import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Search, Heart, User, LayoutDashboard } from "lucide-react";
import { useEscapeKey } from "../hooks/useEscapeKey";

export default function MobileMenu({ open, onClose, links, onSearchClick, isAuthenticated, isAdmin }) {
  useEscapeKey(onClose, open);
  const extraLinks = [
    { label: "Wishlist", to: "/wishlist", icon: Heart },
    { label: "Account", to: isAuthenticated ? "/account" : "/login", icon: User },
    ...(isAdmin ? [{ label: "Admin", to: "/admin", icon: LayoutDashboard }] : []),
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between px-5 py-6">
            <span className="font-heading text-2xl tracking-[0.2em]">VELORA</span>
            <button type="button" onClick={onClose} aria-label="Close menu">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-8" aria-label="Mobile">
            {links.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
              >
                <Link
                  to={link.to}
                  onClick={onClose}
                  className="block border-b border-line py-4 font-heading text-4xl"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center justify-around border-t border-line px-8 py-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSearchClick?.();
              }}
              className="flex flex-col items-center gap-2 label text-muted"
            >
              <Search size={18} strokeWidth={1.5} />
              Search
            </button>
            {extraLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className="flex flex-col items-center gap-2 label text-muted"
              >
                <item.icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
