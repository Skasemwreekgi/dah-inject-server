const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS to allow requests from the Chrome extension
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// Credentials (μπορείς να προσθέσεις περισσότερους χρήστες)
const users = {
    "user1": { password: "pass123", allowed: true },
    "user2": { password: "pass456", allowed: true },
    "user3": { password: "newpass789", allowed: true },
    "user4": { password: "secure456", allowed: true },
    "user5": { password: "mypassword", allowed: true }
};

// Root endpoint για να δοκιμάσουμε αν ο server είναι live
app.get('/', (req, res) => {
    console.log("Received GET request to /");
    res.send("DAH Inject Server is running!");
});

// Endpoint για έλεγχο login
app.post('/login', (req, res) => {
    console.log("Received POST request to /login:", req.body);
    const { username, password } = req.body;
    if (!username || !password) {
        console.log("Missing username or password");
        return res.status(400).json({ success: false, message: "Missing username or password" });
    }

    const user = users[username];
    if (!user) {
        console.log("Invalid username:", username);
        return res.status(401).json({ success: false, message: "Invalid username" });
    }

    if (user.password !== password) {
        console.log("Invalid password for user:", username);
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    if (!user.allowed) {
        console.log("User not allowed:", username);
        return res.status(403).json({ success: false, message: "User not allowed" });
    }

    console.log("Login successful for user:", username);
    res.json({ success: true, message: "Login successful" });
});

// Endpoint για injection
app.post('/inject', (req, res) => {
    console.log("Received POST request to /inject:", req.body);
    const { username, xAuthToken, refreshToken } = req.body;

    if (!username || !xAuthToken) {
        console.log("Missing username or xAuthToken");
        return res.status(400).json({ success: false, message: "Missing username or xAuthToken" });
    }

    const user = users[username];
    if (!user || !user.allowed) {
        console.log("User not allowed for injection:", username);
        return res.status(403).json({ success: false, message: "User not allowed" });
    }

    // Εκτέλεση της λογικής injection (μεταφέρθηκε από το background.js)
    const timestamp = Date.now();
    const expiration = timestamp + (30 * 24 * 60 * 60 * 1000); // 30 μέρες

    const injectionData = {
        location: `{"position":{"lat":"", "lon":"", "timestamp":${timestamp}},"dismissed":false,"__PERSIST__":{"version":1,"timestamp":${timestamp + 100}}}`,
        mfa: `{"authToken":"${xAuthToken}", "authTokenExpiration":${expiration}, "captchaType":"CAPTCHA_INVALID", "funnelSessionId":"","guestAuthToken":"","loginType":"sms", "onboardingUserId":null, "refreshToken":"${refreshToken || ''}", "__PERSIST__":{"version":0, "timestamp":${expiration}}}`,
        user: `{"loggedIn":true, "__PERSIST__":{"version":2, "timestamp":${expiration}}}`
    };

    console.log("Injection successful for user:", username);
    res.json({ success: true, message: "Injection successful", data: injectionData });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
