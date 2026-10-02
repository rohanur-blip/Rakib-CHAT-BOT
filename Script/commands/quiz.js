const axios = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const CONFIG_URL = "https://gitlab.com/shahadat-sahu/sahu-api/-/raw/main/API.json";

module.exports.config = {
  name: "quiz",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SHAHADAT SAHU",
  description: "Multiplayer Quiz with 40s timer",
  commandCategory: "Game",
  usages: "quiz",
  cooldowns: 0,
  usePrefix: true
};

const TIME_LIMIT = 40000; // ৪০ সেকেন্ড করা হয়েছে
let QUIZ_API = null;

async function loadQuizAPI() {
  try {
    if (QUIZ_API) return QUIZ_API;
    const res = await axios.get(CONFIG_URL);
    QUIZ_API = res.data.quize.replace(/\/$/, "");
    return QUIZ_API;
  } catch {
    return null;
  }
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  if (!global.client.handleReply) global.client.handleReply = [];

  try {
    const quizAPI = await loadQuizAPI();
    if (!quizAPI) return api.sendMessage("Quiz API error call boss SAHU✔️", threadID, messageID);

    const res = await axios.get(quizAPI + "/quiz");
    const data = res.data;

    if (!data || !data.question) {
      return api.sendMessage("❌ No quiz available", threadID, messageID);
    }

    const msg =
      `🎮 𝗚𝗮𝗺𝗲 𝗤𝘂𝗶𝘇 𝗦𝘁𝗮𝗿𝘁𝗲𝗱\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🔻 ${data.question}\n\n` +
      `A › ${data.A}\n` +
      `B › ${data.B}\n` +
      `C › ${data.C}\n` +
      `D › ${data.D}\n\n` +
      `⏰ 40s • Reply: A/B/C/D\n` +
      `💡 (সবাই উত্তর দিতে পারবে, ৪০ সেকেন্ড পর সঠিক উত্তর জানানো হবে)`;

    api.sendMessage(msg, threadID, (err, info) => {
      if (err) return;

      const timeout = setTimeout(async () => {
        const i = global.client.handleReply.findIndex(e => e.messageID === info.messageID);
        if (i === -1) return;

        const hr = global.client.handleReply[i];

        try {
          // সঠিক উত্তর বের করা হচ্ছে 
          const result = await axios.post(quizAPI + "/quiz/answer", {
            sessionID: hr.sessionID,
            answer: ""
          });

          const correctAns = result.data.answer;
          let correctLetter = correctAns;

          // API যদি অপশনের ভ্যালু পাঠায়, তবে তা A/B/C/D এর সাথে ম্যাচ করে লেটার বের করা
          if (!["A", "B", "C", "D"].includes(correctAns)) {
            if (hr.quizData.A === correctAns) correctLetter = "A";
            else if (hr.quizData.B === correctAns) correctLetter = "B";
            else if (hr.quizData.C === correctAns) correctLetter = "C";
            else if (hr.quizData.D === correctAns) correctLetter = "D";
          }

          // রেজাল্ট হিসাব করা
          const participants = hr.participants || {};
          let totalParticipants = Object.keys(participants).length;
          let winnersCount = 0;

          for (const uid in participants) {
            if (participants[uid] === correctLetter) {
              winnersCount++;
            }
          }

          let replyMsg = `⏰ সময় শেষ!\n✅ সঠিক উত্তর: ${correctAns}\n━━━━━━━━━━━━━━━━━━\n`;
          
          if (totalParticipants === 0) {
            replyMsg += `😔 কেউই কুইজের উত্তর দেয়নি!`;
          } else {
            replyMsg += `📊 মোট উত্তর দিয়েছেন: ${totalParticipants} জন\n🏆 সঠিক উত্তর দিয়েছেন: ${winnersCount} জন`;
          }

          api.sendMessage(replyMsg, threadID);
          
        } catch (error) {
          api.sendMessage("❌ ফলাফল লোড করতে সমস্যা হয়েছে!", threadID);
        }

        // কুইজের মেসেজ আনসেন্ড করে দেওয়া হবে এবং handleReply ডিলিট হবে
        await api.unsendMessage(info.messageID).catch(() => {});
        global.client.handleReply.splice(i, 1);

      }, TIME_LIMIT);

      // handleReply তে গেমের ডাটা সেভ করা হচ্ছে
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        sessionID: data.sessionID,
        quizData: data,
        participants: {}, // সবার উত্তর সেভ রাখার জন্য
        timeout
      });
    }, messageID);

  } catch {
    api.sendMessage("Quiz API error call boss SAHU✔", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, body, messageID, senderID } = event;

  const ans = body.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(ans)) return;

  if (!handleReply.participants) handleReply.participants = {};

  // কেউ যদি দ্বিতীয়বার উত্তর দিতে চায়
  if (handleReply.participants[senderID]) {
    return api.sendMessage("⚠️ তুমি ইতিমধ্যে উত্তর দিয়েছ, ফলাফলের জন্য অপেক্ষা করো!", threadID, messageID);
  }

  // ইউজারের উত্তর সেভ করা হচ্ছে
  handleReply.participants[senderID] = ans;
  
  // উত্তর রিসিভ হলে মেসেজে রিয়েক্ট দেওয়া হবে
  api.setMessageReaction("👍", messageID, (err) => {}, true);
};
