import { flushSync } from "react-dom";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut } from "lucide-react";
import { selectCurrentUser, clearCredentials } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const TABS = [
  { label: "Overview", to: "/account", end: true },
  { label: "Orders", to: "/account/orders" },
  { label: "Wishlist", to: "/account/wishlist" },
  { label: "Profile", to: "/account/profile" },
  { label: "Addresses", to: "/account/addresses" },
];

export default function AccountLayout() {
  useDocumentTitle("My Account");
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().catch(() => null);
    // flushSync forces the navigation to fully commit — unmounting this
    // ProtectedRoute-guarded page — before auth state changes below.
    // Without it, React batches both into one update, so ProtectedRoute
    // sees isAuthenticated flip to false while still mounted here and
    // fires its own redirect to /login, winning the race against this.
    flushSync(() => {
      navigate("/");
    });
    dispatch(clearCredentials());
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-12 flex flex-col gap-2">
        <span className="label text-accent">My Account</span>
        <h1 className="font-heading text-5xl sm:text-6xl">Hi, {user?.name?.split(" ")[0]}</h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="grid grid-cols-3 gap-2 lg:flex lg:flex-col lg:gap-2">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `label flex items-center justify-center border px-2 py-2.5 text-center transition-colors lg:justify-start lg:px-4 lg:text-left ${
                  isActive ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-ink hover:text-ink"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="label flex items-center justify-center gap-1 whitespace-nowrap border border-line px-1 py-2.5 text-center text-muted transition-colors hover:border-accent hover:text-accent lg:mt-4 lg:justify-start lg:gap-2 lg:px-4 lg:text-left"
          >
            <LogOut size={13} strokeWidth={1.5} className="shrink-0" />
            Log Out
          </button>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
