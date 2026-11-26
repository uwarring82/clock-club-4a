"use strict";
const main=document.querySelector("main");
const levels=["Volle Stunden","Halb & Viertel","Fünf-Minuten-Schritte"];
const modes={
 read:{name:"Uhr ablesen",short:"Von der Uhr zum Satz",q:"Wie spät ist es?",instruction:"Schau auf die Uhr und wähle den richtigen Satz."},
 set:{name:"Zeiger zeichnen",short:"Vom Satz zur Uhr",q:"Stell die Uhr!",instruction:"Wähle einen Zeiger. Ziehe ihn auf der Uhr oder tippe auf seine Zielzahl."},
 hear:{name:"Hören & sprechen",short:"Hinhören und nachsprechen",q:"Welche Zeit hörst du?",instruction:"Hör gut zu. Welche Uhrzeit passt zum englischen Satz?"}
};
function emptyScores(){return {read:[0,0,0],set:[0,0,0],hear:[0,0,0]};}
const key="clock-club-stars-v1";
function getScores(){
 const clean=emptyScores();
 try{const raw=JSON.parse(localStorage.getItem(key));for(const k in clean)clean[k]=clean[k].map((_,i)=>Number.isSafeInteger(raw?.[k]?.[i])&&raw[k][i]>0?raw[k][i]:0);}catch{}
 return clean;
}
const state={page:"spielplatz",mode:"read",level:0,scores:getScores(),rounds:{},storage:true};
const $=id=>document.getElementById(id);
const shuffled=a=>{const copy=a.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
function say(text){$("announcer").textContent=text;}
const roundKey=()=>state.mode+state.level;
function newRound(first=false){
 const chosenHours=shuffled(Array.from({length:12},(_,i)=>i+1));
 if(first){const i=chosenHours.indexOf(3);[chosenHours[0],chosenHours[i]]=[chosenHours[i],chosenHours[0]];}
 const minutes=state.level===0?[0,0,0,0,0]:state.level===1?shuffled([15,30,45,...shuffled([15,30,45]).slice(0,2)]):shuffled([shuffled([5,10])[0],shuffled([20,25])[0],shuffled([35,40])[0],shuffled([50,55])[0],shuffled([15,30,45])[0]]);
 const r={idx:0,done:false,items:chosenHours.slice(0,5).map((h,i)=>{
 const target={h,m:minutes[i]};
 const altHour={h:(h+10)%12+1,m:target.m};
 const altMinute={h,m:60-target.m};
 let others=state.level===0?[{h:(h+2)%12+1,m:0},{h:(h+5)%12+1,m:0}]:[altHour,target.m===30?{h,m:15}:altMinute];
 const options=first&&i===0?[others[0],target,others[1]]:shuffled([target,...others]);
 return {target,options,selected:null,solved:false,feedback:"",hand:"hour",draw:{h:h===12?4:12,m:0},transcript:false};
 })};
 state.rounds[roundKey()]=r;return r;
}
const round=()=>state.rounds[roundKey()]||newRound(state.mode==="read"&&state.level===0);
const current=()=>round().items[round().idx];
function scoreTotal(){return Object.values(state.scores).flat().reduce((a,b)=>a+b,0);}
function bank(){const n=scoreTotal();$("starCount").textContent=n+(n===1?" Stern":" Sterne");}
function score(){state.scores[state.mode][state.level]++;try{localStorage.setItem(key,JSON.stringify(state.scores));}catch{state.storage=false;}bank();}
const audio=new Audio();
let audioToken=0;
function stopAudio(){audioToken++;audio.pause();if("speechSynthesis" in window)speechSynthesis.cancel();}
function play(time){
 stopAudio();
 const token=audioToken;
 const file=()=>{if(audioToken!==token)return;audio.src="audio/"+time.h+"-"+time.m+".mp3";audio.play().catch(()=>{if(audioToken===token){say("Ton konnte nicht abgespielt werden.");if(state.mode==="hear"&&state.page==="spielplatz"){current().transcript=true;render();}}});};
 if("speechSynthesis" in window && "SpeechSynthesisUtterance" in window){
  const voice=speechSynthesis.getVoices().find(v=>v.localService&&/^en[-_]GB$/i.test(v.lang));
  if(voice){const u=new SpeechSynthesisUtterance(words(time));u.voice=voice;u.lang="en-GB";u.rate=.85;u.onerror=file;speechSynthesis.speak(u);return;}
 }
 file();
}
function hero(title,sub,levelControl=false){
 return '<section class="hero"><div><div class="eyebrow hero-label">'+icon("cap")+' ENGLISCH <b>·</b> KLASSE 4A</div><h1'+(state.page==="spielplatz"?' lang="en"':'')+'>'+title+'</h1><p>'+sub+'</p></div>'+
 (levelControl?'<div class="level-picker">'+icon("levels")+'<select id="level" aria-label="Übungsstufe">'+levels.map((l,i)=>'<option value="'+i+'" '+(state.level===i?'selected':'')+'>Stufe '+(i+1)+' · '+l+'</option>').join("")+'</select>'+icon("down")+'</div>':'')+'</section>';
}
function modeTiles(){
 return '<section class="modes" aria-labelledby="modesTitle"><h2 id="modesTitle">Deine Spielarten</h2><div class="mode-grid">'+Object.entries(modes).map(([k,v])=>'<button class="mode-tile '+k+(state.mode===k?' active':'')+'" data-mode="'+k+'" aria-pressed="'+(state.mode===k)+'"><span class="art-block">'+modeArt(k)+'</span><span class="mode-copy"><strong>'+v.name+'</strong><small>'+v.short+'</small></span>'+(state.mode===k?'<span class="mode-check">'+icon("check")+'</span>':'')+'</button>').join("")+'</div></section>';
}
function clockPanel(q){
 const hidden=state.mode==="hear"&&!q.solved;
 return '<section class="clock-panel" aria-label="Analoge Lernuhr"><div class="panel-tools"><span class="clock-chip">'+icon("clock")+' Lernuhr</span><button class="tip-btn" data-action="tip">'+icon("bulb")+' Tipp</button></div><div class="art-wrap">'+clockArt(state.mode==="set"?q.draw:q.target,hidden,state.mode==="set"&&!q.solved)+'</div><div class="legend">'+
 (hidden?'<button class="listen-on-clock" data-action="listen">'+icon("sound")+' Zeit anhören</button>':'<span><b class="dot hour"></b>Stundenzeiger</span><span><b class="dot minute"></b>Minutenzeiger</span>')+'</div></section>';
}
function progress(r){return '<div class="progress-head"><span class="eyebrow">AUFGABE '+(r.idx+1)+' VON 5</span><span class="progress" aria-hidden="true">'+r.items.map((q,i)=>'<b class="'+(q.solved?'filled':i===r.idx?'current':'')+'"></b>').join("")+'</span></div>';}
function setControls(q){
 return '<div class="target"><span lang="en">'+words(q.target)+'</span><button class="icon-button" data-action="listen" aria-label="Englischen Satz hören">'+icon("sound")+'</button></div><div class="hand-pick" role="group" aria-label="Zeiger wählen">'+["hour","minute"].map((k,i)=>'<button data-hand="'+k+'" aria-pressed="'+(q.hand===k)+'"><b class="dot '+k+'"></b>'+(i?"Minute":"Stunde")+'</button>').join("")+'</div><div class="step-control"><button class="icon-button" data-action="minus" aria-label="Ausgewählten Zeiger zurückstellen">'+icon("minus")+'</button><span id="stepLabel">'+(q.hand==="hour"?"Eine Stunde":"Fünf Minuten")+'</span><button class="icon-button" data-action="plus" aria-label="Ausgewählten Zeiger vorstellen">'+icon("plus")+'</button></div>';
}
function answers(q){
 return '<div class="answers" role="group" aria-label="Antwort auswählen">'+q.options.map((t,i)=>'<button data-answer="'+i+'" aria-pressed="'+(q.selected===i)+'" class="choice '+(q.selected===i?'selected':'')+'"><span class="choice-letter" aria-hidden="true">'+"ABC"[i]+'</span><span '+(state.mode==="read"?'lang="en"':'')+'>'+(state.mode==="read"?words(t):digital(t)+" Uhr")+'</span><span class="choice-mark">'+(q.selected===i?icon("check"):'')+'</span></button>').join("")+'</div>';
}
function exercise(r,q){
 if(q.solved)return '<section class="exercise-card solved">'+progress(r)+'<div class="success-emblem">'+icon("star")+'</div><h2><span lang="en">Well done!</span></h2><p>Ein Stern für dich. Sprich den Satz laut nach.</p><div class="target"><span lang="en">'+words(q.target)+'</span><button class="icon-button" data-action="listen" aria-label="Englischen Satz noch einmal hören">'+icon("sound")+'</button></div><button class="primary" data-action="next">'+(r.idx===4?'Runde abschließen':'Nächste Aufgabe')+'</button></section>';
 return '<section class="exercise-card" aria-labelledby="qTitle">'+progress(r)+'<h2 id="qTitle">'+modes[state.mode].q+'</h2><p>'+modes[state.mode].instruction+'</p>'+
 (state.mode==="set"?setControls(q):answers(q))+
 (state.mode==="hear"?'<button class="transcript" data-action="transcript" aria-expanded="'+q.transcript+'">'+(q.transcript?'Text ausblenden':'Mitlesen')+'</button>'+(q.transcript?'<p class="script" lang="en">'+words(q.target)+'</p>':''):'')+
 (q.feedback?'<div class="feedback" role="status">'+q.feedback+'</div>':'')+
 '<button class="primary" data-action="check">'+icon("check")+' Antwort prüfen</button></section>';
}
function roundEnd(){
 return '<section class="round-end"><div class="reward-stars">'+icon("star")+icon("star")+icon("star")+'</div><h2>Fünf Aufgaben, fünf Sterne!</h2><p>Du hast die Runde „'+modes[state.mode].name+'“ auf Stufe '+(state.level+1)+' geschafft.</p><div class="end-actions"><button class="primary" data-action="replay">Noch eine Runde</button>'+(state.level<2?'<button class="secondary" data-action="levelup">Nächste Stufe</button>':'')+'</div></section>';
}
function game(){
 const r=round(),q=current();
 return hero('What time is it<span class="question-mark">?</span>','Entdecke die Uhr und sag die Zeit auf Englisch.',true)+
 (r.done?roundEnd():'<div class="play-grid">'+clockPanel(q)+exercise(r,q)+'</div>')+modeTiles();
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
 return hero("Dein Wortschatz","Hör dir die Sätze an und sprich sie laut nach.")+'<div class="vocab-grid">'+vocabulary.map(([en,de,t,note],i)=>'<article class="vocab-card"><div class="vocab-top">'+miniClock(t)+'<div><h2 lang="en">'+en+'</h2><span>'+de+'</span></div></div><div class="vocab-phrase"><span lang="en">'+words(t)+'</span><button class="icon-button" data-word="'+i+'" aria-label="Beispiel für '+en+' anhören">'+icon("sound")+'</button></div><p><strong>'+digital(t)+' Uhr.</strong> '+note+'</p></article>').join("")+'</div><a class="secondary back" href="#spielplatz">'+icon("game")+' Zum Spielplatz</a>';
}
function trophy(){
 const n=scoreTotal();
 return hero("Deine Sternesammlung",state.storage?"Für jede gelöste Aufgabe bekommst du einen Stern. Deine Sterne bleiben auf diesem Gerät.":"Für jede gelöste Aufgabe bekommst du einen Stern. Gerade können sie nur für diesen Besuch gezählt werden.")+'<section class="score-panel"><div class="success-emblem">'+icon("star")+'</div><h2>'+n+(n===1?" Stern":" Sterne")+'</h2><p>'+(n?"So verteilen sich deine Sterne auf die drei Spielarten.":"Spiel eine Runde und sammle deinen ersten Stern.")+'</p></section><div class="mode-grid score-grid">'+Object.entries(modes).map(([k,v])=>'<article class="score-tile '+k+'"><div>'+modeArt(k)+'<h3>'+v.name+'</h3></div>'+levels.map((l,i)=>'<p><span>'+l+'</span><b>'+state.scores[k][i]+' '+icon("star")+'</b></p>').join("")+'</article>').join("")+'</div><a class="secondary back" href="#spielplatz">'+icon("game")+' Zum Spielplatz</a>';
}
function render(){
 const active=document.activeElement;
 const action=active?.dataset?Object.entries(active.dataset)[0]:null;
 main.innerHTML=state.page==="spielplatz"?game():state.page==="wortschatz"?lexicon():trophy();
 document.querySelectorAll("[data-nav]").forEach(a=>{if(a.dataset.nav===state.page)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 bank();if(state.page==="spielplatz"&&state.mode==="set"&&!round().done&&!current().solved)bindDrawing();
 if(action){const target=Array.from(main.querySelectorAll("button")).find(b=>b.dataset[action[0]]===action[1]);target?.focus({preventScroll:true});}
}
document.querySelector(".skip").addEventListener("click",e=>{e.preventDefault();main.focus();});
function route(){
 stopAudio();const page=location.hash.slice(1);state.page=["wortschatz","sterne"].includes(page)?page:"spielplatz";render();window.scrollTo(0,0);
}
function refreshClock(q){
 $("hands").innerHTML=hands(q.draw);$("dialDesc").textContent="Kurzer Zeiger auf Stunde "+q.draw.h+", langer Zeiger auf "+(q.draw.m/5||12)+".";
}
function normHour(h){return ((h-1)%12+12)%12+1;}
function bindDrawing(){
 const surface=$("drawSurface");if(!surface)return;
 let pointer=null;
 function change(e){
  const svg=surface.ownerSVGElement,p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
  const pos=p.matrixTransform(svg.getScreenCTM().inverse()),x=pos.x-280,y=pos.y-169;
  if(Math.hypot(x,y)<18)return;
  const a=(Math.atan2(x,-y)*180/Math.PI+360)%360;
  const q=current();
  if(q.hand==="hour"){q.draw.h=normHour(Math.floor(a/30+.07));}
  else q.draw.m=(Math.round(a/30)%12)*5;
  q.feedback="";main.querySelector(".feedback")?.remove();refreshClock(q);
 }
 surface.onpointerdown=e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;surface.setPointerCapture(pointer);change(e);};
 surface.onpointermove=e=>{if(e.pointerId===pointer)change(e);};
 surface.onpointerup=e=>{if(e.pointerId===pointer){change(e);pointer=null;}};
 surface.onpointercancel=surface.onlostpointercapture=()=>{pointer=null;};
}
function check(){
 const q=current();if(q.solved)return;
 if(state.mode!=="set"&&q.selected===null){q.feedback="Tippe zuerst auf eine Antwort.";render();return;}
 const actual=state.mode==="set"?q.draw:q.options[q.selected];
 if(digital(actual)===digital(q.target)){
 q.solved=true;q.feedback="";score();render();say("Richtig! Ein Stern für dich. "+words(q.target));main.querySelector('[data-action="next"]').focus({preventScroll:true});return;
 }
 if(state.mode==="hear")q.feedback=state.level===0?"Hör noch einmal hin. Welche Zahl hörst du vor „o’clock“?":"Hör noch einmal hin. Welche Stunde hörst du? Heißt es „past“ oder „to“?";
 else if(state.mode==="set")q.feedback=actual.m!==q.target.m?"Schau auf den langen Zeiger. Jeder große Strich zählt fünf Minuten.":"Der lange Zeiger passt. Schau noch einmal auf die Stunde.";
 else q.feedback=actual.m===q.target.m?"Schau noch einmal auf den kurzen Zeiger. Er zeigt die Stunde.":"Achte auf den langen Zeiger. Zähle von der 12 aus in Fünferschritten.";
 render();
}
function help(){
 const info=state.level===0?'Bei vollen Stunden steht der lange Zeiger auf der 12. Lies die Zahl beim kurzen Zeiger und hänge <b lang="en">o’clock</b> an.':state.level===1?'Auf der 3 heißt es <b lang="en">quarter past</b>, auf der 6 <b lang="en">half past</b>, auf der 9 <b lang="en">quarter to</b>. Bei <b lang="en">to</b> nennst du die nächste Stunde.':'Zähle in Fünferschritten. Bis zur halben Stunde sagst du <b lang="en">past</b>. Danach zählst du, wie viele Minuten bis zur nächsten Stunde fehlen, und sagst <b lang="en">to</b>.';
 const ex=state.level===0?{h:8,m:0}:state.level===1?{h:3,m:30}:{h:11,m:55};
 $("helpBody").innerHTML='<span class="help-symbol">'+icon("bulb")+'</span><h2 id="helpTitle">Ein kleiner Tipp</h2><p>'+info+'</p><div class="help-example">'+miniClock(ex)+'<div><small>Zum Beispiel</small><strong lang="en">'+words(ex)+'</strong><span>'+digital(ex)+' Uhr'+(state.level===1?' · halb vier':'')+'</span></div></div>'+(state.mode==="set"?'<p>Wähle „Stunde“ oder „Minute“. Ziehe von der Mitte zum Zifferblatt. Mit + und − geht es auch.</p>':'')+'<button class="primary" data-action="dismiss">Weiter üben</button>';
 $("helpDialog").showModal();
}
main.addEventListener("change",e=>{if(e.target.id==="level"){stopAudio();state.level=Number(e.target.value);render();$("level").focus({preventScroll:true});}});
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.id==="closeHelp"||b.dataset.action==="dismiss"){$("helpDialog").close();return;}
 if(b.hasAttribute("data-word")){play(vocabulary[Number(b.dataset.word)][2]);return;}
 if(state.page!=="spielplatz")return;
 const r=round(),q=current(),d=b.dataset;
 if(d.mode){stopAudio();state.mode=d.mode;render();if(matchMedia("(max-width: 720px)").matches)document.querySelector(".play-grid,.round-end")?.scrollIntoView({block:"start"});return;}
 if(d.answer!==undefined&&!q.solved){q.selected=Number(d.answer);q.feedback="";render();return;}
 if(d.hand&&!q.solved){q.hand=d.hand;render();return;}
 switch(d.action){
  case "tip":help();break;
  case "listen":play(q.target);break;
  case "transcript":q.transcript=!q.transcript;render();break;
  case "check":check();break;
  case "plus":case "minus":{
   const step=d.action==="plus"?1:-1;
   if(q.hand==="hour")q.draw.h=normHour(q.draw.h+step);
   else{const m=q.draw.m+step*5;q.draw.h=normHour(q.draw.h+Math.floor(m/60));q.draw.m=(m+60)%60;}
   q.feedback="";render();say("Eingestellt auf "+digital(q.draw)+" Uhr.");break;
  }
  case "next":stopAudio();if(r.idx===4)r.done=true;else r.idx++;render();say(r.done?"Runde geschafft!":"Aufgabe "+(r.idx+1)+" von fünf.");if(!r.done&&matchMedia("(max-width: 720px)").matches)main.querySelector(".play-grid")?.scrollIntoView({block:"start"});break;
  case "replay":stopAudio();newRound();render();break;
  case "levelup":stopAudio();state.level=Math.min(2,state.level+1);if(round().done)newRound();render();break;
 }
});
$("helpDialog").addEventListener("click",e=>{if(e.target===$("helpDialog")){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
document.querySelectorAll("[data-icon]").forEach(el=>el.outerHTML=icon(el.dataset.icon));
window.addEventListener("hashchange",route);
window.addEventListener("storage",e=>{if(e.key===key){state.scores=getScores();render();}});
route();
