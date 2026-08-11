const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Phục vụ trang tạo nhân vật (index)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Phục vụ trang chính của game (profile)
app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});