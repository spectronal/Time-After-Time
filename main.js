let clicks = 0;

const button = document.getElementById('btn');
const counter = document.getElementById('counter');

button.addEventListener('click', () => {
    clicks++;
    counter.textContent = `Button clicked ${clicks} times`;
});

