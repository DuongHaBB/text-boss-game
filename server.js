const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

app.use(express.json());

// Bảng tra cứu mốc trần Bình Cảnh (Kỳ 1 là 20 điểm)
const BOTTLENECK_LIMITS = {
  1: 20,
  2: 50,
  3: 100,
  4: 200,
  5: 400,
  6: 800,
  7: 1600,
  8: 3200,
  9: 6400,
  10: 12800
};

// 1. Màn hình Khởi Tạo: Nhập Tên, Phân bổ 10 điểm tự do (Khởi đầu gốc = 0) & Chọn khu vực (+5 điểm)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Cửu Mệnh - Khởi Tông</title>
<style>
body { background: #0d0d0d; color: #e0e0e0; font-family: monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.auth-box { background: #1a1a1a; padding: 25px 30px; border-radius: 8px; width: 440px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.8); }
input, select { width: 100%; padding: 10px; margin: 6px 0 12px 0; background: #262626; border: 1px solid #444; color: #fff; border-radius: 4px; font-family: inherit; font-size: 13px; box-sizing: border-box; }
button { width: 100%; padding: 12px; margin-top: 15px; background: #d4af37; color: #000; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; font-size: 15px; }
button:hover { background: #b89728; }
.label-title { font-size: 13px; color: #aaa; text-align: left; margin-top: 6px; }
.stat-alloc-row { display: flex; justify-content: space-between; align-items: center; background: #141414; border: 1px solid #333; padding: 8px 12px; margin: 6px 0; border-radius: 4px; font-size: 13px; }
.alloc-btn { background: #262626; border: 1px solid #555; color: #fff; width: 30px; height: 30px; font-weight: bold; cursor: pointer; border-radius: 3px; font-size: 14px; margin: 0; }
.alloc-btn:hover { background: #383838; border-color: #d4af37; }
.points-left { color: #2ecc71; font-weight: bold; }
hr { border: 0; border-top: 1px solid #333; margin: 12px 0; }
</style>
</head>
<body>
<div class="auth-box">
<h2 style="text-align: center; color: #d4af37; margin-top: 0; margin-bottom: 12px;">🐾 CỬU MỆNH 🐾</h2>

<div class="label-title">1. Nhập Tên Main:</div>
<input type="text" id="username" placeholder="Nhập tên của main...">

<div class="label-title">2. Khu vực sinh ra (+5 điểm ưu thế theo khu vực):</div>
<select id="realm-select" onchange="updateRealmBonus()">
<option value="xich_hoa">Xích Hỏa Vực (+5 Thể Lực & Hấp thu Thể Lực x2)</option>
<option value="tam_sac">Tam Sắc Phủ (+5 Linh Lực & Hấp thu Linh Lực x2)</option>
<option value="bach_ngoc">Bạch Ngọc Đài (+5 Tinh Lực & Hấp thu Tinh Lực x2)</option>
</select>

<hr>
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
  <span style="font-size: 13px; color: #aaa;">3. Phân bổ 10 điểm tiềm năng tự do:</span>
  <span style="font-size: 12px;">Còn lại: <span id="points-left" class="points-left">10</span> điểm</span>
</div>

<div class="stat-alloc-row">
  <span>Thể Lực (Gốc: 0 + Khu vực: <span id="bonus-the">5</span> + Tự do: <span id="alloc-the" style="color:#d4af37">0</span>)</span>
  <div>
    <button class="alloc-btn" onclick="adjustStat('the', -1)">-</button>
    <button class="alloc-btn" onclick="adjustStat('the', 1)">+</button>
  </div>
</div>

<div class="stat-alloc-row">
  <span>Linh Lực (Gốc: 0 + Khu vực: <span id="bonus-linh">0</span> + Tự do: <span id="alloc-linh" style="color:#d4af37">0</span>)</span>
  <div>
    <button class="alloc-btn" onclick="adjustStat('linh', -1)">-</button>
    <button class="alloc-btn" onclick="adjustStat('linh', 1)">+</button>
  </div>
</div>

<div class="stat-alloc-row">
  <span>Tinh Lực (Gốc: 0 + Khu vực: <span id="bonus-tinh">0</span> + Tự do: <span id="alloc-tinh" style="color:#d4af37">0</span>)</span>
  <div>
    <button class="alloc-btn" onclick="adjustStat('tinh', -1)">-</button>
    <button class="alloc-btn" onclick="adjustStat('tinh', 1)">+</button>
  </div>
</div>

<button onclick="saveAndEnter()">NHẬP THẾ</button>
</div>

<script>
let pointsLeft = 10;
let allocThe = 0;
let allocLinh = 0;
let allocTinh = 0;

function updateRealmBonus() {
  let realm = document.getElementById('realm-select').value;
  document.getElementById('bonus-the').innerText = (realm === 'xich_hoa') ? 5 : 0;
  document.getElementById('bonus-linh').innerText = (realm === 'tam_sac') ? 5 : 0;
  document.getElementById('bonus-tinh').innerText = (realm === 'bach_ngoc') ? 5 : 0;
}

function adjustStat(stat, amount) {
  if (amount > 0 && pointsLeft > 0) {
    if (stat === 'the') { allocThe++; }
    if (stat === 'linh') { allocLinh++; }
    if (stat === 'tinh') { allocTinh++; }
    pointsLeft--;
  } else if (amount < 0) {
    if (stat === 'the' && allocThe > 0) { allocThe--; pointsLeft++; }
    if (stat === 'linh' && allocLinh > 0) { allocLinh--; pointsLeft++; }
    if (stat === 'tinh' && allocTinh > 0) { allocTinh--; pointsLeft++; }
  }

  document.getElementById('points-left').innerText = pointsLeft;
  document.getElementById('alloc-the').innerText = allocThe;
  document.getElementById('alloc-linh').innerText = allocLinh;
  document.getElementById('alloc-tinh').innerText = allocTinh;
}

function saveAndEnter() {
  const name = document.getElementById('username').value.trim();
  const realm = document.getElementById('realm-select').value;
  if (!name) { alert('Vui lòng nhập tên main!'); return; }
  if (pointsLeft > 0) { alert('Bạn vẫn còn điểm tiềm năng chưa cộng hết!'); return; }

  let travelerId = '#' + Math.floor(Math.random() * 900 + 100);

  let theLuc = 0 + allocThe;
  let linhLuc = 0 + allocLinh;
  let tinhLuc = 0 + allocTinh;

  if (realm === 'xich_hoa') { theLuc += 5; }
  else if (realm === 'tam_sac') { linhLuc += 5; }
  else if (realm === 'bach_ngoc') { tinhLuc += 5; }

  localStorage.setItem('game_character_name', name);
  localStorage.setItem('game_traveler_id', travelerId);
  localStorage.setItem('game_realm', realm);
  localStorage.setItem('game_the_luc', theLuc);
  localStorage.setItem('game_linh_luc', linhLuc);
  localStorage.setItem('game_tinh_luc', tinhLuc);

  localStorage.setItem('game_prog_the_luc', 0.0);
  localStorage.setItem('game_prog_linh_luc', 0.0);
  localStorage.setItem('game_prog_tinh_luc', 0.0);

  localStorage.setItem('game_period', 1);
  localStorage.setItem('game_is_bottleneck', 'false');

  localStorage.setItem('item_stvl', 5);
  localStorage.setItem('item_stp', 5);
  localStorage.setItem('item_def_vl', 3);
  localStorage.setItem('item_def_p', 3);

  window.location.href = '/profile';
}

updateRealmBonus();
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
<title>Đạo Tịch - Hệ Thống Cảnh Giới & Combat</title>
<style>
body { background: #0d0d0d; color: #e0e0e0; font-family: monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.panel { background: #1a1a1a; padding: 25px 30px; border-radius: 8px; width: 460px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.8); margin: 20px 0; }
.stat-item { margin: 8px 0; color: #aaa; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
.stat-value { color: #d4af37; font-weight: bold; }
.prog-text { font-size: 11px; color: #666; font-style: italic; }
.warning-text { color: #e74c3c; font-weight: bold; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
hr { border: 0; border-top: 1px solid #333; margin: 10px 0; }
button { width: 100%; padding: 10px; margin-top: 6px; background: #262626; color: #fff; border: 1px solid #555; cursor: pointer; border-radius: 4px; font-size: 13px; }
button:hover { background: #383838; }
.combat-btn { background: #0f2a1a; border-color: #2ecc71; color: #2ecc71; font-weight: bold; }
.break-btn { background: #3c2a0f; border-color: #d4af37; color: #d4af37; font-weight: bold; }
.sub-panel { background: #141414; border: 1px dashed #444; padding: 10px; margin-top: 12px; border-radius: 6px; display: none; }
.sub-title { color: #d4af37; font-size: 12px; margin-bottom: 6px; text-align: center; font-weight: bold; }

#combat-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); justify-content: center; align-items: center; }
.modal-content { background: #1a1a1a; padding: 25px; border-radius: 8px; width: 420px; border: 1px solid #2ecc71; text-align: center; }
.monster-group { margin: 10px 0; border: 1px solid #333; padding: 8px; border-radius: 6px; background: #141414; text-align: left; }
.monster-title { font-size: 11px; color: #2ecc71; font-weight: bold; margin-bottom: 4px; }
.reward-btn { width: 32%; padding: 6px 2px; background: #262626; color: #fff; border: 1px solid #555; cursor: pointer; border-radius: 3px; font-size: 10px; text-align: center; font-family: inherit; }
.reward-btn:hover { background: #383838; border-color: #d4af37; }
.monster-row { display: flex; justify-content: space-between; }
</style>
</head>
<body>
<div class="panel">
<h2 style="text-align: center; color: #d4af37; margin-top: 0; margin-bottom: 12px;">ĐẠO TỊCH</h2>
<div class="stat-item"><span id="d_label_traveler">Lữ khách -</span> <span class="stat-value" id="d_identity">-</span></div>
<div class="stat-item"><span>Khu vực sinh ra:</span> <span class="stat-value" id="d_realm">-</span></div>
<div class="stat-item"><span>Cảnh Giới:</span> <span class="stat-value" id="d_rank">Kỳ 1</span></div>
<div class="stat-item" id="bottleneck-status-box" style="display: none;"><span>Trạng thái:</span> <span class="warning-text">Lâm vào bình cảnh!</span></div>

<hr>
<h4 style="color: #888; margin: 6px 0 4px 0;">TIỀM NĂNG & TIẾN ĐỘ</h4>
<div class="stat-item"><span>Thể Lực:</span> <div><span class="stat-value" id="d_the_luc">-</span> <span class="prog-text" id="p_the_luc">(0%)</span></div></div>
<div class="stat-item"><span>Linh Lực:</span> <div><span class="stat-value" id="d_linh_luc">-</span> <span class="prog-text" id="p_linh_luc">(0%)</span></div></div>
<div class="stat-item"><span>Tinh Lực:</span> <div><span class="stat-value" id="d_tinh_luc">-</span> <span class="prog-text" id="p_tinh_luc">(0%)</span></div></div>

<hr>
<h4 style="color: #888; margin: 6px 0 4px 0;">CHỈ SỐ CHIẾN ĐẤU (ATK & DEF)</h4>
<div class="stat-item"><span>Hệ Sát Thương:</span> <span class="stat-value" id="d_dmg_type" style="color: #3498db;">-</span></div>
<div class="stat-item"><span>Chỉ Số Tấn Công (ATK):</span> <span class="stat-value" id="d_atk_val">-</span></div>
<div class="stat-item"><span>Kháng Vật Lý:</span> <span class="stat-value" id="d_def_vl">-</span></div>
<div class="stat-item"><span>Kháng Pháp Lực:</span> <span class="stat-value" id="d_def_p">-</span></div>
<div class="stat-item"><span>Tốc Lực (Tinh Lực / 10 + Kỳ):</span> <span class="stat-value" id="d_speed">-</span></div>
<div class="stat-item"><span>Danh Hiệu / Hiệu Ứng:</span> <span class="stat-value" id="d_title" style="color: #e67e22;">[Bình Thường]</span></div>

<div id="detail-box" class="sub-panel">
<div class="sub-title">⚡ CHI TIẾT TÍNH TOÁN ⚡</div>
<div class="stat-item"><span>Trần điểm hiện tại:</span> <span class="stat-value" id="d_limit_val">20</span></div>
<div class="stat-item"><span>Chỉ số cao nhất:</span> <span class="stat-value" id="d_max_stat">10</span></div>
</div>

<button id="btn-break" class="break-btn" onclick="breakBottleneck()" style="display: none;">⚡ PHÁ VỠ BÌNH CẢNH</button>
<button class="combat-btn" onclick="openCombatModal()">⚔️ Test Combat (Hấp Thu Nguyên Khí)</button>
<button onclick="toggleDetails()">📊 Xem chi tiết giới hạn</button>
<button onclick="goBack()" style="background: #2a1111; border-color: #773333; color: #ff9999;">🔄 Đầu thai (Chuyển sinh lại)</button>
</div>

<div id="combat-modal">
<div class="modal-content">
<h3 style="color: #2ecc71; margin-top: 0;">🎉 CHIẾN THẮNG COMBAT!</h3>
<p style="color: #aaa; font-size: 11px; margin-bottom: 6px;">Chọn loại quái để nhận tiến độ:</p>

<div class="monster-group">
  <div class="monster-title">1. Quái Thường [+0.05 pts]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(0.05, 'the_luc')">⚡ Thể</button>
    <button class="reward-btn" onclick="absorbCombat(0.05, 'linh_luc')">💧 Linh</button>
    <button class="reward-btn" onclick="absorbCombat(0.05, 'tinh_luc')">✨ Tinh</button>
  </div>
</div>

<div class="monster-group">
  <div class="monster-title">2. Quái Lớn / Cự Xà [+0.1 pts]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(0.1, 'the_luc')">⚡ Thể</button>
    <button class="reward-btn" onclick="absorbCombat(0.1, 'linh_luc')">💧 Linh</button>
    <button class="reward-btn" onclick="absorbCombat(0.1, 'tinh_luc')">✨ Tinh</button>
  </div>
</div>

<div class="monster-group">
  <div class="monster-title">3. Tinh Anh / Đầu Đàn [+0.4 pts]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(0.4, 'the_luc')">⚡ Thể</button>
    <button class="reward-btn" onclick="absorbCombat(0.4, 'linh_luc')">💧 Linh</button>
    <button class="reward-btn" onclick="absorbCombat(0.4, 'tinh_luc')">✨ Tinh</button>
  </div>
</div>

<div class="monster-group">
  <div class="monster-title">4. Boss / Đại Yêu Thú [+1.0 pts trọn vẹn]</div>
  <div class="monster-row">
    <button class="reward-btn" onclick="absorbCombat(1.0, 'the_luc')">⚡ Thể</button>
    <button class="reward-btn" onclick="absorbCombat(1.0, 'linh_luc')">💧 Linh</button>
    <button class="reward-btn" onclick="absorbCombat(1.0, 'tinh_luc')">✨ Tinh</button>
  </div>
</div>

<button onclick="closeCombatModal()" style="background: #333; margin-top: 6px; border: 1px solid #555; color: #ccc; padding: 6px;">Đóng</button>
</div>
</div>

<script>
const REALMS_DATA = {
  'xich_hoa': { name: 'Xích Hỏa Vực' },
  'tam_sac': { name: 'Tam Sắc Phủ' },
  'bach_ngoc': { name: 'Bạch Ngọc Đài' }
};

const BOTTLENECK_LIMITS = {
  1: 20, 2: 50, 3: 100, 4: 200, 5: 400,
  6: 800, 7: 1600, 8: 3200, 9: 6400, 10: 12800
};

const charName = localStorage.getItem('game_character_name');
const travelerId = localStorage.getItem('game_traveler_id');
const realmKey = localStorage.getItem('game_realm');

let theLuc = parseInt(localStorage.getItem('game_the_luc')) || 0;
let linhLuc = parseInt(localStorage.getItem('game_linh_luc')) || 0;
let tinhLuc = parseInt(localStorage.getItem('game_tinh_luc')) || 0;

let progTheLuc = parseFloat(localStorage.getItem('game_prog_the_luc')) || 0.0;
let progLinhLuc = parseFloat(localStorage.getItem('game_prog_linh_luc')) || 0.0;
let progTinhLuc = parseFloat(localStorage.getItem('game_prog_tinh_luc')) || 0.0;

let currentPeriod = parseInt(localStorage.getItem('game_period')) || 1;
let isBottleneck = localStorage.getItem('game_is_bottleneck') === 'true';

let itemStvl = parseInt(localStorage.getItem('item_stvl')) || 5;
let itemStp = parseInt(localStorage.getItem('item_stp')) || 5;
let itemDefVl = parseInt(localStorage.getItem('item_def_vl')) || 3;
let itemDefP = parseInt(localStorage.getItem('item_def_p')) || 3;

if (!charName || !travelerId || !realmKey || !REALMS_DATA[realmKey]) {
  window.location.href = '/';
} else {
  checkAndTriggerBottleneck();
  updateUI();
}

function checkAndTriggerBottleneck() {
  let maxStat = Math.max(theLuc, linhLuc, tinhLuc);
  let limit = BOTTLENECK_LIMITS[currentPeriod] || 20;
  if (maxStat >= limit && !isBottleneck) {
    isBottleneck = true;
    localStorage.setItem('game_is_bottleneck', 'true');
  }
}

function updateUI() {
  document.getElementById('d_label_traveler').innerText = "Lữ khách " + travelerId;
  document.getElementById('d_identity').innerText = charName;
  document.getElementById('d_realm').innerText = REALMS_DATA[realmKey].name;
  document.getElementById('d_rank').innerText = "Kỳ " + currentPeriod;

  document.getElementById('d_the_luc').innerText = theLuc;
  document.getElementById('d_linh_luc').innerText = linhLuc;
  document.getElementById('d_tinh_luc').innerText = tinhLuc;

  document.getElementById('p_the_luc').innerText = "(" + Math.round(progTheLuc * 100) + "%)";
  document.getElementById('p_linh_luc').innerText = "(" + Math.round(progLinhLuc * 100) + "%)";
  document.getElementById('p_tinh_luc').innerText = "(" + Math.round(progTinhLuc * 100) + "%)";

  let maxStat = Math.max(theLuc, linhLuc, tinhLuc);
  let limit = BOTTLENECK_LIMITS[currentPeriod] || 20;
  document.getElementById('d_limit_val').innerText = limit;
  document.getElementById('d_max_stat').innerText = maxStat;

  let statusBox = document.getElementById('bottleneck-status-box');
  let breakBtn = document.getElementById('btn-break');
  if (isBottleneck) {
    statusBox.style.display = 'flex';
    breakBtn.style.display = 'block';
  } else {
    statusBox.style.display = 'none';
    breakBtn.style.display = 'none';
  }

  let dmgTypeStr = "";
  let atkVal = 0;
  let titleStr = "[Bình Thường]";

  // --- LOGIC XÁC ĐỊNH DANH HIỆU CHUẨN XÁC ---
  let statsObj = { 'Thể': theLuc, 'Linh': linhLuc, 'Tinh': tinhLuc };
  let maxVal = Math.max(theLuc, linhLuc, tinhLuc);
  let highestKeys = Object.keys(statsObj).filter(k => statsObj[k] === maxVal);

  if (highestKeys.length >= 2 && maxVal > 0) {
    if (highestKeys.length === 3) {
      titleStr = "👑 [Tam Thanh Nhất Khí - Giảm 50% chỉ số địch, x2 Dmg]";
      dmgTypeStr = "Hỗn Hợp Tuyệt Đối (Tam Thanh)";
      atkVal = (itemStvl + (theLuc / 10)) * 2;
    } else if (highestKeys.includes('Thể') && highestKeys.includes('Linh')) {
      titleStr = "⚡ [Lưỡng Nghi Đồng Nguyên - Dmg x2 trừ kháng]";
      dmgTypeStr = "Hỗn Hợp (Thể = Linh)";
      atkVal = (itemStvl + (theLuc / 10)) * 2;
    } else if (highestKeys.includes('Thể') && highestKeys.includes('Tinh')) {
      titleStr = "🗡️ [Thân Tinh Hợp Nhất - Xuyên 50% PTVL]";
      dmgTypeStr = "Vật Lý (Thể = Tinh)";
      atkVal = itemStvl + (theLuc / 10);
    } else if (highestKeys.includes('Linh') && highestKeys.includes('Tinh')) {
      titleStr = "🔮 [Linh Tinh Giao Hòa - Xuyên 50% Kháng Pháp]";
      dmgTypeStr = "Pháp Thuật (Linh = Tinh)";
      atkVal = itemStp + (linhLuc / 10);
    }
  } else {
    // Trường hợp chỉ có 1 chỉ số lớn nhất hoặc toàn 0
    if (theLuc > linhLuc && theLuc >= tinhLuc) {
      dmgTypeStr = "Vật Lý (STVL)";
      atkVal = itemStvl + (theLuc / 10);
    } else if (linhLuc > theLuc && linhLuc >= tinhLuc) {
      dmgTypeStr = "Pháp Thuật (STP)";
      atkVal = itemStp + (linhLuc / 10);
    } else if (tinhLuc > theLuc && tinhLuc > linhLuc) {
      dmgTypeStr = "Tinh Thần";
      atkVal = itemStvl + (tinhLuc / 10);
    } else {
      dmgTypeStr = "Cơ Bản";
      atkVal = itemStvl;
    }
  }

  document.getElementById('d_dmg_type').innerText = dmgTypeStr;
  document.getElementById('d_atk_val').innerText = atkVal.toFixed(1);
  document.getElementById('d_title').innerText = titleStr;

  let defVl = itemDefVl + Math.round(theLuc / 20);
  let defP = itemDefP + Math.round(linhLuc / 20);
  let speed = (tinhLuc / 10) + currentPeriod;

  document.getElementById('d_def_vl').innerText = defVl;
  document.getElementById('d_def_p').innerText = defP;
  document.getElementById('d_speed').innerText = speed.toFixed(1);
}

function toggleDetails() {
  let box = document.getElementById('detail-box');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function openCombatModal() {
  if (isBottleneck) {
    alert('Đang lâm vào bình cảnh! Không thể hấp thu nguyên khí nếu chưa phá vỡ cảnh giới.');
    return;
  }
  document.getElementById('combat-modal').style.display = 'flex';
}

function closeCombatModal() {
  document.getElementById('combat-modal').style.display = 'none';
}

function absorbCombat(baseAmount, type) {
  if (isBottleneck) {
    alert('Nhân vật đang bị kẹt bình cảnh!');
    return;
  }

  let multiplier = 1;
  if (type === 'the_luc' && realmKey === 'xich_hoa') multiplier = 2;
  if (type === 'linh_luc' && realmKey === 'tam_sac') multiplier = 2;
  if (type === 'tinh_luc' && realmKey === 'bach_ngoc') multiplier = 2;

  let gained = baseAmount * multiplier;
  let statNameVi = (type === 'the_luc') ? 'Thể Lực' : (type === 'linh_luc') ? 'Linh Lực' : 'Tinh Lực';

  if (type === 'the_luc') {
    progTheLuc += gained;
    while (progTheLuc >= 1.0) { theLuc += 1; progTheLuc -= 1.0; }
    localStorage.setItem('game_the_luc', theLuc);
    localStorage.setItem('game_prog_the_luc', progTheLuc.toFixed(2));
  } else if (type === 'linh_luc') {
    progLinhLuc += gained;
    while (progLinhLuc >= 1.0) { linhLuc += 1; progLinhLuc -= 1.0; }
    localStorage.setItem('game_linh_luc', linhLuc);
    localStorage.setItem('game_prog_linh_luc', progLinhLuc.toFixed(2));
  } else if (type === 'tinh_luc') {
    progTinhLuc += gained;
    while (progTinhLuc >= 1.0) { tinhLuc += 1; progTinhLuc -= 1.0; }
    localStorage.setItem('game_tinh_luc', tinhLuc);
    localStorage.setItem('game_prog_tinh_luc', progTinhLuc.toFixed(2));
  }

  checkAndTriggerBottleneck();
  alert('Hấp thu thành công! Nhận +' + gained.toFixed(2) + ' tiến độ ' + statNameVi);
  
  closeCombatModal();
  updateUI();
}

function breakBottleneck() {
  let rewardBonus = currentPeriod; 

  theLuc += rewardBonus;
  linhLuc += rewardBonus;
  tinhLuc += rewardBonus;

  currentPeriod += 1;
  isBottleneck = false;

  localStorage.setItem('game_the_luc', theLuc);
  localStorage.setItem('game_linh_luc', linhLuc);
  localStorage.setItem('game_tinh_luc', tinhLuc);
  localStorage.setItem('game_period', currentPeriod);
  localStorage.setItem('game_is_bottleneck', 'false');

  alert('🌟 PHÁ VỠ BÌNH CẢNH THÀNH CÔNG! Chuyển sang Kỳ ' + currentPeriod + '. Toàn bộ chỉ số tiềm năng tăng +' + rewardBonus + '!');
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