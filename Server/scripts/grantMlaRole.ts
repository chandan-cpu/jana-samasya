import "dotenv/config";
import { createClerkClient } from "@clerk/backend";

async function main() {
  const clerkUserId = process.argv[2];
  if (!clerkUserId) {
    console.error("Usage: npm run grant-mla-role -- <clerkUserId>");
    process.exit(1);
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing CLERK_SECRET_KEY in environment");
    process.exit(1);
  }

  const clerkClient = createClerkClient({ secretKey });

  await clerkClient.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role: "mla" },
  });

  console.log(`Granted role "mla" to user ${clerkUserId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
