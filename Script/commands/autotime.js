const schedule = require("node-schedule");

module.exports.config = {
  name: "autosent",
  version: "1.3.0", // ভার্সন আপডেট করা হয়েছে
  hasPermssion: 0,
  credits: "Rakibul Islam", // নাম পরিবর্তন করা হয়েছে
  description: "Automatically sends scheduled messages with Anti-Spam protection",
  commandCategory: "group messenger",
  usages: "[]",
  cooldowns: 0
};

const messages = [
    { time: '12:00 AM', message: 'এখন সময় রাত 12:00 AM ⏳\nঅনেক রাত হলো, ঘুমিয়ে পড় Bby Good Night 😴💤❤️' },
    { time: '1:00 AM', message: 'এখন সময় রাত 1:00 AM ⏳\nকিরে তুই এখনো ঘুমাস নাই? তাড়াতাড়ি ঘুমিয়ে পড়!😾😴🛌' },
    { time: '2:00 AM', message: 'এখন সময় রাত 2:00 AM ⏳\nঘুমে আয় ভাই! এখনো জাইগা আফসোস ক্যান?😤👊💤' },
    { time: '3:00 AM', message: 'এখন সময় রাত 3:00 AM ⏳\nসবাই ঘুমাইয়া গেছে, তুই এখন জাইগা আসোস ক্যান?🙄🌃🛌' },
    { time: '4:00 AM', message: 'এখন সময় ভোর 4:00 AM ⏳\nএকটু পর আজান হবে, সময় হয়ে গেছে। 🕌🕋🕓' },
    { time: '5:00 AM', message: 'এখন সময় ভোর 5:00 AM ⏳\nফজরের আজান হয়ে গেছে, নামাজটা পরে নিও পিও~ 🕌✨🤲💖' },
    { time: '6:00 AM', message: 'এখন সময় সকাল 6:00 AM ⏳\nআসসালামুয়ালাইকুম Good Morning Bby! এখন বিছানা থেকে উঠে ব্যায়াম টা করে ফেল 🌅💖😳' },
    { time: '7:00 AM', message: 'এখন সময় সকাল 7:00 AM ⏳\nঘুম ভাঙতেই মোবাইল! দাঁত ব্রাশটা করবি তো নাকি!🛌➡️📱' },
    { time: '8:00 AM', message: 'এখন সময় সকাল 8:00 AM ⏳\nপিও, মোবাইল রেখে দাঁত ব্রাশ করে খেয়ে নাও!📱🪥🍽️' },
    { time: '9:00 AM', message: 'এখন সময় সকাল 9:00 AM ⏳\nBby, Breakfast korco?🍳🥞💖' },
    { time: '10:00 AM', message: 'এখন সময় সকাল 10:00 AM ⏳\nকিরে ভন্ড, তুই আজ কলেজ যাস নাই? 😜📚🙄' },
    { time: '11:00 AM', message: 'এখন সময় সকাল 11:00 AM ⏳\nনাটক কম কর পিও~ বস এখন বিজি আছে!🙄📱💼' },
    { time: '12:00 PM', message: 'এখন সময় দুপুর 12:00 PM ⏳\nGood Afternoon! 🌞🙌🌸' },
    { time: '1:00 PM', message: 'এখন সময় দুপুর 1:00 PM ⏳\nভন্ড কোথাকার মোবাইল বন্ধ করে জোহরের নামাজ পড়ে নাও😻❣️🥰' },
    { time: '2:00 PM', message: 'এখন সময় দুপুর 2:00 PM ⏳\nভন্ড কোথাকার, মোবাইল রাখ! গোসল করে খাওয়া-দাওয়া করে নে🔪🛁🍽️' },
    { time: '3:00 PM', message: 'এখন সময় বিকেল 3:00 PM ⏳\nJan, তোমাকে ছাড়া আর দুপুরে ঘুম হয় না….!😴💔🌙' },
    { time: '4:00 PM', message: 'এখন সময় বিকেল 4:00 PM ⏳\nঅনেক গরম পড়েছিল আজ! 🥵🌞💦' },
    { time: '5:00 PM', message: 'এখন সময় বিকেল 5:00 PM ⏳\nপরিস্থিতি যেমনি হোক না কেন, সব সময় হলে হাসতেই হবে! 😅🕒🙂' },
    { time: '6:00 PM', message: 'এখন সময় সন্ধ্যা 6:00 PM ⏳\nGood Evening Everyone! সবাই হাত মুখ ধুয়ে নাও! 🌆👐💦' },
    { time: '7:00 PM', message: 'এখন সময় সন্ধ্যা 7:00 PM ⏳\nকিরে ভন্ড, তুই আজ পড়তে বসছিলি নাকি?😏📚🤔' },
    { time: '8:00 PM', message: 'এখন সময় রাত 8:00 PM ⏳\nওই ওই, এতো bot bot না করে আমার বস রাকিবুল কে একটা গফ দে...!🫰😎🔥' }, // নাম পরিবর্তন করা হয়েছে
    { time: '9:00 PM', message: 'এখন সময় রাত 9:00 PM ⏳\nআমার cute bby টাহ খানা খাইছে...!😘🍽️❤️' },
    { time: '10:00 PM', message: 'এখন সময় রাত 10:00 PM ⏳\nকিরে ভন্ড, খাইবি কখন? সারাদিন মোবাইল টিপস..!😜📱😾' },
    { time: '11:00 PM', message: 'এখন সময় রাত 11:00 PM ⏳\nযে ছেড়ে গেছে 😔 তাকে ভুলে যাও 🙂 আমার বস রাকিবুল এর সাথে প্রেম করে তাকে দেখিয়ে দাও...!🙈🐸🤗' } // নাম পরিবর্তন করা হয়েছে
];

module.exports.onLoad = ({ api }) => {
  if (global.config?.autoSent === false) return;

  messages.forEach(({ time, message }) => {
    if (!time || !message) return;

    const [hourStr, minuteStr, period] = time.split(/[: ]/);
    let hour24 = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    }
    if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    const rule = new schedule.RecurrenceRule();
    rule.tz = "Asia/Dhaka";
    rule.hour = hour24;
    rule.minute = minute;

    schedule.scheduleJob(rule, async () => {
      if (global.config?.autoSent === false) return;

      const threadIDs = global.data?.allThreadID;

      // যদি বটের ডাটাবেসে কোনো গ্রুপ না থাকে তবে কোডটি রিটার্ন করবে
      if (!Array.isArray(threadIDs) || threadIDs.length === 0) return;

      // Anti-spam এবং Error Handling সিস্টেম
      for (const threadID of threadIDs) {
        try {
          api.sendMessage(message, threadID);
          // ফেসবুক যেন স্প্যাম না ভাবে তার জন্য 300 মিলিসেকেন্ড অপেক্ষা করবে
          await new Promise(resolve => setTimeout(resolve, 300)); 
        } catch (error) {
          console.error(`Error sending message to thread ${threadID}:`, error);
        }
      }
    });
  });
};

module.exports.run = () => {};
