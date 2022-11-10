const currentPath = window.location.href;
const nav = document.querySelectorAll('nav a');

nav.forEach(link => {
    if(currentPath.match(link.getAttribute("href"))){
        link.classList.add("active")
    }
})