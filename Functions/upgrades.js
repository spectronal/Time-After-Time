const tabsContainer = document.getElementById('tabs');
const tabs = tabsContainer.querySelectorAll('.tab');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        renderUpgrades();
    });
});

const upgradeList = document.getElementById('upgrade-list');

function renderUpgrades() {
    upgradeList.innerHTML = '';

    for (let key in upgrades) {
        const up = upgrades[key];
        if (activeTab !== 'all' && up.category !== activeTab) continue;

        const card = document.createElement('div');
        card.className = 'upgrade-card' + (playerClicks < up.cost ? ' cant-afford' : '');

        const effectText = up.category === 'auto'
            ? `+${up.multiplier} click${up.multiplier > 1 ? 's' : ''}/sec`
            : `+${up.multiplier} click${up.multiplier > 1 ? 's' : ''}/tap`;

        card.innerHTML = `
            <div class="card-top">
                <span class="card-name">${up.name}</span>
                <span class="card-qty">${up.quantity}</span>
            </div>
            <div class="card-desc">${up.desc}</div>
            <div class="card-bottom">
                <span class="card-cost">${up.cost} clicks</span>
                <span class="card-effect">${effectText}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            if (playerClicks >= up.cost) {
                playerClicks -= up.cost;
                up.quantity++;
                up.cost = Math.floor(up.cost * 1.5);
                updateCounter();
                renderUpgrades();
            }
        });

        upgradeList.appendChild(card);
    }
}
