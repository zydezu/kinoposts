const page = document.getElementById("page");
let baselink = ""

function loadPage(link = document.getElementById("URLInput").value) {
    fetchWebpage(link)
}

fetchWebpage("https://zydezu.github.io/sitemap.html")
function fetchWebpage(link) {
    baselink = link.substring(0, link.lastIndexOf('/')) + "/";
    console.log(baselink)
    fetch(link)
        .then((response) => response.text())
        .then((data) => renderPage(data)); // javascript fetching protocol
}

function renderPage(data) {
    data = data.replace(/<a[^>]*href="(.*?)">/g, `<button onclick='loadPage("${baselink}$1")'>Link</button>`)
    data = data.replace(/(?<=(href|src|data-playlist)=")[^"]*/gm, `${baselink}$&`);

    page.innerHTML = `${data}`
}