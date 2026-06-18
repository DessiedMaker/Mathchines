import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const env = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf-8");
const lines = env.split("\n");
const processEnv: Record<string, string> = {};
for (const line of lines) {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts
      .slice(1)
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");
    processEnv[key] = val;
  }
}

const url = processEnv.SUPABASE_URL || processEnv.VITE_SUPABASE_URL;
const key = processEnv.SUPABASE_PUBLISHABLE_KEY || processEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  console.log('Checking if "curricula" table exists on Supabase...');
  try {
    const { data, error } = await supabase.from("curricula").select("*").limit(1);
    if (error) {
      console.log("Error querying table:", error.code, error.message);
      if (
        error.message.includes('relation "public.curricula" does not exist') ||
        error.code === "PGRST116"
      ) {
        console.log(
          '👉 RESULT: The "curricula" table DOES NOT exist. Migrations have not been applied.',
        );
      } else {
        console.log("👉 RESULT: Unknown query failure.");
      }
    } else {
      console.log('👉 RESULT: SUCCESS! The "curricula" table exists. Data:', data);
    }
  } catch (err: any) {
    console.error("Fetch crashed:", err.message);
  }
}

test();
