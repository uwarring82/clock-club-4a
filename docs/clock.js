"use strict";
const marks = {
 game:'<path d="M7.8 7h8.4c2.1 0 3.3 1.5 4 4.1l1.1 5c.6 2.8-1.9 4.1-3.8 2l-2.1-2.3H8.6l-2.1 2.3c-1.9 2.1-4.4.8-3.8-2l1.1-5C4.5 8.5 5.7 7 7.8 7Z"/><path d="M6.7 11.7h4m-2-2v4"/><circle cx="15.5" cy="12.6" r=".65"/><circle cx="17.6" cy="10.4" r=".65"/>',
 book:'<path d="M3 5.3c3.5-1.2 6.5-.7 9 1.3 2.5-2 5.5-2.5 9-1.3v13c-3.5-1.2-6.5-.7-9 1.3-2.5-2-5.5-2.5-9-1.3zM12 6.6v13"/>',
 star:'<path d="m12 2.6 2.9 5.9 6.6.9-4.8 4.6 1.2 6.7-5.9-3.2-5.9 3.2L7.3 14 2.5 9.4l6.6-.9z"/>',
 clock:'<circle cx="12" cy="12" r="8.6"/><path d="M12 6.9v5.3l3.7 2.2"/>',
 bulb:'<path d="M8.4 15.3a6 6 0 1 1 7.2 0c-1 .8-1.3 1.5-1.3 2.5H9.7c0-1-.3-1.7-1.3-2.5ZM10 21h4"/>',
 levels:'<rect x="3" y="13.5" width="3.5" height="6.5" rx=".8"/><rect x="10.2" y="9" width="3.5" height="11" rx=".8"/><rect x="17.5" y="4" width="3.5" height="16" rx=".8"/>',
 down:'<path d="m6 9 6 6 6-6"/>',check:'<path d="m4.7 12.3 4.7 4.8 9.9-10.2"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
 sound:'<path d="m3 9 4.5-.1L13 4.5v15l-5.5-4.4L3 15zM16 8a5.8 5.8 0 0 1 0 8m2.7-10.5a9.4 9.4 0 0 1 0 13"/>',
 pencil:'<path d="m14.6 4.3 5.1 5.1L8.5 20.6l-6 .9.9-6zM12.4 6.5l5.1 5.1M3.5 15.6l5 5M15 4l1.8-1.8c.7-.7 1.7-.7 2.4 0l2.7 2.7c.7.7.7 1.7 0 2.4L20 9.2"/>',
 headphones:'<path d="M3.7 13V11a8.3 8.3 0 0 1 16.6 0v2"/><rect x="3" y="11.5" width="4.5" height="8" rx="2"/><rect x="16.5" y="11.5" width="4.5" height="8" rx="2"/>',
 play:'<path d="m8 4 12 8-12 8z"/>',minus:'<path d="M5 12h14"/>',plus:'<path d="M5 12h14m-7-7v14"/>',
 cap:'<path d="m2 8 10-4.8L22 8l-10 4.8zM6 10v5c3 3 9 3 12 0v-5m4-2v7"/>'
};
function icon(name){return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+marks[name]+'</svg>';}
function modeArt(mode){
 const art={
 read:'<circle cx="31" cy="33" r="20" fill="#a68bd6"/><circle cx="31" cy="32" r="15.5" fill="#fff7dc"/><path d="M31 21v11l8 4" fill="none"/><path d="m14 15-4 2m34-6 3 3M22 52l-3 4m20-4 3 4"/><circle cx="31" cy="32" r="2" fill="#4a3d5b"/>',
 set:'<g transform="rotate(35 31 32)"><path d="M24 13c0-4 15-4 15 0v30l-7.5 12L24 43z" fill="#f5bf62"/><path d="M24 19h15v5H24z" fill="#a7d6c2"/><path d="M24 13c0-6 15-6 15 0v5H24z" fill="#fa997f"/><path d="M24 43l7.5 12L39 43l-5 2-2.5-3-3 3z" fill="#fee9c3"/><path d="m29 52 2.5 3 2.5-3" fill="#514661"/><path d="M31.5 25v15" fill="none"/></g>',
 hear:'<path d="M12 33v-4c0-26 39-26 39 0v4h-5v-4c0-19-29-19-29 0v4z" fill="#f8ba69"/><path d="M12 29q-6 1-5 9t7 8l4-1-2-17zM51 29q6 1 5 9t-7 8l-4-1 2-17z" fill="#74bca4"/><rect x="14" y="27" width="7" height="21" rx="3.5" transform="rotate(-8 17 38)" fill="#aae0cb"/><rect x="42" y="27" width="7" height="21" rx="3.5" transform="rotate(8 45 38)" fill="#aae0cb"/><path d="M40 50q-4 3-8 3" fill="none"/>'
 };return '<svg aria-hidden="true" viewBox="0 0 64 64" class="mode-art"><g stroke="#45394c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+art[mode]+'</g></svg>';
}
const hourNames=["twelve","one","two","three","four","five","six","seven","eight","nine","ten","eleven"];
const minuteNames=["","five","ten","quarter","twenty","twenty-five","half","twenty-five","twenty","quarter","ten","five"];
function words(time){
 const {h,m}=time;
 if(m===0)return "It’s "+hourNames[h%12]+" o’clock.";
 return "It’s "+minuteNames[m/5]+(m<=30?" past "+hourNames[h%12]:" to "+hourNames[(h+1)%12])+".";
}
function digital({h,m}){return h+":"+String(m).padStart(2,"0");}
function point(angle,r){const rad=angle*Math.PI/180;return [280+Math.sin(rad)*r,169-Math.cos(rad)*r];}
function faceLabels(){
 let result="";
 for(let i=0;i<60;i++){const big=i%5===0;const a=point(i*6,96);const b=point(i*6,big?90:93.5);
 result+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+(big?'#514555':'#b6aca8')+'" stroke-width="'+(big?2.7:1.25)+'" stroke-linecap="round"/>';}
 for(let n=1;n<=12;n++){const p=point(n*30,76.5);result+='<text x="'+p[0]+'" y="'+(p[1]+7.5)+'" text-anchor="middle">'+n+'</text>';}
 return result;
}
const labels=faceLabels();
const dialShell='<ellipse cx="282" cy="294" rx="111" ry="9.5" fill="#cbc0df" opacity=".68"/>'+
'<g stroke="#3c3347" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">'+
'<path d="m207 247-17 38q-1 4 4 5l9 1 25-30m123-13 18 37q2 4-2 6l-9 1-27-32" fill="#6c617b"/>'+
'<path d="m209 65-17-20m154 20 18-20" stroke-width="8"/>'+
'<path d="M251 62c-1-16 7-26 29-26s30 10 29 26" fill="none" stroke-width="6"/>'+
'<path d="M275 45V29h10v16" fill="#e4aa59"/><rect x="268" y="22" width="24" height="10" rx="4" fill="#ffdc81"/>'+
'<g transform="rotate(-34 194 52)"><path d="M155 50c0-17 16-30 37-30 23 0 39 14 39 30l-2 6h-71z" fill="#f58f70"/><path d="M166 38q5-9 17-11" stroke="#ffcab0" fill="none" stroke-width="4"/><rect x="153" y="49" width="81" height="7.5" rx="3.8" fill="#e77b69"/><path d="M189 20v-4q4-4 8 0v4" fill="#f5cc84"/></g>'+
'<g transform="rotate(34 366 52)"><path d="M327 50c0-17 16-30 37-30 23 0 39 14 39 30l-2 6h-71z" fill="#f58f70"/><path d="M338 38q5-9 17-11" stroke="#ffcab0" fill="none" stroke-width="4"/><rect x="325" y="49" width="81" height="7.5" rx="3.8" fill="#e77b69"/><path d="M361 20v-4q4-4 8 0v4" fill="#f5cc84"/></g>'+
'<circle cx="282.5" cy="172" r="119" fill="#78ac9e"/><circle cx="279" cy="167.5" r="118" fill="#a2d5be"/><path d="M169 145a112 112 0 0 1 66-79" fill="none" stroke="#d5ecce" stroke-width="5"/>'+
'<circle cx="280" cy="169" r="103" fill="#fdf9ea"/><path d="M180 165a100 100 0 0 1 162-75" fill="none" stroke="#e4ddcb" stroke-width="3"/></g>';
const ornaments='<g fill="none" stroke-width="3" stroke-linecap="round"><path d="m121 49-8-8m4 19-13-2m23-17-2-10" stroke="#8e76b2"/><path d="m433 69 9-8m-7 18 13-1" stroke="#8e76b2"/><path d="m386 246 4 10 10 1-8 6 2 10-9-6-8 6 2-10-8-6 10-1z" fill="#b6a6dd" stroke="#736189" stroke-width="1.8"/><path d="M108 161q4-6 5-16 3 11 7 14 4 3 13 4-10 4-13 9-2 4-3 11-3-10-7-13-4-3-13-4 8-2 11-5Z" fill="#ffcf69" stroke="#554455" stroke-width="2.4"/><path d="M456 138q3-4 4-12 2 9 5 11 3 3 10 4-10 2-13 13-3-9-6-11-3-2-8-3z" fill="#ffd578" stroke="#605064" stroke-width="2"/><path d="M99 242q10 4 3 11-5 4-7-2-2-9 7-12 8-3 13 1" stroke="#b0a0ce" stroke-width="2.3"/><path d="m442 223 8-4 2 8 8-4" stroke="#eb987d"/></g>';
function hands(time){
 const hourAngle=(time.h%12)*30+time.m*.5,minuteAngle=time.m*6;
 return '<g transform="rotate('+hourAngle+' 280 169)"><path d="M275.8 174 276 118q.1-6 4-8 4 2 4 8l.2 56q-4 6-8.4 0Z" fill="#796098" stroke="#45384f" stroke-width="2.5"/></g>'+
 '<g transform="rotate('+minuteAngle+' 280 169)"><path d="M277.4 181 277.7 95l2.3-7 2.4 7 .3 86q-2.7 4-5.3 0Z" fill="#ed9366" stroke="#784736" stroke-width="2.2"/></g>'+
 '<circle cx="280" cy="169" r="7.5" stroke="#42374b" stroke-width="2.6" fill="#f9cd7e"/><circle cx="280" cy="169" r="2.2" fill="#67505a"/>';
}
function clockArt(time,hidden,editable){
 const desc=hidden?'Die Zeiger erscheinen nach der Hörübung.':'Kurzer Zeiger auf Stunde '+time.h+', langer Zeiger auf '+(time.m/5||12)+'.';
 return '<svg class="alarm-art" viewBox="0 0 560 314" role="img" aria-labelledby="dialDesc"><title id="dialDesc">'+desc+'</title>'+ornaments+dialShell+
 (hidden?'<g fill="#c9bcd8"><circle cx="280" cy="169" r="46" fill="#efe8f1"/><path d="m265 161 9 .1 12-9v33l-12-9h-9z" fill="#8065a5"/><path d="M292 157q12 12 0 24" fill="none" stroke="#8065a5" stroke-width="4" stroke-linecap="round"/></g>':
 '<g class="dial-text">'+labels+'</g><g id="hands">'+hands(time)+'</g>')+
 (editable?'<circle id="drawSurface" cx="280" cy="169" r="104" fill="transparent" />':'')+'</svg>';
}
