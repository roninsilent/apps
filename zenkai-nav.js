/* ------------------------------------------------------------------
   zenkai-nav.js — la barra de dalt, a totes les pàgines.

   Va a part de zenkai.js perquè el porta també la portada i les eines que
   no entren amb Google: carregar tota la maquinària de la sessió per pintar
   un menú no tindria sentit.
   ------------------------------------------------------------------ */

/* ---------------- el saltador d'eines ----------------
   Les eines són pàgines separades, però fer-les servir no ho ha de semblar.
   Això substitueix el "‹ Menú" de la capçalera per la llista sencera, amb la
   que tens oberta marcada. La portada segueix sent-hi, la primera de tot. */
var ZEINES = [
  ["index.html",       "Menú",          "la portada"],
  ["inventari.html",   "Inventari",     "filament"],
  ["pressupost.html",  "Pressupost",    "què costa"],
  ["impressions.html", "Impressions",   "registre"],
  ["collabs.html",     "Col·laboracions", "marques"],
  ["instagram.html",   "Estadístiques", "xarxes"]
];
(function(){
  var bar = document.querySelector(".brandbar");
  if(!bar) return;
  var aqui = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if(!aqui) aqui = "index.html";

  var jo = null;
  ZEINES.forEach(function(e){ if(e[0].toLowerCase()===aqui) jo=e; });

  var caixa = document.createElement("div");
  caixa.className = "toolpick";
  var bo = document.createElement("button");
  bo.type = "button";
  bo.setAttribute("aria-expanded","false");
  bo.setAttribute("aria-haspopup","true");
  bo.innerHTML = (jo && jo[0]!=="index.html" ? jo[1] : "Eines") + ' <span class="ca">▼</span>';
  var menu = document.createElement("div");
  menu.className = "toolmenu";
  menu.hidden = true;
  menu.innerHTML = ZEINES.map(function(e,i){
    var cur = e[0].toLowerCase()===aqui;
    return (i===1 ? '<hr>' : '') +
      '<a href="'+e[0]+'"'+(cur?' aria-current="page"':'')+'>'+e[1]+
      '<small>'+e[2]+'</small></a>';
  }).join("");
  caixa.appendChild(bo); caixa.appendChild(menu);

  /* on hi havia el "‹ Menú", i si no, al final de la capçalera */
  var vell = bar.querySelector(".backlink");
  if(vell) bar.replaceChild(caixa, vell);
  else bar.appendChild(caixa);

  function tanca(){ menu.hidden=true; bo.setAttribute("aria-expanded","false"); }
  bo.onclick = function(ev){
    ev.stopPropagation();
    var obrint = menu.hidden;
    menu.hidden = !obrint;
    bo.setAttribute("aria-expanded", String(obrint));
  };
  document.addEventListener("click", function(ev){
    if(!caixa.contains(ev.target)) tanca();
  });
  document.addEventListener("keydown", function(ev){
    if(ev.key==="Escape") tanca();
  });
})();

/* ---------------- efectes d'entrada ----------------
   Les targetes entren desenfocades, una darrere l'altra, quan s'obre la pàgina o
   arriben les dades. Si l'efecte sortís també quan escrius al cercador o canvies un
   filtre, cada tecla faria parpellejar la llista: per això només s'anima durant els
   primers segons després d'obrir o d'entrar, i mai just després d'un clic o una tecla. */
(function(){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  if(!("IntersectionObserver" in window) || !("MutationObserver" in window)) return;
  var SEL = ".card,.stat,.reel,.rec";
  var obert = performance.now(), ultimaAccio = -1e9, lotT = 0, lotN = 0;
  ["keydown","input","pointerdown"].forEach(function(n){
    document.addEventListener(n, function(){ ultimaAccio = performance.now(); }, true);
  });
  var io = new IntersectionObserver(function(en){
    en.forEach(function(x){
      if(!x.isIntersecting) return;
      var e = x.target; io.unobserve(e);
      e.classList.remove("zfx-pre"); e.classList.add("zfx-in");
      setTimeout(function(){ e.classList.remove("zfx-in"); }, 1500);
    });
  }, {threshold:.08});
  function prepara(n){
    if(n.nodeType !== 1) return;
    var l = [];
    if(n.matches && n.matches(SEL)) l.push(n);
    if(n.querySelectorAll) Array.prototype.push.apply(l, n.querySelectorAll(SEL));
    l.forEach(function(e){
      if(e.__zfx) return; e.__zfx = 1;
      var ara = performance.now();
      if(ara - obert > 4000 || ara - ultimaAccio < 800) return;
      if(ara - lotT > 200) lotN = 0;
      lotT = ara;
      e.style.setProperty("--zi", Math.min(lotN++, 8));
      e.classList.add("zfx-pre");
      io.observe(e);
      /* per si una targeta queda amagada molt de temps: que no es quedi invisible */
      setTimeout(function(){ e.classList.remove("zfx-pre"); }, 8000);
    });
  }
  function engega(){
    prepara(document.body);
    new MutationObserver(function(ms){
      ms.forEach(function(m){ Array.prototype.forEach.call(m.addedNodes, prepara); });
    }).observe(document.body, {childList:true, subtree:true});
    var g = document.getElementById("gate");
    if(g) new MutationObserver(function(){ if(g.hidden) obert = performance.now(); })
      .observe(g, {attributes:true, attributeFilter:["hidden"]});
  }
  if(document.body) engega(); else document.addEventListener("DOMContentLoaded", engega);
})();
