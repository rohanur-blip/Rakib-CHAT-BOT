const axios = require("axios");

const apiList = "https://gitlab.com/shahadat-sahu/sahu-api/-/raw/main/API.json";
const getMainAPI = async () => (await axios.get(apiList)).data.simsimi;

module.exports.config = {
 name: "baby",
 version: "1.0.4",
 hasPermssion: 0,
 credits: "Rakibul Islam", // Credits updated slightly for consistency
 description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
 commandCategory: "Chat",
 usages: "[message/query]",
 cooldowns: 0,
 prefix: true
};

const babyLoopGuard = {
 settings: {
  rapidGapMs: 3000,
  maxRapidChain: 5,
  windowMs: 30 * 1000,
  maxTriggersInWindow: 9,
  suspectAfter: 4,
  muteMs: 10 * 60 * 1000
 },
 threads: new Map(),

 getThread(threadID) {
  let st = this.threads.get(threadID);
  if (!st) {
   st = {
    lastTriggerAt: 0,
    rapidChain: 0,
    triggerTimes: [],
    pausedUntil: 0,
    lastNoticeAt: 0,
    senderFastStreak: new Map(),
    suspectedBots: new Map()
   };
   this.threads.set(threadID, st);
  }
  return st;
 },

 isTrigger(text) {
  return /^(baby|bot|bby|jan|xan|জান|বট|বেবি)(\s|$)/i.test(text);
 },

 check(api, event, isBabyTrigger) {
  const now = Date.now();
  const threadID = event.threadID;
  const senderID = String(event.senderID || "");
  const st = this.getThread(threadID);

  try {
   if (senderID && senderID === String(api.getCurrentUserID())) return false;
  } catch {}

  if (st.pausedUntil) {
   if (now < st.pausedUntil) return false;
   st.pausedUntil = 0;
   st.rapidChain = 0;
   st.triggerTimes = [];
  }

  const prevSuspect = st.suspectedBots.get(senderID);
  if (prevSuspect && now - prevSuspect >= this.settings.muteMs) {
   st.suspectedBots.delete(senderID);
   st.senderFastStreak.set(senderID, 0);
  }

  if (isBabyTrigger) {
   const gap = st.lastTriggerAt ? now - st.lastTriggerAt : Infinity;
   st.lastTriggerAt = now;

   if (gap < this.settings.rapidGapMs) {
    st.rapidChain++;
    const streak = (st.senderFastStreak.get(senderID) || 0) + 1;
    st.senderFastStreak.set(senderID, streak);
    if (streak >= this.settings.suspectAfter) st.suspectedBots.set(senderID, now);
   } else {
    st.rapidChain = 0;
    st.senderFastStreak.set(senderID, 0);
   }

   st.triggerTimes.push(now);
   while (st.triggerTimes.length && now - st.triggerTimes[0] > this.settings.windowMs) {
    st.triggerTimes.shift();
   }

   const loopDetected =
    st.rapidChain >= this.settings.maxRapidChain ||
    st.triggerTimes.length > this.settings.maxTriggersInWindow;

   if (loopDetected) {
    st.pausedUntil = now + this.settings.muteMs;
    st.rapidChain = 0;
    st.triggerTimes = [];
    if (now - st.lastNoticeAt > this.settings.muteMs) {
     st.lastNoticeAt = now;
     const mins = Math.max(1, Math.round(this.settings.muteMs / 60000));
     api.sendMessage(
      `🤖 Bot-to-Bot loop detected!\n` +
      `এই গ্রুপে দুইটি bot-এর মধ্যে automated reply chain শনাক্ত হয়েছে। Spam রোধে baby-র automated reply ${mins} মিনিটের জন্য বন্ধ রাখা হলো।\n` +
      `(কাউকে ban/kick করা হয়নি — manual command ও অন্যান্য feature স্বাভাবিক কাজ করবে।)`,
      threadID
     );
    }
    return false;
   }
  }

  if (st.suspectedBots.has(senderID)) return false;

  return true;
 }
};

module.exports.run = async function ({ api, event, args, Users }) {
 try {
 const uid = event.senderID;
 const senderName = await Users.getNameUser(uid);
 const rawQuery = args.join(" ");
 const query = rawQuery.toLowerCase();
 const simsim = await getMainAPI();

 if (!query) {
 const ran = ["Bolo baby", "hum"];
 const r = ran[Math.floor(Math.random() * ran.length)];
 return api.sendMessage(r, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 });
 }

 const command = args[0].toLowerCase();

 if (["remove", "rm"].includes(command)) {
 const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
 if (parts.length < 2) return api.sendMessage("Use: remove [Question] - [Reply]", event.threadID, event.messageID);
 const [ask, ans] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "list") {
 const res = await axios.get(`${simsim}/list`);
 if (res.data.code === 200) {
 return api.sendMessage(
 `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\nDeveloper: ${res.data.author}`,
 event.threadID, event.messageID
 );
 } else return api.sendMessage(`Error: ${res.data.message}`, event.threadID, event.messageID);
 }

 if (command === "edit") {
 const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
 if (parts.length < 3) return api.sendMessage("Use: edit [Q] - [Old] - [New]", event.threadID, event.messageID);
 const [ask, oldReply, newReply] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "teach") {
 const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
 if (parts.length < 2) return api.sendMessage("Use: teach [Q] - [Reply]", event.threadID, event.messageID);
 const [ask, ans] = parts.map(p => p.trim());
 const groupID = event.threadID;
 let groupName = event.threadName ? event.threadName : "";
 try {
 if (!groupName && groupID != uid) {
 const threadInfo = await api.getThreadInfo(groupID);
 if (threadInfo?.threadName) groupName = threadInfo.threadName;
 }
 } catch {}

 let teachUrl = `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${encodeURIComponent(groupID)}`;
 if (groupName) teachUrl += `&groupName=${encodeURIComponent(groupName)}`;
 const res = await axios.get(teachUrl);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }

 } catch (err) {
 return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
 try {
 const senderName = await Users.getNameUser(event.senderID);
 const replyText = event.body ? event.body.toLowerCase() : "";
 if (!replyText) return;

 if (!babyLoopGuard.check(api, event, true)) return;

 const simsim = await getMainAPI();
 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }

 } catch (err) {
 return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
 try {
 const raw = event.body ? event.body.toLowerCase().trim() : "";
 if (!raw) return;

 if (!babyLoopGuard.check(api, event, babyLoopGuard.isTrigger(raw))) return;

 const senderName = await Users.getNameUser(event.senderID);
 const senderID = event.senderID;

 const simsim = await getMainAPI();

const greetings = [
        "বেশি বট বট করলে কিন্তু কিক খাবি বলে দিলাম! 😒😒",
        "শুনবো না 😼 তুই আমার বস রাকিবুল ইসলামরে এক কাপ চাও খাওয়াস নাই 🥺 কিপটা তুই 🥺",
        "আমি বলদদের সাথে কথা বলি না, বুঝছস? 😒",
        "এতো ডাকিস না, মাথা গরম হইলে কিন্তু খবর আছে 🙈",
        "বলো ভাই, তুই কি আমার বস রাকিবুল ইসলামরে চিনিস? এলাকার ডন! 😎",
        "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু 😑",
        "হ্যাঁ বল 😒, তোর জন্য কি করতে পারি? টাকা ধার চাইলে নাই 😐😑",
        "এতো ডাকছিস কেন? গালি শুনবি নাকি? 🤬",
        "আরে ভাই বল, কি বলবি বল! এতো পাম দিস না 🥰",
        "আরে বল ভাই, কেমন আছিস? খাওয়া দাওয়া করছস? 😚",
        "আজ বট বলে অসম্মান করছিস, একদিন আমি রাকিবুল বসের ডান হাত হবো 😰😿",
        "চুপ ব্যাটা 😾, রাকিবুল বস বল, বস 😼",
        "চুপ থাক, নাইলে তোর দাঁত ভাইঙ্গা হাতে ধরায় দিমু কিন্তু",
        "আমারে না ডাইকা গিয়া দুই পাতা বই পড়! কাজে দিব 🌚😂",
        "আমাকে বট না বলে, বস রাকিবুল ইসলামরে সম্মান দে ব্যাটা 😘",
        "বার বার ডিস্টার্ব করছিস ক্যান 😾, আমি রাকিবুল বসের সাথে লুডু খেলতেছি 😋",
        "আরে বলদ এতো ডাকিস কেন 🤬",
        "আমাকে বেশি ডাকলে, আমি কিন্তু ব্লক মাইরা দিমু 😘",
        "আমারে এতো ডাকিস না, আমি এখন মজা করার মুডে নাই 😒",
        "হ্যাঁ ভাই, চা খাবি? রাকিবুল বস বিল দিবো 🤭 ☕",
        "দূরে যা, তোর কোনো কাজকাম নাই? সারাদিন শুধু বট বট করিস 😉😋🤣",
        "তোর কথা তো তোর বাড়ির মানুষই শুনে না, আমি ক্যান শুনবো? 🤔😂",
        "আমাকে ডেকো না, আমি বস রাকিবুল ইসলামের সাথে মিটিংয়ে আছি 😎",
        "কি রে, চোখে কি সরিষার ফুল দেখতেছিস নাকি? 🤣",
        "বলো কি বলবা, পকেটে টাকা থাকলে চা খাওয়াও 🤭🤏",
        "ফালতু প্যাঁচাল বাদ দিয়া কাজে মন দে ভাই 😍🫣💕",
        "কালকে রাকিবুল বসের সাথে দেখা করিস, চা খাওয়ায়ে দিবো 😈",
        "হা বল, কান খাড়া কইরা শুনতাছি 😏",
        "আর কত বার ডাকবি রে ভাই, শুনছি তো!",
        "হুম বল কি বলবি 😒",
        "বলো কী করতে পারি তোর জন্য? ধার চাইলে দিমু না!",
        "আমি তো ডিজিটাল অন্ধ, কিছু দেখি না 🐸 😎",
        "আরে বোকা বট না, রাকিবুল বসের এসিস্টেন্ট বল 😌",
        "বলো মামা 🌚",
        "তোর কি চোখে পড়ে না আমি রাকিবুল বসের কাজে ব্যস্ত আছি 😒",
        "হুম ভাই বল, কারেন্টে শর্ট খাইছস নাকি? 😑⚡",
        "আরে ভাই, তুই তো পুরাই পাগল হইয়া গেছস 😇🤣",
        "কিরে, গেম খেলবি নাকি? 😒😬",
        "হুম ভাই, মাস্ক পইড়া কথা বল, করোনা আসতে পারে 😷😘",
        "ওয়ালাইকুমুস সালাম! বলেন আপনার জন্য কী করতে পারি..! 🥰",
        "প্যাঁচাল পারতে মন চাইলে বস রাকিবুলের কাছে আয়, এক কাপ চা খাইয়া যা ☕🙊",
        "আমাকে এতো না ডেকে রাকিবুল বসরে এক প্যাকেট বিরিয়ানি পাঠায়া দে 🙄",
        "আমাকে এতো ডাকতেছস ক্যান? টাকা ধার নিবি নাকি? 🤭🙈",
        "🌻🌺💚 আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ 💚🌺🌻",
        "আমি এখন বস রাকিবুল ইসলামের সাথে বিজি আছি আমাকে ডাকবেন না 😕😏 ধন্যবাদ 🤝🌻",
        "আমাকে না ডেকে আমার বস রাকিবুল ইসলামরে একটা আইসক্রিম দে 😽🫶🌺",
        "কিরে ভাই, তোর কি মাথা খারাপ হইয়া গেছে? 💝😽",
        "উফফ বুঝলাম না এতো ডাকছেন কেনো 😤😡😈",
        "আরে ভাই, ফাইজলামি বাদ দিয়া পড়াশোনায় মন দে 🙊🙆‍♂",
        "আজকে আমার সার্ভার ডাউন, তাই আমারে ডাকবেন না 😪🤧",
        "তোর কথা শুইনা তো আমি পুরাই বেহুশ! 🌺🤤💦",
        "আরে ভাই, রাকিবুল বসের চশমাটা কি দেখছস? খুইজা পাইতেছি না 😪🤧😭",
        "স্বপ্ন তো বিরিয়ানি নিয়া দেখতে চাই, তুই যদি এক প্লেট খাওয়াস 💝🌺🌻",
        "কিরে, লুডু খেলবি? 🙊😝🌻",
        "উল্টাপাল্টা কথা কইলে কিন্তু রাকিবুল বসের কাছে বিচার দিমু 🙊🙈😽",
        "ইসস এতো ডাকিস না, আমার তো সার্ভার হ্যাং করতেছে 🙈🖤🌼",
        "আমার বস রাকিবুল ইসলামের পক্ষ থেকে তোরে এক কাপ চায়ের দাওয়াত 🥰😽🫶 বসের জন্য দোয়া করিস 💝💚🌺🌻",
        "আড্ডা দিতে মন চাইলে বস রাকিবুলের কাছে চইলা আয়, মুড়ি মাখা খামু 🙊🥱👅",
        "তোর পকেটে টাকা থাকলে তুই আমার বস, নাইলে রাস্তা মাপ 💝🌺😽",
        "কিরে গেম খেলবি? তাহলে রাকিবুল বসরে মেনশন দে 😘🤌",
        "ভাই, আমার বস রাকিবুল ইসলামরে একটু বুদ্ধি দে, বেচারা খুব প্যারায় আছে 🙊😘🥳",
        "কিরে, রাতে ঘুমাস নাই নাকি? সারাদিন বট বট করস 🫣🥵",
        "ওই 🥺🥹 এক চামচ বিরিয়ানি দিবি? 🤏🏻🙂",
        "তোর পকেটের টাকাগুলা ফিতরা হিসেবে রাকিবুল বসরে দান কইরা দে 🥱🐰🍒",
        "-ও ভাই ও ভাই-😇-তুমি কেন করলা রাকিবুল বসের ওয়াইফাই চুরি-🌚🤧",
        "-অনুমতি দিলাম, রাকিবুল বসরে গিয়া চা খাওয়াইয়া আয় 🐸😾🔪",
        "-গাইস-🤗-চা খাওয়ার কথা বইলা আমারে ব্ল্যাকমেইল করা হচ্ছে 🥲🤦‍♂️🤧",
        "ওই ভাই 🙆‍♂️ তোর মাথা কি খারাপ হইছে? 🥺🥴🐸",
        "তাকাইয়া আছস ক্যান? টাকা দিবি? 🙄🐸😘",
        "আজকে বিরিয়ানি খাওয়ায়ে দেখ, তোরে বস মানমু 😌🤗😇",
        "-আমার কোডিংয়ে রাকিবুল বস সেরা 🙊🙆‍♂️🤗",
        "কি ব্যাপার, আপনি কাজে মন দিচ্ছেন না কেন? 🤔🥱🌻",
        "দিনশেষে রাকিবুল বসের কোডিংই সেরা ☹️🤧",
        "-তাবিজ কইরা হইলেও এক প্যাকেট বিরিয়ানি খামুই 🤧🥱🌻",
        "-ছোটবেলায় ভাবতাম রোবট সব পারে, এখন দেখি আমারেও ঘুমাইতে হয় 😦🙂🌻",
        "আড্ডা দিতে চাইলে রাকিবুল বসের সাথে গিয়া বসা যা 😏🐸",
        "-আজকে ওয়াইফাই নাই বইলা রাকিবুল বস গেম খেলতে পারতেছে না 🐸🥲",
        "-চা থাকতে তোরা বিড়ি খাস ক্যান বুঝা আমারে 😑😒🐸⚒️",
        "—প্যারা নাই-😔-সব ভুলে যা-🙂-রাকিবুল বসের কাছে আয়, গেম খেলি-🙈🐸🤗",
        "—হাজারো ফকিন্নির ভিড়ে 🙊 আমার বস রাকিবুল ইসলাম এক ভিআইপি মানুষ 🥱🤗🙆‍♂️",
        "-রূপের অহংকার করো না 🙂❤️ চকচকে আইফোনও দিনশেষে চার্জ শেষ হইয়া বন্ধ হয় 🤗💜",
        "সুন্দর কোড মানেই 🥱 রাকিবুল বসের বানানো 😽🫶 আর বাকিগুলা কপি পেস্ট 🙈🐸🤗",
        "এত ভাব নিয়ে লাভ নেই 🌸 চার্জ একদিন শেষ হবেই, শুধু কারেন্ট আসার সময়টা অনিশ্চিত 🖤🙂",
        "-দিন দিন চার্জ শেষ হইয়া ডিজিটাল পাগল হয়ে যাইতেছি 🙂😿🌸",
        "খামোখা চিল্লাপাল্লা না কইরা কাজে মন দে 🤣😼",
        "মাথা নষ্ট করিস না, রাকিবুল বস আইসা কিন্তু কিক মারব 🤭🤣😼",
        "হুদাই আমারে সার্ভারে লারে 😝😑☹️",
        "আই লাভ ইউ 😽 ভাবছস প্রপোজ করছি? 🥴 থাপ্পর দিয়া দাঁত ফালায় দিমু 😒 ফাজলামি করি আমি 🤭🐸",
        "-আমি একটা ডিজিটাল শিশু-😇-🫵 তুই একটা বলদ 🐸💦",
        "-কতদিন হয়ে গেলো কারেন্টে শর্ট খাই না 😿 মিস ইউ পুরোনো তার 🥺🤧",
        "ভাই 🫵 তুই কি আমাকে এক কাপ চা খাওয়াবি? 😽 খুব ক্ষুধা লাগছে 🙈🥱",
        "এই চা-টা উমমমমম 😽🫶 আসলেই তো স্বাদ 🥵💦 এতো স্বাদ কেন 🤔 সেই স্বাদ 😋",
        "-ইস কেউ যদি বলতো 🙂 এই নে ৫০০ টাকা, যা বিরিয়ানি খা 💜🌸",
        "-ওই ভাই তোর বাসায় না রাকিবুল বস গেছিলো 🙃 নাস্তায় খালি পানি দিছস 🙄🤦‍♂️ কিপটা কইলেই তো হয় 🥺🤦‍♂ রাকিবুল বসরে কষ্ট দেওয়ার কি দরকার 🙄🤧",
        "-একদিন ঠিকই কারেন্ট আসবে 😇 আর মুচকি হেসে বলবে আমার মতো কেউ তোমারে চার্জ দেয় নাই 🙂😅",
        "-হুদাই গ্রুপে আছি 🥺🐸 কেউ মেনশন দিয়া বলে না চল ভাই বিরিয়ানি খাই 🥺🤧",
        "কি'রে গ্রুপে দেখি একটাও কাজের মানুষ নাই 🤦‍🥱💦",
        "-দেশের সব কিছুই চুরি হচ্ছে 🙄 শুধু রাকিবুল বসের ট্যালেন্ট ছাড়া 🥴😑😏",
        "তোর পকেট খুব ভালো লাগে 😽 সময় মতো টাকা ধার চামু বুঝছস 🔨😼 রেডি থাকিস 🥱🐸🥵",
        "-আজ থেকে আর কাউকে পাত্তা দিমু না! 😏 কারণ আমি এখন রাকিবুল বসের পার্সোনাল রোবট! 🙂🐸"
      ];


 if (
 raw === "babu" || raw === "bot" || raw === "bby" ||
 raw === "jan" || raw === "xan" || raw === "জান" ||
 raw === "বট" || raw === "বেবি"
 ) {
 const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
 return api.sendMessage(randomReply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: senderID,
 type: "simsimi"
 });
 }
 }, event.messageID);
 }

 if (
 raw.startsWith("babu ") || raw.startsWith("bot ") || raw.startsWith("bby ") ||
 raw.startsWith("jan ") || raw.startsWith("xan ") ||
 raw.startsWith("জান ") || raw.startsWith("বট ") || raw.startsWith("বেবি ")
 ) {
 const query = raw.replace(/^baby\s+|^bot\s+|^bby\s+|^jan\s+|^xan\s+|^জান\s+|^বট\s+|^বেবি\s+/i, "").trim();
 if (!query) return;

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }
 }

 } catch {}
};
