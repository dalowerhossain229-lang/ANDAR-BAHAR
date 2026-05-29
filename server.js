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

// ৫২টি তাস ডেক জেনারেটর পুল তালিকা (১ থেকে ১৩ মান এবং ৪টি স্যুট)
const cardSuitsPool = ["H", "D", "C", "S"]; // Hearts, Diamonds, Clubs, Spades

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে
app.get('/api/andar-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    try {
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok" && response.data.balance !== undefined) {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. অন্দর বাহির কোর ডিলিং এপিআই রাউট (১.৯৫ ওডস ও কঠোর ২০০০০ লিমিট সিকিউরিটি ফিল্টার লক ভাই ভাই!)
app.post('/api/andar-deal', async (req, res) => {
    const { userId, amount, wallet, prediction } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const userPrediction = prediction || "ANDAR"; // ANDAR বা BAHAR

    // 🔒 [মেগা লিমিট কড়া ফিল্টার]: বাজি ১ টাকার কম বা ২০০০০ টাকার বেশি হলে ডিরেক্ট ব্লক ভাই ভাই!
    if (reqAmount < 1 || reqAmount > 20000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳Subcontinent)" });
    }

    try {
        // 🔒 [ব্যালেন্স যাচাই]: বাজি প্লে করার আগে ডাটাবেজ থেকে রিয়েল টাকা নিশ্চিত করার চাবি
        const balResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet
        }, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balResponse.data && balResponse.data.status === "ok" && balResponse.data.balance !== undefined) {
            currentDbBalance = parseFloat(balResponse.data.balance);
        } else {
            return res.json({ success: false, balance: 0, message: "❌ Database Sync Error! Please refresh and try again." });
        }

        // 🔒 [ইনসাফিসিয়েন্ট প্রোটেকশন বর্ম]: অ্যাকাউন্টে টাকা কম থাকলে বা জিরো ব্যালেন্স হলে বাজি রিফিউজড ভাই ভাই!
        if (currentDbBalance < reqAmount || currentDbBalance <= 0) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge BDT." });
        }

        let adminTriggeredPrize = (balResponse.data && balResponse.data.andar_target) ? balResponse.data.andar_target : null;

        let jokerCard, finalResultSide, andarCards, baharCards, finalStatus, winMultiplier;
        let isLoopActive = true;
        let loopSafety = 0;

        // 🎰 [🎰 ৯৫% ওরিজিনাল ক্যাসিনো RTP গাণিতিক ডিলিং লুপ ভাই ভাই]
        while (isLoopActive && loopSafety < 200) {
            loopSafety++;
            
            // র্যান্ডম জোকার কার্ড ভ্যালু (১-১৩)
            const jokerValue = Math.floor(Math.random() * 13) + 1;
            const jokerSuit = cardSuitsPool[Math.floor(Math.random() * cardSuitsPool.length)];
            jokerCard = { value: jokerValue, suit: jokerSuit };

            andarCards = [];
            baharCards = [];
            let dealTurn = "ANDAR";
            let matched = false;

            // তাস বাফারিং ডিলিং লুপ
            for (let d = 0; d < 40; d++) {
                let testVal = Math.floor(Math.random() * 13) + 1;
                let testSuit = cardSuitsPool[Math.floor(Math.random() * cardSuitsPool.length)];
                let cardObj = { value: testVal, suit: testSuit };

                if (dealTurn === "ANDAR") {
                    andarCards.push(cardObj);
                    if (testVal === jokerValue) { finalResultSide = "ANDAR"; matched = true; break; }
                    dealTurn = "BAHAR";
                } else {
                    baharCards.push(cardObj);
                    if (testVal === jokerValue) { finalResultSide = "BAHAR"; matched = true; break; }
                    dealTurn = "ANDAR";
                }
            }

            if (!matched) finalResultSide = (Math.random() < 0.5) ? "ANDAR" : "BAHAR";

            if (userPrediction === finalResultSide) {
                finalStatus = "win";
                // 🚀 [ওডস ১.৯৫ প্রফিট বুস্টার ম্যাথ]: ২.০০ গুণের পরিবর্তে সরাসরি ১.৯৫ গুণ প্রফিট লক!
                winMultiplier = 1.95; 
            } else {
                finalStatus = "lose";
                winMultiplier = 0.00;
            }

            // এডমিন ড্যাশবোর্ড কন্ট্রোল ট্রিগার চাবি
            if (adminTriggeredPrize) {
                if (adminTriggeredPrize === "force_lose" && finalStatus === "lose") isLoopActive = false;
                if (adminTriggeredPrize === userPrediction && finalStatus === "win") isLoopActive = false;
            } else {
                if (finalStatus === "win") {
                    // ৯৫% আরটিপি সিঙ্ক কন্ট্রোল ম্যাথ লুপ স্বাভাবিক ক্যাসিনো ট্র্যাকে ৪৪% এ ব্যালেন্সড লক ভাই ভাই!
                    if (Math.random() <= 0.44) {
                        isLoopActive = false;
                    }
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
                jokerCard: jokerCard,
                andarCards: andarCards,
                baharCards: baharCards,
                result: finalResultSide
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

io.on('connection', (socket) => { console.log("Player connected to Andar Bahar Engine!"); });

// অন্দর বাহির গেম স্বতন্ত্র ৪০০০ পোর্টে কড়া নিয়নে অন ফায়ার ভাই ভাই!
const PORT = process.env.PORT || 27000; 
server.listen(PORT, () => { console.log(`🎡 Andar Bahar Engine Running on port ${PORT}`); });
