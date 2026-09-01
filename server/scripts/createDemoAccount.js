import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

// A dedicated, intentionally-public account for showing the admin panel to
// prospective clients — NOT the real admin login. Its credentials are
// meant to be known (see client/src/constants/config.js, where the
// "Demo Admin Login" button on /login autofills them), so this account
// exists specifically to keep the real ADMIN_EMAIL/ADMIN_PASSWORD out of
// anything public. Role is "manager", not "admin" — every current admin
// route is gated with staffOnly (admin OR manager) so this has identical
// access today, but it's a free bit of headroom if an admin-only route is
// ever added later.
const DEMO_EMAIL = process.env.DEMO_ADMIN_EMAIL || "demo@velora.com";
const DEMO_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "VeloraDemo2026";

async function run() {
  await connectDB();

  let user = await User.findOne({ email: DEMO_EMAIL }).select("+password");
  if (user) {
    user.name = "Demo Admin";
    user.role = "manager";
    user.isActive = true;
    user.password = DEMO_PASSWORD; // reset each run so the published demo credential always works
    await user.save();
    console.log(`Demo account updated: ${DEMO_EMAIL}`);
  } else {
    await User.create({ name: "Demo Admin", email: DEMO_EMAIL, password: DEMO_PASSWORD, role: "manager" });
    console.log(`Demo account created: ${DEMO_EMAIL}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("createDemoAccount failed:", err);
  process.exit(1);
});
