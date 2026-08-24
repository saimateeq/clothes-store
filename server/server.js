import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Render's containers have no outbound IPv6 route, but Node's default DNS
// order can still hand back smtp.gmail.com's AAAA record first — the
// connection then hangs and fails with ENETUNREACH instead of falling back
// to IPv4. Prefer IPv4 for every outbound lookup process-wide.
dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`VELORA API listening on http://localhost:${PORT}`);
  });
}

start();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
