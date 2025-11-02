import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

import './CircularGallery.css';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      fontFamily: this.font
    });
  }
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    // Make cards square by using the same dimension for both width and height
    const cardSize = Math.min(
      (this.viewport.width * (700 * this.scale)) / this.screen.width,
      (this.viewport.height * (700 * this.scale)) / this.screen.height
    );
    this.plane.scale.y = cardSize;
    this.plane.scale.x = cardSize;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(container, {
    items = [],
    bend = 1.5,
    textColor = '#ffffff',
    borderRadius = 0.2,
    font = 'bold 20px Figtree',
    scrollSpeed = 1.5,
    scrollEase = 0.05,
    autoScroll = true,
    autoScrollSpeed = 0.1,
    onImageClick, // Add click handler prop
    onEyeButtonClick // Add eye button click handler prop
  } = {}) {
    autoBind(this);
    this.container = container;
    this.items = items;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.scrollSpeed = scrollSpeed;
    this.scrollEase = scrollEase;
    this.autoScroll = autoScroll;
    this.autoScrollSpeed = autoScrollSpeed;
    this.onImageClick = onImageClick; // Store click handler
    this.onEyeButtonClick = onEyeButtonClick; // Store eye button click handler
    this.scroll = {
      ease: scrollEase,
      current: 0,
      target: 0,
      last: 0
    };
    this.init();
  }
  init() {
    document.documentElement.classList.remove('no-js');
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createClickHandlers(); // Create click handlers before onResize
    this.createNavigation(); // Create navigation arrows
    this.onResize();
    this.createGeometry();
    this.createMedias();
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
    
    // Ensure the canvas has a lower z-index than the click handlers
    this.gl.canvas.style.zIndex = '1';
    this.gl.canvas.style.position = 'relative';
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }
  createMedias() {
    const defaultItems = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: 'Bridge' },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: 'Desk Setup' },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: 'Waterfall' },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: 'Strawberries' },
      { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: 'Deep Diving' },
      { image: `https://picsum.photos/seed/16/800/600?grayscale`, text: 'Train Track' },
      { image: `https://picsum.photos/seed/17/800/600?grayscale`, text: 'Santorini' },
      { image: `https://picsum.photos/seed/8/800/600?grayscale`, text: 'Blurry Lights' },
      { image: `https://picsum.photos/seed/9/800/600?grayscale`, text: 'New York' },
      { image: `https://picsum.photos/seed/10/800/600?grayscale`, text: 'Good Boy' },
      { image: `https://picsum.photos/seed/21/800/600?grayscale`, text: 'Coastline' },
      { image: `https://picsum.photos/seed/12/800/600?grayscale`, text: 'Palm Trees' }
    ];
    const galleryItems = this.items.length ? this.items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend: this.bend,
        textColor: this.textColor,
        borderRadius: this.borderRadius,
        font: this.font
      });
    });
  }

  // Create invisible click handlers for each item
  createClickHandlers() {
    // Create a container for click handlers
    this.clickContainer = document.createElement('div');
    this.clickContainer.style.position = 'absolute';
    this.clickContainer.style.top = '0';
    this.clickContainer.style.left = '0';
    this.clickContainer.style.width = '100%';
    this.clickContainer.style.height = '100%';
    this.clickContainer.style.pointerEvents = 'none'; // Don't block WebGL events
    this.clickContainer.style.zIndex = '10'; // Ensure click handlers are above WebGL canvas
    this.container.appendChild(this.clickContainer);
    this.clickHandlers = [];
  }

  // Update click handler positions
  updateClickHandlers() {
    // Check if clickContainer exists
    if (!this.clickContainer) {
      return;
    }
    
    // Clear existing handlers
    this.clickContainer.innerHTML = '';
    this.clickHandlers = [];
    
    if (!this.medias || !this.items || this.items.length === 0) {
      return;
    }
    
    // Create click handlers for visible items
    this.medias.forEach((media, index) => {
      // Only create handlers for items in the original set (not duplicates)
      if (index < this.items.length && this.items[index]) {
        const handler = document.createElement('div');
        handler.className = 'circular-gallery-click-handler'; // Add class for CSS styling
        handler.style.position = 'absolute';
        handler.style.cursor = 'pointer';
        handler.style.pointerEvents = 'auto'; // Enable pointer events for this element
        handler.style.zIndex = '11'; // Ensure click handlers are above the WebGL canvas
        handler.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'; // Add transition for hover effect
        handler.style.backgroundColor = 'transparent'; // Ensure transparent background
        
        // Position the handler over the media
        const scale = this.screen ? this.screen.height / 1500 : 1;
        // Make cards square by using the same dimension for both width and height
        const cardSize = this.viewport ? Math.min(
          (this.viewport.width * (700 * scale)) / this.screen.width,
          (this.viewport.height * (700 * scale)) / this.screen.height
        ) : 150;
        
        // Calculate position based on media position
        // The media position is relative to the center of the viewport
        const x = media.plane.position.x + (this.viewport ? this.viewport.width / 2 : this.container.clientWidth / 2);
        const y = (this.viewport ? this.viewport.height / 2 : this.container.clientHeight / 2) + media.plane.position.y;
        
        handler.style.left = `${x - cardSize / 2}px`;
        handler.style.top = `${y - cardSize / 2}px`;
        handler.style.width = `${cardSize}px`;
        handler.style.height = `${cardSize}px`;
        
        // Create eye button for product highlights
        const eyeButton = document.createElement('div');
        eyeButton.className = 'circular-gallery-eye-button';
        eyeButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        
        // Add hover effect to show eye button
        handler.addEventListener('mouseenter', () => {
          eyeButton.style.opacity = '1';
        });
        
        handler.addEventListener('mouseleave', () => {
          eyeButton.style.opacity = '0';
        });
        
        // Add click event for eye button
        eyeButton.addEventListener('click', (e) => {
          // Prevent the click from propagating to the container
          e.stopPropagation();
          e.preventDefault();
          
          // Handle eye button click (product highlight)
          if (this.items[index] && this.items[index].id) {
            if (this.onEyeButtonClick && typeof this.onEyeButtonClick === 'function') {
              this.onEyeButtonClick(this.items[index].id);
            }
          }
        });
        
        // Add click event for main card
        handler.addEventListener('click', (e) => {
          // Handle main card click
          if (this.items[index] && this.items[index].id) {
            if (this.onImageClick && typeof this.onImageClick === 'function') {
              this.onImageClick(this.items[index].id);
            }
          }
        });
        
        // Also prevent other events that might trigger dragging
        handler.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        
        handler.addEventListener('touchstart', (e) => {
          e.stopPropagation();
        });
        
        handler.appendChild(eyeButton);
        this.clickContainer.appendChild(handler);
        this.clickHandlers.push(handler);
      }
    });
  }

  // Create navigation arrows
  createNavigation() {
    // Create left arrow
    this.leftArrow = document.createElement('div');
    this.leftArrow.className = 'circular-gallery__arrow circular-gallery__arrow--left';
    this.leftArrow.addEventListener('click', () => {
      this.scroll.target -= this.medias[0].width;
    });
    this.container.appendChild(this.leftArrow);

    // Create right arrow
    this.rightArrow = document.createElement('div');
    this.rightArrow.className = 'circular-gallery__arrow circular-gallery__arrow--right';
    this.rightArrow.addEventListener('click', () => {
      this.scroll.target += this.medias[0].width;
    });
    this.container.appendChild(this.rightArrow);
  }

  onTouchDown(e) {
    this.isDown = true;
    this.isDragging = false; // Reset dragging state
    // Remove lastInteractionTime update since we want continuous scrolling
    this.scroll.position = this.scroll.current;
    this.startX = e.touches ? e.touches[0].clientX : e.clientX;
    this.startY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Store the target element to check if it's a click handler
    this.startTarget = e.target;
    
    // Add dragging class to container
    this.container.classList.add('dragging');
  }
  
  onTouchMove(e) {
    if (!this.isDown) {
      return;
    }
    
    // Remove lastInteractionTime update since we want continuous scrolling
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const distanceX = this.startX - x;
    const distanceY = this.startY - y;
    
    // Only consider it dragging if moved more than 5 pixels in any direction
    if (Math.abs(distanceX) > 5 || Math.abs(distanceY) > 5) {
      this.isDragging = true;
      const scrollDistance = distanceX * (this.scrollSpeed * 0.025);
      this.scroll.target = this.scroll.position + scrollDistance;
    }
  }
  
  onTouchUp(e) {
    this.isDown = false;
    
    // Remove dragging class from container
    this.container.classList.remove('dragging');
    
    // If it wasn't a drag, treat it as a click
    if (!this.isDragging) {
      // Check if the click was on a click handler or eye button
      const target = e.target;
      
      // Check if the click was directly on a click handler
      if (target.classList.contains('circular-gallery-click-handler')) {
        // Let the click handler handle the event
        return;
      }
      
      // Check if the click was on an eye button
      if (target.classList.contains('circular-gallery-eye-button')) {
        // Let the eye button handle the event
        return;
      }
      
      // Check if the click was on an SVG inside an eye button
      if (target.tagName === 'path' && target.parentElement && 
          target.parentElement.classList.contains('circular-gallery-eye-button')) {
        // Let the eye button handle the event
        return;
      }
      
      // Check if the click was on an SVG inside an eye button
      if (target.tagName === 'svg' && target.parentElement && 
          target.parentElement.classList.contains('circular-gallery-eye-button')) {
        // Let the eye button handle the event
        return;
      }
      
      // Check if the click was on an element inside a click handler
      let parent = target.parentElement;
      while (parent) {
        if (parent.classList.contains('circular-gallery-click-handler')) {
          // Let the click handler handle the event
          return;
        }
        parent = parent.parentElement;
      }
    }
    
    this.onCheck();
  }
  
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
    // Update click handlers on resize
    this.updateClickHandlers();
  }
  update() {
    // Handle auto-scroll if enabled - ALWAYS run regardless of user interaction
    if (this.autoScroll) {
      this.scroll.target += this.autoScrollSpeed;
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    
    // Update click handlers position
    this.updateClickHandlers();
    
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    
    window.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchstart', this.boundOnTouchDown);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 1.5, // Use bend=1.5 for subtle curvature as per standards
  textColor = '#ffffff',
  borderRadius = 0.2, // Use borderRadius=0.04 to match card design language
  font = 'bold 20px Figtree', // Smaller font size for better appearance
  scrollSpeed = 1.5, // Use scrollSpeed=1.5 as per standards
  scrollEase = 0.05, // Use scrollEase=0.05 as per standards
  autoScroll = true,
  autoScrollSpeed = 0.1,
  height = 400, // Add height parameter to make cards smaller
  onImageClick, // Add click handler prop
  onEyeButtonClick // Add eye button click handler prop
}) {
  const containerRef = useRef(null);
  useEffect(() => {
    const app = new App(containerRef.current, { 
      items, 
      bend, 
      textColor, 
      borderRadius, 
      font, 
      scrollSpeed, 
      scrollEase,
      autoScroll,
      autoScrollSpeed,
      onImageClick, // Pass click handler to App
      onEyeButtonClick // Pass eye button click handler to App
    });
    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, autoScroll, autoScrollSpeed, onImageClick, onEyeButtonClick]);
  
  // Apply height style
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = `${height}px`;
    }
  }, [height]);
  
  return <div className="circular-gallery" ref={containerRef} />;
}