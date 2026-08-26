import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, User, ShoppingBag, Menu, LayoutDashboard, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { selectIsAuthenticated, selectIsAdmin, clearCredentials } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApi";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";

const NAV_LINKS = [
  { label: "Women", to: "/shop/women" },
  { label: "Men", to: "/shop/men" },
  { label: "New Arrivals", to: "/shop?sort=newest" },
  { label: "Collections", to: "/shop" },
  { label: "Our Story", to: "/about" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count: cartCount, pulse, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().catch(() => null);
    // flushSync forces the navigation to fully commit — including
    // unmounting whatever protected route we were on — before auth state
    // changes. Without it, React batches the navigate + dispatch below
    // into one update, so ProtectedRoute (still mounted for e.g. /account)
    // sees isAuthenticated flip to false and fires its own redirect to
    // /login, winning the race against this navigate to "/".
    flushSync(() => {
      navigate("/");
    });
    dispatch(clearCredentials());
  };

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  const transparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`sticky top-9 z-40 w-full transition-all duration-500 text-black ${
          transparent
            ? "border-b border-transparent bg-transparent"
            : "border-b border-line bg-bg/90 backdrop-blur-md"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1600px] items-center justify-between px-5 transition-all duration-500 sm:px-8 ${
            transparent ? "py-7" : "py-4"
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`inline-flex items-center gap-2 lg:hidden ${
              transparent ? "text-black" : "text-ink"
            }`}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <nav
            className={`hidden items-center gap-8 lg:flex ${
              transparent ? "text-black" : "text-ink"
            }`}
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className="link-underline label"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/"
            className={`font-heading text-2xl tracking-[0.2em] sm:text-3xl ${
              transparent ? "text-black" : "text-ink"
            }`}
            aria-label="VELORA home"
          >
            VELORA
          </Link>

          <div
            className={`flex items-center gap-4 sm:gap-5 ${
              transparent ? "text-black" : "text-ink"
            }`}
          >
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden transition-opacity hover:opacity-60 sm:inline-flex"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>
            <Link
              to="/wishlist"
              className="relative hidden transition-opacity hover:opacity-60 sm:inline-flex"
              aria-label={`Wishlist, ${wishCount} items`}
            >
              <Heart size={19} strokeWidth={1.5} />
              {wishCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
                  {wishCount}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden transition-opacity hover:opacity-60 sm:inline-flex"
                aria-label="Admin panel"
                title="Admin panel"
              >
                <LayoutDashboard size={19} strokeWidth={1.5} />
              </Link>
            )}
            {!isAdmin && (
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="hidden transition-opacity hover:opacity-60 sm:inline-flex"
                aria-label={isAuthenticated ? "Account" : "Log In"}
                title={isAuthenticated ? "Account" : "Log In"}
              >
                <User size={19} strokeWidth={1.5} />
              </Link>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden transition-opacity hover:opacity-60 sm:inline-flex"
                aria-label="Log Out"
                title="Log Out"
              >
                <LogOut size={19} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex transition-opacity hover:opacity-60"
              aria-label={`Cart, ${cartCount} items`}
            >
              <motion.span
                key={pulse}
                initial={{ scale: 1 }}
                animate={pulse ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
              </motion.span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={NAV_LINKS}
        onSearchClick={() => setSearchOpen(true)}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
