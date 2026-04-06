loadData();

const button = document.getElementById('btn');
const counter = document.getElementById('counter');
const saveBtn = document.getElementById('saveBtn');
const mainArea = document.querySelector('.main');

function updateCounter() {
    counter.textContent = formatNumber(Math.floor(playerClicks));
    renderUpgrades();
}

function formatNumber(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

button.addEventListener('click', (e) => {
    const multiplier = returnMultiplier();
    playerClicks += multiplier;
    updateCounter();

    counter.classList.add('bump');
    setTimeout(() => counter.classList.remove('bump'), 80);

    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - 10) + 'px';
    ripple.style.top = (e.clientY - 10) + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

setInterval(() => {
    const auto = getAutoClicksPerSec();
    if (auto > 0) {
        playerClicks += auto / 4;
        updateCounter();
    }
}, 250);

saveBtn.addEventListener('click', () => saveData());

setInterval(() => saveData(), 30000);

updateCounter();
