const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Τα credentials σου (μπορείς να τα αλλάξεις)
const users = {
    "user1": { password: "pass123", allowed: true },
    "user2": { password: "pass456", allowed: true },
    "user3": { password: "newpass789", allowed: true },
    "user4": { password: "secure456", allowed: true },
    "user5": { password: "mypassword", allowed: true }
};

// Endpoint για έλεγχο login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Missing username or password" });
    }

    const user = users[username];
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid username" });
    }

    if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    if (!user.allowed) {
        return res.status(403).json({ success: false, message: "User not allowed" });
    }

    res.json({ success: true, message: "Login successful" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
