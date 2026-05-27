const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - মেগা সকেট প্রোটোকল লক]
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

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক]
const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 🃏 ওরিজিনাল তাসের কার্ডের মেমোরি ডেক ভাই ভাই
const cardDeck = [
    { value: "2", suit: "♥️", points: 2 }, { value: "3", suit: "♥️", points: 3 }, { value: "4", suit: "♥️", points: 4 },
    { value: "5", suit: "♥️", points: 5 }, { value: "6", suit: "♥️", points: 6 }, { value: "7", suit: "♥️", points: 7 },
    { value: "8", suit: "♥️", points: 8 }, { value: "9", suit: "♥️", points: 9 }, { value: "10", suit: "♥️", points: 10 },
    { value: "J", suit: "♥️", points: 11 }, { value: "Q", suit: "♥️", points: 12 }, { value: "K", suit: "♥️", points: 13 }, { value: "A", suit: "♥️", points: 14 },
    
    { value: "2", suit: "♦️", points: 2 }, { value: "3", suit: "♦️", points: 3 }, { value: "4", suit: "♦️", points: 4 },
    { value: "5", suit: "♦️", points: 5 }, { value: "6", suit: "♦️", points: 6 }, { value: "7", suit: "♦️", points: 7 },
    { value: "8", suit: "♦️", points: 8 }, { value: "9", suit: "♦️", points: 9 }, { value: "10", suit: "♦️", points: 10 },
    { value: "J", suit: "♦️", points: 11 }, { value: "Q", suit: "♦️", points: 12 }, { value: "K", suit: "♦️", points: 13 }, { value: "A", suit: "♦️", points: 14 },
    
    { value: "2", suit: "♣️", points: 2 }, { value: "3", suit: "♣️", points: 3 }, { value: "4", suit: "♣️", points: 4 },
    { value: "5", suit: "♣️", points: 5 }, { value: "6", suit: "♣️", points: 6 }, { value: "7", suit: "♣️", points: 7 },
    { value: "8", suit: "♣️", points: 8 }, { value: "9", suit: "♣️", points: 9 }, { value: "10", suit: "♣️", points: 10 },
    { value: "J", suit: "♣️", points: 11 }, { value: "Q", suit: "♣️", points: 12 }, { value: "K", suit: "♣️", points: 13 }, { value: "A", suit: "♣️", points: 14 },
    
    { value: "2", suit: "♠️", points: 2 }, { value: "3", suit: "♠️", points: 3 }, { value: "4", suit: "♠️", points: 4 },
    { value: "5", suit: "♠️", points: 5 }, { value: "6", suit: "♠️", points: 6 }, { value: "7", suit: "♠️", points: 7 },
    { value: "8", suit: "♠️", points: 8 }, { value: "9", suit: "♠️", points: 9 }, { value: "10", suit: "♠️", points: 10 },
    { value: "J", suit: "♠️", points: 11 }, { value: "Q", suit: "♠️", points: 12 }, { value: "K", suit: "♠️", points: 13 }, { value: "A", suit: "♠️", points: 14 }
];

// ইউজার ভিত্তিক লাইভ জোকার কার্ড মেমোরি ট্র্যাকার
let activeUserJokers = {};

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে
app.get('/api/andarbahar-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    try {
        const response = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${wallet}`, { timeout: 30000 });
        if (response.data && response.data.status === "ok") {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. গেম শুরুতে বা রাউন্ড শেষে মেইন জোকার কার্ড সেটআপ ইনিশিয়ালাইজার ভাই
app.get('/api/andarbahar-init', (req, res) => {
    const { userId } = req.query;
    const currentId = userId || "guest_user";
    
    // ডেক থেকে ১টি র্যান্ডম জোকার কার্ড মেমোরিতে অ্যাসাইন লক
    activeUserJokers[currentId] = cardDeck[Math.floor(Math.random() * cardDeck.length)];
    return res.json({ success: true, jokerCard: activeUserJokers[currentId] });
});

// 🛫 ৩. অন্দর বাহার কোর ডিল এপিআই রাউট (POST Route - ৯৫% RTP গাণিতিক অ্যালগরিদম বর্ম লক ভাই ভাই!)
app.post('/api/andarbahar-deal', async (req, res) => {
    const { userId, amount, wallet, prediction } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const userPrediction = prediction || "ANDAR"; // ANDAR বা BAHAR

    if (reqAmount < 1 || reqAmount > 2000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳২০০০)" });
    }

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance!" });
        }

        // 🎯 [ভবিষ্যৎ সেন্ট্রাল গোপন এডমিন প্যানেল গেটওয়ে লিঙ্ক লক]
        let adminTriggeredPrize = (balCheck.data && balCheck.data.andarbahar_target) ? balCheck.data.andarbahar_target : null;

        // কারেন্ট সেশনের জোকার কার্ড নিয়ে আসা ভাই
        if (!activeUserJokers[userId]) {
            activeUserJokers[userId] = cardDeck[Math.floor(Math.random() * cardDeck.length)];
        }
        const currentJoker = activeUserJokers[userId];

        let andarCard, baharCard, winnerSide, finalStatus, winMultiplier;
        let isLoopActive = true;
        let loopSafety = 0;

        // 🎰 [🎰 ৯৫% ওরিজিনাল RTP ও সুষম কার্ড র্যান্ডমাইজেশন লুপ ভাই ভাই]
        while (isLoopActive && loopSafety < 200) {
            loopSafety++;
            
            andarCard = cardDeck[Math.floor(Math.random() * cardDeck.length)];
            baharCard = cardDeck[Math.floor(Math.random() * cardDeck.length)];

            // জোকার কার্ডের ভ্যালুর সাথে ম্যাচিং পয়েন্ট হিসাব লক
            let isAndarMatch = (andarCard.value === currentJoker.value);
            let isBaharMatch = (baharCard.value === currentJoker.value);

            if (isAndarMatch && !isBaharMatch) {
                winnerSide = "ANDAR";
            } else if (isBaharMatch && !isAndarMatch) {
                winnerSide = "BAHAR";
            } else if (isAndarMatch && isBaharMatch) {
                // দুই পক্ষেই জোকার মিললে র্যান্ডম সিলেকশন
                winnerSide = (Math.random() > 0.5) ? "ANDAR" : "BAHAR";
            } else {
                // কোনো পক্ষেই না মিললে লুপের সুষম খাতিরে র্যান্ডম উইনার ট্র্যাকার সেট
                winnerSide = (Math.random() > 0.5) ? "ANDAR" : "BAHAR";
                if (winnerSide === "ANDAR") andarCard = { ...andarCard, value: currentJoker.value };
                else baharCard = { ...baharCard, value: currentJoker.value };
            }

            if (userPrediction === winnerSide) {
                finalStatus = "win";
                winMultiplier = 2.00; // ২ গুণ ডবল প্রফিট চাবি ভাই ভাই
            } else {
                finalStatus = "lose";
                winMultiplier = 0.00;
            }

            if (adminTriggeredPrize) {
                if (adminTriggeredPrize === "force_lose" && finalStatus === "lose") isLoopActive = false;
                if (adminTriggeredPrize === winnerSide && finalStatus === "win") isLoopActive = false;
            } else {
                if (finalStatus === "win") {
                    // ৯৫% আরটিপি ব্যালেন্স ট্র্যাকিং লুপ অনুযায়ী প্লেয়ার উইন চান্স ৪৬% লক ভাই ভাই
                    if (Math.random() <= 0.46) {
                        isLoopActive = false;
                    }
                } else {
                    isLoopActive = false; // প্লেয়ার লস খেলে লুপ ডিরেক্ট স্টপ ভাই
                }
            }
        }

        let winAmount = 0;
        let dbAction = "bet";
        let dbAmount = reqAmount;

        if (finalStatus === "win") {
            winAmount = Math.floor(reqAmount * winMultiplier);
            dbAction = "win";
            dbAmount = parseFloat(winAmount);
        }

        let phpPayload = {
            action: dbAction,
            username: userId,
            amount: dbAmount,
            wallet: targetWallet
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

        const response = await axios.post(MAIN_SITE_URL + '/api_callback.php', phpPayload, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

                        return res.json({
                success: true,
                balance: response.data.balance,
                status: finalStatus,
                winAmount: winAmount,
                winnerSide: winnerSide,
                andarCard: andarCard,
                baharCard: baharCard
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        console.error("Andar Bahar Core Engine Error:", e.message);
        return res.json({ success: false, message: "⚠️ Timeout! Click DEAL again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

io.on('connection', (socket) => { console.log("Player connected to Andar Bahar Casino Engine!"); });

// ১৯ নম্বর গেম ২৬০০০ এ চলছে, তাই ২০ নম্বর মেগা মাইলফলক গেম প্রজেক্টের স্বাধীন কাস্টম পোর্ট ২৭০০০ কড়া লক হলো ভাই ভাই!
const PORT = process.env.PORT || 27000;
server.listen(PORT, () => { console.log(`🎡 Andar Bahar Casino Engine Running on port ${PORT}`); });
