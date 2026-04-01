// ============================================
// DATA PERTANDINGAN
// ============================================
const matchesData = [
    {
        id: 1,
        team1: "Barcelona",
        team2: "Real Madrid",
        team1Icon: "fa-solid fa-futbol",
        team2Icon: "fa-solid fa-crown",
        date: "2024-12-23",
        time: "21:00 WIB",
        competition: "La Liga"
    },
    {
        id: 2,
        team1: "Manchester United",
        team2: "Liverpool",
        team1Icon: "fa-solid fa-shield-halbed",
        team2Icon: "fa-solid fa-liver",
        date: "2024-12-24",
        time: "22:00 WIB",
        competition: "Premier League"
    },
    {
        id: 3,
        team1: "Juventus",
        team2: "Inter Milan",
        team1Icon: "fa-solid fa-star",
        team2Icon: "fa-solid fa-bolt",
        date: "2024-12-25",
        time: "01:45 WIB",
        competition: "Serie A"
    },
    {
        id: 4,
        team1: "Bayern Munich",
        team2: "Borussia Dortmund",
        team1Icon: "fa-solid fa-eagle",
        team2Icon: "fa-solid fa-bee",
        date: "2024-12-26",
        time: "20:30 WIB",
        competition: "Bundesliga"
    },
    {
        id: 5,
        team1: "PSG",
        team2: "Marseille",
        team1Icon: "fa-solid fa-tower-cell",
        team2Icon: "fa-solid fa-ship",
        date: "2024-12-27",
        time: "02:00 WIB",
        competition: "Ligue 1"
    },
    {
        id: 6,
        team1: "Arsenal",
        team2: "Chelsea",
        team1Icon: "fa-solid fa-gun",
        team2Icon: "fa-solid fa-car",
        date: "2024-12-28",
        time: "23:00 WIB",
        competition: "Premier League"
    }
];

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
    PREDICTIONS: 'football_predictions',
    POINTS: 'user_points',
    LEADERBOARD: 'leaderboard_data'
};

// ============================================
// GLOBAL STATE
// ============================================
let predictions = {};
let userPoints = 0;
let leaderboard = [];

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Load data dari localStorage
function loadData() {
    const savedPredictions = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    if (savedPredictions) {
        predictions = JSON.parse(savedPredictions);
    }
    
    const savedPoints = localStorage.getItem(STORAGE_KEYS.POINTS);
    if (savedPoints) {
        userPoints = parseInt(savedPoints) || 0;
    }
    
    const savedLeaderboard = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
    }
}

// Save predictions ke localStorage
function savePredictions() {
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(predictions));
}

// Save points ke localStorage
function savePoints() {
    localStorage.setItem(STORAGE_KEYS.POINTS, userPoints);
}

// Save leaderboard ke localStorage
function saveLeaderboard() {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
}

// Update total points display
function updatePointsDisplay() {
    const pointsElement = document.getElementById('totalPoints');
    if (pointsElement) {
        pointsElement.textContent = userPoints;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.className = `toast ${type}`;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Hitung poin untuk sebuah pertandingan
function calculatePoints(prediction, actualScore) {
    if (!prediction || !actualScore) return 0;
    
    const predHome = parseInt(prediction.home);
    const predAway = parseInt(prediction.away);
    const actualHome = parseInt(actualScore.home);
    const actualAway = parseInt(actualScore.away);
    
    // Validasi angka
    if (isNaN(predHome) || isNaN(predAway) || isNaN(actualHome) || isNaN(actualAway)) {
        return 0;
    }
    
    // Tebak skor tepat = 3 poin
    if (predHome === actualHome && predAway === actualAway) {
        return 3;
    }
    
    // Tebak pemenang benar = 1 poin
    const predWinner = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
    const actualWinner = actualHome > actualAway ? 'home' : (actualHome < actualAway ? 'away' : 'draw');
    
    if (predWinner === actualWinner) {
        return 1;
    }
    
    return 0;
}

// Update leaderboard dengan data baru
function updateLeaderboard(matchId, pointsEarned) {
    // Cek apakah user sudah ada di leaderboard
    let userEntry = leaderboard.find(entry => entry.id === 'current_user');
    
    if (userEntry) {
        userEntry.points = userPoints;
        userEntry.lastMatch = matchId;
        userEntry.lastUpdate = new Date().toISOString();
    } else {
        leaderboard.push({
            id: 'current_user',
            name: 'Kamu',
            points: userPoints,
            lastMatch: matchId,
            lastUpdate: new Date().toISOString()
        });
    }
    
    // Urutkan berdasarkan poin tertinggi
    leaderboard.sort((a, b) => b.points - a.points);
    
    // Simpan ke localStorage
    saveLeaderboard();
    
    // Refresh display leaderboard
    renderLeaderboard();
}

// Render leaderboard ke HTML
function renderLeaderboard() {
    const container = document.getElementById('leaderboardTable');
    if (!container) return;
    
    if (leaderboard.length === 0) {
        container.innerHTML = `
            <div class="leaderboard-empty">
                <i class="fas fa-chart-simple"></i>
                <p>Belum ada data. Kirim tebakan pertama kamu!</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="leaderboard-row header">
            <div>#</div>
            <div>Nama</div>
            <div>Poin</div>
        </div>
    `;
    
    leaderboard.forEach((entry, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'top-1';
        else if (index === 1) rankClass = 'top-2';
        else if (index === 2) rankClass = 'top-3';
        
        html += `
            <div class="leaderboard-row">
                <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-points">${entry.points} pts</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Render semua pertandingan ke grid
function renderMatches() {
    const grid = document.getElementById('matchesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    matchesData.forEach((match, index) => {
        const savedPrediction = predictions[match.id];
        const hasPrediction = savedPrediction && savedPrediction.home !== undefined && savedPrediction.away !== undefined;
        
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.style.animationDelay = `${index * 0.05}s`;
        matchCard.dataset.matchId = match.id;
        
        matchCard.innerHTML = `
            <div class="match-header">
                <div class="match-date">
                    <i class="far fa-calendar-alt"></i>
                    <span>${match.date} • ${match.time}</span>
                    <span class="competition">${match.competition}</span>
                </div>
            </div>
            <div class="match-teams">
                <div class="team">
                    <div class="team-icon"><i class="${match.team1Icon}"></i></div>
                    <div class="team-name">${match.team1}</div>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <div class="team-icon"><i class="${match.team2Icon}"></i></div>
                    <div class="team-name">${match.team2}</div>
                </div>
            </div>
            <div class="score-inputs">
                <div class="input-group">
                    <label>${match.team1}</label>
                    <input type="number" 
                           id="home_${match.id}" 
                           placeholder="0" 
                           min="0" 
                           max="20"
                           value="${hasPrediction ? savedPrediction.home : ''}"
                           ${hasPrediction ? 'disabled' : ''}>
                </div>
                <div class="input-group">
                    <label>${match.team2}</label>
                    <input type="number" 
                           id="away_${match.id}" 
                           placeholder="0" 
                           min="0" 
                           max="20"
                           value="${hasPrediction ? savedPrediction.away : ''}"
                           ${hasPrediction ? 'disabled' : ''}>
                </div>
            </div>
            <div class="match-actions">
                <button class="btn-match btn-submit" 
                        data-id="${match.id}" 
                        ${hasPrediction ? 'disabled' : ''}>
                    <i class="fas fa-paper-plane"></i> Kirim
                </button>
                <button class="btn-match btn-reset-match" 
                        data-id="${match.id}"
                        ${!hasPrediction ? 'disabled' : ''}>
                    <i class="fas fa-undo-alt"></i> Reset
                </button>
            </div>
            ${savedPrediction && savedPrediction.result ? `
            <div class="match-result">
                <div class="result-badge ${savedPrediction.result.class}">
                    <i class="fas ${savedPrediction.result.icon}"></i>
                    <span>${savedPrediction.result.text}</span>
                </div>
                <div class="points-earned">+${savedPrediction.points} poin</div>
            </div>
            ` : ''}
        `;
        
        grid.appendChild(matchCard);
    });
    
    // Attach event listeners
    attachMatchEvents();
}

// Attach event listeners untuk semua tombol match
function attachMatchEvents() {
    // Tombol submit per match
    document.querySelectorAll('.btn-submit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const matchId = parseInt(btn.dataset.id);
            submitPrediction(matchId);
        });
    });
    
    // Tombol reset per match
    document.querySelectorAll('.btn-reset-match').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const matchId = parseInt(btn.dataset.id);
            resetMatchPrediction(matchId);
        });
    });
}

// Submit prediksi untuk satu pertandingan
function submitPrediction(matchId) {
    const match = matchesData.find(m => m.id === matchId);
    if (!match) return;
    
    const homeInput = document.getElementById(`home_${matchId}`);
    const awayInput = document.getElementById(`away_${matchId}`);
    
    const homeScore = homeInput.value.trim();
    const awayScore = awayInput.value.trim();
    
    // Validasi input
    if (homeScore === '' || awayScore === '') {
        showToast('Skor tidak boleh kosong!', 'error');
        homeInput.style.borderColor = 'var(--accent-red)';
        awayInput.style.borderColor = 'var(--accent-red)';
        setTimeout(() => {
            homeInput.style.borderColor = '';
            awayInput.style.borderColor = '';
        }, 2000);
        return;
    }
    
    const homeInt = parseInt(homeScore);
    const awayInt = parseInt(awayScore);
    
    if (isNaN(homeInt) || isNaN(awayInt) || homeInt < 0 || awayInt < 0 || homeInt > 20 || awayInt > 20) {
        showToast('Skor harus angka antara 0-20!', 'error');
        return;
    }
    
    // Simulasi skor aktual (dalam real app, ini dari API/database)
    // Untuk demo, kita generate random skor untuk menentukan poin
    const actualHome = Math.floor(Math.random() * 5);
    const actualAway = Math.floor(Math.random() * 5);
    
    // Hitung poin
    const points = calculatePoints(
        { home: homeInt, away: awayInt },
        { home: actualHome, away: actualAway }
    );
    
    // Tentukan hasil tebakan
    let resultClass = '', resultIcon = '', resultText = '';
    if (points === 3) {
        resultClass = 'success';
        resultIcon = 'fa-trophy';
        resultText = `Skor tepat! (${actualHome}-${actualAway})`;
    } else if (points === 1) {
        resultClass = 'partial';
        resultIcon = 'fa-thumbs-up';
        resultText = `Pemenang benar! (${actualHome}-${actualAway})`;
    } else {
        resultClass = 'failed';
        resultIcon = 'fa-times-circle';
        resultText = `Kurang tepat (${actualHome}-${actualAway})`;
    }
    
    // Simpan prediksi
    predictions[matchId] = {
        home: homeInt,
        away: awayInt,
        actualHome: actualHome,
        actualAway: actualAway,
        points: points,
        result: {
            class: resultClass,
            icon: resultIcon,
            text: resultText
        },
        submittedAt: new Date().toISOString()
    };
    
    // Update total poin
    userPoints += points;
    
    // Save ke storage
    savePredictions();
    savePoints();
    updatePointsDisplay();
    
    // Update leaderboard
    updateLeaderboard(matchId, points);
    
    // Animasi card
    const card = document.querySelector(`.match-card[data-match-id="${matchId}"]`);
    if (card) {
        card.classList.add('submit-animation');
        setTimeout(() => card.classList.remove('submit-animation'), 300);
    }
    
    // Re-render pertandingan
    renderMatches();
    
    // Notifikasi sukses
    showToast(`${match.team1} vs ${match.team2}: ${resultText}. +${points} poin!`, 'success');
}

// Reset prediksi satu pertandingan
function resetMatchPrediction(matchId) {
    const match = matchesData.find(m => m.id === matchId);
    if (!match) return;
    
    const savedPrediction = predictions[matchId];
    if (savedPrediction) {
        // Kurangi poin yang sudah didapat
        userPoints -= savedPrediction.points;
        savePoints();
        updatePointsDisplay();
        
        // Hapus prediksi
        delete predictions[matchId];
        savePredictions();
        
        // Update leaderboard
        updateLeaderboard(matchId, 0);
        
        // Re-render
        renderMatches();
        
        showToast(`Prediksi ${match.team1} vs ${match.team2} telah direset!`, 'success');
    }
}

// Kirim semua prediksi
function submitAllPredictions() {
    const unsentMatches = matchesData.filter(match => !predictions[match.id]);
    
    if (unsentMatches.length === 0) {
        showToast('Semua pertandingan sudah ditebak!', 'error');
        return;
    }
    
    unsentMatches.forEach(match => {
        const homeInput = document.getElementById(`home_${match.id}`);
        const awayInput = document.getElementById(`away_${match.id}`);
        
        if (homeInput && awayInput && homeInput.value && awayInput.value) {
            submitPrediction(match.id);
        }
    });
    
    if (unsentMatches.length > 0) {
        showToast(`${unsentMatches.length} tebakan berhasil dikirim!`, 'success');
    }
}

// Reset semua prediksi
function resetAllPredictions() {
    if (Object.keys(predictions).length === 0) {
        showToast('Tidak ada prediksi yang perlu direset!', 'error');
        return;
    }
    
    // Reset poin
    userPoints = 0;
    savePoints();
    updatePointsDisplay();
    
    // Hapus semua prediksi
    predictions = {};
    savePredictions();
    
    // Update leaderboard
    updateLeaderboard(0, 0);
    
    // Re-render
    renderMatches();
    
    showToast('Semua prediksi berhasil direset!', 'success');
}

// Hapus semua data (prediksi, poin, leaderboard)
function clearAllData() {
    if (confirm('⚠️ Peringatan! Ini akan menghapus SEMUA data prediksi, poin, dan leaderboard. Lanjutkan?')) {
        predictions = {};
        userPoints = 0;
        leaderboard = [];
        
        localStorage.removeItem(STORAGE_KEYS.PREDICTIONS);
        localStorage.removeItem(STORAGE_KEYS.POINTS);
        localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
        
        updatePointsDisplay();
        renderMatches();
        renderLeaderboard();
        
        showToast('Semua data berhasil dihapus!', 'success');
    }
}

// Reset leaderboard
function resetLeaderboard() {
    if (confirm('Reset leaderboard? Data poin kamu tetap tersimpan.')) {
        leaderboard = [];
        saveLeaderboard();
        renderLeaderboard();
        showToast('Leaderboard berhasil direset!', 'success');
    }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    loadData();
    updatePointsDisplay();
    renderMatches();
    renderLeaderboard();
    
    // Attach global button events
    const submitAllBtn = document.getElementById('submitAllBtn');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const resetLeaderboardBtn = document.getElementById('resetLeaderboardBtn');
    
    if (submitAllBtn) submitAllBtn.addEventListener('click', submitAllPredictions);
    if (resetAllBtn) resetAllBtn.addEventListener('click', resetAllPredictions);
    if (clearDataBtn) clearDataBtn.addEventListener('click', clearAllData);
    if (resetLeaderboardBtn) resetLeaderboardBtn.addEventListener('click', resetLeaderboard);
}

// Start aplikasi
init();
