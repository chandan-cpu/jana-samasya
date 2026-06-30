import dns from "dns";
import mongoose from "mongoose";
import { env } from "../config/env";

// Some Windows/sandboxed environments fail to resolve mongodb+srv:// SRV
// records via the system resolver; fall back to public DNS for this lookup.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log("Connected to MongoDB");
}
