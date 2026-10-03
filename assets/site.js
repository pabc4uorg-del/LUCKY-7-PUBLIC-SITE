
const m=document.querySelector(".menu"), n=document.querySelector(".navlinks");
if(m&&n){m.addEventListener("click",()=>n.classList.toggle("open"))}
document.querySelectorAll(".navlinks a").forEach(a=>a.addEventListener("click",()=>n&&n.classList.remove("open")));
