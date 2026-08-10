const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);

app.use(express.json());

// Trang tạo nhân vật
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Trang bảng thông số nhân vật
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server game Cửu Mệnh đang chạy trên cổng ${PORT}`);
});