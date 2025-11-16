# 🍳 Cook'N'Crop 🌿

**A full-stack MERN application connecting food lovers, cooks, and farmers. Share recipes, shop for fresh ingredients, and engage with a vibrant community.**

Cook'N'Crop is a feature-rich, modern web platform built with the MERN stack (MongoDB, Express, React, Node.js). It's designed to be a one-stop-shop for everything food-related, from discovering and sharing recipes to buying fresh produce directly from sellers.

---

## 🌟 Overview

Cook'N'Crop is a comprehensive food community platform that brings together three key aspects of the food ecosystem:

1. **Social Community**: Users can share recipes, cooking tips, and food experiences
2. **E-commerce Marketplace**: Fresh produce and ingredients available for purchase
3. **Loyalty Program**: Harvest Coins reward system for engaged users

The platform features a modern, responsive design with customizable themes, real-time messaging, and a rich user experience.

---

## 🚀 Key Features

### 👤 **User Authentication & Management**
- **Secure Registration & Login**: Email/password authentication with JWT-based sessions
- **OAuth 2.0 Integration**: Social login via Google, GitHub, and LinkedIn
- **Password Management**: Secure "Forgot Password" and "Reset Password" functionality
- **User Profiles**: Customizable profiles with avatars, bios, and social connections
- **Role-based Access Control**: User, moderator, and admin roles with appropriate permissions
- **Account Security**: Session management, account deactivation, and security settings

### 🛒 **E-commerce Marketplace (Crop Corner)**
- **Product Catalog**: Extensive catalog of fresh produce, ingredients, and food items
- **Advanced Filtering**: Search and filter by category, price, tags, ratings, and availability
- **Product Details**: Rich product information including nutrition facts, variants, and badges
- **Shopping Cart**: Persistent cart system with quantity management
- **Checkout Process**: Multi-step checkout with address management and payment options
- **Order Management**: Complete order history with status tracking
- **Product Reviews**: Rating and review system with upvoting capabilities
- **Wishlist**: Save favorite products for later purchase
- **Recently Viewed**: Track and revisit previously viewed products
- **Personalized Recommendations**: AI-driven product suggestions based on user behavior

### 📝 **Community & Recipe Sharing**
- **Post Creation**: Rich text editor for creating recipes and general posts
- **Recipe Format**: Structured recipe posts with ingredients, instructions, and prep times
- **Shoppable Recipes**: One-click ingredient purchasing from recipes
- **Post Interactions**: Upvoting, saving, and commenting on posts
- **Nested Comments**: Multi-level comment system with collapsible threads
- **Content Groups**: Community groups for specific interests and topics
- **Collections**: User-created collections of favorite posts and recipes
- **Content Discovery**: Trending, popular, and personalized content feeds
- **Advanced Search**: Powerful search across posts, users, and content

### 💬 **Real-Time Communication**
- **Instant Messaging**: Private one-on-one messaging between users
- **Real-time Notifications**: Live updates for messages, comments, and platform activity
- **Presence Indicators**: Online/offline status for contacts
- **Message Reactions**: Emoji reactions to messages
- **Media Sharing**: Image and file sharing in conversations
- **Message Status**: Read receipts and delivery confirmations

### 🛠️ **Support & Moderation**
- **Help Center**: Comprehensive FAQ and support documentation
- **Ticket System**: User support ticket creation and management
- **Content Reporting**: Report inappropriate posts, comments, or users
- **User Blocking**: Block unwanted interactions from other users
- **Admin Moderation**: Content and user management tools for administrators
- **Community Guidelines**: Clear rules and policies for platform usage

### 🎁 **Loyalty & Rewards Program**
- **Harvest Coins**: Earn coins through purchases and platform engagement
- **Tiered Membership**: Bronze, Silver, and Gold membership levels with increasing benefits
- **Redemption System**: Exchange coins for discounts and special offers
- **Activity Rewards**: Bonus coins for community participation
- **Referral Program**: Earn coins by inviting friends to the platform

### 🎨 **Modern UI/UX Features**
- **Responsive Design**: Fully responsive interface that works on all devices
- **Customizable Themes**: Multiple color themes (Royal Amethyst, Forest Mist, Sunset Glow, Ocean Breeze)
- **Light/Dark Mode**: Toggle between light and dark color schemes
- **Font Customization**: Choose from multiple font options for personalized reading
- **Animations**: Smooth transitions and micro-interactions throughout the interface
- **Accessibility**: WCAG-compliant design for users with disabilities
- **Performance Optimized**: Lazy loading, code splitting, and efficient data fetching

### 🔧 **Admin Panel**
- **Dashboard Analytics**: Real-time statistics and visualizations
- **User Management**: View, edit, and manage all user accounts
- **Product Management**: Add, edit, import (CSV), and manage inventory
- **Order Management**: Process and track customer orders
- **Content Moderation**: Review reported content and user-generated posts
- **Broadcast System**: Send announcements to all platform users
- **Coupon Management**: Create and manage discount codes
- **Group Management**: Administer community groups and auto-join settings
- **Support Ticket Handling**: Manage and respond to user support requests

---

## 🛠️ Technology Stack

### Frontend
- **React**: Modern component-based UI library
- **Material-UI**: Comprehensive React component library
- **React Router**: Declarative routing for React applications
- **Styled Components**: Visual primitives for themeable component styling
- **Axios**: Promise-based HTTP client for API requests
- **Socket.IO Client**: Real-time bidirectional event-based communication
- **Framer Motion**: Production-ready motion library for React
- **Redux/Zustand**: State management solutions
- **Formik & Yup**: Form handling and validation
- **React Query**: Server state management

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: Document-oriented NoSQL database
- **Mongoose**: Elegant MongoDB object modeling
- **Passport.js**: Authentication middleware with multiple strategies
- **JWT**: JSON Web Tokens for secure authentication
- **Socket.IO**: Real-time bidirectional event-based communication
- **Nodemailer**: Email sending capabilities
- **Multer**: Middleware for handling multipart/form-data
- **Bcrypt.js**: Password hashing and security
- **Stripe**: Payment processing integration

### DevOps & Tools
- **Git**: Distributed version control system
- **npm/yarn**: Package managers for JavaScript
- **ESLint**: JavaScript linting utility
- **Prettier**: Code formatter for consistent styling
- **Jest**: JavaScript testing framework
- **Docker**: Containerization platform (optional)
- **Render/Heroku**: Cloud platform for deployment

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v16 or later)
- **npm** or **yarn**
- **MongoDB**: Local instance or cloud service (MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/cook-n-crop.git
   cd cook-n-crop
   ```

2. **Set up the Backend:**
   ```sh
   cd server
   npm install
   ```
   
   Create a `.env` file in the `server` directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   
   # Session Secret
   SESSION_SECRET=your_super_strong_session_secret
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   
   # Email Configuration (Brevo/Sendinblue recommended)
   EMAIL_HOST=smtp-relay.brevo.com
   EMAIL_PORT=587
   EMAIL_USER=your_brevo_login_email@example.com
   EMAIL_PASS=your_brevo_smtp_key
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Cook'N'Crop
   
   # OAuth Credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   ```

3. **Set up the Frontend:**
   ```sh
   cd ../client
   npm install
   ```
   
   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the Backend Server:**
   ```sh
   cd server
   npm run dev
   ```

2. **Start the Frontend Development Server:**
   ```sh
   cd client
   npm start
   ```

---

## 📂 Project Structure

```
cook-n-crop/
├── client/                    # React frontend application
│   ├── public/                # Static assets
│   └── src/                   # Source code
│       ├── assets/            # Images, icons, and other media
│       ├── components/        # Reusable UI components
│       ├── contexts/          # React context providers
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Page components
│       ├── services/          # API service functions
│       ├── custom_components/ # Custom UI components
│       └── App.js             # Main application component
├── server/                    # Node.js backend API
│   ├── config/                # Configuration files
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Custom middleware functions
│   ├── models/                # Mongoose data models
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions
│   └── server.js              # Main server file
└── README.md                  # Project documentation
```

---

## 🎯 Core Functionality Deep Dive

### User System
The user system is built on a robust authentication foundation with multiple login options. Users can register with email/password or use OAuth providers. The profile system allows for customization with avatars, bios, and social connections. Role-based permissions ensure appropriate access levels for regular users, moderators, and administrators.

### E-commerce Platform
The marketplace features a comprehensive product catalog with advanced search and filtering capabilities. Products include detailed information like nutrition facts, variants for different sizes/weights, and badges for special attributes (organic, bestseller, etc.). The shopping experience includes a persistent cart, multi-step checkout, and order tracking.

### Community Features
The social aspect of Cook'N'Crop centers around recipe sharing and community engagement. Users can create rich recipe posts with structured ingredients and instructions. The shoppable recipe feature allows one-click purchasing of all ingredients. Posts support upvoting, commenting, and saving, with a sophisticated nested comment system.

### Real-time Communication
The messaging system provides instant communication between users with features like online presence indicators, message reactions, and media sharing. Real-time notifications keep users updated on platform activity.

### Loyalty Program
Harvest Coins provide tangible rewards for user engagement. The tiered system offers increasing benefits with higher membership levels, and coins can be redeemed for discounts on future purchases.

---

## 🔒 Security Features

- **Password Encryption**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Proper session handling and cleanup
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation for all user inputs
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Helmet.js**: Security headers for Express applications
- **Environment Variables**: Sensitive data stored securely

---

## 📱 Responsive Design

The application is built with a mobile-first approach and features:

- **Adaptive Layouts**: Components adjust to different screen sizes
- **Touch-friendly Controls**: Optimized for touch interactions
- **Performance Optimization**: Lazy loading and efficient data fetching
- **Cross-browser Compatibility**: Works across modern browsers
- **Progressive Web App**: Installable on mobile devices

---

## 🧪 Testing Strategy

The application implements a comprehensive testing approach:

- **Unit Testing**: Component and function testing with Jest
- **Integration Testing**: API endpoint testing
- **End-to-End Testing**: User flow testing with Cypress
- **Performance Testing**: Load and stress testing
- **Accessibility Testing**: WCAG compliance verification

---

## 🚀 Deployment Options

### Development
- Local development with hot reloading
- MongoDB local instance or Atlas

### Production
- **Frontend**: Deploy to Netlify, Vercel, or static hosting
- **Backend**: Deploy to Render, Heroku, or cloud VPS
- **Database**: MongoDB Atlas for managed database service
- **CDN**: Content delivery network for static assets

---

## 🤝 Contributing

We welcome contributions to Cook'N'Crop! To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

Please ensure your code follows our style guidelines and includes appropriate tests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this platform
- Inspired by the need to connect food lovers, cooks, and farmers
- Built with modern web technologies for the best user experience

---

## 📞 Support

For support, please open an issue on GitHub or contact our team at support@cookncrop.com.

---

## 🎉 Conclusion

Cook'N'Crop represents a comprehensive solution for the modern food community. With its blend of social features, e-commerce capabilities, and loyalty rewards, it provides a complete platform for food enthusiasts to connect, share, and shop. The application demonstrates best practices in full-stack development with a focus on user experience, security, and scalability.