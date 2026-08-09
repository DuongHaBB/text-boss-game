const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

app.use(express.json());

// 1. Màn hình Khởi Tạo: Nhập Tên nhân vật & Chọn khu vực xuất thân
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
        <div class="label-title">1. Nhập Tên Nhân Vật:</div>
        <input type="text" id="username" placeholder="Nhập tên của ngươi...">
        <div class="label-title">2. Khu vực sinh ra (Tốc độ tu luyện x2):</div>
        <select id="realm-select">
            <option value="xich_hoa">Xích Hỏa Vực (Tốc độ Thể Lực x2)</option>
            <option value="tam_sac">Tam Sắc Phủ (Tốc độ Linh Lực x2)</option>
            <option value="bach_ngoc">Bạch Ngọc Đài (Tốc độ Tinh Lực x2)</option>
        </select>
        <button onclick="saveAndEnter()">NHẬP THẾ</button>
    </div>
    <script>
        function saveAndEnter() {
            const name = document.getElementById('username').value.trim();
            const realm = document.getElementById('realm-select').value;
            if (!name) {
                alert('Vui lòng nhập tên nhân vật!');
                return;
            }
            let travelerId = '#' + Math.floor(Math.random() * 900 + 100);
            
            localStorage.setItem('game_character_name', name);
            localStorage.setItem('game_traveler_id', travelerId);
            localStorage.setItem('game_realm', realm);
            
            // Khởi tạo cơ bản: Mặc định 10 điểm, khu vực nào ưu thế sẽ được +5 điểm sẵn
            localStorage.setItem('game_the_luc', realm === 'xich_hoa' ? 15 : 10);
            localStorage.setItem('game_linh_luc', realm === 'tam_sac' ? 15 : 10);
            localStorage.setItem('game_tinh_luc', realm === 'bach_ngoc' ? 15 : 10);
            
            window.location.href = '/profile';
        }
    </script>
</body>
</html>
    `);
});

// 2. Màn hình Bảng Thông Số Nhân Vật (Đạo Tịch)
app.get('/profile', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Đạo Tịch</title>
    <style>
        body { background: #0d0d0d; color: #e0e0e0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .panel { background: #1a1a1a; padding: 25px 30px; border-radius: 8px; width: 440px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.8); }
        .stat-item { margin: 10px 0; color: #aaa; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
        .sub-stat { padding-left: 15px; font-size: 13px; color: #888; }
        .stat-value { color: #d4af37; font-weight: bold; }
        hr { border: 0; border-top: 1px solid #333; margin: 12px 0; }
        button { width: 100%; padding: 10px; margin-top: 8px; background: #262626; color: #fff; border: 1px solid #555; cursor: pointer; border-radius: 4px; font-size: 14px; }
        button:hover { background: #383838; }
        .action-btn { background: #332700; border-color: #d4af37; color: #d4af37; font-weight: bold; }
        .action-btn:hover { background: #4d3b00; }
        .sub-panel { background: #141414; border: 1px dashed #444; padding: 12px; margin-top: 15px; border-radius: 6px; display: none; }
        .sub-title { color: #d4af37; font-size: 13px; margin-bottom: 8px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="panel">
        <h2 style="text-align: center; color: #d4af37; margin-top: 0; margin-bottom: 15px;">ĐẠO TỊCH</h2>
        
        <div class="stat-item"><span id="d_label_traveler">Lữ khách -</span> <span class="stat-value" id="d_identity">-</span></div>
        <div class="stat-item"><span>Khu vực sinh ra:</span> <span class="stat-value" id="d_realm">-</span></div>
        <div class="stat-item"><span>Cảnh Giới (Cấp độ):</span> <span class="stat-value" id="d_rank">Cấp 1</span></div>
        <hr>
        <h4 style="color: #888; margin: 8px 0 4px 0;">TIỀM NĂNG</h4>
        <div class="stat-item"><span>Thể Lực:</span> <span class="stat-value" id="d_the_luc">-</span></div>
        <div class="stat-item"><span>Linh Lực:</span> <span class="stat-value" id="d_linh_luc">-</span></div>
        <div class="stat-item"><span>Tinh Lực:</span> <span class="stat-value" id="d_tinh_luc">-</span></div>
        <hr>
        <h4 style="color: #888; margin: 8px 0 4px 0;">TRANG BỊ</h4>
        <div class="stat-item"><span>Vũ khí:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
        <div class="stat-item"><span>Khôi giáp:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
        <div class="stat-item"><span>Bối giáp:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
        <div class="stat-item"><span>Hộ thủ:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
        
        <!-- Tab hiển thị chỉ số chi tiết đã tách nhánh Tinh Lực -->
        <div id="detail-box" class="sub-panel">
            <div class="sub-title">⚡ CHỈ SỐ CHI TIẾT CHIẾN ĐẤU ⚡</div>
            <div class="stat-item"><span>Hệ số Cảnh Giới:</span> <span class="stat-value" id="d_he_so">1.0x</span></div>
            <div class="stat-item"><span>Sinh Lực (HP / Phòng):</span> <span class="stat-value" id="d_hp">-</span></div>
            <div class="stat-item"><span>Pháp Lực (MP giới hạn):</span> <span class="stat-value" id="d_mp">-</span></div>
            
            <div class="stat-item" style="color: #d4af37; margin-top: 8px;"><span>Tinh Lực Quy Đổi:</span> <span class="stat-value" id="d_tinh_tong">-</span></div>
            <div class="stat-item sub-stat"><span>├─ Cước Lực (Tốc/Né):</span> <span class="stat-value" id="d_cuoc_luc">-</span></div>
            <div class="stat-item sub-stat"><span>├─ May Mắn (Kỳ ngộ):</span> <span class="stat-value" id="d_may_man">-</span></div>
            <div class="stat-item sub-stat"><span>└─ Hoạt Lực (Chế đồ/Farm):</span> <span class="stat-value" id="d_hoat_luc">-</span></div>
        </div>

        <button class="action-btn" onclick="simActivity()">⚡ Hoạt động tu luyện (Tăng tốc độ x2)</button>
        <button onclick="toggleDetails()">📊 Xem chỉ số chi tiết</button>
        <button onclick="goBack()" style="background: #2a1111; border-color: #773333; color: #ff9999;">🔄 Đầu thai (Chuyển sinh lại)</button>
    </div>
    <script>
        const REALMS_DATA = {
            'xich_hoa': { name: 'Xích Hỏa Vực' },
            'tam_sac': { name: 'Tam Sắc Phủ' },
            'bach_ngoc': { name: 'Bạch Ngọc Đài' }
        };

        const charName = localStorage.getItem('game_character_name');
        const travelerId = localStorage.getItem('game_traveler_id');
        const realmKey = localStorage.getItem('game_realm');
        
        let theLuc = parseInt(localStorage.getItem('game_the_luc')) || 10;
        let linhLuc = parseInt(localStorage.getItem('game_linh_luc')) || 10;
        let tinhLuc = parseInt(localStorage.getItem('game_tinh_luc')) || 10;

        if (!charName || !travelerId || !realmKey || !REALMS_DATA[realmKey]) {
            window.location.href = '/';
        } else {
            updateUI();
        }

        function updateUI() {
            document.getElementById('d_label_traveler').innerText = "Lữ khách " + travelerId;
            document.getElementById('d_identity').innerText = charName;
            document.getElementById('d_realm').innerText = REALMS_DATA[realmKey].name;
            
            document.getElementById('d_the_luc').innerText = theLuc;
            document.getElementById('d_linh_luc').innerText = linhLuc;
            document.getElementById('d_tinh_luc').innerText = tinhLuc;

            let maxStat = Math.max(theLuc, linhLuc, tinhLuc);
            let level = Math.min(10, Math.floor((maxStat - 10) / 10) + 1);
            if (level < 1) level = 1;

            let rankNames = [
                "Cấp 1 - Thú Sơ Khai", "Cấp 2 - Khai Khiếu", "Cấp 3 - Luyện Cốt", 
                "Cấp 4 - Ngưng Thần", "Cấp 5 - Hóa Hình", "Cấp 6 - Thông Linh", 
                "Cấp 7 - Yêu Binh", "Cấp 8 - Yêu Tướng", "Cấp 9 - Yêu Vương", "Cấp 10 - Miêu Vương 👑"
            ];
            document.getElementById('d_rank').innerText = rankNames[level - 1];

            let heSo = parseFloat((1.0 + (level - 1) * 0.222).toFixed(2));
            if (level === 10) heSo = 3.0;

            let sinhLucFinal = Math.floor(theLuc * heSo);
            let phapLucFinal = Math.floor((linhLuc * heSo) / 10);
            let tinhLucFinal = Math.floor(tinhLuc * heSo);

            document.getElementById('d_he_so').innerText = heSo + "x";
            document.getElementById('d_hp').innerText = sinhLucFinal;
            document.getElementById('d_mp').innerText = phapLucFinal;
            document.getElementById('d_tinh_tong').innerText = tinhLucFinal;

            document.getElementById('d_cuoc_luc').innerText = Math.floor(tinhLucFinal * 0.4);
            document.getElementById('d_may_man').innerText = Math.floor(tinhLucFinal * 0.2) + " pts";
            document.getElementById('d_hoat_luc').innerText = Math.floor(tinhLucFinal * 0.4);
        }

        function toggleDetails() {
            let box = document.getElementById('detail-box');
            box.style.display = box.style.display === 'block' ? 'none' : 'block';
        }

        function simActivity() {
            let gainTheLuc = Math.max(1, Math.floor(3 * (1 - theLuc / 120)));
            let gainLinhLuc = Math.max(1, Math.floor(3 * (1 - linhLuc / 120)));
            let gainTinhLuc = Math.max(1, Math.floor(3 * (1 - tinhLuc / 120)));

            // Tốc độ tu luyện (thu thập) tăng x2 cho chỉ số ưu thế của khu vực
            if (realmKey === 'xich_hoa') gainTheLuc *= 2;
            if (realmKey === 'tam_sac') gainLinhLuc *= 2;
            if (realmKey === 'bach_ngoc') gainTinhLuc *= 2;

            theLuc += gainTheLuc;
            linhLuc += gainLinhLuc;
            tinhLuc += gainTinhLuc;

            localStorage.setItem('game_the_luc', theLuc);
            localStorage.setItem('game_linh_luc', linhLuc);
            localStorage.setItem('game_tinh_luc', tinhLuc);

            updateUI();
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
    console.log(`Server đang chạy trên cổng ${PORT}`);
});