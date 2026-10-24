module.exports.config = {
  name: "autoreact",
  version: "1.4.0",
  hasPermission: 0,
  credits: "SHAHADAT SAHU", // Modified by Gemini
  description: "Bot React based on user's emoji or random",
  commandCategory: "No Prefix",
  cooldowns: 0,
};

module.exports.handleEvent = async ({ api, event }) => {
  const threadData = global.data.threadData.get(event.threadID) || {};
  if (threadData["🥰"] !== true) return;
  if (!event.body) return;

  // ইমোজি শনাক্ত করার রেগুলার এক্সপ্রেশন (Regex)
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  
  // ইউজারের মেসেজ থেকে ইমোজিগুলো খুঁজে বের করা
  const matchedEmojis = event.body.match(emojiRegex);
  
  let reactionEmoji;

  // যদি মেসেজে ইমোজি থাকে, তবে মেসেজের সর্বশেষ ইমোজিটি রিঅ্যাক্ট হিসেবে নেবে
  if (matchedEmojis && matchedEmojis.length > 0) {
    reactionEmoji = matchedEmojis[matchedEmojis.length - 1];
  } 
  // যদি মেসেজে কোনো ইমোজি না থাকে, তবে আগের লিস্ট থেকে র‍্যান্ডম ইমোজি নেবে
  else {
    const emojis = [
      "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
      "🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚",
      "😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩",
      "🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣",
      "😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬",
      "🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗",
      "🤭","🫢","🫣","🤫","🤔","🫡","🤐","🤨","😐","😑",
      "😶","🙄","😬","😮","😯","😲","😴","🤤","😪","😵",
      "🤐","🥴","🤢","🤮","🤧","😷","🤠","🥸","😈","👿",
      "👹","👺","🤡","💩","👻","💀","☠️","👽","👾","🤖",
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","🩷",
      "🩵","🩶","💔","❤️‍🔥","❤️‍🩹","💕","💞","💓","💗","💖",
      "💘","💝","💟","❣️","💯","💫","✨","⭐","🌟","🔥",
      "💥","⚡","🌈","☀️","🌙","🌸","🌺","🌻","🌹","🌷",
      "🌼","💐","🍀","🌿","🍁","🍂","🍃","🌱","🌴","🌵",
      "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👋","👏",
      "🙌","👐","🤲","🙏","💪","🫶","🫰","🤌","✍️","🤳",
      "💅","👀","👄","🫦","👂","👃","🧠","❤️‍🔥","💋","💏",
      "🎉","🎊","🎈","🎁","🎂","🎀","🎵","🎶","🎸","🎹",
      "🥁","🎧","🎤","🎬","🎮","🏆","🥇","🥈","🥉","⚽",
      "🏀","🏈","⚾","🎾","🏐","🏏","🏓","🥊","🏋️","🚀",
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
      "🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧",
      "🐦","🦋","🐝","🐞","🦄","🐴","🐢","🐍","🦎","🐊",
      "🐳","🐬","🐟","🐠","🦈","🐙","🦀","🦐","🦑","🐚"
    ];
    reactionEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  }

  api.setMessageReaction(reactionEmoji, event.messageID, err => {
    if (err) console.error("Error sending reaction:", err);
  }, true);
};

module.exports.run = async ({ api, event, Threads }) => {
  const { threadID, messageID, body } = event;
  const threadData = await Threads.getData(threadID);

  if (typeof threadData.data["🥰"] === "undefined")
    threadData.data["🥰"] = false;

  const action = body.trim().split(/\s+/)[1]?.toLowerCase();

  if (action === "on")
    threadData.data["🥰"] = true;
  else if (action === "off")
    threadData.data["🥰"] = false;
  else
    threadData.data["🥰"] = !threadData.data["🥰"];

  await Threads.setData(threadID, { data: threadData.data });
  global.data.threadData.set(threadID, threadData.data);

  api.sendMessage(
    `Auto-react is now ${threadData.data["🥰"] ? "ON 🟢" : "OFF 🔴"}`,
    threadID,
    messageID
  );
};
