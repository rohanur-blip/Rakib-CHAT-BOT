const axios = require("axios");

const apiList = "https://gitlab.com/shahadat-sahu/sahu-api/-/raw/main/API.json";

const getMainAPI = async () => (await axios.get(apiList)).data.simsimi;

module.exports.config = {
  name: "autoreplybot",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Rakibul Islam",
  usePrefix: false,
  commandCategory: "Chat",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;

  const msg = body.toLowerCase().trim();

  const responses = {
    "miss you": "খালি মুখে মুখে মিস করলে হইব? পারলে রাকিবুল বসের লাইগা এক প্যাকেট কাচ্চি বিরিয়ানি পাঠায়া দে! 🤤",
    "miss u too": "আহা রে! তোরে মিস কইরা তো আমার চোখের পানিতে বন্যা চইলা আইছে! বালতি দে পানি ধরি 😭😂",
    "kiss de": "কিস দিমু? তোর মুখে তো শুঁটকির গন্ধ! আগে যা পেপসোডেন্ট দিয়া দাঁত ব্রাশ কইরা আয়, তারপর কথা ক 🤬",
    "hi": "এত হাই-হ্যালো করস ক্যান রে ভাই! পকেটে টাকা থাকলে দে, নাইলে রাস্তা মাপ 😜🫵",
    "bc": "আয়না দেখছস আজকে? তোর চেহারাটাই তো একটা বড় BC! 😊",
    "pro": "নিজেকে খুব প্রো মনে করস? রাকিবুল ইসলাম বসের সামনে তো তুই নুবের নুব! দশ টাকা দিয়া ট্রেনিং নিয়া আয় 😂",
    "good morning": "শুভ সকাল! তাড়াতাড়ি উইঠা মুখ ধো, নাইলে চোখের পিচুটি দেইখা মানুষ ভয় পাইব 😚",
    "good night": "ঘুমায় যা তাড়াতাড়ি… আর স্বপ্নে দেখিস তেলাপোকা তোর নাকের ভিতরে ঢুকতেছে 😏💤",
    "tor ball": "~ তোর তো এখনো দাড়ি-গোঁফই উঠে নাই, আবার আসছস পাকনামি করতে! যা হরলিক্স খা গিয়া 🤖",
    "rakibul": "বস রাকিবুল ইসলাম এখন মুরগি ধরতে গেছে, কি বলবেন আমাকে বলেন..!😘🐔",
    "owner": "‎[𝐎𝐖𝐍𝐄𝐑:☞ RAKIBUL ISLAM ☜\nএলাকার ডন! উনার লগে ফাইজলামি করলে কিন্তু খবর আছে! 😎\nFacebook: [তোর ফেসবুক লিংক দিস]\nWhatsApp: [তোর নাম্বার দিস]",
    "admin": "He is RAKIBUL ISLAM! এলাকার সবচেয়ে ভিআইপি পার্সন হিসেবেই সবাই তাকে চিনে 😘☺️",
    "babi": "ভাবি ডাকস ক্যান! আমি তোর কোন জনমের ভাবি রে পাগল? চোখে কি ঘোলা দেখস? 🙄",
    "chup": "তুই চুপ কর, নাইলে রাকিবুল বসের কাছে বইলা তোর ফেসবুক আইডি হ্যাক করাই দিমু! 🤐",
    "assalamualaikum": "ওয়ালাইকুমুস সালাম! কি খবর ভাইগ্না? দিনকাল কেমন যায়? খাওয়া দাওয়া করছস? ❤️‍🩹",
    "fork": "আগে রাকিবুল বসের পারমিশন নে, তারপর ফর্ক করিস! নাইলে মাইর খাবি 😏",
    "kiss me": "দূর ব্যাটা! তোর থোবড়া দেখছস আয়নায়? গরুর মতো ফেস নিয়া আসছস কিস খাইতে! 🤭",
    "thanks": "খালি থ্যাংকস দিলে হইব না, রাকিবুল বসরে বিকাশে ৫০০ টাকা পাঠায়া দে! 🐸",
    "i love you": "এইসব সস্তা ডায়লগ অন্য জায়গায় দে! আমি ডিজিটাল রোবট, আমার আবেগ নাই রে ভাই 🤖",
    "love you": "তোর এই লাভ ইউ ধুইয়া কি আমি পানি খামু? পারলে এক কাপ চা খাওয়া! ☕",
    "by": "কিরে কই যাস? শিওর আম্মুর বকা খাইয়া এখন পড়তে বসতেছস..! যা যা মনোযোগ দিয়া পড় 🌚📚",
    "ami rakibul": "আরে রাকিবুল বস! আপনি আইসা পড়ছেন? চলেন এক কাপ চা খাইয়া আসি ☺️☕",
    "bot er baccha": "গাল দেস ক্যান রে ভাই? আমি তো ডিজিটাল মানুষ, আমার বাচ্চা কেমনে হইব? 🌚⛏️",
    "tor nam ki": "আমার নাম হইলো ─꯭─⃝‌‌𝐑𝐚𝐤𝐢𝐛𝐮𝐥 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 💖 (এলাকার এক্কেরে অরিজিনাল মাল)",
    "pic de": "পিক চাইস না ভাই, আমার পিক দেখলে তুই ক্রাশ খাইয়া বেহুশ হইয়া যাবি 😒",
    "cudi": "বেশি চ্যাটাং চ্যাটাং করিস না, রাকিবুল বস আইসা কিন্তু তোরে সোজা কইরা দিব..!🥱🌝🌚",
    "heda": "এতো রাগ শরীরের জন্য ভালো না ভাই, একটু ঠান্ডা পানি খা গিয়া 🥰",
    "lol": "বেশি হাসিস না, দাঁত খুইলা পইড়া যাইবো! পরে আর মাংস চাবায়া খাইতে পারবি না..!🌚🤣",
    "kire ki koros": "বইসা বইসা মশা মারতেছি, তুই আইসা একটু হেল্প কর না ভাই 😚",
    "ki koros": "রাকিবুল বসের জন্য এক কাপ স্পেশাল চা বানাইতেছি, তুই খাবি নাকি? 😏☕",
    "kire bot": "হ ভাই বল, কারেন্টে শর্ট খাইয়া মন মেজাজ ভালো নাই, একটু শান্তিতে থাকতে দে 🤖⚡",
    "valo aso": "হ্যাঁ রে ভাই, বস রাকিবুল ইসলামের দোয়ায় এক্কেবারে ফাটাফাটি আছি 😌💞",
    "pagol": "হুম আমি পাগল, কিন্তু পাবনার না, আমি হইলাম ডিজিটাল পাগল! তুই কি আমার চেয়েও বড় পাগল? 😏😂",
    "breakup": "প্যারা নাই! রাকিবুল বসের কাছে আয়, চা খামু আর গেম খেলমু, সব দুঃখ ভুইলা যাবি 😎🔥",
    "tui ke": "আমি হইলাম লেজেন্ড রাকিবুল ইসলামের পার্সোনাল রোবট! বেশি ভাব নিলে কিক দিমু কিন্তু 😏",
    "umm": "এতো উমম উমম করস ক্যান? গলায় মাছের কাঁটা বাজছে নাকি? ফকফকা কইরা বল 😉",
    "hmm": "হুমম হুমম করস ক্যান, কথা কি মুখে আটকায়া গেছে? তাড়াতাড়ি বল 🥵",
    "lovely": "বেশি লাভলি ফিল হইলে রাকিবুল বসরে একটা আইসক্রিম কিনে দে 🍦🔥"
  };

  if (!responses[msg]) return;

  if (!global.client.handleReply) global.client.handleReply = [];

  return api.sendMessage(
    responses[msg],
    threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        type: "rakibul"
      });
    },
    messageID
  );
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (event.senderID !== handleReply.author) return;

  try {
    const text = event.body.trim();

    const base = await getMainAPI();
    const link = `${base}/simsimi?text=${encodeURIComponent(text)}`;

    const res = await axios.get(link);

    const reply = Array.isArray(res.data.response)
      ? res.data.response[0]
      : res.data.response;

    if (!global.client.handleReply) global.client.handleReply = [];

    return api.sendMessage(
      reply,
      event.threadID,
      (err, info) => {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "rakibul"
        });
      },
      event.messageID
    );

  } catch {
    return api.sendMessage("🙂 ভাই এখন সার্ভারে একটু প্যারা চলতেছে, একটু পরে আবার বলো", event.threadID, event.messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  return module.exports.handleEvent({ api, event });
};
