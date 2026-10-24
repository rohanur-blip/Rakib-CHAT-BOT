module.exports.config = {
  name: "tag",
  version: "1.1.0",
  hasPermssion: 2, // শুধুমাত্র গ্রুপ এডমিন বা বট এডমিন
  credits: "Rakibul Islam", // নাম পরিবর্তন করা হয়েছে
  description: "Group এ সবাইকে নির্দিষ্ট সংখ্যায় মেনশন পাঠানো",
  commandCategory: "group",
  usages: "[সংখ্যা] (যেমন: /tag 5)",
  cooldowns: 5 // স্প্যাম এড়াতে কুলডাউন বাড়ানো হয়েছে
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const { threadID, messageID } = event;
    
    // ইউজার সংখ্যা না দিলে বাই-ডিফল্ট ১ বার কাজ করবে
    let repeatCount = parseInt(args[0]) || 1;

    // Anti-Spam: সর্বোচ্চ ২০ বারের বেশি ট্যাগ করা যাবে না
    if (repeatCount > 20) {
      return api.sendMessage("⚠️ স্প্যাম রোধ করতে সর্বোচ্চ ২০ বার ট্যাগ করা যাবে!", threadID, messageID);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const memberIDs = threadInfo.participantIDs;

    // বট নিজেকে মেনশন করবে না
    const mentions = memberIDs
      .filter(id => id != api.getCurrentUserID())
      .map(id => ({ tag: "@everyone", id }));

    // ইউজারকে জানিয়ে দেওয়া যে কাজ শুরু হয়েছে
    if (repeatCount > 1) {
      api.sendMessage(`✅ ${repeatCount} বার মেনশন দেওয়া শুরু হলো...`, threadID, messageID);
    }

    for (let i = 0; i < repeatCount; i++) {
      await api.sendMessage({
        body: `📢 @everyone\nসবাই চিপা থেকে বের হও 🐸`,
        mentions
      }, threadID);

      // ফেসবুক যেন স্প্যাম ব্লক না করে তাই ৩ সেকেন্ড (3000ms) গ্যাপ
      await new Promise(resolve => setTimeout(resolve, 3000)); 
    }
  } catch (error) {
    console.error("Tag command error:", error);
    api.sendMessage("⚠️ মেনশন দিতে সমস্যা হয়েছে! সম্ভবত বট রেস্ট্রিক্ট খেয়েছে।", event.threadID);
  }
};
