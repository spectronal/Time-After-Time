
let playerClicks = 0;

let upgrades = {
    'autoClicker': {
        id: 'autoClicker',
        name: 'Momentum',
        desc: 'Time moves on its own.',
        cost: 10,
        quantity: 0,
        multiplier: 1,
        category: 'auto',
    },
    'doubleClick': {
        id: 'doubleClick',
        name: 'Déjà vu',
        desc: 'Relive the same moment twice.',
        cost: 50,
        quantity: 0,
        multiplier: 2,
        category: 'click',
    },
    'clickBooster': {
        id: 'clickBooster',
        name: 'Sprint',
        desc: 'Rushing through every second.',
        cost: 100,
        quantity: 0,
        multiplier: 5,
        category: 'click',
    },
    'turboClick': {
        id: 'turboClick',
        name: 'Fleeting',
        desc: 'Gone before you notice.',
        cost: 250,
        quantity: 0,
        multiplier: 5,
        category: 'auto',
    },
};

let activeTab = 'all';

function returnMultiplier() {
    let totalMultiplier = 1;
    for (let key in upgrades) {
        const up = upgrades[key];
        if (up.quantity > 0 && up.category === 'click') {
            totalMultiplier += up.multiplier * up.quantity;
        }
    }
    return totalMultiplier;
}

function getAutoClicksPerSec() {
    let total = 0;
    for (let key in upgrades) {
        const up = upgrades[key];
        if (up.quantity > 0 && up.category === 'auto') {
            total += up.multiplier * up.quantity;
        }
    }
    return total;
}
