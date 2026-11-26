const {readFileSync,existsSync}=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const art=readFileSync("docs/clock.js","utf8"),app=readFileSync("docs/app.js","utf8");
const store=new Map();
const element={addEventListener(){},remove(){},focus(){},setAttribute(){},removeAttribute(){},querySelector(){return {focus(){}}},querySelectorAll(){return []}};
const env={Audio:class{pause(){}},location:{hash:""},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},document:{activeElement:null,querySelector:()=>element,getElementById:()=>element,querySelectorAll:()=>[],addEventListener(){}},window:{scrollTo(){},addEventListener(){}},assert,existsSync};
vm.runInNewContext(art+'\n'+app+`
assert.equal(words({h:3,m:30}),"It’s half past three.");
assert.equal(words({h:12,m:45}),"It’s quarter to one.");
assert.equal(words({h:11,m:55}),"It’s five to twelve.");
for(let h=1;h<=12;h++)for(let m=0;m<60;m+=5){
 assert.ok(existsSync('docs/audio/'+h+'-'+m+'.mp3'));
 assert.ok(!/undefined|NaN/.test(words({h,m})+hands({h,m})));
 const actualAngle=h%12*30+m*.5;assert.equal(normHour(Math.floor((actualAngle%360)/30+.07)),h);
}
for(const mode of Object.keys(modes))for(let level=0;level<3;level++){
 state.mode=mode;state.level=level;
 for(let attempt=0;attempt<30;attempt++){
  const r=newRound();assert.equal(r.items.length,5);
  for(const q of r.items){
   assert.equal(new Set(q.options.map(digital)).size,3);
   assert.ok(q.options.some(o=>digital(o)===digital(q.target)));
   if(level===0)assert.equal(q.target.m,0);
   if(level===1)assert.ok([15,30,45].includes(q.target.m));
  }
 }
 const r=newRound();for(let i=0;i<5;i++){
 r.idx=i;const q=current();q.selected=q.options.indexOf(q.target);q.draw={...q.target};
 const before=scoreTotal();check();assert.ok(q.solved);check();assert.equal(scoreTotal(),before+1);
 }
}
assert.equal(scoreTotal(),45);
`,env);
console.log("144 Uhrzeiten mit Audio, Zeigerwinkel, 270 Fünferrunden und neun vollständige Punkteprüfungen bestanden.");
