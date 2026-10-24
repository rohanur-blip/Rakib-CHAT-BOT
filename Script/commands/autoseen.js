const fs = require("fs-extra");
const path = require("path");

// ফাইলের সঠিক লোকেশন সেট করা হলো
const filePath = path.join(__dirname, "cache", "autoseen.txt");

// ফাইল না থাকলে তৈরি করা এবং গ্লোবাল ভেরিয়েবলে ডাটা সেভ করা
if (!fs.existsSync(filePath)) {
  fs.ensureFileSync(filePath);
  fs.writeFileSync(filePath, "true");
}

// বটের স্পিড ঠিক রাখতে ডাটা মেমরিতে ক্যাশ (cache) করা হলো
if (typeof global.autoseenState === "undefined") {
  global.autoseenState = fs.readFileSync(filePath, "utf8") === "true";
}

module.exports.config = {
  name: "autoseen",
  version: "1.1.0",
  hasPermssion: 3, // Admin Only
  credits: "Rakibul Islam", // নাম পরিবর্তন করা হয়েছে
  description: "Auto seen messages without lagging the bot",
  commandCategory: "tools",
  usages: "on/off",
  cooldowns: 0
};

module.exports.handleEvent = async ({ api }) => {
  // ফাইল রিড করার বদলে সরাসরি মেমরি থেকে চেক করবে (সুপার ফাস্ট)
  if (global.autoseenState === true) {
    api.markAsReadAll(() => {});
  }
};

module.exports.run = async ({ api, event, args }) => {
  const action = args[0]?.toLowerCase();

  if (!["on", "off"].includes(action)) {
    return api.sendMessage(
      `⚠️ সঠিক নিয়ম: ${global.config.PREFIX}autoseen on/off`,
      event.threadID,
      event.messageID
    );
  }

  const isTurningOn = action === "on";

  // মেমরি ও ফাইলে একসাথে আপডেট করা হলো
  global.autoseenState = isTurningOn;
  fs.writeFileSync(filePath, isTurningOn ? "true" : "false");

  api.sendMessage(
    `✅ Autoseen is now ${isTurningOn ? "ON 🟢" : "OFF 🔴"}`,
    event.threadID,
    event.messageID
  );
};
