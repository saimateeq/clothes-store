export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

// Intentionally public — a dedicated demo account (role: manager, NOT the
// real admin) for showing the admin panel to prospective clients. Safe to
// ship in the client bundle because it isn't a real credential to protect;
// see server/scripts/createDemoAccount.js.
export const DEMO_ADMIN_EMAIL = "demo@velora.com";
export const DEMO_ADMIN_PASSWORD = "VeloraDemo2026";
