"use strict";
// Coordinates are approximate city centres. Device locations are rounded to 0.1 degrees.
const skyPlaces=[
  ["Sprockhövel",51.35,7.25,"Europe/Berlin"],["Gevelsberg",51.32,7.34,"Europe/Berlin"],
  ["Wuppertal",51.26,7.15,"Europe/Berlin"],["Freiburg",48.00,7.85,"Europe/Berlin"],
  ["Berlin",52.52,13.41,"Europe/Berlin"],["London",51.51,-0.13,"Europe/London"],
  ["New York",40.71,-74.01,"America/New_York"],["Sydney",-33.87,151.21,"Australia/Sydney"]
];
let skyPlace=skyPlaces[0], skyDayShift=0, askedForPlace=false, placeRequest=0;
const zoneClocks=new Map();
function zoneClock(zone){
  if(!zoneClocks.has(zone))zoneClocks.set(zone,new Intl.DateTimeFormat("en-GB",{
    timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"
  }));
  return zoneClocks.get(zone);
}
function civilStamp(instant,zone){
  const p=Object.fromEntries(zoneClock(zone).formatToParts(instant).map(v=>[v.type,v.value]));
  return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute);
}
const dayMs=86400000;
let skyDateCache=null;
function observingTime(t,place,now,shift){
  const zone=place[3], day=Math.floor(civilStamp(now,zone)/dayMs)+shift;
  if(!skyDateCache || skyDateCache.zone!==zone || skyDateCache.day!==day){
    const noon=day*dayMs+dayMs/2;
    const offsets=[noon-dayMs,noon,noon+dayMs].map(at=>civilStamp(at,zone)-at);
    skyDateCache={zone,day,offsets:[...new Set(offsets)].sort((a,b)=>b-a)};
  }
  const wall=day*dayMs+((t.h%12+(t.pm?12:0))*60+t.m)*60000;
  const choices=skyDateCache.offsets.map(offset=>wall-offset);
  // On autumn's repeated hour use the first occurrence. Flag spring's missing hour.
  const valid=choices.filter(at=>civilStamp(at,zone)===wall);
  return {date:new Date(valid[0]??Math.max(...choices)),gap:valid.length===0,fold:valid.length>1};
}
function localSky(t,place=skyPlace,now=Date.now(),shift=skyDayShift){
  const {date,gap,fold}=observingTime(t,place,now,shift), [,lat,lon,zone]=place;
  const sun=window.SunCalc.getPosition(date,lat,lon), moon=window.SunCalc.getMoonPosition(date,lat,lon);
  const illumination=window.SunCalc.getMoonIllumination(date);
  const names=["Neumond","Zunehmende Sichel","Erstes Viertel","Zunehmender Mond","Vollmond","Abnehmender Mond","Letztes Viertel","Abnehmende Sichel"];
  const phase=names[Math.round(illumination.phase*8)%8], percent=Math.round(illumination.fraction*100);
  return {sun,moon,illumination,phase,percent,date,gap,fold,zone};
}
function moonShape(sky){
  const f=sky.illumination.fraction, radius=Math.abs(1-2*f)*10;
  const limb="M0 -10 A10 10 0 0 1 0 10 ";
  const edge=radius<0.001?"L0 -10":"A"+radius+" 10 0 0 "+(f<0.5?0:1)+" 0 -10";
  const turn=-90-(sky.illumination.angle-sky.moon.parallacticAngle)*180/Math.PI;
  return '<path d="'+limb+edge+'Z" transform="rotate('+turn+')" fill="#fff3cb"/>';
}
function skyDescription(sky){
  const date=sky.date.toLocaleDateString("de-DE",{timeZone:sky.zone,day:"numeric",month:"long",year:"numeric"});
  if(sky.gap)return date+" · Diese Ortszeit entfällt bei der Zeitumstellung.";
  return date+" · "+sky.phase+" · "+sky.percent+" % beleuchtet"+(sky.moon.altitude<0?" · unter dem Horizont":" · über dem Horizont")+(sky.fold?" · erste der beiden gleichen Uhrzeiten":"");
}
