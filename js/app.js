const CL_KEY = "caseleague_v3_7";
const flags = { England:"🏴", France:"🇫🇷", Argentina:"🇦🇷", Brazil:"🇧🇷", Portugal:"🇵🇹", Germany:"🇩🇪", Spain:"🇪🇸", Morocco:"🇲🇦", Ghana:"🇬🇭", Scotland:"🏴", Netherlands:"🇳🇱", USA:"🇺🇸", Japan:"🇯🇵", Nigeria:"🇳🇬", Senegal:"🇸🇳", Croatia:"🇭🇷", Italy:"🇮🇹", Mexico:"🇲🇽", Canada:"🇨🇦" };
const countries = Object.keys(flags);
const rarityOrder = { common:1, silver:2, gold:3, diamond:4 };
const rarityValue = { common:[18,55], silver:[65,260], gold:[330,1600], diamond:[2500,9000] };
const players = [
  ["K. Mbappe","France","gold","ST",96,42,88,96], ["L. Messi","Argentina","diamond","RW",92,36,114,120],
  ["J. Bellingham","England","gold","CM",88,82,93,86], ["B. Saka","England","silver","RW",84,58,78,89],
  ["P. Foden","England","silver","CAM",82,52,77,91], ["H. Kane","England","gold","ST",92,55,101,78],
  ["V. Junior","Brazil","gold","LW",90,40,78,103], ["R. Leao","Portugal","silver","LW",84,45,72,94],
  ["C. Ronaldo","Portugal","gold","ST",90,38,122,88], ["J. Musiala","Germany","gold","CAM",86,54,80,98],
  ["A. Hakimi","Morocco","silver","RB",77,84,82,79], ["A. Griezmann","France","gold","CF",86,66,108,90],
  ["S. McTominay","Scotland","common","CM",70,74,75,58], ["M. Kudus","Ghana","silver","AM",80,56,70,88],
  ["T. Kroos","Germany","gold","CM",76,74,130,82], ["F. Valverde","Uruguay","silver","CM",78,82,84,76],
  ["R. Lewandowski","Poland","gold","ST",91,42,118,75], ["D. Dumfries","Netherlands","common","RB",65,78,70,60],
  ["C. Pulisic","USA","silver","LW",78,48,76,84], ["K. Mitoma","Japan","silver","LW",79,51,72,90],
  ["V. Osimhen","Nigeria","gold","ST",91,51,75,84], ["S. Mane","Senegal","gold","LW",88,53,105,91],
  ["L. Modric","Croatia","diamond","CM",80,75,145,98], ["R. Jimenez","Mexico","common","ST",72,45,82,64],
  ["J. David","Canada","silver","ST",82,42,72,77], ["Pedri","Spain","gold","CM",77,66,82,100]
];
const tactics = {
  balanced:{name:"Balanced", atk:1, def:1, flr:1, risk:1, desc:"Stable, flexible football."},
  counter:{name:"Counter Attack", atk:1.08, def:.96, flr:1.1, risk:1.1, desc:"Absorb pressure then break quickly."},
  shoot:{name:"Shoot On Sight", atk:1.14, def:.9, flr:1.18, risk:1.25, desc:"More shots, more chaos."},
  deep:{name:"Deep Defence", atk:.83, def:1.2, flr:.94, risk:.84, desc:"Compact defending with fewer attacks."},
  possession:{name:"Possession", atk:.96, def:1.06, flr:1.04, risk:.88, desc:"Control the ball and reduce mistakes."},
  allout:{name:"All Out Attack", atk:1.28, def:.72, flr:1.16, risk:1.38, desc:"High danger both ways."},
  bus:{name:"Park The Bus", atk:.7, def:1.35, flr:.82, risk:.75, desc:"Protect the clean sheet."}
};
const baseState = () => ({
  username:"", flag:"🇬🇧", lld:500, starterPacks:3, standardPacks:0, rarePacks:0, inventory:[], market:[], listings:[], matchHistory:[], defaultTactic:"balanced",
  quick:{division:10, points:0, played:0, wins:0, draws:0, losses:0, gf:0, ga:0},
  normal:makeNormalLeague(), createdAt:Date.now()
});
function load(){ try{return JSON.parse(localStorage.getItem(CL_KEY)) || baseState()}catch(e){return baseState()} }
let State = load();
function save(){ localStorage.setItem(CL_KEY, JSON.stringify(State)); refreshHud(); }
function resetDemo(){ localStorage.removeItem(CL_KEY); State = baseState(); location.href='index.html'; }
function money(n){ return Math.round(n).toLocaleString()+" LLD"; }
function uid(prefix="id"){ return prefix+"_"+Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function toast(msg,type=""){ let wrap=document.querySelector('.toast-wrap'); if(!wrap){wrap=document.createElement('div');wrap.className='toast-wrap';document.body.appendChild(wrap)} const el=document.createElement('div'); el.className='toast '+type; el.textContent=msg; wrap.appendChild(el); setTimeout(()=>el.remove(),3500); }
function nav(active=""){
  return `<div class="topbar"><div class="wrap nav-inner"><a class="brand" href="hub.html"><span class="crest">CL</span><span>Case League</span></a><div class="links">${[
    ['hub.html','Hub','hub'],['store.html','Store','store'],['open.html','Open','open'],['inventory.html','Inventory','inventory'],['quickplay.html','Quick Play','quickplay'],['normal.html','Normal League','normal'],['marketplace.html','Marketplace','marketplace'],['profiles.html','Profiles','profiles'],['settings.html','Settings','settings'],['odds.html','Odds','odds']
  ].map(x=>`<a class="${active===x[2]?'active':''}" href="${x[0]}">${x[1]}</a>`).join('')}</div><div class="wallet"><span class="chip">${State.flag||'🇬🇧'} ${State.username||'Guest'}</span><span class="chip" id="hud-lld">◈ ${money(State.lld||0)}</span><span class="chip" id="hud-packs">Starter ${State.starterPacks||0} · Std ${State.standardPacks||0} · Rare ${State.rarePacks||0}</span></div></div></div>`;
}
function refreshHud(){ const l=document.getElementById('hud-lld'); if(l)l.textContent='◈ '+money(State.lld||0); const p=document.getElementById('hud-packs'); if(p)p.textContent=`Starter ${State.starterPacks||0} · Std ${State.standardPacks||0} · Rare ${State.rarePacks||0}`; }
function guard(){ if(!State.username && !location.pathname.endsWith('index.html') && !location.pathname.endsWith('/')) location.href='index.html'; }
function ensureStarter(){ if(!State.inventory) State.inventory=[]; if(!State.market) State.market=[]; if(!State.matchHistory) State.matchHistory=[]; if(!State.normal) State.normal=makeNormalLeague(); }
function genCard(rarity=null, tradeable=true){
  let pool = players.filter(p=>!rarity || p[2]===rarity); if(!pool.length) pool=players;
  const p = pick(pool), valueRange = rarityValue[p[2]] || [20,80];
  return { id:uid('card'), name:p[0], country:p[1], flag:flags[p[1]]||'🏳️', rarity:p[2], position:p[3], attack:jitter(p[4]), defence:jitter(p[5]), experience:jitter(p[6]), flair:jitter(p[7]), confidence:50, tradeable, locked:false, loanUntil:0, injured:false, suspended:false, stats:{matches:0,goals:0,assists:0,tackles:0,saves:0,cleanSheets:0,wins:0,draws:0,losses:0,mvp:0}, value:rand(valueRange[0], valueRange[1]), acquiredAt:Date.now() };
}
function jitter(v){ return Math.max(20, Math.min(140, v + rand(-6,7))); }
function genRecovery(tradeable=true){ return {id:uid('item'), type:'recovery', name:'Injury Recovery Card', country:'Medical', flag:'🩺', rarity:'silver', tradeable, value:120, acquiredAt:Date.now()}; }
function rollRarity(kind){ const r=Math.random()*100; if(kind==='rare'){ if(r<45)return'common'; if(r<83)return'silver'; if(r<97)return'gold'; return'diamond'; } if(r<70)return'common'; if(r<92)return'silver'; if(r<99)return'gold'; return'diamond'; }
function openPack(kind='standard', tradeable=true){
  const out=[]; const guaranteed = kind==='rare' ? ['common','common','silver','silver',null,null] : ['common','common','common','silver',null,null];
  guaranteed.forEach((g,i)=>{ if(Math.random()<0.08 && i>2) out.push(genRecovery(tradeable)); else out.push(genCard(g || rollRarity(kind), tradeable)); });
  return out;
}
function cardHTML(c, opts={}){
  if(c.type==='recovery') return `<div class="player-card rarity-silver ${opts.select?'selectable':''}" data-id="${c.id}"><div class="player-top"><div><div class="pname">${c.name}</div><div class="pcountry">Consumable · Removes injury or suspension</div></div><div class="flag">🩺</div></div><div class="status-row"><span class="tag">Silver</span><span class="tag ${c.tradeable?'good':'lock'}">${c.tradeable?'Tradeable':'Untradeable'}</span></div>${opts.actions||''}</div>`;
  const unavailable = isUnavailable(c);
  return `<div class="player-card rarity-${c.rarity} ${opts.select?'selectable':''} ${unavailable?'dimmed':''}" data-id="${c.id}">
    <div class="player-top"><div><div class="pname">${c.name}</div><div class="pcountry">${c.flag} ${c.country} · ${c.position}</div></div><span class="badge">${c.rarity.toUpperCase()}</span></div>
    <div class="stats-mini"><div class="mini"><b>${c.attack}</b><span>Attack</span></div><div class="mini"><b>${c.defence}</b><span>Defence</span></div><div class="mini"><b>${c.experience}</b><span>Experience</span></div><div class="mini"><b>${c.flair}</b><span>Flair</span></div></div>
    <div class="status-row"><span class="tag">Confidence ${c.confidence}</span><span class="tag ${c.tradeable?'good':'lock'}">${c.tradeable?'Tradeable':'Untradeable'}</span>${c.loanUntil>Date.now()?`<span class="tag lock">On loan ${timeLeft(c.loanUntil)}</span>`:''}${c.injured?'<span class="tag lock">Injured</span>':''}${c.suspended?'<span class="tag lock">Suspended</span>':''}</div>
    ${opts.actions||''}
  </div>`;
}
function isUnavailable(c){ return c.type==='recovery' || c.loanUntil>Date.now() || c.injured || c.suspended; }
function timeLeft(ts){ const m=Math.max(0,Math.ceil((ts-Date.now())/60000)); if(m>60)return Math.ceil(m/60)+'h'; return m+'m'; }
function eligibleCards(){ return State.inventory.filter(c=>c.type!=='recovery' && !isUnavailable(c)); }
function teamPower(cards,tacticKey){ const t=tactics[tacticKey]||tactics.balanced; let atk=0,def=0,exp=0,flr=0,conf=0; cards.forEach(c=>{ const confMod = 1 + ((c.confidence-50)/300); atk += c.attack*t.atk; def += c.defence*t.def; exp += c.experience; flr += c.flair*t.flr*confMod; conf += c.confidence; }); return {attack:atk, defence:def, experience:exp, flair:flr, confidence:conf, total:atk+def+exp+flr, tactic:t}; }
function makeBot(userCards){ const avg = userCards.length? Math.round(userCards.reduce((a,c)=>a+c.attack+c.defence+c.experience+c.flair,0)/(userCards.length*4)) : 75; return [1,2,3].map(()=>{ let c=genCard(pick(['common','silver','gold']), false); ['attack','defence','experience','flair'].forEach(k=>c[k]=Math.max(45, Math.min(125, avg+rand(-14,10)))); c.confidence=rand(38,82); return c; }); }
function simulateMatch(userCards, botCards, tacticKey, botTacticKey){
  const up=teamPower(userCards,tacticKey), bp=teamPower(botCards,botTacticKey); const events=[]; let us=0, them=0;
  const userStats = {}; userCards.forEach(c=>userStats[c.id]={goals:0,assists:0,tackles:rand(0,3)});
  for(let minute=5; minute<=90; minute+=rand(5,9)){
    const userChance=(up.attack*1.18+up.flair*.8+up.experience*.36)/(bp.defence+bp.experience*.45+260);
    const botChance=(bp.attack*1.15+bp.flair*.78+bp.experience*.34)/(up.defence+up.experience*.45+260);
    if(Math.random()<Math.min(.36,userChance*.32)){ us++; const scorer=pick(userCards), assister=pick(userCards.filter(x=>x.id!==scorer.id))||scorer; userStats[scorer.id].goals++; userStats[assister.id].assists=(userStats[assister.id].assists||0)+1; events.push({minute,type:'goal',side:'user',text:`${minute}' GOAL! ${scorer.name} finishes after ${assister.name} creates space.`}); }
    else if(Math.random()<Math.min(.32,botChance*.28)){ them++; const scorer=pick(botCards); events.push({minute,type:'goal',side:'bot',text:`${minute}' Bot goal. ${scorer.name} punishes the space.`}); }
    else { const lines=[`${minute}' ${pick(userCards).name} presses hard and wins a tackle.`,`${minute}' ${tactics[tacticKey].name} shape is holding well.`,`${minute}' The AI goalkeeper reacts sharply.`,`${minute}' ${pick(userCards).name} attempts a flair run.`]; events.push({minute,type:'note',side:'neutral',text:pick(lines)}); }
  }
  if(events.length<8) events.push({minute:90,type:'note',side:'neutral',text:"90' Final whistle is close. Both sides are fighting for the result."});
  const result = us>them?'win':us===them?'draw':'loss';
  const reward = result==='win' ? 100+us+(them===0?1:0) : result==='draw' ? 25+us : 0;
  return {us,them,events,result,reward,userStats,up,bp,botTacticKey};
}
function applyMatch(result,userCards){
  State.lld += result.reward; State.quick.played++; State.quick.gf += result.us; State.quick.ga += result.them;
  if(result.result==='win'){State.quick.wins++;State.quick.points+=3}else if(result.result==='draw'){State.quick.draws++;State.quick.points+=1}else{State.quick.losses++}
  userCards.forEach(c=>{ const s=result.userStats[c.id]||{}; c.stats.matches++; c.stats.goals+=(s.goals||0); c.stats.assists+=(s.assists||0); c.stats.tackles+=(s.tackles||0); if(result.them===0)c.stats.cleanSheets++; c.stats[result.result==='win'?'wins':result.result==='draw'?'draws':'losses']++; const streakBonus = result.result==='win' ? 2 + Math.min(16, State.quick.wins*1.5) : result.result==='loss' ? -rand(2,8) : rand(-1,2); c.confidence = Math.max(1, Math.min(200, Math.round(c.confidence + streakBonus + (s.goals||0)*2 + (s.assists||0)))); if(Math.random()<.045 && result.result!=='win') c.injured=true; if(Math.random()<.03) c.suspended=true; });
  State.matchHistory.unshift({id:uid('match'),date:Date.now(),mode:'Quick Play',score:`${result.us}-${result.them}`,result:result.result,reward:result.reward,tactic:result.up.tactic.name,players:userCards.map(c=>c.name),events:result.events.slice(0,10)});
  save();
}
function makeNormalLeague(){
  const names=['AtlasFox','NileKing','UrbanLion','GoldTempo','SouthAce','NovaPress','BlueFlair','FinalWhistle','IronWing','CrownPass','MetroNine','RapidBlock','VelvetBoot','CleanSheet','DriftGoal','PeakForm'];
  const teams=names.map((n,i)=>({nickname:n,flag:pick(Object.values(flags)),played:rand(4,12),wins:rand(1,7),draws:rand(0,4),losses:rand(0,5),gf:rand(6,24),ga:rand(5,22)}));
  teams.forEach(t=>{t.points=t.wins*3+t.draws;t.gd=t.gf-t.ga});
  const fixtures=[]; for(let d=1; d<=30; d+=3){fixtures.push({day:d, opponent:pick(names), flag:pick(Object.values(flags)), status:d<9?'done':'upcoming', result:d<9?pick(['W 2-1','D 1-1','L 0-1']):'', importance:d>24?'Promotion race':'League fixture'});}
  return {seasonDay:12, league:'Standard League 2', teams, fixtures, notes:'30 day season, 2 day reschedule window, new season on day 33.'};
}
function standingsRows(){ const me={nickname:State.username||'You',flag:State.flag||'🇬🇧',played:State.quick.played,wins:State.quick.wins,draws:State.quick.draws,losses:State.quick.losses,gf:State.quick.gf,ga:State.quick.ga,points:State.quick.points,gd:State.quick.gf-State.quick.ga}; const all=[me,...State.normal.teams].sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf); return all.map((t,i)=>`<tr><td>${i+1}</td><td>${t.flag} ${t.nickname}</td><td>${t.played}</td><td>${t.wins}</td><td>${t.draws}</td><td>${t.losses}</td><td>${t.gf}</td><td>${t.ga}</td><td>${t.gd}</td><td><b>${t.points}</b></td></tr>`).join(''); }
function buyPack(kind,currency){ const price = kind==='rare'?250:170; if(currency==='lld'){ if(State.lld<price){toast('Not enough LLD','bad');return} State.lld-=price; if(kind==='rare')State.rarePacks++; else State.standardPacks++; save(); toast(`${kind==='rare'?'Rare':'Standard'} pack bought with LLD`,'good'); } else { if(kind==='rare')State.rarePacks++; else State.standardPacks++; save(); toast('Demo GBP purchase simulated. Pack added.','good'); } }
function listCard(id, price){ const c=State.inventory.find(x=>x.id===id); if(!c || !c.tradeable || isUnavailable(c)){toast('This item cannot be listed','bad');return} price=Math.max(1,parseInt(price||c.value,10)); State.listings.push({id:uid('listing'),card:c,price,seller:State.username,date:Date.now()}); State.inventory=State.inventory.filter(x=>x.id!==id); save(); toast('Listed on marketplace','good'); }
function buyListing(id){ const l=State.listings.find(x=>x.id===id); if(!l)return; if(State.lld<l.price){toast('Not enough LLD','bad');return} State.lld-=l.price; const admin=Math.round(l.price*.2); const card=l.card; card.id=uid('card'); State.inventory.push(card); State.listings=State.listings.filter(x=>x.id!==id); save(); toast(`Purchased. Admin tax ${admin} LLD`,'good'); }
function sendLoan(id){ const active=State.inventory.filter(c=>c.loanUntil>Date.now()).length; const c=State.inventory.find(x=>x.id===id); if(!c || c.type==='recovery' || active>=5 || c.loanUntil>Date.now()){toast('Loan unavailable','bad');return} c.loanUntil=Date.now()+12*60*60*1000; const reward={common:1,silver:rand(2,3),gold:rand(4,5),diamond:rand(6,7)}[c.rarity]||1; State.lld+=reward; save(); toast(`${c.name} loaned for 12h. +${reward} LLD`,'good'); }
function useRecovery(targetId){ const item=State.inventory.find(x=>x.type==='recovery'); const c=State.inventory.find(x=>x.id===targetId); if(!item){toast('No recovery card available','bad');return} if(!c || (!c.injured && !c.suspended)){toast('That player does not need recovery','bad');return} c.injured=false;c.suspended=false; State.inventory=State.inventory.filter(x=>x.id!==item.id); save(); toast(`${c.name} recovered`,'good'); }
function publicProfiles(){ return [{nickname:State.username||'You',flag:State.flag||'🇬🇧',league:State.normal.league,record:`${State.quick.wins}W ${State.quick.draws}D ${State.quick.losses}L`,inventory:State.inventory.length}, ...State.normal.teams.slice(0,12).map(t=>({nickname:t.nickname,flag:t.flag,league:pick(['Pro Standard League','Standard League 1','Standard League 2']),record:`${t.wins}W ${t.draws}D ${t.losses}L`,inventory:rand(18,140)}))]; }
ensureStarter(); save();
