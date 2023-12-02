const toggleTheme = document.getElementById("toggleThemeButton")

const meta = document.querySelector('meta[name="color-scheme"]');
const root = document.querySelector(":root");
let currentColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';

toggleTheme.addEventListener("click", () => {
    currentColorScheme = currentColorScheme === 'light' ? 'dark' : 'light';
    meta.content = currentColorScheme;
    changeTheme();
})

function changeTheme() {
    root.classList.toggle("dark", currentColorScheme === 'dark');
    root.classList.toggle("light", currentColorScheme === 'light');
}