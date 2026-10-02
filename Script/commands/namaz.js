const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "namaz",
    aliases: ["namz", "namaj"],
    version: "1.2.0",
    hasPermssion: 0,
    credits: "SHAHADAT SAHU",
    description: "Show prayer times by city and auto remind",
    commandCategory: "Islamic",
    usages: "namaz [city name]",
    cooldowns: 10,
    usePrefix: true,
    dependencies: {
        axios: ""
    }
};

const PRAYER_NAMES = [
    ["Fajr", "ফজর"],
    ["Sunrise", "সূর্যোদয়"],
    ["Dhuhr", "যোহর"],
    ["Asr", "আসর"],
    ["Maghrib", "মাগরিব"],
    ["Isha", "ইশা"]
];

function cleanTime(value) {
    return String(value || "N/A")
        .replace(/\s*\(.+?\)\s*/g, "")
        .trim();
}

// রিমাইন্ডার ডাটা সেভ করার জন্য ফাইলের লোকেশন
const pathData = path.join(__dirname, "namazReminders.json");

// বট চালু হওয়ার সময় এই ফাংশনটি কাজ করবে
module.exports.onLoad = function ({ api }) {
    if (!global.namazReminders) {
        if (fs.existsSync(pathData)) {
            global.namazReminders = JSON.parse(fs.readFileSync(pathData, "utf-8"));
        } else {
            global.namazReminders = {};
        }
    }
    
    if (!global.prayerCache) {
        global.prayerCache = {}; 
    }

    // প্রতি ১ মিনিট পর পর সময় চেক করার লুপ
    setInterval(async () => {
        const now = new Date();
        // বাংলাদেশের বর্তমান সময় (HH:mm ফরম্যাটে) বের করা হচ্ছে
        const currentTime = now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Dhaka",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });
        
        const currentDate = now.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" }); // DD/MM/YYYY

        for (const threadID in global.namazReminders) {
            const city = global.namazReminders[threadID];
            let timings = null;

            // ডাটা ক্যাশে থাকলে সেখান থেকে নিবে, নাহলে API থেকে নিবে (API ব্যান থেকে বাঁচতে)
            if (global.prayerCache[city] && global.prayerCache[city].date === currentDate) {
                timings = global.prayerCache[city].times;
            } else {
                try {
                    const response = await axios.get("https://api.aladhan.com/v1/timingsByCity", {
                        params: { city, country: "Bangladesh", method: 1 }
                    });
                    timings = response.data.data.timings;
                    global.prayerCache[city] = { date: currentDate, times: timings };
                } catch (e) {
                    continue;
                }
            }

            if (timings) {
                // বর্তমান সময়ের সাথে নামাজের ওয়াক্ত মিলছে কিনা চেক করা
                for (const [key, label] of PRAYER_NAMES) {
                    if (key === "Sunrise") continue; // সূর্যোদয়ের সময় রিমাইন্ড দিবে না

                    const prayerTime = cleanTime(timings[key]);
                    if (currentTime === prayerTime) {
                        const msg = `🕋 𝗔𝗹𝗮𝗿𝗺: নামাজের সময় হয়েছে!\n\nএখন 📍${city} সিটিতে 🕌 ${label} এর ওয়াক্ত শুরু হয়েছে।\nসবাইকে নামাজ পড়ার জন্য অনুরোধ করা হলো।`;
                        api.sendMessage(msg, threadID);
                    }
                }
            }
        }
    }, 60000); // 60000ms = 1 minute
};

module.exports.run = async function ({ api, event, args }) {
    const city = args.join(" ").trim();

    if (!city) {
        return api.sendMessage(
            "⚠️ Please enter a city name.\n\nExample:\n/namaz Khagrachari\n/namaz Dhaka\n/namaz Chattogram",
            event.threadID,
            event.messageID
        );
    }

    const country = "Bangladesh";

    try {
        const response = await axios.get(
            "https://api.aladhan.com/v1/timingsByCity",
            {
                timeout: 15000,
                params: {
                    city,
                    country,
                    method: 1
                }
            }
        );

        const payload = response.data?.data;
        const timings = payload?.timings;

        if (!timings) {
            throw new Error("Prayer data not found");
        }

        // যে গ্রুপ থেকে কমান্ড দেওয়া হয়েছে সেখানে রিমাইন্ডার সেভ করা
        if (!global.namazReminders) global.namazReminders = {};
        global.namazReminders[event.threadID] = city;
        fs.writeFileSync(pathData, JSON.stringify(global.namazReminders, null, 2), "utf-8");

        const date = payload.date || {};

        const lines = PRAYER_NAMES.map(
            ([key, label]) =>
                `🕌 ${label}: ${cleanTime(timings[key])}`
        );

        const body =
`🕌 𝗡𝗮𝗺𝗮𝘇 𝗧𝗶𝗺𝗲

📍 𝗖𝗶𝘁𝘆: ${city}, ${country}
📅 𝗗𝗮𝘁𝗲: ${date.readable || "Today"}
🌙 𝗛𝗶𝗷𝗿𝗶: ${date.hijri?.date || "N/A"}

${lines.join("\n")}

✅ এই গ্রুপের জন্য স্বয়ংক্রিয় রিমাইন্ডার চালু করা হয়েছে! ওয়াক্ত শুরু হলে মেসেজ দেওয়া হবে।
🆓 Source: Aladhan free API`;

        return api.sendMessage(
            body,
            event.threadID,
            event.messageID
        );

    } catch (error) {
        return api.sendMessage(
            `⚠️ ${city}-এর নামাজের সময় পাওয়া যায়নি!`,
            event.threadID,
            event.messageID
        );
    }
};
