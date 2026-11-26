"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const storage = new Map([["clock-club-stars-v1", JSON.stringify({read:[2,0,0],set:[],hear:[]})]]);
const playback = [], speech = [];
const element = {
  dataset:{}, addEventListener(){}, focus(){}, close(){}, showModal(){}, setAttribute(){},
  removeAttribute(){}, querySelector(){return element;}, querySelectorAll(){return [];}
};
class AudioMock {
  pause(){}
  play(){playback.push({src:this.src,rate:this.playbackRate,pitch:this.preservesPitch});return Promise.resolve();}
}
const env = {
  Audio:AudioMock,SpeechSynthesisUtterance:class {},location:{hash:""},
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  document:{activeElement:null,querySelector:()=>element,getElementById:()=>element,querySelectorAll:()=>[],addEventListener(){}},
  window:{scrollTo(){},addEventListener(){},SpeechSynthesisUtterance:class {},
    speechSynthesis:{cancel(){},getVoices:()=>[{lang:"en-GB",localService:true}],speak:u=>speech.push(u)}},
  assert,playback,speech
};
const scripts=["clock","learning","audio","app"].map(name=>fs.readFileSync("docs/"+name+".js","utf8"));
vm.runInNewContext(scripts.join("\n"),env);
vm.runInNewContext(`
assert.equal(scoreTotal(),2);
assert.equal(state.page,"eingang");
assert.equal(words({h:3,m:30}),"It’s half past three.");
assert.equal(words({h:12,m:45}),"It’s quarter to one.");
assert.equal(words({h:11,m:55}),"It’s five to twelve.");
for(let h=1;h<=12;h++)for(let m=0;m<60;m+=5){
  assert.ok(!/undefined|NaN/.test(words({h,m})+hands({h,m})));
  assert.equal(normHour(Math.floor((((h%12)*30+m*.5)%360)/30+.07)),h);
}
for(const mode of [...kinds,"mixed"])for(let level=0;level<3;level++){
  for(let attempt=0;attempt<30;attempt++){
    const r=makeRound(mode,level,{});
    assert.equal(r.items.length,5);
    if(mode==="mixed")assert.equal(new Set(r.items.map(q=>q.kind)).size,3);
    for(const q of r.items){
      assert.equal(new Set(q.options.map(digital)).size,3);
      assert.ok(q.options.some(o=>sameTime(o,q.target)));
      assert.ok(minutesByLevel[level].includes(q.target.m));
    }
  }
}
// Follow the same paths as the entrance buttons, including skipped answers.
function guideAnswer(result){
  const q=guideQuestion();
  if(result!==null){
    if(q.kind==="set")q.draw=result?{...q.target}:{h:1,m:0};
    else q.selected=q.options.findIndex(option=>sameTime(option,q.target)===result);
  }
  advanceGuide(result===null);
}
function guidePath(read,whole,quarter,set){
  state.page="ankommen";guide=startGuide();
  guideAnswer(read);
  assert.equal(guideQuestion().target.m,0);
  guideAnswer(whole);
  if(whole===true){
    assert.equal(guideQuestion().kind,"hear");assert.equal(guideQuestion().target.m,45);
    assert.ok(guideQuestion().options.some(t=>t.h===3&&t.m===45));
    guideAnswer(quarter);
  }
  assert.equal(guideQuestion().kind,"set");
  guideAnswer(set);
  assert.equal(guideQuestion(),null);assert.equal(guide.step,whole===true?4:3);
  const rec=suggestedRoom(guide.results);
  return [rec.page,rec.level].join("/");
}
// The five reachable listening outcomes crossed with the nine reading/setting pairs.
const listeningPaths=[[false,null],[null,null],[true,false],[true,null],[true,true]];
const workshopOutcomes=Array(5).fill("werkstatt/0");
const hearing=["hoerhoehle/0","hoerhoehle/0","hoerhoehle/1","hoerhoehle/1"];
for(const [read,set,expected] of [
  [false,false,workshopOutcomes], [false,true,workshopOutcomes], [false,null,workshopOutcomes],
  [true,false,workshopOutcomes], [null,false,workshopOutcomes],
  [true,true,[...hearing,"raetselraum/1"]], [null,null,[...hearing,"raetselraum/0"]],
  [true,null,[...hearing,"raetselraum/0"]], [null,true,[...hearing,"raetselraum/0"]]
]){
  listeningPaths.forEach(([whole,quarter],i)=>{
    assert.equal(guidePath(read,whole,quarter,set),expected[i],JSON.stringify({read,set,whole,quarter}));
  });
}
assert.equal(scoreTotal(),2);assert.equal(Object.keys(data.history).length,0);
for(let h=1;h<=12;h++)for(const m of [35,40,45,50,55]){
  for(const kind of kinds){
    const options=makeQuestion({h,m},kind).options;
    const shifted=normHour(kind==="hear"?h+1:h-1);
    assert.ok(options.some(t=>t.h===shifted&&t.m===m));
    assert.ok(options.some(t=>t.h===h&&t.m===60-m));
  }
}
state.page="hoerhoehle";state.mode="hear";state.level=1;
const r=newRound();
const q=r.items[0]=makeQuestion({h:2,m:45},"hear");
q.selected=q.options.findIndex(t=>t.h===3&&t.m===45);check();
assert.equal(q.feedback,"Bei „to three“ wird es gleich drei. Es ist also noch vor drei.");
assert.equal(q.mistakes,1);assert.equal(scoreTotal(),2);
q.selected=q.options.findIndex(t=>sameTime(t,q.target));check();check();
assert.equal(scoreTotal(),3);
const id="hear/"+digital(q.target);
assert.equal(data.history[id].retry,1);assert.equal(data.history[id].review,true);
const later=makeRound("hear",1,data.history);
assert.ok(later.items.some(item=>sameTime(item.target,q.target)));
const repeat=makeQuestion(q.target,"hear");
recordSolution(data.history,repeat);assert.equal(data.history[id].review,false);
const withHelp=makeQuestion({h:11,m:45},"set");withHelp.assisted=true;
recordSolution(data.history,withHelp);assert.equal(data.history["set/11:45"].help,1);
assert.equal(loadLearning().rounds.hear1.items[0].solved,true);
for(const [h,en,de] of [[11,"twelve","zwölf"],[12,"one","eins"]]){
  const item=r.items[0]=makeQuestion({h,m:45},"hear");
  item.selected=item.options.findIndex(t=>t.h===normHour(h+1)&&t.m===45);check();
  assert.ok(item.feedback.includes("„to "+en+"“"));assert.ok(item.feedback.endsWith("vor "+de+"."));
}
state.page="raetselraum";state.mode="mixed";state.level=1;newRound();
const puzzleItem=current();puzzleItem.mistakes=1;
assert.ok(!game().includes('data-action="tip"'));assert.ok(!game().includes('data-action="transcript"'));
assert.ok(!game().includes('data-action="slow"'));
play({h:6,m:5},true);assert.equal(playback.at(-1).src,"audio/6-5.mp3");
assert.equal(playback.at(-1).rate,.8);assert.equal(playback.at(-1).pitch,true);
assert.equal(speech.length,0);
const staleError=player.onerror;play({h:5,m:55});staleError();assert.equal(speech.length,0);
player.onerror();player.onerror();assert.equal(speech.length,1);
assert.equal(speech[0].lang,"en-GB");assert.equal(playback.at(-1).rate,1);
resetDevice();assert.equal(scoreTotal(),0);assert.deepEqual(Object.keys(loadLearning().history),[]);
assert.equal(loadLearning().last,null);
`,env);
for(let h=1;h<=12;h++)for(let m=0;m<60;m+=5)assert.ok(fs.statSync(`docs/audio/${h}-${m}.mp3`).size>0);
console.log("144 clips, 360 rounds, 45 guide paths, review scheduling, stars, reset, resume, puzzle and audio fallback passed.");
