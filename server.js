const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json()); // Để đọc dữ liệu JSON gửi từ client lên

// Cơ sở dữ liệu giả lập trên RAM (Sau này có thể thay bằng MongoDB/MySQL)
let users = {}; // Lưu thông tin tài khoản: { socketId: { username, email, type } }

// Giao diện trang Đăng nhập / Chọn cách chơi
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Đăng Nhập - Săn Boss Online</title>
            <style>
                body { background: #121212; color: #fff; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .auth-box { background: #1e1e1e; padding: 30px; border-radius: 8px; width: 350px; border: 1px solid #444; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                input { width: 90%; padding: 10px; margin: 10px 0; background: #2e2e2e; border: 1px solid #555; color: #fff; border-radius: 4px; font-family: inherit; }
                button { width: 100%; padding: 10px; margin: 10px 0; background: #333; color: #fff; border: 1px solid #777; cursor: pointer; border-radius: 4px; font-size: 15px; font-family: inherit; transition: 0.2s; }
                button:hover { background: #555; }
                .google-btn { background: #4285F4; border: none; }
                .google-btn:hover { background: #3367D6; }
                .divider { margin: 15px 0; color: #777; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="auth-box">
                <h2>SĂN BOSS ONLINE</h2>
                <p style="color: #aaa; font-size: 13px;">Chọn phương thức tham gia</p>
                
                <!-- Lựa chọn 1: Chơi thử nhanh -->
                <button onclick="playAsGuest()">🎮 Chơi thử nhanh (Khách)</button>
                
                <div class="divider">HOẶC LIÊN KẾT TÀI KHOẢN</div>

                <!-- Lựa chọn 2: Liên kết Email/Google (Mô phỏng nhập email bảo vệ tài khoản) -->
                <input type="email" id="user-email" placeholder="Nhập Email của bạn...">
                <button class="google-btn" onclick="linkGoogleAccount()">🔗 Liên kết tài khoản Google</button>
            </div>

            <script>
                function playAsGuest() {
                    // Tạo tên ngẫu nhiên cho khách
                    const guestName = "Khách_" + Math.floor(Math.random() * 10000);
                    localStorage.setItem('game_username', guestName);
                    localStorage.setItem('game_login_type', 'guest');
                    window.location.href = '/game';
                }

                function linkGoogleAccount() {
                    const email = document.getElementById('user-email').value;
                    if (!email || !email.includes('@')) {
                        alert('Vui lòng nhập một địa chỉ email hợp lệ!');
                        return;
                    }
                    // Lưu thông tin liên kết vào trình duyệt và chuyển hướng vào game
                    localStorage.setItem('game_username', email.split('@')[0]);
                    localStorage.setItem('game_email', email);
                    localStorage.setItem('game_login_type', 'google');
                    window.location.href = '/game';
                }
            </script>
        </body>
        </html>
    `);
});

// Giao diện chính của Game (sau khi đã đăng nhập)
app.get('/game', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Phòng Săn Boss</title>
            <style>
                body { background: #121212; color: #fff; font-family: monospace; text-align: center; padding-top: 30px; }
                .box { background: #1e1e1e; padding: 20px; border-radius: 8px; display: inline-block; width: 450px; border: 1px solid #444; }
                #timer { font-size: 24px; color: #ff5555; font-weight: bold; }
                button { background: #333; color: #fff; border: 1px solid #777; padding: 10px; margin: 5px; cursor: pointer; width: 120px; font-size: 15px; }
                button:hover { background: #555; }
                #log { text-align: left; background: #000; padding: 10px; height: 150px; overflow-y: auto; margin-top: 15px; font-size: 13px; border: 1px solid #333; }
                .user-info { color: #4CAF50; margin-bottom: 15px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="box">
                <div class="user-info" id="display-user">Đang kết nối...</div>
                <h2>RỒNG LỬA HUY DIỆT</h2>
                <p>Máu Boss: <span id="boss-hp">1000</span> / 1000</p>
                <p>Thời gian quyết định: <span id="timer">10</span>s</p>
                
                <div id="controls">
                    <p id="status-text">Đang chờ lượt hành động...</p>
                    <button onclick="sendAction('attack')">⚔️ Tấn công</button>
                    <button onclick="sendAction('defend')">🛡️ Phòng thủ</button>
                    <button onclick="sendAction('escape')">🏃 Bỏ chạy</button>
                </div>

                <h3>Nhật ký chiến đấu:</h3>
                <div id="log"></div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                // Lấy thông tin đăng nhập từ localStorage
                const username = localStorage.getItem('game_username');
                const loginType = localStorage.getItem('game_login_type');

                if (!username) {
                    window.location.href = '/'; // Chưa đăng nhập thì đá về trang login
                } else {
                    document.getElementById('display-user').innerText = 
                        \`Xin chào: \${username} (\${loginType === 'google' ? 'Đã liên kết Google' : 'Chơi thử'})\`;
                }

                const socket = io();
                let hasVoted = false;

                // Gửi tên người chơi lên server ngay khi kết nối
                socket.emit('register_player', { username, loginType });

                function sendAction(action) {
                    if (hasVoted) return;
                    socket.emit('player_action', action);
                    hasVoted = true;
                    document.getElementById('status-text').innerText = "Đã gửi lệnh! Đang chờ kết quả...";
                }

                socket.on('update_game', (data) => {
                    document.getElementById('boss-hp').innerText = data.bossHP;
                    document.getElementById('timer').innerText = data.timeLeft;
                    
                    const logDiv = document.getElementById('log');
                    logDiv.innerHTML = data.logs.join('<br>');
                    logDiv.scrollTop = logDiv.scrollHeight;
                });

                socket.on('new_turn', () => {
                    hasVoted = false;
                    document.getElementById('status-text').innerText = "Hãy chọn hành động của bạn!";
                });
            </script>
        </body>
        </html>
    `);
});

// Logic Trò chơi & Quản lý Người chơi kết nối
let bossHP = 1000;
let timeLeft = 10;
let gameLogs = ["Trận chiến săn Boss bắt đầu!"];
let playerActions = {};

setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
        processTurn();
        timeLeft = 10;
        io.emit('new_turn');
    }
    io.emit('update_game', { bossHP, timeLeft, logs: gameLogs });
}, 1000);

function processTurn() {
    if (bossHP <= 0) return;
    let totalDamage = 0;
    let attackCount = 0;

    for (let id in playerActions) {
        let action = playerActions[id].action;
        let name = playerActions[id].username;
        if (action === 'attack') {
            totalDamage += 50;
            attackCount++;
            gameLogs.push(`> ${name} đã vung kiếm tấn công!`);
        }
    }

    if (attackCount > 0) {
        bossHP -= totalDamage;
        gameLogs.push(`=> Gây tổng cộng ${totalDamage} sát thương lên Boss.`);
    } else {
        gameLogs.push(`> Lượt này mọi người do dự, không ai tấn công Boss.`);
    }

    if (bossHP <= 0) {
        bossHP = 0;
        gameLogs.push(`🎉 Boss đã bị tiêu diệt! Nhóm chiến thắng vinh quang!`);
    }

    playerActions = {};
    if (gameLogs.length > 20) gameLogs.shift();
}

io.on('connection', (socket) => {
    socket.on('register_player', (data) => {
        users[socket.id] = data;
        console.log(`Người chơi vào game: ${data.username} (${data.loginType})`);
    });

    socket.on('player_action', (action) => {
        if (users[socket.id]) {
            playerActions[socket.id] = {
                username: users[socket.id].username,
                action: action
            };
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        delete playerActions[socket.id];
    });
});

server.listen(3000, () => {
    console.log(`=== MÁY CHỦ ĐÃ SẴN SÀNG ===`);
    console.log(`Truy cập thử nghiệm tại: http://localhost:3000`);
});