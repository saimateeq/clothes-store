import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

async function run() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("ADMIN_EMAIL not set in .env");
    process.exit(1);
  }
  const user = await User.findOne({ email }).lean();
  if (!user) {
    console.log(`No user found for ${email}`);
  } else {
    console.log(`Found user: ${user.email} — role=${user.role} — isActive=${user.isActive}`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
