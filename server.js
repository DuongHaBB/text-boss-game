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
<div class="label-title">1. Nhập Tên Main:</div>
<input type="text" id="username" placeholder="Nhập tên của main...">
<div class="label-title">2. Khu vực sinh ra (+5 điểm ưu thế & Hấp thu x2):</div>
<select id="realm-select">
<option value="xich_hoa">Xích Hỏa Vực (+5 Thể Lực & Hấp thu Thể Lực x2)</option>
<option value="tam_sac">Tam Sắc Phủ (+5 Linh Lực & Hấp thu Linh Lực x2)</option>
<option value="bach_ngoc">Bạch Ngọc Đài (+5 Tinh Lực & Hấp thu Tinh Lực x2)</option>
</select>
<button onclick="saveAndEnter()">NHẬP THẾ</button>
</div>
<script>
function saveAndEnter() {
const name = document.getElementById('username').value.trim();
const realm = document.getElementById('realm-select').value;
if (!name) {
alert('Vui lòng nhập tên main!');
return;
}
let travelerId = '#' + Math.floor(Math.random() * 900 + 100);

let theLuc = 10;
let linhLuc = 10;
let tinhLuc = 10;

if (realm === 'xich_hoa') {
  theLuc += 5;
} else if (realm === 'tam_sac') {
  linhLuc += 5;
} else if (realm === 'bach_ngoc') {
  tinhLuc += 5;
}

localStorage.setItem('game_character_name', name);
localStorage.setItem('game_traveler_id', travelerId);
localStorage.setItem('game_realm', realm);
localStorage.setItem('game_the_luc', theLuc);
localStorage.setItem('game_linh_luc', linhLuc);
localStorage.setItem('game_tinh_luc', tinhLuc);

// Khởi tạo tiến độ hấp thu thập phân (dưới dạng float)
localStorage.setItem('game_prog_the_luc', 0.0);
localStorage.setItem('game_prog_linh_luc', 0.0);
localStorage.setItem('game_prog_tinh_luc', 0.0);

window.location.href = '/profile';
}
</script>
</body>
</html>
`);
});

// 2. Màn hình Bảng Thông Số Nhân Vật (Đạo Tịch) tích hợp Test Combat theo cấp bậc quái
app.get('/profile', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Đạo Tịch & Test Combat Hệ Thống Tiến Độ</title>
<style>
body { background: #0d0d0d; color: #e0e0e0; font-family: monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.panel { background: #1a1a1a; padding: 25px 30px; border-radius: 8px; width: 440px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.8); margin: 20px 0; }
.stat-item { margin: 10px 0; color: #aaa; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
.sub-stat { padding-left: 15px; font-size: 13px; color: #888; }
.stat-value { color: #d4af37; font-weight: bold; }
.prog-text { font-size: 11px; color: #666; font-style: italic; }
hr { border: 0; border-top: 1px solid #333; margin: 12px 0; }
button { width: 100%; padding: 10px; margin-top: 8px; background: #262626; color: #fff; border: 1px solid #555; cursor: pointer; border-radius: 4px; font-size: 14px; }
button:hover { background: #383838; }
.combat-btn { background: #0f2a1a; border-color: #2ecc71; color: #2ecc71; font-weight: bold; }
.combat-btn:hover { background: #143d24; }
.sub-panel { background: #141414; border: 1px dashed #444; padding: 12px; margin-top: 15px; border-radius: 6px; display: none; }
.sub-title { color: #d4af37; font-size: 13px; margin-bottom: 8px; text-align: center; font-weight: bold; }

/* Modal Test Combat theo cấp bậc quái */
#combat-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); justify-content: center; align-items: center; }
.modal-content { background: #1a1a1a; padding: 25px; border-radius: 8px; width: 420px; border: 1px solid #2ecc71; text-align: center; }
.monster-group { margin: 12px 0; border: 1px solid #333; padding: 10px; border-radius: 6px; background: #141414; text-align: left; }
.monster-title { font-size: 12px; color: #2ecc71; font-weight: bold; margin-bottom: 6px; }
.reward-btn { width: 32%; padding: 8px 4px; margin: 2px 0; background: #262626; color: #fff; border: 1px solid #555; cursor: pointer; border-radius: 3px; font-size: 11px; text-align: center; font-family: inherit; }
.reward-btn:hover { background: #383838; border-color: #d4af37; }
.monster-row { display: flex; justify-content: space-between; }
</style>
</head>
<body>
<div class="panel">
<h2 style="text-align: center; color: #d4af37; margin-top: 0; margin-bottom: 15px;">ĐẠO TỊCH</h2>
<div class="stat-item"><span id="d_label_traveler">Lữ khách -</span> <span class="stat-value" id="d_identity">-</span></div>
<div class="stat-item"><span>Khu vực sinh ra:</span> <span class="stat-value" id="d_realm">-</span></div>
<div class="stat-item"><span>Cảnh Giới (Cấp độ):</span> <span class="stat-value" id="d_rank">Cấp 1</span></div>
<hr>
<h4 style="color: #888; margin: 8px 0 4px 0;">TIỀM NĂNG & TIẾN ĐỘ HẤP THU</h4>
<div class="stat-item">
  <div>Thể Lực: <span class="stat-value" id="d_the_luc">-</span> <span class="prog-text" id="p_the_luc">(0%)</span></div>
</div>
<div class="stat-item">
  <div>Linh Lực: <span class="stat-value" id="d_linh_luc">-</span> <span class="prog-text" id="p_linh_luc">(0%)</span></div>
</div>
<div class="stat-item">
  <div>Tinh Lực: <span class="stat-value" id="d_tinh_luc">-</span> <span class="prog-text" id="p_tinh_luc">(0%)</span></div>
</div>
<hr>
<h4 style="color: #888; margin: 8px 0 4px 0;">TRANG BỊ</h4>
<div class="stat-item"><span>Vũ khí:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
<div class="stat-item"><span>Khôi giáp:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
<div class="stat-item"><span>Bối giáp:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>
<div class="stat-item"><span>Hộ thủ:</span> <span class="stat-value" style="color: #666;">[Chưa có]</span></div>

<!-- Tab hiển thị chỉ số chiến đấu chi tiết -->
<div id="detail-box" class="sub-panel">
<div class="sub-title">⚡ CHỈ SỐ CHI TIẾT CHIẾN ĐẤU ⚡</div>
<div class="stat-item"><span>Hệ số Cảnh Giới:</span> <span class="stat-value" id="d_he_so">1.0x</span></div>
<div class="stat-item"><span>Sinh Lực (HP / Thể chất):</span> <span class="stat-value" id="d_hp">-</span></div>
<div class="stat-item" style="color: #00ffff; margin-top: 6px;"><span>Pháp Lực (MP giới hạn):</span> <span class="stat-value" id="d_mp" style="color: #00ffff;">-</span></div>
<div class="stat-item sub-stat"><span>└─ Kháng Pháp (Phòng thủ phép):</span> <span class="stat-value" id="d_khang_phap">-</span></div>
<div class="stat-item" style="color: #d4af37; margin-top: 8px;"><span>Tinh Lực Quy Đổi:</span> <span class="stat-value" id="d_tinh_tong">-</span></div>
<div class="stat-item sub-stat"><span>├─ Cước Lực (Tốc/Né):</span> <span class="stat-value" id="d_cuoc_luc">-</span></div>
<div class="stat-item sub-stat"><span>├─ May Mắn (Kỳ ngộ):</span> <span class="stat-value" id="d_may_man">-</span></div>
<div class="stat-item sub-stat"><span>└─ Hoạt Lực (Chế đồ/Farm):</span> <span class="stat-value" id="d_hoat_luc">-</span></div>
</div>

<button class="combat-btn" onclick="openCombatModal()">⚔️ Test Combat (Chọn loại Quái & Hấp Thu)</button>
<button onclick="toggleDetails()">📊 Xem chỉ số chi tiết</button>
<button onclick="goBack()" style="background: #2a1111; border-color: #773333; color: #ff9999;">🔄 Đầu thai (Chuyển sinh lại)</button>
</div>

<!-- Modal Giao diện Test Combat chọn cấp Quái -->
<div id="combat-modal">
<div class="modal-content">
<h3 style="color: #2ecc71; margin-top: 0;">🎉 CHIẾN THẮNG COMBAT!</h3>
<p style="color: #aaa; font-size: 12px; margin-bottom: 8px;">Chọn cấp bậc quái đã hạ gục để nhận tiến độ nguyên khí:</p>

<!-- Cấp 1: Quái thường -->
<div class="monster-group">
  <div class="monster-title">1. Quái Thường (VD: Rắn Thường) [+0.05 pts]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(0.05, 'the_luc')">⚡ Thể Lực</button>
    <button class="reward-btn" onclick="absorbCombat(0.05, 'linh_luc')">💧 Linh Lực</button>
    <button class="reward-btn" onclick="absorbCombat(0.05, 'tinh_luc')">✨ Tinh Lực</button>
  </div>
</div>

<!-- Cấp 2: Quái to / Cự xà -->
<div class="monster-group">
  <div class="monster-title">2. Quái Lớn (VD: Cự Xà) [+0.1 pts]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(0.1, 'the_luc')">⚡ Thể Lực</button>
    <button class="reward-btn" onclick="absorbCombat(0.1, 'linh_luc')">💧 Linh Lực</button>
    <button class="reward-btn" onclick="absorbCombat(0.1, 'tinh_luc')">✨ Tinh Lực</button>
  </div>
</div>

<!-- Cấp 3: Tinh anh / Đầu đàn -->
<div class="monster-group">
  <div class="monster-title">3. Tinh Anh / Đầu Đàn [+0.4 pts]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(0.4, 'the_luc')">⚡ Thể Lực</button>
    <button class="reward-btn" onclick="absorbCombat(0.4, 'linh_luc')">💧 Linh Lực</button>
    <button class="reward-btn" onclick="absorbCombat(0.4, 'tinh_luc')">✨ Tinh Lực</button>
  </div>
</div>

<!-- Cấp 4: Boss / Đại yêu thú -->
<div class="monster-group">
  <div class="monster-title">4. Boss / Đại Yêu Thú [+1.0 pts trọn vẹn]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(1.0, 'the_luc')">⚡ Thể Lực</button>
    <button class="reward-btn" onclick="absorbCombat(1.0, 'linh_luc')">💧 Linh Lực</button>
    <button class="reward-btn" onclick="absorbCombat(1.0, 'tinh_luc')">✨ Tinh Lực</button>
  </div>
</div>

<button onclick="closeCombatModal()" style="background: #333; margin-top: 8px; border: 1px solid #555; color: #ccc; padding: 8px;">Đóng</button>
</div>
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

let progTheLuc = parseFloat(localStorage.getItem('game_prog_the_luc')) || 0.0;
let progLinhLuc = parseFloat(localStorage.getItem('game_prog_linh_luc')) || 0.0;
let progTinhLuc = parseFloat(localStorage.getItem('game_prog_tinh_luc')) || 0.0;

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

  // Hiển thị phần trăm tiến độ thập phân (làm tròn 1-2 chữ số thập phân)
  document.getElementById('p_the_luc').innerText = "(" + Math.round(progTheLuc * 100) + "%)";
  document.getElementById('p_linh_luc').innerText = "(" + Math.round(progLinhLuc * 100) + "%)";
  document.getElementById('p_tinh_luc').innerText = "(" + Math.round(progTinhLuc * 100) + "%)";

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
  let phapLucFinal = Math.floor(linhLuc * heSo * 2);
  let khangPhapFinal = Math.floor(linhLuc * heSo * 0.5);
  let tinhLucFinal = Math.floor(tinhLuc * heSo);

  document.getElementById('d_he_so').innerText = heSo + "x";
  document.getElementById('d_hp').innerText = sinhLucFinal;
  document.getElementById('d_mp').innerText = phapLucFinal;
  document.getElementById('d_khang_phap').innerText = khangPhapFinal;
  document.getElementById('d_tinh_tong').innerText = tinhLucFinal;
  document.getElementById('d_cuoc_luc').innerText = Math.floor(tinhLucFinal * 0.4);
  document.getElementById('d_may_man').innerText = Math.floor(tinhLucFinal * 0.2) + " pts";
  document.getElementById('d_hoat_luc').innerText = Math.floor(tinhLucFinal * 0.4);
}

function toggleDetails() {
  let box = document.getElementById('detail-box');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function openCombatModal() {
  document.getElementById('combat-modal').style.display = 'flex';
}

function closeCombatModal() {
  document.getElementById('combat-modal').style.display = 'none';
}

function absorbCombat(baseAmount, type) {
  let multiplier = 1;

  // Kiểm tra thiên phú x2 theo khu vực xuất thân
  if (type === 'the_luc' && realmKey === 'xich_hoa') multiplier = 2;
  if (type === 'linh_luc' && realmKey === 'tam_sac') multiplier = 2;
  if (type === 'tinh_luc' && realmKey === 'bach_ngoc') multiplier = 2;

  let gained = baseAmount * multiplier;
  let statNameVi = (type === 'the_luc') ? 'Thể Lực' : (type === 'linh_luc') ? 'Linh Lực' : 'Tinh Lực';

  if (type === 'the_luc') {
    progTheLuc += gained;
    while (progTheLuc >= 1.0) {
      theLuc += 1;
      progTheLuc -= 1.0;
    }
    localStorage.setItem('game_the_luc', theLuc);
    localStorage.setItem('game_prog_the_luc', progTheLuc.toFixed(2));
  } else if (type === 'linh_luc') {
    progLinhLuc += gained;
    while (progLinhLuc >= 1.0) {
      linhLuc += 1;
      progLinhLuc -= 1.0;
    }
    localStorage.setItem('game_linh_luc', linhLuc);
    localStorage.setItem('game_prog_linh_luc', progLinhLuc.toFixed(2));
  } else if (type === 'tinh_luc') {
    progTinhLuc += gained;
    while (progTinhLuc >= 1.0) {
      tinhLuc += 1;
      progTinhLuc -= 1.0;
    }
    localStorage.setItem('game_tinh_luc', tinhLuc);
    localStorage.setItem('game_prog_tinh_luc', progTinhLuc.toFixed(2));
  }

  alert('Main hấp thu thành công! Nhận +' + gained.toFixed(2) + ' tiến độ ' + statNameVi + (multiplier > 2 || multiplier === 2 ? ' (Đã nhân đôi thiên phú khu vực x2)' : ''));
  
  closeCombatModal();
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
  console.log(`Server game Cửu Mệnh đang chạy trên cổng ${PORT}`);
});