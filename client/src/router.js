import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CropCorner from "./pages/CropCorner";
import TermsPage from "./pages/TermsPage"; // New
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"; // New
import SupportContactPage from "./pages/SupportContactPage"; // New
import AboutPage from "./pages/AboutPage";
import Login from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import PublicProfilePage from "./pages/PublicProfilePage"; // New: Import PublicProfilePage
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // New
import ResetPasswordPage from "./pages/ResetPasswordPage"; // New
import PostPage from "./pages/PostPage"; // New: Import PostPage
import FeedPage from "./pages/FeedPage"; // New
import Community from "./pages/Community";
import ProductPage from "./pages/ProductPage"; // New
import Recipes from "./pages/Recipes";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage"; // New
import OrderDetailsPage from "./pages/OrderDetailsPage"; // New: Import OrderDetailsPage
import AddressManagementPage from "./pages/AddressManagementPage"; // New: Import AddressManagementPage
import PrivateRoute from "./components/PrivateRoute"; // New
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"; // New
import AdminOverview from "./pages/admin/AdminOverview"; // New
import ManageUsers from "./pages/admin/ManageUsers"; // New
import ManageOrders from "./pages/admin/ManageOrders"; // New
import MySupportTicketsPage from "./pages/MySupportTicketsPage"; // New
import SupportTicketDetailsPage from "./pages/SupportTicketDetailsPage"; // New
import ManageSupport from "./pages/admin/ManageSupport"; // New
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
import BlockedUsersPage from './pages/BlockedUsersPage';
import SearchPage from './pages/SearchPage';
import ExploreGroupsPage from './pages/ExploreGroupsPage'; // New
import CreateGroupPage from './pages/CreateGroupPage'; // New
import GroupPage from './pages/GroupPage'; // New
import EditGroupPage from './pages/EditGroupPage'; // New
import CreatePostPage from './pages/CreatePostPage'; // New
import MyCollectionsPage from './pages/MyCollectionsPage'; // New
import CollectionDetailsPage from './pages/CollectionDetailsPage'; // New
import MessengerPage from './pages/MessengerPage';
import WishlistPage from './pages/WishlistPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/terms" element={<TermsPage />} /> {/* New */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} /> {/* New */}
      <Route path="/support" element={<SupportContactPage />} /> {/* New */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/user/:username" element={<PublicProfilePage />} /> {/* New: Public Profile Page */}
      <Route path="/post/:id" element={<PostPage />} /> {/* New: Single Post Page */}
      <Route path="/feed" element={<FeedPage />} /> {/* New */}
      <Route path="/community" element={<Community />} />
      <Route path="/g/:slug" element={<GroupPage />} /> {/* New */}
      <Route path="/community/explore" element={<ExploreGroupsPage />} /> {/* New */}
      <Route path="/collection/:id" element={<CollectionDetailsPage />} /> {/* New */}
      <Route path="/product/:id" element={<ProductPage />} /> {/* New */}
      <Route path="/CropCorner" element={<CropCorner />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* New */}
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* New */}
      <Route path="/login" element={<Login />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Authenticated User Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/addresses" element={<AddressManagementPage />} />
        <Route path="/profile/collections" element={<MyCollectionsPage />} /> {/* New */}
        <Route path="/profile/saved-posts" element={<SavedPostsPage />} />
        <Route path="/profile/my-activity" element={<MyActivityPage />} />
        <Route path="/profile/blocked-users" element={<BlockedUsersPage />} />
        <Route path="/profile/wishlist" element={<WishlistPage />} />
        <Route path="/g/:slug/edit" element={<EditGroupPage />} /> {/* Moved inside PrivateRoute */} {/* Corrected PrivateRoute usage */}
        <Route path="/community/create" element={<CreateGroupPage />} /> {/* New */}
        <Route path="/create-post" element={<CreatePostPage />} /> {/* New */}
        <Route path="/create-recipe" element={<CreatePostPage />} /> {/* New */}
        <Route path="/profile/support-tickets" element={<MySupportTicketsPage />} />
        <Route path="/support/ticket/:id" element={<SupportTicketDetailsPage />} />
        <Route path="/profile/orders" element={<OrderHistoryPage />} />
        <Route path="/messages" element={<MessengerPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboardPage />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="users/:userId/addresses" element={<AdminUserAddressesPage />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="orders/edit/:id" element={<EditOrderPage />} />
          <Route path="orders/create" element={<CreateOrderPage />} />
          <Route path="support" element={<ManageSupport />} /> {/* New */}
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/low-stock" element={<LowStockPage />} />
          <Route path="reports" element={<ReportedContent />} />
          <Route path="broadcast" element={<BroadcastPage />} />
          <Route path="coupons" element={<ManageCoupons />} />
          <Route path="coupons/:code/orders" element={<CouponOrdersPage />} />
        </Route>
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}