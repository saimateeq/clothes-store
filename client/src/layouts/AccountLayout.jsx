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
    dispatch(clearCredentials());
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-12 flex flex-col gap-2">
        <span className="label text-accent">My Account</span>
        <h1 className="font-heading text-5xl sm:text-6xl">Hi, {user?.name?.split(" ")[0]}</h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-0">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b border-line py-3 text-sm transition-colors lg:border-b-0 lg:border-l lg:pl-4 ${
                  isActive ? "border-ink font-medium text-ink" : "border-line text-muted hover:text-ink"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-0 flex items-center gap-2 whitespace-nowrap py-3 text-sm text-muted hover:text-ink lg:mt-6 lg:border-l lg:border-transparent lg:pl-4"
          >
            <LogOut size={14} strokeWidth={1.5} />
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
