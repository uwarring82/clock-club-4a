"use strict";
const roomNames = {
  werkstatt: "Uhrenwerkstatt", hoerhoehle: "Hörhöhle", sprechbuehne: "Sprechbühne",
  raetselraum: "Rätselraum", spielplatz: "Übungsplatz"
};
const roomDescriptions = {
  werkstatt: "Drehe die Zeiger und höre, was die Uhr sagt.",
  hoerhoehle: "Erkenne die Zeit am Klang. Du kannst langsam hören und mitlesen.",
  sprechbuehne: "Hör einen Satz, sprich ihn nach und vergleiche mit dem Vorbild.",
  raetselraum: "Löse fünf gemischte Rätsel durch Lesen, Hören und Zeigerstellen."
};
const kinds = ["read", "set", "hear"];
const minutesByLevel = [[0], [15,30,45], [5,10,15,20,25,30,35,40,45,50,55]];
const learningKey = "clock-club-learning-v1";
const normHour = h => ((h - 1) % 12 + 12) % 12 + 1;
const validTime = t => t && Number.isInteger(t.h) && t.h >= 1 && t.h <= 12 &&
  Number.isInteger(t.m) && t.m >= 0 && t.m < 60 && t.m % 5 === 0;
const sameTime = (a,b) => a.h === b.h && a.m === b.m;
const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
const validLevel = l => [0,1,2].includes(l);
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function makeQuestion(target,kind,first=false) {
  const {h,m} = target;
  const otherHour = kind==="hear" && m>30 ? normHour(h+1) : normHour(h-1);
  const distractors = m === 0 ? [{h:normHour(h+3),m}, {h:normHour(h+6),m}] :
    [{h:otherHour,m}, {h,m:m===30?15:60-m}];
  const options = [distractors[0],target,distractors[1]];
  return {target,kind,options:first?options:shuffle(options),selected:null,solved:false,
    mistakes:0,assisted:false,feedback:"",hand:"hour",draw:{h:h===12?4:12,m:0},transcript:false};
}
function recordFor(history,kind,t) {
  const id = kind + "/" + digital(t);
  return history[id] ||= {alone:0,help:0,retry:0,misses:0,review:false};
}
function recordMiss(history,q) {
  q.mistakes++;
  const entry = recordFor(history,q.kind,q.target);
  entry.misses++;
  entry.review = true;
}
function recordSolution(history,q) {
  if (q.solved) return false;
  const entry = recordFor(history,q.kind,q.target);
  const result = q.mistakes ? "retry" : q.assisted ? "help" : "alone";
  entry[result]++;
  entry.review = result !== "alone";
  q.solved = true;
  return true;
}
function makeRound(mode,level,history,first=false) {
  const hours = shuffle(Array.from({length:12},(_,i)=>i+1));
  if (first) {const i=hours.indexOf(3);[hours[0],hours[i]]=[hours[i],hours[0]];}
  const minutes = level===0 ? [0,0,0,0,0] : level===1 ?
    shuffle([15,30,45,...shuffle([15,30,45]).slice(0,2)]) :
    shuffle([[5,10],[20,25],[35,40],[50,55],[15,30,45]].map(group=>shuffle(group)[0]));
  const actions = mode==="mixed" ? shuffle([...kinds,...shuffle(kinds).slice(0,2)]) : Array(5).fill(mode);
  const items=actions.map((k,i)=>makeQuestion({h:hours[i],m:minutes[i]},k,first&&i===0));
  // Reserve at most two tasks for a later encounter, keeping all mixed-round skills.
  const review = shuffle(Object.entries(history).filter(([,e])=>e.review));
  const used = new Set();
  for (const [id] of review) {
    const [kind,stamp] = id.split("/");
    const [h,m] = stamp.split(":").map(Number);
    if (!minutesByLevel[level].includes(m)) continue;
    const target={h,m};
    const existing=items.findIndex(q=>sameTime(q.target,target));
    const i=existing>=0 ? existing : items.findIndex((q,j)=>q.kind===kind && !used.has(j));
    if (i<0 || used.has(i) || items[i].kind!==kind) continue;
    items[i]=makeQuestion(target,kind);used.add(i);
    if (used.size===2) break;
  }
  return {idx:0,done:false,items};
}
function suggestedRoom({read,whole,quarter,set}) {
  if (read===false || set===false) return {page:"werkstatt",level:0,why:"Drehe die Zeiger selbst. Du siehst und hörst, wie sich die Zeit verändert."};
  if (whole!==true) return {page:"hoerhoehle",level:0,why:"Fang in der Hörhöhle mit vollen Stunden an. Hör auf die Zahl vor „o’clock“."};
  if (quarter!==true) return {page:"hoerhoehle",level:1,why:"In der Hörhöhle kannst du „quarter past“ und „quarter to“ langsam anhören und vergleichen."};
  if (read===true && set===true) return {page:"raetselraum",level:1,why:"Du hast die Uhr gelesen, gehört und gestellt. Probier eine Runde mit halben und Viertelstunden."};
  return {page:"raetselraum",level:0,why:"Starte mit fünf kleinen Rätseln zu vollen Stunden. Du kannst den Raum jederzeit wechseln."};
}
function restoreRound(r,mode,level) {
  if (!r || !Number.isInteger(r.idx) || r.idx<0 || r.idx>4 || !Array.isArray(r.items) || r.items.length!==5) return null;
  const items=[];
  for (const q of r.items) {
    if (!validTime(q?.target) || !minutesByLevel[level].includes(q.target.m) || !validTime(q.draw) ||
        !kinds.includes(q.kind) || (mode!=="mixed" && q.kind!==mode) || !Array.isArray(q.options) || q.options.length!==3 ||
        !q.options.every(validTime) || !q.options.some(t=>sameTime(t,q.target))) return null;
    const clean=makeQuestion(q.target,q.kind);
    Object.assign(clean,{options:q.options,draw:q.draw,selected:[0,1,2].includes(q.selected)?q.selected:null,
      solved:q.solved===true,mistakes:count(q.mistakes),assisted:q.assisted===true,
      transcript:q.transcript===true,hand:q.hand==="minute"?"minute":"hour"});
    items.push(clean);
  }
  return {idx:r.idx,done:r.done===true && items.every(q=>q.solved),items};
}
function loadLearning() {
  let raw;
  try { raw=JSON.parse(localStorage.getItem(learningKey)); } catch {}
  const clean={last:null,rounds:{},history:{},work:{h:3,m:0},stage:{h:3,m:0},phase:0};
  if (!raw || typeof raw!=="object") return clean;
  const last=raw.last;
  if (last && Object.hasOwn(roomNames,last.page) && validLevel(last.level) && [...kinds,"mixed"].includes(last.mode))
    clean.last={page:last.page,level:last.level,mode:last.mode};
  for (const mode of [...kinds,"mixed"]) for(let level=0;level<3;level++){
    const k=mode+level, r=restoreRound(raw.rounds?.[k],mode,level);
    if(r)clean.rounds[k]=r;
  }
  for(const [id,e] of Object.entries(raw.history||{})){
    if(!/^(read|set|hear)\/([1-9]|1[0-2]):[0-5][05]$/.test(id)|| !e || typeof e!=="object")continue;
    clean.history[id]={alone:count(e.alone),help:count(e.help),retry:count(e.retry),misses:count(e.misses),review:e.review===true};
  }
  if(validTime(raw.work)) clean.work=raw.work;
  if(validTime(raw.stage)) clean.stage=raw.stage;
  clean.phase=[0,1,2].includes(raw.phase)?raw.phase:0;
  return clean;
}
