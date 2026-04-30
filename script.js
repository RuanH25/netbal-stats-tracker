// ================= GLOBAL STATE =================
let players = [];
let lineup = {};
let selectedPosition = null;

let teamAScore = 0;
let teamBScore = 0;
let gameType = 7;

// TIMER + GAME SETTINGS
let totalQuarters = 4;
let currentQuarter = 1;
let periodTime = 600;
let quarterLineups = {
  1: {},
  2: {},
  3: {},
  4: {}
};

let time = 600;
let interval = null;

// NEW SYSTEMS
let actionHistory = [];
let playerStats = {};

// 🔥 FIX: prevent duplicate games
let currentGameId = null;

let playerPositionsHistory = {};
let currentEvents = [];
let lastSavedTime = null;


// ================= NAV =================
function goHome() {

  // 🔥 only save as active if game screen is visible
  if (document.getElementById("game").style.display === "block") {
    saveGame("active");
  }

  document.getElementById("game").style.display = "none";
  document.getElementById("newGameScreen").style.display = "none";
  document.getElementById("statsScreen").style.display = "none"; // 🔥 ADD THIS

  document.getElementById("home").style.display = "block";

  window.scrollTo(0, 0);
  loadRecentGames();

  pauseTimer();
  isRunning = false;
}

function isGameCompleted() {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  let g = games.find(x => x.id === currentGameId);

  return g && g.status === "completed";
}

// ================= ROSTER =================
function updateRoster() {
  let type = document.getElementById("gameType").value;
  let grid = document.getElementById("rosterGrid");
  let q = document.getElementById("quarterSelect").value;

  grid.innerHTML = "";

  let positions = type == 7
  ? ["GS","GA","WA","C","WD","GD","GK","S1","S2","S3","S4"]
  : ["A1","A2","L1","L2","D1","D2","S1","S2","S3","S4"];

  // make sure quarter exists
  if (!quarterLineups[q]) quarterLineups[q] = {};

  positions.forEach(pos => {
    let savedName = quarterLineups[q][pos] || "";

    let row = document.createElement("div");
    row.className = "roster-row";

    row.innerHTML = `
      <div class="pos-badge">${pos}</div>
      <input 
        value="${savedName}"
        placeholder="Player Name"
        oninput="saveRosterInput('${q}', '${pos}', this.value)"
      >
    `;

    grid.appendChild(row);
  });
}

function saveRosterInput(q, pos, value) {
  if (!quarterLineups[q]) quarterLineups[q] = {};
  quarterLineups[q][pos] = value;
}

// ================= START GAME =================
function startGame() {

  if (isSetupEmpty()) {
  alert("Please enter both team names and at least one player.");
  return;
}

currentGameId = null;
lastSavedTime = null;

  gameType = parseInt(document.getElementById("gameType").value);

  totalQuarters = parseInt(document.getElementById("quarters").value);
  periodTime = parseInt(document.getElementById("gameLength").value);

  time = periodTime;
  currentQuarter = 1;

  document.getElementById("period").innerText = "Q1";
  updateTimer();

let positions = gameType == 7
  ? ["GS","GA","WA","C","WD","GD","GK"]
  : ["A1","A2","L1","L2","D1","D2"];

  players = [];
  lineup = {};
  playerStats = {};
  playerPositionsHistory = {};
  currentEvents = [];
  actionHistory = [];

  let q1 = quarterLineups[1] || {};

// collect all players
players = [];

Object.values(quarterLineups).forEach(q => {
  Object.values(q).forEach(name => {
    if (name && !players.includes(name)) {
      players.push(name);
    }
  });
});

players.forEach(name => {
  if (!playerStats[name]) {
    playerStats[name] = {
      goals1: 0,
      goals2: 0,
      miss: 0,
      intercept: 0,
      pickup: 0,
      turnover: 0,
      tip: 0,
      rebound: 0,
      badPass: 0,
      dropped: 0,
      netAbuse: 0,
      contact: 0,
      obstruction: 0,
      footwork: 0,
      linebreak: 0,
      attitude: 0,
      replay: 0,
      offside: 0
    };
  }
});

// build lineup from Q1
positions.forEach(pos => {
  let name = q1[pos] || pos;

  lineup[pos] = name;

  playerPositionsHistory[name] = [pos];

  playerStats[name] = {
    goals1: 0,
    goals2: 0,
    miss1: 0,
    miss2: 0,
    intercept: 0,
    pickup: 0,
    turnover: 0,
    tip: 0,
    rebound: 0,
    badPass: 0,
    dropped: 0,
    netAbuse: 0,
    contact: 0,
    obstruction: 0,
    footwork: 0,
    linebreak: 0,
    attitude: 0,
    replay: 0,
    offside: 0
  };
});

  teamAScore = 0;
  teamBScore = 0;

  document.getElementById("teamAScore").innerText = 0;
  document.getElementById("teamBScore").innerText = 0;

  document.getElementById("newGameScreen").style.display = "none";
  document.getElementById("game").style.display = "block";

  document.getElementById("teamAName").innerText =
    document.getElementById("teamA").value;

  document.getElementById("teamBName").innerText =
    document.getElementById("teamB").value;

  renderPlayerGrid();
  saveGame("active");
}

// ================= RENDER GRID =================

function renderPlayerGrid() {
  let container = document.getElementById("players");
  container.innerHTML = "";

  container.className = "player-grid";

if (gameType === 7) {
  container.classList.add("seven");
}

  Object.keys(lineup).forEach((pos, index) => {
    let div = document.createElement("div");
    div.className = "player-card";
    if (gameType === 7) {
  div.style.gridArea = pos;
} else {
  div.style.gridArea = "auto"; // 🔥 RESET for 6's
}

    let playerName = lineup[pos];

    // ✅ SAFE UI UPDATE
    div.innerHTML =
      "<div class='player-pos'>" + pos + "</div>" +
      "<div class='player-name'>" + playerName + "</div>";

    div.onclick = () => selectPlayer(pos);

    container.appendChild(div);
  });
}
// ================= SELECT PLAYER =================
function selectPlayer(pos) {
  console.log("CLICKED:", pos);   // 🔥 ADD THIS

  selectedPosition = pos;

  document.getElementById("playerTitle").innerText =
    lineup[pos] + " (" + pos + ")";

  highlightSelectedPlayer(pos);
  setupShooting(pos);
}

// ================= HIGHLIGHT =================
function highlightSelectedPlayer(position) {
  const cards = document.querySelectorAll(".player-card");

  cards.forEach(card => {
    card.classList.remove("active");

    const posText = card.querySelector(".player-pos").textContent.trim();

    console.log("CARD:", posText, "| CLICKED:", position); // 🔥 DEBUG

    if (posText == position) {   // 🔥 use == (important)
      card.classList.add("active");
    }
  });
}

// ================= CLEAR =================
function clearSelection() {
  selectedPosition = null;
  document.getElementById("playerTitle").innerText = "Select Player";

  document.querySelectorAll(".player-card")
    .forEach(c => c.classList.remove("active"));

  document.getElementById("shootingActions").innerHTML = "";
}

// ================= SHOOTING =================
function setupShooting(pos) {
  let container = document.getElementById("shootingActions");

  container.innerHTML = "";

  console.log("GameType:", gameType, "Position:", pos); // DEBUG

  // ===== 7-a-side =====
  if (gameType === 7) {
    if (pos === "GS" || pos === "GA") {
      container.innerHTML = `
        <button class="btn-goal1" onclick="recordAction('goal1')">+1 Goal</button>
        <button class="btn-miss" onclick="recordAction('miss')">Miss</button>
      `;
    } else {
      container.innerHTML = `<p>No shooting</p>`;
    }
  }

  // ===== 6-a-side =====
  if (gameType === 6) {

    if (pos === "A1" || pos === "A2") {
      container.innerHTML = `
        <button class="btn-goal1" onclick="recordAction('goal1')">+1 Goal</button>
        <button class="btn-goal2" onclick="recordAction('goal2')">+2 Goal</button>
        <button class="btn-miss" onclick="recordAction('miss1')">Miss 1</button>
        <button class="btn-miss" onclick="recordAction('miss2')">Miss 2</button>
      `;
    }

    else if (pos === "L1" || pos === "L2") {
      container.innerHTML = `
        <button class="btn-goal2" onclick="recordAction('goal2')">+2 Goal</button>
        <button class="btn-miss" onclick="recordAction('miss2')">Miss 2</button>
      `;
    }

    else {
      container.innerHTML = `<p>No shooting</p>`;
    }
  }
}

// ================= RECORD ACTION =================
function recordAction(type) {
  if (isGameCompleted()) return;
  if (!selectedPosition) {
  alert("Select a player first");
  return;
}

highlightSelectedPlayer(selectedPosition);

  let player = lineup[selectedPosition];

  actionHistory.push({
    type,
    player,
    prevScore: teamAScore,
    prevStats: JSON.parse(JSON.stringify(playerStats[player]))
  });

  if (type === "goal1") {
    teamAScore++;
    playerStats[player].goals1++;
  }

  if (type === "goal2") {
    teamAScore += 2;
    playerStats[player].goals2++;
  }

  if (type === "miss") playerStats[player].miss1++;
  if (type === "miss2") playerStats[player].miss2++

  if (type === "intercept") playerStats[player].intercept++;
  if (type === "pickup") playerStats[player].pickup++;
  if (type === "turnover") playerStats[player].turnover++;
  if (type === "tip") playerStats[player].tip++;
  if (type === "rebound") playerStats[player].rebound++;

  if (type === "bad pass") playerStats[player].badPass++;
  if (type === "dropped") playerStats[player].dropped++;
  if (type === "net abuse") playerStats[player].netAbuse++;
  if (type === "contact") playerStats[player].contact++;
  if (type === "obstruction") playerStats[player].obstruction++;
  if (type === "footwork") playerStats[player].footwork++;
  if (type === "linebreak") playerStats[player].linebreak++;
  if (type === "attitude") playerStats[player].attitude++;
  if (type === "replay") playerStats[player].replay++;
  if (type === "offside") playerStats[player].offside++;

  document.getElementById("teamAScore").innerText = teamAScore;

let actionName = type;

if (type === "turnover") actionName = "Forced Turnover";
if (type === "bad pass") actionName = "Bad Pass";
if (type === "net abuse") actionName = "Net Abuse";
if (type === "linebreak") actionName = "Linebreak";

let text = player + " (" + selectedPosition + ") → " + actionName;

currentEvents.unshift({
  text: text,
  time: new Date()
});

renderEventLog();

saveGame("active");
}

// ================= UNDO =================
function undoLastAction() {
  if (isGameCompleted()) return;
  let last = actionHistory.pop();
  if (!last) return;

  // restore score + stats
  teamAScore = last.prevScore;
  playerStats[last.player] = last.prevStats;

  document.getElementById("teamAScore").innerText = teamAScore;

  // 🔥 remove event from data (IMPORTANT)
  currentEvents.shift();

  // 🔥 re-render events correctly
  renderEventLog();

  saveGame("active");
}

// ================= OPPONENT SCORE =================
function addOpponentScore(value) {
  if (isGameCompleted()) return;
  teamBScore += value;
  if (teamBScore < 0) teamBScore = 0;

  document.getElementById("teamBScore").innerText = teamBScore;
  saveGame("active");
}

// ================= TIMER =================
function startTimer() {
  if (interval) return;

  let endTime = Date.now() + (time * 1000);

  interval = setInterval(() => {
    time = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    updateTimer();

    if (time % 10 === 0 && time !== lastSavedTime) {
  lastSavedTime = time;
  saveGame("active");
}

    if (time <= 0) {
      clearInterval(interval);
      interval = null;
      isRunning = false;
      document.getElementById("playBtn").innerText = "▶";

      if (currentQuarter >= totalQuarters) {
        saveGame("completed");
        showStatsPage();
        return;
      }

      document.getElementById("quarterDisplay").innerText = currentQuarter;
      openPositionChange();
    }
  }, 250);


}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  clearInterval(interval);
  interval = null;

  time = periodTime;
  updateTimer();
}

function updateTimer() {
  let m = Math.floor(time / 60);
  let s = time % 60;

  document.getElementById("timer").innerText =
    m + ":" + (s < 10 ? "0" : "") + s;
}

// ================= QUARTERS =================
function nextQuarter() {
  if (isGameCompleted()) return;
  console.warn("nextQuarter disabled. Use modal system.");
}

// ================= STATS =================
function showStatsPage() {

  // 🔥 ADD THESE TWO LINES
  document.getElementById("home").style.display = "none";
  document.getElementById("newGameScreen").style.display = "none";

  document.getElementById("game").style.display = "none";
  document.getElementById("statsScreen").style.display = "block";

  let content = document.getElementById("statsContent");
  content.innerHTML = "";

  // 🔥 SMART PERFORMANCE HIGHLIGHTS
  let bestScorer = { name: "-", value: 0 };
  let bestDefender = { name: "-", value: 0 };
  let topInterceptor = { name: "-", value: 0 };

  Object.keys(playerStats).forEach(player => {
    let s = playerStats[player];

    let points = (s.goals1 * 1) + (s.goals2 * 2);

   let defensiveImpact =
(s.intercept * 5) +
(s.pickup * 3) +
(s.rebound * 4) +
(s.tip * 2) +
(s.turnover * 4);

    if (points > bestScorer.value) {
      bestScorer = { name: player, value: points };
    }

    if (defensiveImpact > bestDefender.value) {
      bestDefender = { name: player, value: defensiveImpact };
    }

    if (s.intercept > topInterceptor.value) {
      topInterceptor = { name: player, value: s.intercept };
    }


  });

  // 🏆 BUILD FULL RANKINGS
let totalPoints = 0;
let totalAttempts = 0;
let totalDefence = 0;
let totalErrors = 0;

Object.keys(playerStats).forEach(player => {
  let s = playerStats[player];

  totalPoints += (s.goals1 * 1) + (s.goals2 * 2);
  totalAttempts += s.goals1 + s.goals2 + s.miss;

  totalDefence +=
    s.intercept +
    s.pickup +
    s.rebound +
    s.turnover;

  totalErrors +=
  (s.badPass || 0) +
  (s.dropped || 0) +
  (s.contact || 0) +
  (s.obstruction || 0) +
  (s.footwork || 0) +
  (s.linebreak || 0) +
  (s.offside || 0);
});

let shootPct =
  totalAttempts > 0
    ? Math.round((totalPoints / totalAttempts) * 100)
    : 0;

let attackGrade =
  totalPoints >= 90 ? "A" :
  totalPoints >= 75 ? "B" :
  totalPoints >= 60 ? "C" : "D";

let defenceGrade =
  totalDefence >= 12 ? "A" :
  totalDefence >= 8 ? "B" :
  totalDefence >= 4 ? "C" : "D";

let possessionValue =
(totalDefence * 2) - totalErrors;

if (possessionValue < 0) possessionValue = 0;

let possessionGrade =
  possessionValue >= 18 ? "A" :
  possessionValue >= 12 ? "B" :
  possessionValue >= 6 ? "C" : "D";

 let disciplineGrade =
  totalErrors <= 3 ? "A" :
  totalErrors <= 6 ? "B" :
  totalErrors <= 10 ? "C" : "D"; 

let attackTarget = totalQuarters * 12;

let attackPct =
  Math.min(100, Math.round((teamAScore / attackTarget) * 100));

let possessionPct =
Math.min(100, Math.round((possessionValue / 25) * 100));

let disciplinePct = Math.max(0, 100 - (totalErrors * 10));

let rankings = [];

Object.keys(playerStats).forEach(player => {
  let s = playerStats[player];

let positions = playerPositionsHistory[player] || [];

let isMidcourt =
positions.includes("WA") ||
positions.includes("C") ||
positions.includes("WD") ||
positions.includes("L1") ||
positions.includes("L2");

let midcourtBonus = isMidcourt
  ? (s.pickup * 2) + (s.tip * 1.5) + (s.turnover * 2)
  : 0;


let score =

(gameType == 7
  ? (s.goals1 * 1) - (s.miss * 1)
  : (s.goals1 * 1) + (s.goals2 * 2.75) - (s.miss * 1.5))

+ (s.intercept * 5)
+ (s.pickup * 4)
+ (s.turnover * 4)
+ (s.tip * 3)
+ (s.rebound * 4)

- (s.badPass * 3)
- (s.dropped * 3)
- (s.netAbuse * 2)
- (s.contact * 2)
- (s.obstruction * 2)
- (s.footwork * 3)
- (s.linebreak * 2)
- (s.attitude * 2)
- (s.replay * 1)
- (s.offside * 2) 
+ midcourtBonus;

  score = Number(score) || 0;

let rating = 5 + (score / 10);

if (rating > 10) rating = 10;
if (rating < 1) rating = 1;

rankings.push({
  name: player,
  score: score,
  rating: rating.toFixed(1)
});
});

// 🔥 SORT BEST → WORST
rankings.sort((a, b) => b.score - a.score);

// 🎯 MVP = FIRST PLAYER
let MVP = rankings[0];

// 🔥 NEW HEADER (PRO LAYOUT)
let html = `
<div class="stats-header">

  <div class="stats-top">

    <div class="stats-title">
      <p class="live">LIVE SCORE • ${new Date().toDateString()}</p>
      <h1>
        ${document.getElementById("teamAName")?.innerText || "Our Team"} 
        vs 
        ${document.getElementById("teamBName")?.innerText || "Opponent"}
      </h1>
    </div>

    <div class="score-card">
      <div>
        <span>OUR TEAM</span>
        <h2>${teamAScore}</h2>
      </div>
      <div>
        <span>OPPONENT</span>
        <h2>${teamBScore}</h2>
      </div>
    </div>

  </div>
`;

// 🔥 HIGHLIGHTS
html += `
<h3 class="section-title">MATCH HIGHLIGHTS</h3>

<div class="dashboard-top">

  <div class="highlights-left">

    <div class="mvp-main">
      <div class="mvp-label">👑 MVP</div>
      <h2>${MVP.name}</h2>
      <p>${MVP.rating}/10</p>
      <span>Player of the Match</span>
    </div>

    <div class="ranking-grid">

      <div class="rank-card">
        <span>2nd</span>
        <h4>${rankings[1]?.name || "-"}</h4>
        <p>${rankings[1]?.rating || "-"}/10</p>
      </div>

      <div class="rank-card">
        <span>3rd</span>
        <h4>${rankings[2]?.name || "-"}</h4>
        <p>${rankings[2]?.rating || "-"}/10</p>
      </div>

    </div>

  </div>


  <div class="dashboard-right">

    <div class="mini-header">PLAYER AWARDS</div>

    <div class="awards-grid">

      <div class="highlight-card">
        <h2>🏆 Top Scorer</h2>
        <p>${bestScorer.name}</p>
        <span>${bestScorer.value} pts</span>
      </div>

      <div class="highlight-card">
        <h2>🛡️ Best Defender</h2>
        <p>${bestDefender.name}</p>
        <span>${bestDefender.value} impact</span>
      </div>

      <div class="highlight-card">
        <h2>⭐ Top Defender</h2>
        <p>${topInterceptor.name}</p>
        <span>${topInterceptor.value} intercepts</span>
      </div>

    </div>

<div class="mini-header">TEAM PERFORMANCE</div>

<div class="bars-wrap">

  <div class="bar-row">
    <div class="bar-info">
      <strong>Attack</strong>
      <small>${attackGrade} ${attackPct}%</small>
    </div>
    <div class="bar">
      <div style="width:${attackPct}%"></div>
    </div>
  </div>

<div class="bar-row">
  <div class="bar-info">
    <strong>Possession</strong>
    <small>${possessionGrade} ${possessionPct}%</small>
  </div>
  <div class="bar">
    <div style="width:${possessionPct}%"></div>
  </div>
</div>

  <div class="bar-row">
    <div class="bar-info">
      <strong>Shooting</strong>
      <small>${shootPct}%</small>
    </div>
    <div class="bar">
      <div style="width:${shootPct}%"></div>
    </div>
  </div>

  <div class="bar-row">
    <div class="bar-info">
      <strong>Discipline</strong>
      <small>${disciplineGrade} ${disciplinePct}%</small>
    </div>
    <div class="bar">
      <div style="width:${disciplinePct}%"></div>
    </div>
  </div>

 </div>   <!-- bars-wrap -->
</div>   <!-- dashboard-right -->
</div>
`;

  // 🔥 TABLE
  html += `
   <div style="display:flex; justify-content:space-between; align-items:center;">
    <h3 class="section-title">PLAYER STATISTICS</h3>
    <button class="export-btn" onclick="exportCSV()">⬇ Export CSV</button>
  </div>

    <table class="stats-table">
      <tr>
        <th>Player</th>
        <th>Pos</th>
        <th>PTS</th>
        <th>1PT G/A</th>
        <th>1PT %</th>
        <th>2PT G/A</th>
        <th>2PT %</th>
        <th>INT</th>
        <th>Pickup</th>
        <th>FTO</th>
        <th>Tipped</th>
        <th>Reb</th>
        <th>BDPs</th>
        <th>Drop</th>
        <th>Net</th>
        <th>Con</th>
        <th>Obs</th>
        <th>Foot</th>
        <th>Line</th>
        <th>Att</th>
        <th>Rep</th>
        <th>Off</th>
      </tr>
  `;

  Object.keys(playerStats).forEach(player => {
    let s = playerStats[player];

    let goals1 = s.goals1;
    let goals2 = s.goals2;

    let attempts1 = goals1 + s.miss;
    let attempts2 = goals2;

    let percent1 = attempts1 > 0 ? Math.round((goals1 / attempts1) * 100) : 0;
    let percent2 = attempts2 > 0 ? Math.round((goals2 / attempts2) * 100) : 0;

    let points = (goals1 * 1) + (goals2 * 2);

    html += `
      <tr>
       <td class="player-name-cell">
  ${player}
  <button class="edit-btn" onclick="renamePlayer('${player}')">✏️</button>
</td>

<td>
  ${
    playerPositionsHistory[player]
      ? playerPositionsHistory[player].join(",")
      : "-"
  }
</td>

        <td>${points}</td>
        <td>${goals1}/${attempts1}</td>
        <td>${percent1}%</td>

        <td>${goals2}/${attempts2}</td>
        <td>${percent2}%</td>

        <td>${s.intercept}</td>
        <td>${s.pickup}</td>
        <td>${s.turnover}</td>
        <td>${s.tip}</td>
        <td>${s.rebound}</td>

        <td>${s.badPass}</td>
        <td>${s.dropped}</td>
        <td>${s.netAbuse}</td>
        <td>${s.contact}</td>
        <td>${s.obstruction}</td>
        <td>${s.footwork}</td>
        <td>${s.linebreak}</td>
        <td>${s.attitude}</td>
        <td>${s.replay}</td>
        <td>${s.offside}</td>
      </tr>
    `;
  });

  html += `</table>`;
  html += `</div>`;

  content.innerHTML = html;
}


// ================= POSITION CHANGE =================
function openPositionChange() {
  document.getElementById("quarterDisplay").innerText = currentQuarter;
  document.getElementById("positionModal").style.display = "flex";

  let container = document.getElementById("positionSwap");
  container.innerHTML = "";

 let nextQ = currentQuarter + 1;
let plannedLineup = quarterLineups[nextQ] || {};

Object.keys(lineup).forEach(pos => {

  let selectedPlayer = plannedLineup[pos] || lineup[pos];

  let div = document.createElement("div");

  div.innerHTML =
    "<p>" + pos + "</p>" +
    "<select onchange='assignPlayer(\"" + pos + "\", this.value)'>" +
    players.map(p =>
      `<option ${selectedPlayer === p ? "selected" : ""}>${p}</option>`
    ).join("") +
    "</select>";

  container.appendChild(div);
});
}

function assignPlayer(position, playerName) {
  lineup[position] = playerName;

  // 🔥 make sure player exists
  if (!playerPositionsHistory[playerName]) {
    playerPositionsHistory[playerName] = [];
  }

  // 🔥 add position ONLY if not already there
  if (!playerPositionsHistory[playerName].includes(position)) {
    playerPositionsHistory[playerName].push(position);
  }

  renderPlayerGrid();
}

function closePositionModal() {
  document.getElementById("positionModal").style.display = "none";
}

// ================= SAVE SYSTEM =================
function saveGame(status = "active") {

  let games = JSON.parse(localStorage.getItem("games")) || [];
  let existing = games.find(g => g.id === currentGameId);

if (existing && existing.status === "completed") {
  status = "completed";
}

let gameData = {
  id: currentGameId || (Date.now() + Math.floor(Math.random() * 10000)),
  teamA: document.getElementById("teamAName").innerText,
  teamB: document.getElementById("teamBName").innerText,
  scoreA: teamAScore,
  scoreB: teamBScore,
  lineup,
  players,
  stats: playerStats,
  quarter: currentQuarter,
  status,
  events: currentEvents,
  gameType: gameType,

  totalQuarters: totalQuarters,
  periodTime: periodTime,
  timeLeft: time,
  positionsHistory: playerPositionsHistory
};

 if (!currentGameId) {
    currentGameId = gameData.id;
    games.push(gameData);
} else {
    let found = false;

    games = games.map(g => {
        if (g.id === currentGameId) {
            found = true;
            return gameData;
        }
        return g;
    });

    if (!found) {
        games.push(gameData);
    }
}

  games = games.slice(-50);

  localStorage.setItem("games", JSON.stringify(games));
}

// ================= LOAD GAMES =================
function loadRecentGames() {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  let container = document.getElementById("recentGames");

  container.innerHTML = "";

  games.forEach(g => {
    let div = document.createElement("div");

    div.className = "game-card";

    div.innerHTML = `
  <div class="card-top">
    <div class="card-info">
      <p class="card-date">${new Date(g.id).toDateString()}</p>
      <h3 class="match-title">
  <span class="team-name">${g.teamA}</span>
  <span class="vs">vs</span>
  <span class="team-name">${g.teamB}</span>
  </h3> 
    </div>

    <div class="card-score">
      <span>SCORE</span>
      <h2>${g.scoreA} - ${g.scoreB}</h2>
    </div>
  </div>

  <div class="card-bottom">
    <span class="status ${g.status}">${g.status.toUpperCase()}</span>

    <div class="card-actions">
      <button onclick="resumeGame(${g.id})">Open</button>
      <button onclick="deleteGame(${g.id})">Delete</button>
    </div>
  </div>
`;

    container.appendChild(div);
  });
}

function resumeGame(id) {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  let g = games.find(x => x.id === id);
  if (!g) return;

  // 🔥 HANDLE DRAFT
  if (g.status === "draft") {

    currentGameId = g.id;

    // show setup screen
    document.getElementById("home").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.getElementById("statsScreen").style.display = "none";
    document.getElementById("newGameScreen").style.display = "block";

    // restore team names
    document.getElementById("teamA").value =
      g.teamA !== "Untitled Game" ? g.teamA : "";

    document.getElementById("teamB").value = g.teamB || "";

    document.getElementById("period").innerText =
  (totalQuarters === 2 ? "Half " : "Q") + currentQuarter;

  time = periodTime;
  updateTimer();

    updateRoster();

    return;
  }

  // 🔥 NORMAL GAME LOAD
  currentGameId = g.id;
  actionHistory = [];
  currentEvents = g.events || [];
renderEventLog();
lastSavedTime = null;

  lineup = g.lineup;
  players = g.players;
  playerStats = g.stats;
  gameType = g.gameType || 7;
  totalQuarters = g.totalQuarters || 4;
periodTime = g.periodTime || 600;
time = g.timeLeft || periodTime;
playerPositionsHistory = g.positionsHistory || {};
updateTimer();

  teamAScore = g.scoreA;
  teamBScore = g.scoreB;
  currentQuarter = g.quarter;

  document.getElementById("teamAName").innerText = g.teamA;
  document.getElementById("teamBName").innerText = g.teamB;

  document.getElementById("teamAScore").innerText = teamAScore;
  document.getElementById("teamBScore").innerText = teamBScore;

  document.getElementById("home").style.display = "none";
  document.getElementById("game").style.display = "block";

  renderPlayerGrid();
}

function deleteGame(id) {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  games = games.filter(g => g.id !== id);

  localStorage.setItem("games", JSON.stringify(games));
  loadRecentGames();
}

// LOAD ON START
loadRecentGames();

let isRunning = false;

function toggleTimer() {
  if (isGameCompleted()) return;
  const btn = document.getElementById("playBtn");

  if (!isRunning) {
    startTimer();
    isRunning = true;
    btn.innerText = "⏸";
  } else {
    pauseTimer();
    saveGame("active")
    isRunning = false;
    btn.innerText = "▶";
  }
}

function nextQuarterConfirm() {
  if (isGameCompleted()) return;
  pauseTimer();

  isRunning = false;
  document.getElementById("playBtn").innerText = "▶";

  document.getElementById("quarterDisplay").innerText = currentQuarter;

  openPositionChange();
}

function startNextQuarter() {

  if (currentQuarter >= totalQuarters) {
    showStatsPage();
    saveGame("completed");
    return;
  }

  currentQuarter++;

document.getElementById("period").innerText =
  (totalQuarters === 2 ? "Half " : "Q") + currentQuarter;

// 🔥 APPLY planned lineup automatically
let plannedLineup = quarterLineups[currentQuarter] || {};

Object.keys(plannedLineup).forEach(pos => {
  if (plannedLineup[pos]) {
    lineup[pos] = plannedLineup[pos];

    // track position history
    if (!playerPositionsHistory[plannedLineup[pos]]) {
      playerPositionsHistory[plannedLineup[pos]] = [];
    }

    if (!playerPositionsHistory[plannedLineup[pos]].includes(pos)) {
      playerPositionsHistory[plannedLineup[pos]].push(pos);
    }
  }
});

resetTimer();
closePositionModal();
renderPlayerGrid(); // 🔥 update UI
saveGame("active");
}

function endGame() {
  if (confirm("End game and view stats?")) {
    
    closePositionModal(); 
    showStatsPage();
    saveGame("completed");
  }
}



function closeStats() {
  document.getElementById("statsScreen").style.display = "none";
  document.getElementById("game").style.display = "block";
}


function exportCSV() {

  let rows = [];

  // 🔥 HEADERS
  rows.push([
    "Player",
    "Positions",
    "Points",
    "Goals1",
    "Goals2",
    "Miss",
    "Intercept",
    "Pickup",
    "Turnover",
    "Tip",
    "Rebound",
    "BadPass",
    "Dropped",
    "NetAbuse",
    "Contact",
    "Obstruction"
  ]);

  // 🔥 DATA
  Object.keys(playerStats).forEach(player => {
    let s = playerStats[player];

    let points = (s.goals1 * 1) + (s.goals2 * 2);

    rows.push([
      player,
      playerPositionsHistory[player]
        ? playerPositionsHistory[player].join("|")
        : "-",
      points,
      s.goals1,
      s.goals2,
      s.miss,
      s.intercept,
      s.pickup,
      s.turnover,
      s.tip,
      s.rebound,
      s.badPass,
      s.dropped,
      s.netAbuse,
      s.contact,
      s.obstruction
    ]);
  });

  // 🔥 CONVERT TO CSV
  let csvContent = rows.map(e => e.join(",")).join("\n");

  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  let teamA = document.getElementById("teamAName").innerText || "TeamA";
let teamB = document.getElementById("teamBName").innerText || "TeamB";

let dateObj = new Date();
let date = `${dateObj.getDate()}-${dateObj.getMonth()+1}-${dateObj.getFullYear()}`;

link.download = `${teamA}_vs_${teamB}_${date}.csv`;
  link.click();
}


function openNewGame() {

 quarterLineups = {
  1: {},
  2: {},
  3: {},
  4: {}
}; 
  
  createDraftGame();

  // hide screens
  document.getElementById("home").style.display = "none";
  document.getElementById("game").style.display = "none";
  document.getElementById("statsScreen").style.display = "none";

  // show setup
  document.getElementById("newGameScreen").style.display = "block";

  updateRoster();
}

// Greating Draft // 
function createDraftGame() {
  let games = JSON.parse(localStorage.getItem("games")) || [];

  // 🔥 check if a draft already exists
  let existingDraft = games.find(g => g.status === "draft");

  if (existingDraft) {
   games = games.filter(g => g.status !== "draft");
}

  // 🆕 create new draft
  let newGame = {
    id: Date.now(),
    teamA: "Untitled Game",
    teamB: "",
    scoreA: 0,
    scoreB: 0,
    lineup: {},
    players: [],
    stats: {},
    quarter: 1,
    status: "draft"
  };

  currentGameId = newGame.id;
  games.push(newGame);

  localStorage.setItem("games", JSON.stringify(games));
}

function isSetupEmpty() {
  const teamA = document.getElementById("teamA").value.trim();
  const teamB = document.getElementById("teamB").value.trim();

  const inputs = document.querySelectorAll("#rosterGrid input");

  let hasPlayer = false;

  inputs.forEach(input => {
    if (input.value.trim() !== "") {
      hasPlayer = true;
    }
  });

  return (!teamA || !teamB || !hasPlayer);
}

function renderEventLog() {
  let log = document.getElementById("log");
  if (!log) return;

  log.innerHTML = "";

  currentEvents.forEach(e => {
    let div = document.createElement("div");
    div.innerText = e.text;
    log.appendChild(div);
  });
}

function handleStatsBack() {

  let games = JSON.parse(localStorage.getItem("games")) || [];
  let g = games.find(x => x.id === currentGameId);

  if (g && g.status === "completed") {
    goHome();   // ✅ completed → home
  } else {
    // ✅ active → back to game
    document.getElementById("statsScreen").style.display = "none";
    document.getElementById("game").style.display = "block";
  }
}

setInterval(() => {
  if (document.getElementById("game").style.display === "block") {
    saveGame("active");
  }
}, 20000);

document.addEventListener("visibilitychange", () => {
  if (document.hidden &&
      document.getElementById("game").style.display === "block") {
    saveGame("active");
  }
});

function renamePlayer(oldName) {
  let newName = prompt("Edit player name:", oldName);

  if (!newName) return;

  newName = newName.trim();

  if (newName === "" || newName === oldName) return;

  if (players.includes(newName)) {
    alert("That name already exists.");
    return;
  }

  // players array
  players = players.map(p => p === oldName ? newName : p);

  // lineup
  Object.keys(lineup).forEach(pos => {
    if (lineup[pos] === oldName) lineup[pos] = newName;
  });

  // stats
  const reorderedStats = {};

Object.keys(playerStats).forEach(name => {
  if (name === oldName) {
    reorderedStats[newName] = playerStats[oldName];
  } else {
    reorderedStats[name] = playerStats[name];
  }
});

playerStats = reorderedStats;

  // position history
  const reorderedHistory = {};

Object.keys(playerPositionsHistory).forEach(name => {
  if (name === oldName) {
    reorderedHistory[newName] = playerPositionsHistory[oldName];
  } else {
    reorderedHistory[name] = playerPositionsHistory[name];
  }
});

playerPositionsHistory = reorderedHistory;

  // events log text
  currentEvents.forEach(e => {
    e.text = e.text.replaceAll(oldName, newName);
  });

  saveGame("active");
  renderPlayerGrid();
  showStatsPage();
}
