const toggleSwitch = document.querySelector('#darkModeSelector');
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#pitchShadow').setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('#pitchShadow').setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}
toggleSwitch.addEventListener('change', switchTheme, false);
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.querySelector('#pitchShadow').setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}
