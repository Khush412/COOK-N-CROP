# 🍳 Cook'N'Crop 🌿

**A full-stack MERN application connecting food lovers, cooks, and farmers. Share recipes, shop for fresh ingredients, and engage with a vibrant community.**

Cook'N'Crop is a feature-rich, modern web platform built with the MERN stack (MongoDB, Express, React, Node.js). It's designed to be a one-stop-shop for everything food-related, from discovering and sharing recipes to buying fresh produce directly from sellers.

---

### ✨ Live Demo

*[text](https://cookncrop.onrender.com)*

---

## 🚀 Key Features

This project is packed with features designed to create a seamless and engaging user experience.

#### 👤 **Authentication & User Management**
- **Secure Registration & Login**: Standard email/password authentication with JWT-based sessions.
- **OAuth 2.0 Integration**: Users can sign up or log in using Google, GitHub, or Twitter.
- **Password Management**: Secure "Forgot Password" and "Reset Password" functionality via email.
- **User Dashboard**: A private, personalized space for users to manage their profile, view orders, see saved posts, and configure security settings.
- **Public Profiles**: View other users' profiles, see their posts and comments, and follow them.

#### 🛒 **E-commerce (The Crop'Corner)**
- **Product Marketplace**: A fully functional store for fresh ingredients and other products.
- **Advanced Filtering & Sorting**: Easily find products by name, category, price range, and more.
- **Shopping Cart**: A persistent cart to add, remove, and update item quantities.
- **Checkout System**: A multi-step checkout process with address management and coupon code validation.
- **Order History**: Users can view details of their past orders and re-order items with a single click.
- **Product Reviews**: Users can rate and review products they've purchased.

#### 📝 **Community & Recipes**
- **Post Creation**: Users can create, edit, and delete posts, which can be general discussions or detailed recipes.
- **Rich Recipe Format**: Recipes include ingredients, instructions, prep/cook times, servings, and can be tagged with relevant products.
- **Shoppable Recipes**: A standout feature that automatically finds matching ingredients from the store and allows users to add them all to their cart.
- **Interactive Content**: Upvote, save for later, and comment on posts.
- **Nested & Collapsible Comments**: A sophisticated, multi-level comment system with upvoting, replies, and smart collapsing for readability.

#### 💬 **Real-Time Interaction**
- **Live Messenger**: A private, one-on-one messaging system built with Socket.IO for instant communication.
- **Admin Notifications**: Admins receive real-time notifications for events like new user registrations.

#### 🛠️ **Support & Moderation**
- **Contact & Support System**: A comprehensive support page with an FAQ and a contact form that creates support tickets.
- **Ticket Tracking**: Users can view their support tickets and correspond with admins.
- **Reporting System**: Users can report inappropriate posts or comments.
- **Block System**: Users can block others to prevent unwanted interaction.

#### 🎨 **Modern UI/UX**
- **Fully Responsive Design**: A beautiful and intuitive interface that works on all devices, built with Material-UI.
- **Custom Theming**: Includes a theme switcher for light/dark modes and a font selector for a personalized look.
- **Smooth Animations**: Engaging animations and page transitions using Framer Motion.
- **Global Search**: A powerful search bar in the header to find products, posts, and users from anywhere on the site.

---

## 🛠️ Tech Stack

| Category       | Technology                                                              |
|----------------|-------------------------------------------------------------------------|
| **Frontend**   | React, React Router, Material-UI, Styled Components, Axios, Socket.IO Client, Framer Motion |
| **Backend**    | Node.js, Express.js                                                     |
| **Database**   | MongoDB with Mongoose                                                   |
| **Auth**       | Passport.js (JWT, Google, GitHub, Twitter), bcrypt.js                   |
| **Real-Time**  | Socket.IO                                                               |
| **Email**      | Nodemailer                                                              |

---

## 🏁 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

- **Node.js** (v16 or later)
- **npm** or **yarn**
- **MongoDB**: A local instance or a cloud-based service like MongoDB Atlas.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/cook-n-crop.git
    cd cook-n-crop
    ```

2.  **Set up the Backend:**
    - Navigate to the server directory: `cd server`
    - Install dependencies: `npm install`
    - Create a `.env` file in the `server` directory and add the following environment variables. Replace the placeholder values with your actual configuration.

    ```env
    # Server Configuration
    NODE_ENV=development
    PORT=5000

    # Database
    MONGO_URI=your_mongodb_connection_string

    # JWT
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=7d

    # Client URL
    CLIENT_URL=http://localhost:3000

    # --- Production Email: Choose ONE of the options below ---

    # Option 1: Brevo (formerly Sendinblue) - Recommended
    # Free tier is generous. May require phone verification to prevent spam.
    # 1. Sign up at brevo.com, go to SMTP & API, create an SMTP Key.
    EMAIL_HOST=smtp-relay.brevo.com # Brevo SMTP server
    EMAIL_PORT=587
    EMAIL_USER=your_brevo_login_email@example.com # The "Login" value from your Brevo SMTP page
    EMAIL_PASS=your_brevo_smtp_key # The SMTP key you generated
    EMAIL_FROM=noreply@yourdomain.com
    FROM_NAME=Cook'N'Crop

    # Option 2: Mailgun
    # Also has a free tier. May require a credit card for identity verification (won't be charged on free plan).
    # 1. Sign up at mailgun.com, add and verify your domain.
    # 2. Go to Sending > Domain Settings > SMTP credentials to find your details.
    # EMAIL_HOST=smtp.mailgun.org # Or your region-specific host (e.g., smtp.eu.mailgun.org)
    # EMAIL_PORT=587
    # EMAIL_USER=postmaster@your.verified.domain # Your SMTP username from Mailgun
    # EMAIL_PASS=your_mailgun_smtp_password # The password for that SMTP user

    # OAuth Credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    TWITTER_CONSUMER_KEY=your_twitter_api_key
    TWITTER_CONSUMER_SECRET=your_twitter_api_secret_key
    ```

3.  **Set up the Frontend:**
    - Navigate to the client directory: `cd ../client`
    - Install dependencies: `npm install`
    - Create a `.env` file in the `client` directory:

    ```env
    REACT_APP_API_URL=http://localhost:5000
    ```

### Running the Application

1.  **Start the Backend Server:**
    - From the `server` directory, run:
    ```sh
    npm run dev
    ```
    The server will start on the port specified in your `.env` file (e.g., 5000).

2.  **Start the Frontend Development Server:**
    - From the `client` directory, run:
    ```sh
    npm start
    ```
    The React application will open in your browser at `http://localhost:3000`.

---

## 📂 Project Structure

The project is organized into two main parts: `client` and `server`.

```
cook-n-crop/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── App.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── README.md
```

- **`client`**: Contains the React frontend application, created with Create React App.
- **`server`**: Contains the Node.js/Express backend API.

---

## 🎉 Congratulations!

You've built an incredibly robust and feature-complete application. From the complex authentication flows and real-time interactions to the polished, themeable UI, this project showcases a wide range of modern web development skills. It's ready for deployment and for a community to start enjoying it. Well done!
