
function saveData() {
    const data = {
        clicks: playerClicks,
        upgrades: upgrades
    };
    localStorage.setItem('timeAfterTime', JSON.stringify(data));
    showToast('Saved, but it still slips away...');
}

function loadData() {
    const raw = localStorage.getItem('timeAfterTime');
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        playerClicks = data.clicks || 0;
        if (data.upgrades) {
            for (let key in data.upgrades) {
                if (upgrades[key]) {
                    upgrades[key].cost = data.upgrades[key].cost;
                    upgrades[key].quantity = data.upgrades[key].quantity;
                }
            }
        }
    } catch (e) {
        console.warn('Failed to load save data');
    }
}
