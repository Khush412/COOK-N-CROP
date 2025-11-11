"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

function DockItem({
  item,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  variant,
  setHoveredIndex,
  hoveredIndex,
  isTouchDevice,
}) {
  const ref = useRef(null);
  const mouseXMotion = useMotionValue(0);
  const isHovered = useMotionValue(0);
  const x = useMotionValue(0);
  const tooltipSpringConfig = { stiffness: 100, damping: 5 };

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-15, 15]),
    tooltipSpringConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-20, 20]),
    tooltipSpringConfig
  );

  useEffect(() => {
    if (hoveredIndex === item.id) {
      isHovered.set(1);
    } else {
      isHovered.set(0);
    }
  }, [hoveredIndex, item.id, isHovered]);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dist = e.clientX - (rect.x + rect.width / 2);
      mouseXMotion.set(dist);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseXMotion, isTouchDevice]);

  const handleItemMouseMove = (event) => {
    if (isTouchDevice) return;
    const halfWidth = event.currentTarget.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  const targetSize = useTransform(
    mouseXMotion,
    [-distance, 0, distance],
    [baseItemSize, isTouchDevice ? baseItemSize : magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  const getBorderStyles = () => {
    switch (variant) {
      case "gradient":
        return "border-transparent group-hover:border-slate-700 dark:border-white/[0.2]";
      case "tooltip":
        return "border-white/[0.4] group-hover:border-white";
      default:
        return "border-neutral-700";
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`group relative ${item.className || ""}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => !isTouchDevice && setHoveredIndex(item.id)}
      onMouseLeave={() => !isTouchDevice && setHoveredIndex(null)}
      onMouseMove={handleItemMouseMove}
      onClick={item.onClick}
      tabIndex={0}
      role="button"
    >
      <motion.div
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-full bg-black border-2 shadow-md transition-colors duration-300",
          getBorderStyles()
        )}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.label}
            className="h-full w-full rounded-full object-cover object-center p-1"
          />
        ) : (
          <div className="flex items-center justify-center">{item.icon}</div>
        )}
      </motion.div>

      {!isTouchDevice && (
        <AnimatePresence>
          {hoveredIndex === item.id && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: -20,
                scale: 1,
                transition: { type: "spring", stiffness: 260, damping: 10 },
              }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              style={
                variant === "tooltip"
                  ? { translateX, rotate, whiteSpace: "nowrap" }
                  : { whiteSpace: "nowrap" }
              }
              className={cn(
                "absolute z-50 -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl",
                variant === "tooltip" ? "-top-16" : "-top-12"
              )}
            >
              <div className="relative z-30 text-base font-bold text-white">
                {item.label}
              </div>
              {item.description && (
                <div className="text-xs text-white/70">{item.description}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export default function MagicDock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 150,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
  variant = "default",
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const mouseX = useRef(Infinity);
  const isHovered = useMotionValue(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setIsTouchDevice(mediaQuery.matches);

    const handleChange = (e) => setIsTouchDevice(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const maxHeight = Math.max(dockHeight, magnification + magnification / 2 + 4);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height }} className="mx-2 flex max-w-full items-center">
      <motion.div
        onMouseMove={(e) => {
          if (!isTouchDevice) {
            isHovered.set(1);
            mouseX.current = e.pageX;
          }
        }}
        onMouseLeave={() => {
          if (!isTouchDevice) {
            isHovered.set(0);
            mouseX.current = Infinity;
          }
        }}
        className={cn(
          `absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border-neutral-700/50 border-2 pb-2 px-4 bg-black/90`,
          className
        )}
        style={{ height: panelHeight }}
      >
        {items.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            variant={variant}
            setHoveredIndex={setHoveredIndex}
            hoveredIndex={hoveredIndex}
            isTouchDevice={isTouchDevice}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
