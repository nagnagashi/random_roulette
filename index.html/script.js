const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const itemInput = document.getElementById('itemInput');
const addButton = document.getElementById('addButton');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const clearAllButton = document.getElementById('clearAllButton');
const itemListEl = document.getElementById('itemList');
const historyListEl = document.getElementById('historyList');
const resultDisplay = document.getElementById('resultDisplay');

let items = [];
let angle = 0;
let isRotating = false;
let rotationSpeed = 0;
const colors = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B2E2F2', '#C7CEEA', '#F3D1F4'];

// ルーレットの描画
function drawRoulette() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (items.length === 0) {
        ctx.beginPath();
        ctx.arc(radius, radius, radius - 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillText('項目を追加してください', radius, radius);
        return;
    }

    const sliceAngle = (Math.PI * 2) / items.length;

    items.forEach((item, i) => {
        const startAngle = angle + i * sliceAngle;
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius - 10, startAngle, startAngle + sliceAngle);
        ctx.fill();
        ctx.stroke();

        // テキスト描画
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#555';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(item, radius - 30, 10);
        ctx.restore();
    });
}

// 項目の追加
addButton.onclick = () => {
    const text = itemInput.value.trim();
    if (text) {
        items.push(text);
        itemInput.value = '';
        updateUI();
    }
};

// UI更新
function updateUI() {
    drawRoulette();
    itemListEl.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${item} <button class="del-btn" onclick="removeItem(${index})">削除</button>`;
        itemListEl.appendChild(li);
    });
}

function removeItem(index) {
    items.splice(index, 1);
    updateUI();
}

clearAllButton.onclick = () => {
    items = [];
    updateUI();
};

// 回転ロジック
let animationFrame;
startButton.onclick = () => {
    if (items.length < 2) return alert('2項目以上追加してください');
    isRotating = true;
    rotationSpeed = 0.2;
    startButton.disabled = true;
    stopButton.disabled = false;
    resultDisplay.innerText = '';
    rotate();
};

function rotate() {
    angle += rotationSpeed;
    drawRoulette();
    if (isRotating || rotationSpeed > 0) {
        animationFrame = requestAnimationFrame(rotate);
    }
}

stopButton.onclick = () => {
    isRotating = false;
    stopButton.disabled = true;
    slowDown();
};

function slowDown() {
    // 5秒かけて減速
    const duration = 5000;
    const startSpeed = rotationSpeed;
    const startTime = performance.now();

    function animateSlow(now) {
        const elapsed = now - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            // 徐々に速度を落とす(イージング)
            rotationSpeed = startSpeed * (1 - progress);
            angle += rotationSpeed;
            drawRoulette();
            requestAnimationFrame(animateSlow);
        } else {
            rotationSpeed = 0;
            finishSelection();
        }
    }
    requestAnimationFrame(animateSlow);
}

function finishSelection() {
    const sliceAngle = (Math.PI * 2) / items.length;
    // 針(真上 270度 = 1.5PI)の位置にある項目を計算
    const normalizedAngle = (1.5 * Math.PI - angle) % (Math.PI * 2);
    const positiveAngle = normalizedAngle < 0 ? normalizedAngle + Math.PI * 2 : normalizedAngle;
    const selectedIndex = Math.floor(positiveAngle / sliceAngle);
    const winner = items[selectedIndex];

    // 結果表示
    resultDisplay.innerText = `決定👑${winner}！`;

    // クラッカー演出
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffb7b2', '#b2e2f2', '#b2f2bb']
    });

    // 履歴に追加
    const historyItem = document.createElement('li');
    historyItem.innerText = `${historyListEl.children.length + 1}. ${winner}`;
    historyListEl.appendChild(historyItem);

    // 項目から削除して更新
    setTimeout(() => {
        items.splice(selectedIndex, 1);
        updateUI();
        startButton.disabled = false;
    }, 2000);

    // 既存の変数宣言の場所に追加したコード
    const clearHistoryButton = document.getElementById('clearHistoryButton');

    // 履歴削除ボタンのクリックイベント
    clearHistoryButton.onclick = () => {
        if (confirm('履歴をすべて削除してもよろしいですか？')) {
            historyListEl.innerHTML = ''; // 画面上のリストを空にする
        }
    };

    // もし「すべてクリア」ボタンを押したときに履歴も同時に消したい場合は、
    // 既存の clearAllButton.onclick を以下のように書き換えてください。
    clearAllButton.onclick = () => {
        if (confirm('項目と履歴をすべてクリアしますか？')) {
            items = []; // ルーレット項目を空にする
            historyListEl.innerHTML = ''; // 履歴を空にする
            resultDisplay.innerText = ''; // 結果表示を消す
            updateUI();
        }
    };
}

// 初期描画
drawRoulette();