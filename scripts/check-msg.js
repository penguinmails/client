const fs = require("fs");
const path = require("path");
const messages = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../messages/en.json"), "utf8")
);
const get = (obj, key) =>
  key.split(".").reduce((a, b) => (a ? a[b] : undefined), obj);
console.log("exists:", !!get(messages, "Settings.profile.avatar.title"));
console.log("value:", get(messages, "Settings.profile.avatar.title"));
