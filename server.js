const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

app.use(express.json());

// 1. Màn hình Khởi Tạo: Chỉ còn Tên và Khu vực xuất thân thuần túy
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Cửu Mệnh - Khởi Tông</title>
            <style>
                body { background: #0d0d0d; color: #e0e0e0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .auth-box { background: #1a1a1a; padding: 30px; border-radius: 8px; width: 420px; border: 1px solid #333; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.8); }
                input, select { width: 90%; padding: 12px; margin: 12px 0; background: #262626; border: 1px solid #444; color: #fff; border-radius: 4px; font-family: inherit; font-size: 14px; }
                button { width: 95%; padding: 12px; margin-top: 15px; background: #d4af37; color: #000; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; font-size: 15px; }
                button:hover { background: #b89728; }
                .label-title { font-size: 13px; color: #aaa; text-align: left; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="auth-box">
                <h2>🐾 CỬU MỆNH 🐾</h2>
                
                <div class="label-title">1. Nhập Đạo Hiệu:</div>
                <input type="text" id="username" placeholder="Nhập tên của ngươi...">

                <div class="label-title">2. Khu vực sinh ra:</div>
                <select id="realm-select">
                    <option value="bach_ngoc">Bạch Ngọc Đài</option>
                    <option value="xich_hoa">Xích Hỏa Vực</option>
                    <option value="tam_sac">Tam Sắc Phủ</option>
                </select>

                <button onclick="saveAndEnter()">NHẬP THẾ</button>
            </div>

            <script>
                function saveAndEnter() {
                    const name = document.getElementById('username').value.trim();
                    const realm = document.getElementById('realm-select').value;
                    
                    if (!name) {
                        alert('Vui lòng nhập đạo hiệu!');
                        return;
                    }
                    
                    localStorage.setItem('game_username', name);
                    localStorage.setItem('game_realm', realm);
                    window.location.href = '/profile';
                }
            </script>
        </body>
        </html>
    `);
});

// 2. Màn hình Bảng Thông Số Nhân Vật 
app.get('/profile', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Đạo Tịch</title>
            <style>
                body { background: #0d0d0d; color: #e0e0e0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .panel { background: #1a1a1a; padding: 30px; border-radius: 8px; width: 420px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.8); }
                .stat-item { margin: 12px 0; color: #aaa; font-size: 14px; display: flex; justify-content: space-between; }
                .stat-value { color: #d4af37; font-weight: bold; }
                hr { border: 0; border-top: 1px solid #333; margin: 15px 0; }
                button { width: 100%; padding: 10px; margin-top: 20px; background: #262626; color: #fff; border: 1px solid #555; cursor: pointer; border-radius: 4px; font-size: 14px; }
                button:hover { background: #383838; }
            </style>
        </head>
        <body>
            <div class="panel">
                <h2 style="text-align: center; color: #d4af37; margin-top: 0;">ĐẠO TỊCH</h2>
                
                <div class="stat-item"><span>Đạo hiệu:</span> <span class="stat-value" id="d-name">-</span></div>
                <div class="stat-item"><span>Khu vực sinh ra:</span> <span class="stat-value" id="d-realm">-</span></div>
                
                <hr>
                
                <div class="stat-item"><span>Sinh lực (HP):</span> <span class="stat-value" id="d-hp">-</span></div>
                <div class="stat-item"><span>Sức mạnh (ATK):</span> <span class="stat-value" id="d-atk">-</span></div>
                
                <hr>
                
                <h4 style="color: #888; margin: 10px 0 5px 0;">TRANG BỊ</h4>
                <div class="stat-item"><span>Vũ khí:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
                <div class="stat-item"><span>Y phục:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
                
                <button onclick="goBack()">🔄 Đầu thai (Chuyển sinh lại)</button>
            </div>

            <script>
                // Dữ liệu ngầm cho từng khu vực
                const REALMS_DATA = {
                    'bach_ngoc': { name: 'Bạch Ngọc Đài', hp: 190, atk: 35 },
                    'xich_hoa': { name: 'Xích Hỏa Vực', hp: 260, atk: 48 },
                    'tam_sac': { name: 'Tam Sắc Phủ', hp: 220, atk: 40 }
                };

                const username = localStorage.getItem('game_username');
                const realmKey = localStorage.getItem('game_realm');

                if (!username || !realmKey || !REALMS_DATA[realmKey]) {
                    window.location.href = '/';
                } else {
                    const info = REALMS_DATA[realmKey];
                    document.getElementById('d-name').innerText = username;
                    document.getElementById('d-realm').innerText = info.name;
                    document.getElementById('d-hp').innerText = info.hp;
                    document.getElementById('d-atk').innerText = info.atk;
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