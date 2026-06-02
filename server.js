const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - গেটওয়ে সকেট প্রোটোকল লক ভাই ভাই]
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob:; style-src * 'unsafe-inline'; font-src * data:;");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক ভাই ভাই]
const MAIN_SITE_URL = "https://onrender.com"; 

// 🃏 ওরিজিনাল ইন্টারন্যাশনাল কার্ড সুটস এবং র‍্যাঙ্ক পুল
const cardSuitsPool = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স ইন্টারসেপ্টর গেটওয়ে
app.get('/api/andar-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    try {
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet,
            game: "Andar-Bahar"
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok" && response.data.balance !== undefined) {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. অন্দর বাহার কোর ট্রানজেকশন ডিল রাউট (POST Route - ৯৫% RTP গাণিতিক বর্ম কঠোর লক ভাই ভাই!)
app.post('/api/andar-deal', async (req, res) => {
    // 🎯 ফ্রন্টএন্ড অবজেক্ট কি-টোকেনের সাথে মিল রেখে নিখুঁত ভ্যারিয়েবল ক্যাচিং বর্ম
    const { userId, amount, wallet, prediction, game } = req.body;
    
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const userPrediction = prediction || "ANDAR";
    const finalGameName = game || "Andar-Bahar";

    if (reqAmount < 1 || reqAmount > 20000 || (userPrediction !== "ANDAR" && userPrediction !== "BAHAR")) {
        return res.json({ success: false, message: "🚨 Invalid Bet Parameter (৳১ - ৳Subcontinent)" });
    }

    try {
        // 🔒 [ব্যালেন্স যাচাই প্রোটোকল]: বাজি রেস করার সাথে সাথে ডাটাবেজ থেকে BDT টাকা এবং ওরিজিনাল গেমের নাম কেটে নেওয়ার বর্ম লক
        const balResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: reqAmount, // 🎯 বাজি ধরার মূল টাকা একুরেট পাস করা হলো
            wallet: targetWallet,
            game: finalGameName // 🎯 ওরিজিনাল গেমের নাম এখন ওয়ান-শটে মেইন সাইটের ডাটাবেজে অন ফায়ার পাস হবে ওস্তাদ!
        }, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balResponse.data && balResponse.data.status === "ok" && balResponse.data.balance !== undefined) {
            currentDbBalance = parseFloat(balResponse.data.balance);
        } else {
            return res.json({ success: false, balance: 0, message: "X Database Sync Error! Please refresh and try again." });
        }

        // [ব্যালেন্স সিকিউরিটি বর্ম]: অ্যাকাউন্টে টাকা কম থাকলে বা জিরো ব্যালেন্স হলে বাজি রিফিউজড করার চাবি
        if (currentDbBalance < 0) {
            return res.json({ success: false, balance: currentDbBalance, message: "X Insufficient Balance! Please Recharge." });
        }

        let adminTriggeredPrize = (balResponse.data && balResponse.data.andar_target) ? balResponse.data.andar_target : null;

        let jokerCard, finalResultSide, winMultiplier, finalStatus;
        let andarCards = [];
        let baharCards = [];
        let isLoopActive = true;
        let loopSafety = 0;

        // 🎰 [🎰 ৯৫% ওরিজিনাল ক্যাসিনো RTP এবং ৫২ কার্ড ডিলিং গাণিতিক লুপ ভাই ভাই]
        while (isLoopActive && loopSafety < 200) {
            loopSafety++;
            
            andarCards = [];
            baharCards = [];
            
            // জোকার কার্ড জেনারেটর (Ace, Jack, Queen, King র‍্যাঙ্ক লক ভাই ভাই)
            let constJokerValue = Math.floor(Math.random() * 13) + 1;
            let jokerRankMapping = { 1: "A", 11: "J", 12: "Q", 13: "K" };
            let jValueStr = jokerRankMapping[constJokerValue] || constJokerValue.toString();
            let constJokerSuit = cardSuitsPool[Math.floor(Math.random() * cardSuitsPool.length)];
            jokerCard = { value: jValueStr, suit: constJokerSuit };

            let dealTurn = "ANDAR";
            let matched = false;

            // ৫২ কার্ডের র্যান্ডম আর্কেড ফ্লিপ লুপ চেইন
            for (let d = 0; d < 40; d++) {
                let testVal = Math.floor(Math.random() * 13) + 1;
                let tValueStr = jokerRankMapping[testVal] || testVal.toString();
                let testSuit = cardSuitsPool[Math.floor(Math.random() * cardSuitsPool.length)];
                let cardObj = { value: tValueStr, suit: testSuit };

                if (dealTurn === "ANDAR") {
                    andarCards.push(cardObj);
                    if (tValueStr === jokerCard.value) { finalResultSide = "ANDAR"; matched = true; break; }
                    dealTurn = "BAHAR";
                } else {
                    baharCards.push(cardObj);
                    if (tValueStr === jokerCard.value) { finalResultSide = "BAHAR"; matched = true; break; }
                    dealTurn = "ANDAR";
                }
            }

            if (!matched) finalResultSide = (Math.random() > 0.5) ? "ANDAR" : "BAHAR";

            if (userPrediction === finalResultSide) {
                finalStatus = "win";
                winMultiplier = 1.95; // 🎯 ওরিজিনাল ১.৯৫ ওডস প্রফিট সেটেলমেন্ট ভাই ভাই
            } else {
                finalStatus = "lose";
                winMultiplier = 0.00;
            }

            // এডমিন প্যানেল কন্ট্রোল ট্রিগার চাবি
            if (adminTriggeredPrize) {
                if (adminTriggeredPrize === "force_lose" && finalStatus === "win") isLoopActive = false;
                if (adminTriggeredPrize === userPrediction && finalStatus === "win") isLoopActive = false;
            } else {
                if (finalStatus === "win") {
                    // ৯৫% আরটিপি সিঙ্ক কন্ট্রোল ম্যাথ লুপ স্বাভাবিক ট্র্যাকে ৪৪% এ ব্যালেন্সড লক ভাই ভাই!
                    if (Math.random() <= 0.44) isLoopActive = false;
                } else {
                    isLoopActive = false;
                }
            }
        }

        let winAmount = 0;
        let dbAction = "bet";
        let dbAmount = reqAmount;

        if (finalStatus === "win") {
            winAmount = Math.round(reqAmount * winMultiplier);
            dbAction = "win";
            dbAmount = parseFloat(winAmount);
        }

        let phpPayload = {
            action: dbAction,
            username: userId,
            amount: dbAmount,
            wallet: targetWallet,
            game: typeof game !== 'undefined' ? game : "Andar-Bahar" // 🎯 ওরিজিনাল গেমের নাম এখন ওয়ান-শটে মেইন সাইটের ডাটাবেজে অন ফায়ার পাস হবে ওস্তাদ!
        };

        if (dbAction === "win") {
            phpPayload.bet_amount = reqAmount;
            phpPayload.multiplier = winMultiplier.toFixed(2);
            phpPayload.status = "win";
            phpPayload.type = "win";
            phpPayload.is_win = 1;
            phpPayload.win_status = "win";
            phpPayload.log_status = "win";
        }

        // 🛫 ৩. মেইন সাইটের সিকিউরড গেটওয়েতে রিয়েল-টাইম উইন-লস সেটেলমেন্ট এפיআই হিট
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, phpPayload, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                status: finalStatus,
                winAmount: winAmount,
                gameData: {
                    jokerCard: jokerCard,
                    andarCards: andarCards,
                    baharCards: baharCards,
                    result: finalResultSide,
                    status: finalStatus,
                    winAmount: winAmount
                }
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "X Bet Declined by Database!" });
        }

    } catch (e) {
        console.error("Andar Bahar Core Engine Error:", e.message);
        return res.json({ success: false, message: "⚠️ Timeout! Click DEAL again." });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log("Player connected to Andar Bahar Engine!");
});

// ⚡ কাস্টম নোড সার্ভার পোর্ট গেটওয়ে লাইভ অন ফায়ার
const PORT = process.env.PORT || 27000;
server.listen(PORT, () => {
    console.log(`Andar Bahar Engine Running on port ${PORT}`);
});
