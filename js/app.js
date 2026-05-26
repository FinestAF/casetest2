
const state = JSON.parse(localStorage.getItem('caseleague')) || {username:'',lld:500,packs:3,inventory:[]};

const pool = [
['K. Mbappe','France','gold'],
['L. Messi','Argentina','diamond'],
['J. Bellingham','England','gold'],
['B. Saka','England','silver'],
['P. Foden','England','silver'],
['S. McTominay','Scotland','common']
];

function save(){localStorage.setItem('caseleague',JSON.stringify(state));}

function nav(){
return `<div class="topbar"><div>Case League</div><div><a href="hub.html">Hub</a> | <a href="open.html">Open</a> | <a href="inventory.html">Inventory</a> | <a href="quickplay.html">Quick Play</a></div><div>LLD ${state.lld} | Packs ${state.packs}</div></div>`;
}

function genPlayer(){
const p=pool[Math.floor(Math.random()*pool.length)];
return {
name:p[0],
country:p[1],
rarity:p[2],
attack:Math.floor(Math.random()*40)+60,
defence:Math.floor(Math.random()*40)+60,
experience:Math.floor(Math.random()*40)+60,
flair:Math.floor(Math.random()*40)+60,
confidence:50
};
}
