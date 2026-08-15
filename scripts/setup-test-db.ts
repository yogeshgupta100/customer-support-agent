import "dotenv/config";
import { execSync } from "node:child_process";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  console.error("TEST_DATABASE_URL is not set. Add it to your .env file.");
  process.exit(1);
}

const testEnv = { ...process.env, DATABASE_URL: testUrl };

console.log("Applying migrations to test database...");
execSync("npx prisma migrate deploy", { stdio: "inherit", env: testEnv });

console.log("Seeding test database...");
execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: testEnv });

console.log("Test database ready.");
