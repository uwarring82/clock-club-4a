"use strict";
const main=document.querySelector("main");
const $=id=>document.getElementById(id);
const levels=["Volle Stunden","Halb & Viertel","Fünf-Minuten-Schritte"];
const modes={
  read:{name:"Uhr ablesen",q:"Wie spät ist es?",instruction:"Schau auf die Uhr und wähle den richtigen Satz."},
  set:{name:"Zeiger zeichnen",q:"Stell die Uhr!",instruction:"Zieh die Zeigerspitzen mit dem Finger zur passenden Zahl. Du kannst auch Stunde oder Minute wählen und auf eine Zahl tippen."},
  hear:{name:"Uhrzeit hören",q:"Welche Zeit hörst du?",instruction:"Hör dir den Satz an und wähle die passende Uhrzeit."}
};
const key="clock-club-stars-v1";
function getScores(){
  const clean={read:[0,0,0],set:[0,0,0],hear:[0,0,0]};
  try {const raw=JSON.parse(localStorage.getItem(key));for(const k of kinds)clean[k]=clean[k].map((_,i)=>count(raw?.[k]?.[i]));}catch{}
  return clean;
}
const data=loadLearning();
const state={page:"eingang",mode:data.last?.mode||"read",level:data.last?.level||0,scores:getScores(),storage:true};
let guide, workshopHand="hour", audioText="";
const practice=()=>["spielplatz","hoerhoehle","raetselraum"].includes(state.page);
const puzzle=()=>state.page==="raetselraum";
const roundKey=()=>state.mode+state.level;
function newRound(first=false){
  return data.rounds[roundKey()]=makeRound(state.mode,state.level,data.history,first);
}
function round(){return data.rounds[roundKey()]||newRound(state.mode==="read"&&state.level===0);}
function current(){const r=round();return r.items[r.idx];}
function save(){
  if(Object.hasOwn(roomNames,state.page))data.last={page:state.page,mode:state.mode,level:state.level};
  try{localStorage.setItem(learningKey,JSON.stringify(data));}catch{state.storage=false;}
}
function saveStars(){try{localStorage.setItem(key,JSON.stringify(state.scores));}catch{state.storage=false;}}
function scoreTotal(){return Object.values(state.scores).flat().reduce((a,b)=>a+b,0);}
function say(text){$("announcer").textContent=text;}
function showAudioText(t){audioText="Ton nicht verfügbar. Zum Mitlesen: "+words(t);$("audioNotice").textContent=audioText;$("audioNotice").hidden=false;}
function clearAudio(){stopAudio();audioText="";$("audioNotice").hidden=true;}
function btn(action,label,cls="secondary"){return '<button class="'+cls+'" data-action="'+action+'">'+label+'</button>';}
function roomLink(page,label,cls="secondary"){return '<a class="'+cls+'" href="#'+page+'">'+label+'</a>';}
function audioButtons(label="Anhören",slow=true){
  return '<div class="audio-actions">'+btn("listen",icon("sound")+label,"secondary listen")+
    (slow?btn("slow",'<span aria-hidden="true">🐌</span> Langsam',"secondary slow"):"")+'</div>';
}
function hero(title,sub,levelControl=false){
  return '<section class="hero"><div><div class="eyebrow hero-label">'+icon("cap")+' ENGLISCH · KLASSE 4A</div><h1>'+title+'</h1><p>'+sub+'</p></div>'+
    (levelControl?'<div class="level-picker">'+icon("levels")+'<select id="level" aria-label="Übungsstufe">'+levels.map((l,i)=>'<option value="'+i+'" '+(i===state.level?'selected':'')+'>Stufe '+(i+1)+' · '+l+'</option>').join("")+'</select>'+icon("down")+'</div>':'')+'</section>';
}
const welcomeParagraphs = [
  "Welcome to the Clock Club! Come and try the clock workshop. Let’s make half past three. Put your finger on the tip of the short hand and drag it to three. Now drag the long hand to six. Lift your finger and listen. It’s half past three! Can you say it too?",
  "Ready for a game? Sometimes you’ll hear a time and choose the matching time. Sometimes you’ll move the hands yourself, then check your answer. If the hands are close together, choose hour or minute and tap the number you want. You can use the plus and minus buttons, too.",
  "You can play on your own, or take turns with a friend, a parent, or your teacher. One of you says a time. Can the other one make it on the clock?"
];
function entrance(){
  return '<section class="welcome"><div class="welcome-copy"><div class="eyebrow">'+icon("cap")+' ENGLISCH · KLASSE 4A</div><h1 lang="en">Welcome to <br>Clock Club<span>!</span></h1><p>Wie spät ist es auf Englisch? Öffne die Tür und probiere es aus.</p><div class="entry-actions">'+
    roomLink(data.last?.page||"raetselraum",icon("game")+"Direkt spielen","primary")+roomLink("ankommen","Hilf mir beim Einstieg")+roomLink("werkstatt","Zur Uhrenwerkstatt")+btn("welcome",icon("sound")+" Begrüßung anhören")+
    '</div><details><summary>Begrüßung mitlesen</summary><div lang="en">'+welcomeParagraphs.map(line=>'<p>'+line+'</p>').join("")+'</div></details></div><div class="house-art"><img src="assets/clubhouse.svg" alt="Das Clubhaus mit einer Uhr über der offenen Tür"></div></section>';
}
const roomIcons={werkstatt:"clock",hoerhoehle:"headphones",sprechbuehne:"sound",raetselraum:"game"};
function roomOverview(){
  return hero("Deine Lernräume","Welche Tür möchtest du heute öffnen?")+'<div class="room-grid">'+Object.entries(roomDescriptions).map(([id,description])=>
    '<a class="room-tile '+id+'" href="#'+id+'"><span class="door-icon">'+icon(roomIcons[id])+'</span><div><h2>'+roomNames[id]+'</h2><p>'+description+'</p></div></a>').join("")+'</div>'+
    roomLink("ankommen","Hilf mir beim Einstieg","secondary back");
}
function panel(time,{hidden=false,editable=false,tip=false,minutes=false,title="Lernuhr"}={}){
  return '<section class="clock-panel" aria-label="Analoge Lernuhr"><div class="panel-tools"><span class="clock-chip">'+icon("clock")+title+'</span>'+
    (tip?btn("tip",icon("bulb")+' Tipp',"tip-btn"):"")+'</div><div class="art-wrap">'+clockArt(time,hidden,editable,minutes)+'</div>'+
    (hidden?'':'<div class="legend"><span><b class="dot hour"></b>Stundenzeiger</span><span><b class="dot minute"></b>Minutenzeiger</span></div>')+
    (minutes?'<div class="minute-aid" aria-label="Minutenhilfe">3 = 15 min · 6 = 30 min · 9 = 45 min</div>':'')+'</section>';
}
function handControls(hand){
  return '<div class="hand-pick" role="group" aria-label="Zeiger wählen">'+["hour","minute"].map((k,i)=>
    '<button data-hand="'+k+'" aria-pressed="'+(hand===k)+'"><b class="dot '+k+'"></b>'+(i?"Minute":"Stunde")+'</button>').join("")+
    '</div><div class="step-control"><button class="icon-button" data-action="minus" aria-label="Zeiger zurückstellen">'+icon("minus")+'</button><span>'+
    (hand==="hour"?"Eine Stunde":state.page==="werkstatt"?"Eine Minute":"Fünf Minuten")+'</span><button class="icon-button" data-action="plus" aria-label="Zeiger vorstellen">'+icon("plus")+'</button></div>';
}
function answers(q,asDigits=false){
  return '<div class="answers" role="group" aria-label="Antwort auswählen">'+q.options.map((t,i)=>'<button data-answer="'+i+'" aria-pressed="'+(q.selected===i)+'" class="choice '+(q.selected===i?'selected':'')+'"><span class="choice-letter" aria-hidden="true">'+"ABC"[i]+'</span><span '+(asDigits?'':'lang="en"')+'>'+(asDigits?digital(t)+" Uhr":words(t))+'</span></button>').join("")+'</div>';
}
function progress(r){
  return '<div class="progress-head"><span class="eyebrow">AUFGABE '+(r.idx+1)+' VON 5</span><span class="progress" aria-hidden="true">'+r.items.map((q,i)=>'<b class="'+(q.solved?'filled':i===r.idx?'current':'')+'"></b>').join("")+'</span></div>';
}
function exercise(r,q){
  if(q.solved)return '<section class="exercise-card solved">'+progress(r)+'<div class="success-emblem">'+icon("star")+'</div><h2 lang="en">Well done!</h2><p>Ein Stern für dich. Sprich den Satz laut nach.</p><div class="target" lang="en">'+words(q.target)+'</div>'+audioButtons("Satz hören")+btn("next",r.idx===4?"Runde abschließen":"Nächste Aufgabe","primary")+'</section>';
  let task="";
  if(q.kind==="set")task='<div class="target" lang="en">'+words(q.target)+'</div>'+(!puzzle()?audioButtons("Satz hören"):"")+handControls(q.hand);
  else {
    if(q.kind==="hear")task=audioButtons("Zeit anhören",!puzzle());
    task+=answers(q,q.kind==="hear");
    if(q.kind==="hear"&&!puzzle())task+=btn("transcript",q.transcript?"Text ausblenden":"Mitlesen","transcript")+
      (q.transcript?'<p class="script" lang="en">'+words(q.target)+'</p>':'');
  }
  return '<section class="exercise-card">'+progress(r)+'<h2>'+modes[q.kind].q+'</h2><p>'+modes[q.kind].instruction+'</p>'+task+
    (q.feedback?'<p class="feedback" role="status">'+q.feedback+'</p>':'')+btn("check",icon("check")+"Antwort prüfen","primary")+'</section>';
}
function trainingLinks(){
  return '<div class="training-links">'+kinds.map(k=>'<button class="secondary" data-mode="'+k+'" aria-pressed="'+(state.mode===k)+'">'+modes[k].name+'</button>').join("")+'</div>';
}
function game(){
  const r=round(),q=current(),easy=r.items.every(item=>!item.mistakes&&!item.assisted);
  const title=roomNames[state.page],sub=roomDescriptions[state.page]||"Wähle eine Spielart und probiere fünf Aufgaben.";
  let body;
  if(r.done) body='<section class="round-end"><div class="reward-stars">'+icon("star")+icon("star")+icon("star")+'</div><h2>Fünf Aufgaben, fünf Sterne!</h2><p>'+
    (easy&&state.level<2?'Alle fünf beim ersten Versuch gelöst. Magst du die nächste Stufe ausprobieren?':'Du hast die Runde auf Stufe '+(state.level+1)+' geschafft.')+
    '</p><div class="end-actions">'+btn("replay","Noch eine Runde","primary")+(easy&&state.level<2?btn("levelup","Nächste Stufe"):"")+'</div></section>';
  else body='<div class="play-grid">'+panel(q.kind==="set"?q.draw:q.target,{hidden:q.kind==="hear"&&!q.solved,editable:q.kind==="set"&&!q.solved,tip:!puzzle()&&!q.solved,minutes:!puzzle()&&!q.solved&&q.kind!=="hear"&&(q.mistakes>0||q.assisted)})+exercise(r,q)+'</div>';
  return hero(title,sub,true)+body+(state.page==="spielplatz"?trainingLinks():"")+roomLink("raeume","Alle Lernräume","secondary back");
}
function workshop(){
  return hero("Uhrenwerkstatt","Drehe die Zeiger. Die Uhr spricht deine Zeit auf Englisch.")+'<div class="play-grid">'+panel(data.work,{editable:true,title:"Deine Uhr"})+
    '<section class="exercise-card workshop-card"><h2>Deine Wunschzeit</h2><p>Zieh den langen Zeiger von Strich zu Strich. Jeder Strich zählt eine Minute. Lass los und hör dir die Zeit an.</p>'+
    '<div class="target"><strong>'+clock24(data.work)+' Uhr</strong><span lang="en">'+words(data.work)+'</span></div>'+handControls(workshopHand)+audioButtons("Noch einmal hören")+
    '<h3>Wenn beide Zeiger auf zwölf stehen</h3><p>Um 00:00 Uhr beginnt ein neuer Tag: <span lang="en">midnight</span>. Zwölf Stunden später ist Mittag: <span lang="en">noon</span>. <span lang="en">High noon</span> bedeutet genau zwölf Uhr mittags.</p><div class="entry-actions">'+btn("midnight","00:00 · Midnight")+btn("noon","12:00 · Noon")+'</div>'+
    roomLink("spielplatz","Ablesen und Zeichnen üben","primary")+'</section></div>'+roomLink("raeume","Alle Lernräume","secondary back");
}
function stage(){
  const phase=data.phase,t=data.stage;
  const titles=["Hör auf die Stimme","Jetzt bist du dran","Hör noch einmal hin"];
  const compare=t.m===0?"Wie klingt „o’clock“ am Ende?":t.m<=30?"Wie klingt „past“ in deinem Satz?":"Wie klingt „to“ in deinem Satz?";
  const instructions=["Hör dir den ganzen Satz an.","Sprich den Satz laut aus. Nimm dir so viel Zeit, wie du möchtest.","Vergleiche mit dem Vorbild. "+compare];
  return hero("Sprechbühne","Erst zuhören, dann selbst sprechen.",true)+'<div class="play-grid">'+panel(t,{title:"Sprechzeit"})+
    '<section class="exercise-card stage-card"><div class="eyebrow">SCHRITT '+(phase+1)+' VON 3</div><h2>'+titles[phase]+'</h2><p>'+instructions[phase]+'</p>'+
    '<div class="target" lang="en">'+words(t)+'</div>'+audioButtons(phase===2?"Vorbild vergleichen":"Vorbild hören")+
    btn("stage-next",["Jetzt nachsprechen","Mit dem Vorbild vergleichen","Neuer Satz"][phase],"primary")+'</section></div>'+roomLink("raeume","Alle Lernräume","secondary back");
}
function startGuide(){
  const read=makeQuestion({h:4,m:30},"read");
  const whole=makeQuestion({h:6,m:0},"hear");
  const set=makeQuestion({h:8,m:0},"set");
  set.draw={h:12,m:30};
  return {step:0,results:{},tasks:[{probe:"read",...read},{probe:"whole",...whole},{probe:"set",...set}]};
}
function arrival(){
  guide ||= startGuide();
  if(guide.step===guide.tasks.length){
    const rec=suggestedRoom(guide.results);
    return hero("Deine Empfehlung","Du entscheidest, wo du anfängst.")+'<section class="recommend room-tile '+rec.page+'"><span class="door-icon">'+icon(roomIcons[rec.page])+'</span><div><div class="eyebrow">STUFE '+(rec.level+1)+'</div><h2>'+roomNames[rec.page]+'</h2><p>'+rec.why+'</p><div class="entry-actions">'+btn("recommended","Raum betreten","primary")+roomLink("raeume","Alle Lernräume")+'</div></div></section>';
  }
  const q=guide.tasks[guide.step], isSet=q.kind==="set", isHear=q.kind==="hear";
  const title={read:"Welche Zeit zeigt die Uhr?",hear:"Welche Zeit hörst du?",set:"Stell acht Uhr ein."};
  const instruction={read:"Wähle die passende Zahl.",hear:"Hör den englischen Satz und wähle die Uhrzeit.",set:"Zieh den kurzen Zeiger zur 8 und den langen zur 12."};
  return hero("Komm herein!","Lies, hör und stell die Uhr. Du kannst jede Aufgabe überspringen.")+'<div class="play-grid">'+
    panel(isSet?q.draw:q.target,{hidden:isHear,editable:isSet})+'<section class="exercise-card"><div class="progress-head"><span class="eyebrow">ANKOMMEN · AUFGABE '+(guide.step+1)+'</span></div><h2>'+
    title[q.kind]+'</h2><p>'+instruction[q.kind]+'</p>'+
    (isHear?audioButtons("Zeit anhören",false):"")+(isSet?handControls(q.hand):answers(q,true))+
    (q.feedback?'<p class="feedback" role="status">'+q.feedback+'</p>':'')+btn("guide-next",isSet?"Empfehlung ansehen":"Weiter","primary")+btn("guide-skip","Überspringen","transcript")+'</section></div>';
}
const vocabulary=[
 ["o’clock","zur vollen Stunde",{h:3,m:0},"Drei Uhr."],
 ["quarter past","Viertel nach",{h:3,m:15},"Viertel nach drei."],
 ["half past","eine halbe Stunde nach",{h:3,m:30},"Halb vier. Im Englischen nennst du die Stunde, die schon begonnen hat."],
 ["quarter to","Viertel vor",{h:3,m:45},"Viertel vor vier. Bei „to“ nennst du die nächste Stunde."],
 ["five past","fünf nach",{h:8,m:5},"Fünf nach acht. Jeder große Strich steht für fünf Minuten."],
 ["ten to","zehn vor",{h:11,m:50},"Zehn vor zwölf. Bis zwölf fehlen noch zehn Minuten."]
];
function miniClock(t){return '<svg aria-hidden="true" class="mini-clock" viewBox="168 57 224 224"><circle cx="280" cy="169" r="105" fill="#fffbed" stroke="#514355" stroke-width="5"/><g class="dial-text">'+labels+'</g>'+hands(t)+'</svg>';}
function lexicon(){
 return hero("Dein Wortschatz","Hör dir die Sätze an und sprich sie laut nach.")+'<div class="vocab-grid">'+vocabulary.map(([en,de,t,note],i)=>'<article class="vocab-card"><div class="vocab-top">'+miniClock(t)+'<div><h2 lang="en">'+en+'</h2><span>'+de+'</span></div></div><div class="vocab-phrase"><span lang="en">'+words(t)+'</span><button class="icon-button" data-word="'+i+'" aria-label="Beispiel für '+en+' anhören">'+icon("sound")+'</button><button class="slow-word" data-slow-word="'+i+'" aria-label="Beispiel langsam hören">🐌 Langsam</button></div><p><strong>'+digital(t)+' Uhr.</strong> '+note+'</p></article>').join("")+'</div><a class="secondary back" href="#raeume">'+icon("game")+' Zu den Lernräumen</a>';
}
function trophy(){
  const entries=Object.entries(data.history);
  const reviews=entries.filter(([,v])=>v.review).sort((a,b)=>b[1].misses-a[1].misses);
  const rows=kinds.map(k=>{
    const stats=entries.filter(([id])=>id.startsWith(k+"/")).map(([,v])=>v);
    const total=field=>stats.reduce((n,v)=>n+v[field],0);
    return '<tr><th scope="row">'+modes[k].name+'</th><td>'+total("alone")+'</td><td>'+total("help")+'</td><td>'+total("retry")+'</td></tr>';
  }).join("");
  const n=scoreTotal();
  const byLevel=kinds.map(k=>'<tr><th scope="row">'+modes[k].name+'</th>'+state.scores[k].map(v=>'<td>'+v+'</td>').join("")+'</tr>').join("");
  return hero("Deine Sternesammlung",state.storage?"Hier könnt ihr gemeinsam anschauen, was auf diesem Gerät geübt wurde.":"Die Ergebnisse können gerade nur für diesen Besuch gespeichert werden.")+
    '<section class="score-panel"><div class="success-emblem">'+icon("star")+'</div><h2>'+n+(n===1?" Stern":" Sterne")+'</h2><p>Für jede gelöste Aufgabe gibt es einen Stern.</p></section>'+
    '<section class="history-card"><h2>So hast du die Aufgaben gelöst</h2><p>Alle Versuche zählen zum Üben. Ältere Sterne bleiben in deiner Sammlung.</p><div class="table-wrap"><table><thead><tr><th>Spielart</th><th>Auf Anhieb</th><th>Mit Hilfe beim ersten Versuch</th><th>Nach erneutem Versuch</th></tr></thead><tbody>'+rows+'</tbody></table></div><h3>Das üben wir wieder</h3>'+
    (reviews.length?'<ul class="review-list">'+reviews.map(([id])=>{const [mode,stamp]=id.split("/");return '<li>'+stamp+' Uhr · '+modes[mode].name+'</li>';}).join("")+'</ul>':'<p>Aktuell ist keine Uhrzeit zur Wiederholung vorgemerkt.</p>')+'<details><summary>Sterne nach Stufe ansehen</summary><div class="table-wrap"><table><thead><tr><th>Spielart</th><th>Stufe 1</th><th>Stufe 2</th><th>Stufe 3</th></tr></thead><tbody>'+byLevel+'</tbody></table></div></details></section><div class="entry-actions">'+roomLink("raeume","Zu den Lernräumen")+btn("reset","Auf diesem Gerät neu anfangen","text-button")+'</div>';
}
function guideQuestion(){return state.page==="ankommen" && guide ? guide.tasks[guide.step] || null : null;}
function activeQuestion(){return practice() && !round().done ? current() : guideQuestion();}
function drawing(){
  if(state.page==="werkstatt")return {draw:data.work,hand:workshopHand};
  const q=activeQuestion();
  return q?.kind==="set"&&!q.solved?q:null;
}
function render(){
  const active=document.activeElement,marker=active?.dataset?Object.entries(active.dataset)[0]:null;
  const pages={eingang:entrance,ankommen:arrival,raeume:roomOverview,werkstatt:workshop,sprechbuehne:stage,wortschatz:lexicon,sterne:trophy};
  main.innerHTML=practice()?game():pages[state.page]();
  document.querySelectorAll("[data-nav]").forEach(a=>{
    const currentNav=a.dataset.nav===state.page || (a.dataset.nav==="raeume" && Object.hasOwn(roomNames,state.page));
    if(currentNav)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
  });
  const n=scoreTotal();$("starCount").textContent=n+(n===1?" Stern":" Sterne");
  if($("drawSurface") && drawing())bindDrawing();
  if(marker)Array.from(main.querySelectorAll("button")).find(b=>b.dataset[marker[0]]===marker[1])?.focus({preventScroll:true});
}
function route(){
  clearAudio();
  const requested=location.hash.slice(1)||data.last?.page||"eingang";
  state.page=(["eingang","raeume","ankommen","wortschatz","sterne"].includes(requested)||Object.hasOwn(roomNames,requested))?requested:"eingang";
  if(state.page==="raetselraum")state.mode="mixed";
  if(state.page==="hoerhoehle")state.mode="hear";
  if(state.page==="spielplatz"&&!kinds.includes(state.mode))state.mode="read";
  if(state.page==="sprechbuehne"&&!minutesByLevel[state.level].includes(data.stage.m))nextStageTime();
  if(state.page==="ankommen")guide=startGuide();
  render();save();main.focus({preventScroll:true});window.scrollTo(0,0);
}
function nextStageTime(){
  const candidates=[];
  for(let h=1;h<=12;h++)for(const m of minutesByLevel[state.level]){
    const t={h,m};if(!sameTime(t,data.stage))candidates.push(t);
  }
  data.stage=shuffle(candidates)[0];data.phase=0;
}
function advanceWorkshop(t,delta){
  const total=((t.h%12+(t.pm?12:0))*60+t.m+delta+1440)%1440;
  t.h=normHour(Math.floor(total/60));t.m=total%60;t.pm=total>=720;
}
function shiftHand(q,step){
  if(state.page==="werkstatt"){advanceWorkshop(q.draw,step*(q.hand==="hour"?60:1));return;}
  if(q.hand==="hour"){q.draw.h=normHour(q.draw.h+step);return;}
  const m=q.draw.m+step*5;
  q.draw.h=normHour(q.draw.h+Math.floor(m/60));q.draw.m=(m+60)%60;
}
function updateHands(q){
  $("hands").innerHTML=hands(q.draw);
  $("dialDesc").textContent="Kurzer Zeiger auf Stunde "+q.draw.h+", Minuten: "+q.draw.m+".";
}
function finishDraw(q){
  if(q.feedback)q.feedback="";
  render();save();say("Eingestellt auf "+digital(q.draw)+" Uhr.");
  if(state.page==="werkstatt")play({...q.draw});
}
function bindDrawing(){
  const surface=$("drawSurface"),q=drawing();
  let pointer=null, changed=false, grab=null, moved=false;
  function position(e){
    const svg=surface.ownerSVGElement, p=svg.createSVGPoint();
    p.x=e.clientX;p.y=e.clientY;
    const pos=p.matrixTransform(svg.getScreenCTM().inverse());
    return {x:pos.x-280,y:pos.y-169};
  }
  function hitHand({x,y}){
    const radius=Math.hypot(x,y);
    if(radius<18 || radius>88)return null;
    // Compare the touch with both finite hand shafts in clock coordinates.
    function distance(degrees,length){
      const a=degrees*Math.PI/180, dx=Math.sin(a), dy=-Math.cos(a);
      const along=Math.max(0,Math.min(length,x*dx+y*dy));
      return Math.hypot(x-along*dx,y-along*dy);
    }
    const hour=distance(q.draw.h*30+q.draw.m/2,59), minute=distance(q.draw.m*6,81);
    if(Math.min(hour,minute)>8)return null;
    if(Math.abs(hour-minute)<2)return Math.abs(radius-59)<8 ? "hour" : q.hand;
    return hour<minute?"hour":"minute";
  }
  function change(e){
    const {x,y}=position(e);
    if(Math.hypot(x,y)<18)return;
    if(grab && !moved && Math.hypot(x-grab.x,y-grab.y)<3)return;
    if(grab && !moved){
      q.hand=grab.hand;
      if(state.page==="werkstatt")workshopHand=q.hand;
    }
    moved=true;
    const angle=(Math.atan2(x,-y)*180/Math.PI+360)%360;
    const before=digital(q.draw);
    if(state.page==="werkstatt"){
      const hour=q.hand==="hour";
      let delta=hour?Math.round(angle/30)%12-q.draw.h%12:Math.round(angle/6)%60-q.draw.m;
      const cycle=hour?12:60;
      if(grab && Math.abs(delta)>cycle/2)delta-=Math.sign(delta)*cycle;
      advanceWorkshop(q.draw,delta*(hour?60:1));
    }else if(q.hand==="hour")q.draw.h=normHour(Math.round(angle/30));
    else q.draw.m=Math.round(angle/30)%12*5;
    if(digital(q.draw)!==before){changed=true;updateHands(q);}
  }
  surface.onpointerdown=e=>{
    if(pointer!==null)return;
    e.preventDefault();pointer=e.pointerId;surface.setPointerCapture(pointer);
    const pos=position(e),hand=hitHand(pos);
    if(hand)grab={...pos,hand};else change(e);
  };
  surface.onpointermove=e=>{if(e.pointerId===pointer)change(e);};
  function finish(e){
    if(pointer!==e.pointerId)return;
    pointer=null;
    if(changed)finishDraw(q);else if(grab && moved){render();save();}
    changed=false;moved=false;grab=null;
  }
  surface.onpointerup=e=>{
    if(e.pointerId!==pointer)return;
    // A tap on a numeral sets the selected hand, even if the other hand covers it.
    const pos=position(e);
    if(grab && !moved && Math.hypot(pos.x-grab.x,pos.y-grab.y)<3 && Math.hypot(pos.x,pos.y)>=68)grab=null;
    change(e);finish(e);
  };
  surface.onpointercancel=surface.onlostpointercapture=finish;
}
function check(){
  const q=current();
  if(q.solved)return;
  if(q.kind!=="set"&&q.selected===null){q.feedback="Wähle zuerst eine Antwort.";render();return;}
  const actual=q.kind==="set"?q.draw:q.options[q.selected];
  if(sameTime(actual,q.target)){
    if(recordSolution(data.history,q)){state.scores[q.kind][state.level]++;saveStars();}
    q.feedback="";render();save();say("Richtig! Ein Stern für dich. "+words(q.target));
    main.querySelector('[data-action="next"]')?.focus({preventScroll:true});return;
  }
  recordMiss(data.history,q);
  if(puzzle())q.feedback="Probier es noch einmal.";
  else if(q.kind==="hear" && q.target.m>30 && actual.h===normHour(q.target.h+1) && actual.m===q.target.m){
    const hourIndex=actual.h%12;
    const germanHour=["zwölf","eins","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","elf"][hourIndex];
    q.feedback="Bei „to "+hourNames[hourIndex]+"“ wird es gleich "+germanHour+". Es ist also noch vor "+germanHour+".";
  }
  else if(q.kind==="hear")q.feedback="Hör noch einmal hin. Mit der Schnecke spricht die Stimme langsamer.";
  else if(q.kind==="set")q.feedback=actual.m!==q.target.m?"Schau auf den langen Zeiger. Zähle in Fünferschritten.":"Der lange Zeiger passt. Schau noch einmal auf die Stunde.";
  else q.feedback=actual.m===q.target.m?"Schau noch einmal auf den kurzen Zeiger. Er zeigt die Stunde.":"Zähle die Minuten am langen Zeiger in Fünferschritten.";
  render();save();
}
function openDialog(html){$("helpBody").innerHTML=html;$("helpDialog").showModal();}
function help(){
  const q=current();q.assisted=true;save();
  const messages=["Bei vollen Stunden steht der lange Zeiger auf der 12. Nenne die Stunde und hänge „o’clock“ an.",
    "Auf der 3 heißt es „quarter past“, auf der 6 „half past“, auf der 9 „quarter to“. Bei „to“ nennst du die nächste Stunde.",
    "Bei „past“ zählst du ab der 12 vorwärts. Bei „to“ zählst du, wie viele Minuten bis zur nächsten vollen Stunde fehlen."];
  const ex=[{h:8,m:0},{h:3,m:30},{h:11,m:55}][state.level];
  openDialog('<span class="help-symbol">'+icon("bulb")+'</span><h2 id="helpTitle">Ein kleiner Tipp</h2><p>'+messages[state.level]+'</p><div class="help-example">'+miniClock(ex)+'<div><strong lang="en">'+words(ex)+'</strong><span>'+digital(ex)+' Uhr</span></div></div>'+btn("dismiss","Weiter üben","primary"));
}
function advanceGuide(skip){
  const q=guideQuestion();if(!q)return;
  if(!skip&&q.kind!=="set"&&q.selected===null){q.feedback="Wähle eine Antwort oder überspringe die Aufgabe.";render();return;}
  const answer=q.kind==="set"?q.draw:q.options[q.selected];
  const correct=skip?null:sameTime(answer,q.target);
  guide.results[q.probe]=correct;
  guide.step++;
  if(q.probe==="whole" && correct){
    guide.tasks.splice(guide.step,0,{probe:"quarter",...makeQuestion({h:2,m:45},"hear")});
  }
  clearAudio();render();main.focus({preventScroll:true});say(guide.step===guide.tasks.length?"Deine Empfehlung":"Nächste Aufgabe");
}
function resetDevice(){
  const empty={read:[0,0,0],set:[0,0,0],hear:[0,0,0]};
  state.scores=empty;
  Object.assign(data,{last:null,rounds:{},history:{},work:{h:3,m:0},stage:{h:3,m:0},phase:0});
  state.page="eingang";state.mode="read";state.level=0;workshopHand="hour";guide=null;
  saveStars();save();$("helpDialog").close();location.hash="eingang";
}
function listen(slow){
  const q=activeQuestion();
  let t;
  if(q)t=q.target;
  else if(state.page==="werkstatt")t=data.work;
  else if(state.page==="sprechbuehne")t=data.stage;
  if(!t)return;
  if(q && practice() && !q.solved && slow){q.assisted=true;save();}
  play(t,slow);
}
function nextQuestion(){
  const r=round();if(!current().solved)return;
  clearAudio();if(r.idx===4)r.done=true;else r.idx++;
  render();save();say(r.done?"Runde geschafft!":"Aufgabe "+(r.idx+1)+" von fünf.");main.focus({preventScroll:true});
  if(window.matchMedia?.("(max-width: 720px)").matches)main.querySelector(".play-grid,.round-end")?.scrollIntoView({block:"start"});
}
main.addEventListener("change",e=>{
  if(e.target.id!=="level")return;
  clearAudio();state.level=Number(e.target.value);
  if(state.page==="sprechbuehne")nextStageTime();
  render();save();$("level").focus({preventScroll:true});
});
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  const d=b.dataset,action=d.action;
  if(action==="welcome"){if(welcomePlaying)stopAudio();else playWelcome();return;}
  if(b.id==="closeHelp"||action==="dismiss"){$("helpDialog").close();render();return;}
  if(d.word!==undefined||d.slowWord!==undefined){play(vocabulary[Number(d.word??d.slowWord)][2],d.slowWord!==undefined);return;}
  const q=activeQuestion();
  if(d.answer!==undefined && q && !q.solved){q.selected=Number(d.answer);q.feedback="";render();if(practice())save();return;}
  if(d.hand && drawing()){if(state.page==="werkstatt")workshopHand=d.hand;else q.hand=d.hand;render();save();return;}
  if(d.mode && kinds.includes(d.mode)){clearAudio();state.mode=d.mode;render();save();return;}
  switch(action){
    case "noon":case "midnight":
      if(state.page==="werkstatt"){Object.assign(data.work,{h:12,m:0,pm:action==="noon"});finishDraw(drawing());}
      break;
    case "listen":case "slow":listen(action==="slow");break;
    case "check":check();break;
    case "tip":help();break;
    case "transcript":q.transcript=!q.transcript;q.assisted=true;render();save();break;
    case "plus":case "minus":{const edit=drawing();if(edit){shiftHand(edit,action==="plus"?1:-1);finishDraw(edit);}break;}
    case "next":nextQuestion();break;
    case "replay":clearAudio();newRound();render();save();break;
    case "levelup":clearAudio();state.level=Math.min(2,state.level+1);newRound();render();save();break;
    case "stage-next":
      clearAudio();if(data.phase===2)nextStageTime();else data.phase++;
      if(data.phase===2)play(data.stage);
      render();save();break;
    case "guide-next":case "guide-skip":advanceGuide(action==="guide-skip");break;
    case "recommended":{const rec=suggestedRoom(guide.results);state.level=rec.level;location.hash=rec.page;break;}
    case "reset":openDialog('<h2 id="helpTitle">Neu anfangen?</h2><p>Damit löschst du alle Sterne, Übungsrunden und vorgemerkten Uhrzeiten auf diesem Gerät.</p><div class="entry-actions">'+btn("dismiss","Behalten","primary")+btn("confirm-reset","Alles zurücksetzen")+'</div>');break;
    case "confirm-reset":resetDevice();break;
  }
});
$("helpDialog").addEventListener("click",e=>{if(e.target===$("helpDialog")){
  const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();
}});
document.querySelector(".skip").addEventListener("click",e=>{e.preventDefault();main.focus();});
document.querySelectorAll("[data-icon]").forEach(el=>el.outerHTML=icon(el.dataset.icon));
window.addEventListener("hashchange",route);
window.addEventListener("storage",e=>{
  if(e.key===key)state.scores=getScores();
  if(e.key===learningKey)Object.assign(data,loadLearning());
  if(e.key===key||e.key===learningKey)render();
});
route();
if(state.page==="eingang")playWelcome();
