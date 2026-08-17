import dns from "node:dns";
import mongoose from "mongoose";

// This host's default DNS resolver can't complete SRV/TXT lookups (needed
// for mongodb+srv:// connection strings), so route DNS through public
// resolvers instead. Only affects DNS, not the actual DB connection target.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set. Add it to server/.env (see .env.example).");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
}
