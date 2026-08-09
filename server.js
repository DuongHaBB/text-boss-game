const express = require('express');
const app = express();

app.use(express.json());

// 1. Màn hình Khởi Tạo Nhân Vật (Chọn Tông Môn & Đạo Hiệu)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Cửu Mệnh - Khởi Tạo Tiên Miêu</title>
            <style>
                body { background: #0d0d0d; color: #e0e0e0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .auth-box { background: #1a1a1a; padding: 30px; border-radius: 8px; width: 420px; border: 1px solid #333; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.8); }
                input, select { width: 90%; padding: 12px; margin: 12px 0; background: #262626; border: 1px solid #444; color: #fff; border-radius: 4px; font-family: inherit; font-size: 14px; }
                button { width: 95%; padding: 12px; margin-top: 15px; background: #d4af37; color: #000; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; font-size: 15px; }
                button:hover { background: #b89728; }
                .desc { font-size: 12px; color: #888; margin-bottom: 15px; text-align: left; line-height: 1.5; }
            </style>
        </head>
        <body>
            <div class="auth-box">
                <h2>🐾 CỬU MỆNH: TAM GIỚI 🐾</h2>
                <div class="desc">
                    Chọn tông môn bước chân vào con đường tu tiên của loài mèo:<br>
                    - <b>Bạch Ngọc Đài (Mèo Trắng):</b> Kiêu sa, thuần khiết, Thân Pháp & Bạo Kích cao.<br>
                    - <b>Xích Hỏa Vực (Mèo Cam):</b> Cuồng nộ, Sức mạnh thể chất bộc phát.<br>
                    - <b>Tam Sắc Phủ (Tam Thể):</b> Biến hóa khôn lường, Huyền thuật thâm sâu.
                </div>
                <input type="text" id="username" placeholder="Nhập đạo hiệu của chú mèo...">
                <select id="realm-select">
                    <option value="bach_ngoc">🤍 Bạch Ngọc Đài (Mèo Trắng)</option>
                    <option value="xich_hoa">🧡 Xích Hỏa Vực (Mèo Cam)</option>
                    <option value="tam_sac">🤎 Tam Sắc Phủ (Tam Thể)</option>
                </select>
                <button onclick="saveAndEnter()">XÁC NHẬN NHẬP MÔN</button>
            </div>

            <script>
                function saveAndEnter() {
                    const name = document.getElementById('username').value.trim();
                    const realm = document.getElementById('realm-select').value;
                    
                    if (!name) {
                        alert('Vui lòng nhập đạo hiệu cho mèo chiến!');
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

// 2. Màn hình Bảng Thông Số Nhân Vật & Trang Bị
app.get('/profile', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Đạo Tịch Tiên Miêu</title>
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
                <h2 style="text-align: center; color: #d4af37; margin-top: 0;">HỒ SƠ TIÊN MIÊU</h2>
                
                <div class="stat-item"><span>Đạo hiệu:</span> <span class="stat-value" id="d-name">-</span></div>
                <div class="stat-item"><span>Tông môn:</span> <span class="stat-value" id="d-realm">-</span></div>
                
                <hr>
                
                <div class="stat-item"><span>Sinh lực (HP):</span> <span class="stat-value" id="d-hp">-</span></div>
                <div class="stat-item"><span>Sức mạnh (ATK):</span> <span class="stat-value" id="d-atk">-</span></div>
                <div class="stat-item"><span>Thiên phú đặc trưng:</span> <span class="stat-value" id="d-power">-</span></div>
                
                <hr>
                
                <h4 style="color: #888; margin: 10px 0 5px 0;">TRANG BỊ (HÀM LONG TRẤN)</h4>
                <div class="stat-item"><span>Vũ khí:</span> <span class="stat-value" style="color: #666;">[Chưa trang bị - Khúc Mộc Kiếm]</span></div>
                <div class="stat-item"><span>Y phục:</span> <span class="stat-value" style="color: #666;">[Chưa trang bị - Áo Vải Thô]</span></div>
                
                <button onclick="goBack()">🔄 Chuyển sinh (Tạo nhân vật mới)</button>
            </div>

            <script>
                // Dữ liệu chỉ số tương ứng cho 3 phái
                const REALMS_DATA = {
                    'bach_ngoc': { name: 'Bạch Ngọc Đài (Mèo Trắng)', hp: 190, atk: 35, power: 'Thân Pháp / Bạo Kích' },
                    'xich_hoa': { name: 'Xích Hỏa Vực (Mèo Cam)', hp: 260, atk: 48, power: 'Sức Mạnh Bộc Phát' },
                    'tam_sac': { name: 'Tam Sắc Phủ (Tam Thể)', hp: 220, atk: 40, power: 'Huyền Thuật Biến Hóa' }
                };

                const username = localStorage.getItem('game_username');
                const realmKey = localStorage.getItem('game_realm');

                if (!username || !REALMS_DATA[realmKey]) {
                    window.location.href = '/';
                } else {
                    const info = REALMS_DATA[realmKey];
                    document.getElementById('d-name').innerText = username;
                    document.getElementById('d-realm').innerText = info.name;
                    document.getElementById('d-hp').innerText = info.hp;
                    document.getElementById('d-atk').innerText = info.atk;
                    document.getElementById('d-power').innerText = info.power;
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