const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Giao diện Đăng nhập và Tạo Nhân vật khởi đầu
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Khởi Tạo Nhân Vật - Âm Dương Giới</title>
            <style>
                body { background: #121212; color: #fff; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .auth-box { background: #1e1e1e; padding: 30px; border-radius: 8px; width: 380px; border: 1px solid #444; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                input, select { width: 90%; padding: 10px; margin: 10px 0; background: #2e2e2e; border: 1px solid #555; color: #fff; border-radius: 4px; font-family: inherit; }
                button { width: 100%; padding: 12px; margin-top: 15px; background: #ff9800; color: #000; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; font-size: 15px; }
                button:hover { background: #e68900; }
                .desc { font-size: 12px; color: #aaa; margin-bottom: 15px; text-align: left; line-height: 1.4; }
            </style>
        </head>
        <body>
            <div class="auth-box">
                <h2>KHỞI TẠO ANH HÙNG</h2>
                <div class="desc">
                    - <b>Dương Lực:</b> Sức mạnh bộc phát, thiên hướng cận chiến.<br>
                    - <b>Âm Linh:</b> Năng lượng huyền bí, thiên hướng ma pháp.
                </div>
                <input type="text" id="username" placeholder="Nhập tên nhân vật của bạn...">
                <select id="class-select">
                    <option value="chien_binh">⚔️ Chiến Binh (Dương Lực +15 / Âm Linh +5)</option>
                    <option value="phap_su">🔮 Pháp Sư (Dương Lực +5 / Âm Linh +18)</option>
                    <option value="cung_thu">🏹 Cung Thủ (Dương Lực +10 / Âm Linh +10)</option>
                </select>
                <button onclick="saveAndEnter()">XÁC NHẬN TẠO NHÂN VẬT</button>
            </div>

            <script>
                function saveAndEnter() {
                    const name = document.getElementById('username').value.trim();
                    const pClass = document.getElementById('class-select').value;
                    
                    if (!name) {
                        alert('Vui lòng nhập tên nhân vật!');
                        return;
                    }
                    
                    // Lưu thông tin vào trình duyệt để test
                    localStorage.setItem('game_username', name);
                    localStorage.setItem('game_class', pClass);
                    
                    // Chuyển sang màn hình xem thông tin nhân vật
                    window.location.href = '/character';
                }
            </script>
        </body>
        </html>
    `);
});

// Màn hình kiểm tra (Test) thông số nhân vật sau khi tạo
app.get('/character', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Bảng Thông Tin Nhân Vật</title>
            <style>
                body { background: #121212; color: #fff; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .panel { background: #1e1e1e; padding: 30px; border-radius: 8px; width: 400px; border: 1px solid #444; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                .stat-item { margin: 12px 0; color: #aaa; font-size: 15px; }
                .stat-value { color: #ff9800; font-weight: bold; }
                button { width: 100%; padding: 10px; margin-top: 20px; background: #333; color: #fff; border: 1px solid #777; cursor: pointer; border-radius: 4px; font-size: 14px; }
                button:hover { background: #555; }
            </style>
        </head>
        <body>
            <div class="panel">
                <h2 style="text-align: center; color: #4CAF50;">HỒ SƠ ANH HÙNG</h2>
                <div class="stat-item">Tên nhân vật: <span class="stat-value" id="display-name">-</span></div>
                <div class="stat-item">Hệ phái: <span class="stat-value" id="display-class">-</span></div>
                <div class="stat-item">Máu cơ bản (HP): <span class="stat-value" id="display-hp">-</span></div>
                <hr style="border-color: #444; margin: 20px 0;">
                <div class="stat-item" style="color: #ff5722;">☀️ Dương Lực khởi đầu: <span id="display-duong">-</span></div>
                <div class="stat-item" style="color: #00bcd4;">🌙 Âm Linh khởi đầu: <span id="display-am">-</span></div>
                
                <button onclick="goBack()">🔄 Tạo lại nhân vật khác</button>
            </div>

            <script>
                // Định nghĩa hệ phái tương ứng để hiển thị ở giao diện test
                const CLASSES_INFO = {
                    'chien_binh': { name: 'Chiến Binh', hp: 250, duongLuc: 15, amLinh: 5 },
                    'phap_su': { name: 'Pháp Sư', hp: 150, duongLuc: 5, amLinh: 18 },
                    'cung_thu': { name: 'Cung Thủ', hp: 180, duongLuc: 10, amLinh: 10 }
                };

                const username = localStorage.getItem('game_username');
                const pClassKey = localStorage.getItem('game_class');

                if (!username || !CLASSES_INFO[pClassKey]) {
                    window.location.href = '/';
                } else {
                    const info = CLASSES_INFO[pClassKey];
                    document.getElementById('display-name').innerText = username;
                    document.getElementById('display-class').innerText = info.name;
                    document.getElementById('display-hp').innerText = info.hp;
                    document.getElementById('display-duong').innerText = info.duongLuc;
                    document.getElementById('display-am').innerText = info.amLinh;
                }

                function goBack() {
                    localStorage.clear();
                    window.location.href = '/';
                }
            </script>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server dang chay tren cong ${PORT}`);
});