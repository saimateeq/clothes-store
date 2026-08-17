import { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Loader from "./components/Loader";
import PageTransition from "./components/PageTransition";
import AccountLayout from "./layouts/AccountLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AccountOverview from "./pages/account/Overview";
import AccountProfile from "./pages/account/Profile";
import AccountAddresses from "./pages/account/Addresses";
import AccountOrders from "./pages/account/Orders";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

// Code-split the two heaviest subtrees out of the main bundle: the admin
// dashboard (pulls in Recharts) and checkout (pulls in Stripe.js) are only
// ever needed by a fraction of visits, so shoppers browsing the storefront
// shouldn't pay to download either.
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProductList = lazy(() => import("./pages/admin/products/ProductList"));
const AdminProductForm = lazy(() => import("./pages/admin/products/ProductForm"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminCollections = lazy(() => import("./pages/admin/Collections"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminCustomerDetail = lazy(() => import("./pages/admin/CustomerDetail"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const AdminNewsletter = lazy(() => import("./pages/admin/Newsletter"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

function SuspenseFallback() {
  return <div className="mx-auto max-w-[1600px] px-5 py-24"><div className="h-64 animate-pulse bg-line" /></div>;
}

function StorefrontRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    // The motion wrapper must be AnimatePresence's DIRECT child (keyed on
    // pathname) — putting it inside individual <Route> elements instead
    // means AnimatePresence can't reliably detect the exit, and mode="wait"
    // hangs forever waiting for a completion signal it never gets.
    // Enter-only transition: framer-motion 13's AnimatePresence mode="wait"
    // hangs indefinitely on route changes in this React 19 + React Router 7
    // combination (verified: the URL updates but the exiting tree never
    // unmounts). Keying PageTransition by pathname still replays the
    // fade/slide-in on every navigation without depending on exit tracking.
    <PageTransition key={location.pathname}>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<AccountOverview />} />
              <Route path="orders" element={<AccountOrders />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="profile" element={<AccountProfile />} />
              <Route path="addresses" element={<AccountAddresses />} />
            </Route>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </PageTransition>
  );
}

function Storefront() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <StorefrontRoutes />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function AdminApp() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetail />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

function AppShell() {
  useAuthBootstrap();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return isAdmin ? <AdminApp /> : <Storefront />;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <Loader show={loading} />
          <AppShell />
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
