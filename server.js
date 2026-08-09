const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

let users = {}; 

// Giao diện Tạo Nhân Vật (Có phân bổ chỉ số Dương Lực & Âm Linh)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Chọn Thế Lực - Săn Boss Online</title>
            <style>
                body { background: #121212; color: #fff; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .auth-box { background: #1e1e1e; padding: 30px; border-radius: 8px; width: 380px; border: 1px solid #444; text-align: center; }
                input, select { width: 90%; padding: 10px; margin: 10px 0; background: #2e2e2e; border: 1px solid #555; color: #fff; border-radius: 4px; font-family: inherit; }
                button { width: 100%; padding: 10px; margin-top: 15px; background: #ff9800; color: #000; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; font-size: 15px; }
                button:hover { background: #e68900; }
                .desc { font-size: 12px; color: #aaa; margin-bottom: 15px; text-align: left; }
            </style>
        </head>
        <body>
            <div class="auth-box">
                <h2>KHỞI TỤ ÂM DƯƠNG</h2>
                <div class="desc">
                    - <b>Dương Lực:</b> Sức mạnh bộc phát, tăng sát thương vật lý.<br>
                    - <b>Âm Linh:</b> Năng lượng huyền bí, tăng cường phép thuật & bạo kích.
                </div>
                <input type="text" id="username" placeholder="Nhập tên anh hùng...">
                <select id="class-select">
                    <option value="chien_binh">⚔️ Chiến Binh (Thiên hướng: Dương Lực +10)</option>
                    <option value="phap_su">🔮 Pháp Sư (Thiên hướng: Âm Linh +10)</option>
                    <option value="cung_thu">🏹 Cung Thủ (Cân bằng: Dương/Âm +5)</option>
                </select>
                <button onclick="startGame()">BƯỚC VÀO THẾ GIỚI</button>
            </div>

            <script>
                function startGame() {
                    const name = document.getElementById('username').value.trim();
                    const pClass = document.getElementById('class-select').value;
                    if (!name) {
                        alert('Vui lòng nhập tên anh hùng!');
                        return;
                    }
                    localStorage.setItem('game_username', name);
                    localStorage.setItem('game_class', pClass);
                    window.location.href = '/game';
                }
            </script>
        </body>
        </html>
    `);
});

// Giao diện chính của Trò chơi
app.get('/game', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Trận Chiến Âm Dương</title>
            <style>
                body { background: #121212; color: #fff; font-family: monospace; display: flex; justify-content: center; padding-top: 20px; }
                .container { display: flex; gap: 20px; width: 920px; }
                .panel { background: #1e1e1e; padding: 20px; border-radius: 8px; border: 1px solid #444; flex: 1; }
                .box-boss { width: 450px; text-align: center; }
                #timer { font-size: 24px; color: #ff5555; font-weight: bold; }
                button { background: #333; color: #fff; border: 1px solid #777; padding: 8px; margin: 5px; cursor: pointer; width: 100px; font-size: 14px; }
                button:hover { background: #555; }
                #log { text-align: left; background: #000; padding: 10px; height: 180px; overflow-y: auto; margin-top: 15px; font-size: 13px; border: 1px solid #333; }
                .stat-item { margin: 8px 0; color: #aaa; text-align: left; }
                .stat-value { color: #ff9800; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Bảng Thông số Nhân vật -->
                <div class="panel">
                    <h3>THÔNG TIN ANH HÙNG</h3>
                    <div class="stat-item">Tên: <span class="stat-value" id="p-name">-</span></div>
                    <div class="stat-item">Hệ phái: <span class="stat-value" id="p-class">-</span></div>
                    <div class="stat-item">Máu (HP): <span class="stat-value" id="p-hp">-</span></div>
                    <hr style="border-color: #444; margin: 15px 0;">
                    <div class="stat-item" style="color: #ff5722;">☀️ Dương Lực: <span id="p-duong">0</span></div>
                    <div class="stat-item" style="color: #00bcd4;">🌙 Âm Linh: <span id="p-am">0</span></div>
                    
                    <h4 style="margin-top: 25px;">TRANG BỊ</h4>
                    <div class="stat-item">Vũ khí: <span class="stat-value">Chưa có</span></div>
                </div>

                <!-- Bảng Chiến đấu với Boss -->
                <div class="panel box-boss">
                    <h2>THỦ LĨNH ÂM DƯƠNG</h2>
                    <p>Máu Boss: <span id="boss-hp">1200</span> / 1200</p>
                    <p>Thời gian lượt: <span id="timer">10</span>s</p>
                    
                    <div id="controls">
                        <p id="status-text">Đang chờ lượt hành động...</p>
                        <button onclick="sendAction('attack')">⚔️ Tấn công</button>
                        <button onclick="sendAction('skill')">🔮 Thi triển</button>
                        <button onclick="sendAction('defend')">🛡️ Phòng thủ</button>
                    </div>

                    <h3 style="margin-top: 20px;">Nhật ký trận đấu:</h3>
                    <div id="log"></div>
                </div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const username = localStorage.getItem('game_username');
                const pClass = localStorage.getItem('game_class');

                if (!username) window.location.href = '/';

                const socket = io();
                let hasVoted = false;

                socket.emit('register_player', { username, pClass });

                socket.on('init_stats', (data) => {
                    document.getElementById('p-name').innerText = data.name;
                    document.getElementById('p-class').innerText = data.className;
                    document.getElementById('p-hp').innerText = data.hp;
                    document.getElementById('p-duong').innerText = data.duongLuc;
                    document.getElementById('p-am').innerText = data.amLinh;
                });

                function sendAction(action) {
                    if (hasVoted) return;
                    socket.emit('player_action', action);
                    hasVoted = true;
                    document.getElementById('status-text').innerText = "Đã gửi lệnh! Chờ kết quả...";
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
                    document.getElementById('status-text').innerText = "Đến lượt! Hãy chọn hành động.";
                });
            </script>
        </body>
        </html>
    `);
});

// Logic game phía Server
let bossHP = 1200;
let timeLeft = 10;
let gameLogs = ["Cánh cổng Âm Dương mở ra, trận chiến bắt đầu!"];
let playerActions = {};

// Cấu hình chỉ số khởi đầu theo hệ phái
const CLASSES = {
    'chien_binh': { name: 'Chiến Binh', hp: 250, duongLuc: 15, amLinh: 5 },
    'phap_su': { name: 'Pháp Sư', hp: 150, duongLuc: 5, amLinh: 18 },
    'cung_thu': { name: 'Cung Thủ', hp: 180, duongLuc: 10, amLinh: 10 }
};

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
    let actionCount = 0;

    for (let id in playerActions) {
        let p = playerActions[id];
        let dmg = 0;

        if (p.action === 'attack') {
            // Sát thương dựa chủ yếu vào Dương Lực
            dmg = 30 + (p.duongLuc * 2);
            gameLogs.push(`> ⚔️ ${p.username} dồn Dương Lực tấn công, gây ${dmg} sát thương!`);
        } else if (p.action === 'skill') {
            // Sát thương dựa chủ yếu vào Âm Linh
            dmg = 25 + (p.amLinh * 2.5);
            gameLogs.push(`> 🔮 ${p.username} kích hoạt Âm Linh chú ấn, gây ${dmg} sát thương!`);
        } else {
            gameLogs.push(`> 🛡️ ${p.username} thủ thế quan sát.`);
            continue;
        }

        totalDamage += Math.floor(dmg);
        actionCount++;
    }

    if (actionCount > 0) {
        bossHP -= totalDamage;
        gameLogs.push(`=> Tổng sát thương giáng lên Boss: ${totalDamage}`);
    } else {
        gameLogs.push(`> Lượt này toàn đội bỏ trống trận địa.`);
    }

    if (bossHP <= 0) {
        bossHP = 0;
        gameLogs.push(`🎉 Boss Âm Dương đã bị thu phục!`);
    }

    playerActions = {};
    if (gameLogs.length > 20) gameLogs.shift();
}

io.on('connection', (socket) => {
    socket.on('register_player', (data) => {
        let base = CLASSES[data.pClass] || CLASSES['chien_binh'];
        
        users[socket.id] = {
            username: data.username,
            className: base.name,
            hp: base.hp,
            duongLuc: base.duongLuc,
            amLinh: base.amLinh
        };

        socket.emit('init_stats', {
            name: users[socket.id].username,
            className: users[socket.id].className,
            hp: users[socket.id].hp,
            duongLuc: users[socket.id].duongLuc,
            amLinh: users[socket.id].amLinh
        });
    });

    socket.on('player_action', (action) => {
        if (users[socket.id]) {
            playerActions[socket.id] = {
                username: users[socket.id].username,
                duongLuc: users[socket.id].duongLuc,
                amLinh: users[socket.id].amLinh,
                action: action
            };
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        delete playerActions[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server dang chay tren cong ${PORT}`);
});