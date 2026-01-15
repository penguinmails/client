import fs from "fs";
import path from "path";

// Utility to safely fetch nested keys from messages using dot-separated path
function getMessage(obj: any, key: string) {
  return key.split(".").reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[part];
  }, obj);
}

function collectTranslationKeys(dir: string, ext = /\.(ts|tsx|js|jsx)$/i) {
  const keys: Set<string> = new Set();

  function walk(dirPath: string) {
    for (const name of fs.readdirSync(dirPath)) {
      const full = path.join(dirPath, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (ext.test(name)) {
        const content = fs.readFileSync(full, "utf8");
        const regex = /t\(\s*["'`]([^"'`]+)["'`]\s*(?:,|\))/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
          keys.add(m[1]);
        }
      }
    }
  }

  walk(dir);
  return Array.from(keys);
}

describe("i18n: translation keys are present in en.json", () => {
  const messagesPath = path.resolve(__dirname, "../messages/en.json");
  const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));

  test("all used translation keys exist in en.json", () => {
    const projectRoot = path.resolve(__dirname, "..");
    const includeDirs = ["app", "features", "shared", "components", "lib"]; // scan only main source folders
    let keys: string[] = [];
    for (const dir of includeDirs) {
      const full = path.join(projectRoot, dir);
      if (fs.existsSync(full)) {
        keys = keys.concat(collectTranslationKeys(full));
      }
    }
    keys = Array.from(new Set(keys));

    // Only consider likely i18n keys: must contain a dot AND start with an uppercase letter
    // (project top-level namespaces like Settings, Login, Common, etc.)
    const i18nKeyRegex = /^[A-Z][A-Za-z0-9_\-\/]*(?:\.[A-Za-z0-9_\-\/]*)+$/; // Must include at least one dot and only valid characters
    // NOTE: segments must have at least one character after dots
    // tightened below at runtime for better readability
    const i18nSegmentRegex = /^[A-Za-z0-9_\-\/]+$/;

    const missing: string[] = [];
    for (const key of keys) {
      if (!i18nKeyRegex.test(key)) continue;
      // skip dynamic template keys like q${i + 1}
      if (key.includes("${")) continue;
      // ensure each dot-separated segment is valid and non-empty
      const segments = key.split('.').slice(1); // drop the top-level namespace
      if (!segments.every((s) => i18nSegmentRegex.test(s))) continue;
      // Skip literal strings sometimes used in tests/stories (e.g. "Saving...", "Loading...")
      if (key.includes(' ') || key.includes('...')) continue;
      const val = getMessage(messages, key);
      if (val === undefined) missing.push(key);
    }

    if (missing.length > 0) {
      // Helpful error message for debugging
      const sample = missing.slice(0, 10).map((k) => `  - ${k}`).join("\n");
      const remaining = missing.length - 10;
      const moreMessage = remaining > 0 ? `\n...and ${remaining} more` : '';
      throw new Error(
        `Missing translation keys in messages/en.json:\n${sample}${moreMessage}`
      );
    }
  });
});
