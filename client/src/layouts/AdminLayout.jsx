import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  ShoppingBag,
  Users,
  Star,
  Tag,
  Mail,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { selectCurrentUser, clearCredentials } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useEscapeKey } from "../hooks/useEscapeKey";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: FolderTree },
  { label: "Collections", to: "/admin/collections", icon: Layers },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
  { label: "Coupons", to: "/admin/coupons", icon: Tag },
  { label: "Newsletter", to: "/admin/newsletter", icon: Mail },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function SidebarLinks({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Admin">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
              isActive ? "bg-ink text-bg" : "text-muted hover:bg-line/60 hover:text-ink"
            }`
          }
        >
          <item.icon size={16} strokeWidth={1.5} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  useDocumentTitle("Admin");
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEscapeKey(() => setMobileOpen(false), mobileOpen);

  const handleLogout = async () => {
    await logout().catch(() => null);
    dispatch(clearCredentials());
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line lg:flex">
        <div className="flex items-center gap-2 border-b border-line px-5 py-5">
          <span className="font-heading text-xl tracking-[0.15em]">VELORA</span>
          <span className="label text-muted">Admin</span>
        </div>
        <SidebarLinks />
        <div className="border-t border-line p-4">
          <p className="truncate text-xs text-muted">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-xs text-muted hover:text-ink"
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <span className="font-heading text-lg tracking-[0.15em]">VELORA ADMIN</span>
          <div className="w-[22px]" />
        </header>

        <main className="flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-bg lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-5">
                <span className="font-heading text-xl tracking-[0.15em]">VELORA</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <SidebarLinks onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
