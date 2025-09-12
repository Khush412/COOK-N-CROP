import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CropCorner from "./pages/CropCorner";
import Login from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import PublicProfilePage from "./pages/PublicProfilePage"; // New: Import PublicProfilePage
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // New
import ResetPasswordPage from "./pages/ResetPasswordPage"; // New
import PostPage from "./pages/PostPage"; // New: Import PostPage
import FeedPage from "./pages/FeedPage"; // New
import Community from "./pages/Community";
import Subscription from "./pages/Subscription";
import Dashboard from "./pages/Control_panel";
import ProductPage from "./pages/ProductPage"; // New
import Recipes from "./pages/Recipes";
import CartPage from "./pages/CartPage";
import OrderDetailsPage from "./pages/OrderDetailsPage"; // New: Import OrderDetailsPage
import AddressManagementPage from "./pages/AddressManagementPage"; // New: Import AddressManagementPage
import PrivateRoute from "./components/PrivateRoute"; // New
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"; // New
import AdminOverview from "./pages/admin/AdminOverview"; // New
import ManageUsers from "./pages/admin/ManageUsers"; // New
import ManageOrders from "./pages/admin/ManageOrders"; // New
import ManageProducts from "./pages/admin/ManageProducts"; // New
import ReportedContent from "./pages/admin/ReportedContent"; // New
import SavedPostsPage from "./pages/SavedPostsPage"; // New
import OrderHistoryPage from "./pages/OrderHistoryPage"; // New: Import OrderHistoryPage
import ManageCoupons from './pages/admin/ManageCoupons';
import CouponOrdersPage from './pages/admin/CouponOrdersPage';
import CreateOrderPage from './pages/admin/CreateOrderPage';
import EditOrderPage from './pages/admin/EditOrderPage';
import LowStockPage from './pages/admin/LowStockPage';
import BroadcastPage from './pages/admin/BroadcastPage';
import AdminUserAddressesPage from './pages/admin/AdminUserAddressesPage';
import MyActivityPage from './pages/MyActivityPage';
import WishlistPage from './pages/WishlistPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/user/:username" element={<PublicProfilePage />} /> {/* New: Public Profile Page */}
      <Route path="/post/:id" element={<PostPage />} /> {/* New: Single Post Page */}
      <Route path="/feed" element={<FeedPage />} /> {/* New */}
      <Route path="/community" element={<Community />} />
      <Route path="/product/:id" element={<ProductPage />} /> {/* New */}
      <Route path="/CropCorner" element={<CropCorner />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* New */}
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* New */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/addresses" element={<AddressManagementPage />} /> {/* New: Address Management Page */}
      <Route path="/profile/saved-posts" element={<SavedPostsPage />} /> {/* New */}
      <Route path="/profile/my-activity" element={<MyActivityPage />} />
      <Route path="/profile/wishlist" element={<WishlistPage />} />
      <Route path="/profile/orders" element={<OrderHistoryPage />} /> {/* New: Order History Page */}
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboardPage />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="users/:userId/addresses" element={<AdminUserAddressesPage />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="orders/edit/:id" element={<EditOrderPage />} />
          <Route path="orders/create" element={<CreateOrderPage />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/low-stock" element={<LowStockPage />} />
          <Route path="reports" element={<ReportedContent />} />
          <Route path="broadcast" element={<BroadcastPage />} />
          <Route path="coupons" element={<ManageCoupons />} />
          <Route path="coupons/:code/orders" element={<CouponOrdersPage />} />
        </Route>
      </Route>
      <Route path="/order/:id" element={<OrderDetailsPage />} /> {/* New: Order Details Page */}
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}