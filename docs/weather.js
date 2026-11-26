"use strict";

// Forecasts are requested only by the weather control. Turning the dial just looks up an hour.
const weather = {enabled:false, request:null, hours:new Map(), error:false, fetched:0};
function disableWeather(){
  weather.request?.abort();
  Object.assign(weather,{enabled:false,request:null,hours:new Map(),error:false,fetched:0});
}
function weatherKind(code){
  if([0,1,2,3].includes(code))return ["sky",["Klar","Meist klar","Teilweise bewölkt","Bedeckt"][code]];
  if([45,48].includes(code))return ["fog","Nebel"];
  if([51,53,55,56,57].includes(code))return ["drizzle","Nieselregen"];
  if([61,63,65,66,67,80,81,82].includes(code))return ["rain","Regen"];
  if([71,73,75,77,85,86].includes(code))return ["snow","Schnee"];
  if([95,96,99].includes(code))return ["storm","Gewitter"];
  return null;
}
function readForecast(hourly){
  const hours=new Map();
  if(!hourly || !Array.isArray(hourly.time))throw new Error("Missing hourly forecast");
  hourly.time.forEach((time,i)=>{
    const kind=weatherKind(hourly.weather_code?.[i]), cloud=hourly.cloud_cover?.[i], temperature=hourly.temperature_2m?.[i];
    if(!Number.isInteger(time) || !kind || !Number.isFinite(cloud) || cloud<0 || cloud>100)return;
    hours.set(time,{effect:kind[0],label:kind[1],cloud:cloud/100,temperature:Number.isFinite(temperature)?temperature:null});
  });
  if(!hours.size)throw new Error("No usable hours");
  return hours;
}
async function fetchWeather(){
  weather.request?.abort();
  const controller=new AbortController();
  Object.assign(weather,{enabled:true,request:controller,error:false});
  refreshWeather();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const query=new URLSearchParams({
      latitude:skyPlace[1].toFixed(1),longitude:skyPlace[2].toFixed(1),
      hourly:"weather_code,cloud_cover,temperature_2m",timezone:"GMT",
      timeformat:"unixtime",past_days:"1",forecast_days:"7"
    });
    const response=await fetch("https://api.open-meteo.com/v1/forecast?"+query,{
      signal:controller.signal,credentials:"omit",referrerPolicy:"no-referrer"
    });
    if(!response.ok)throw new Error("Forecast unavailable");
    const hours=readForecast((await response.json()).hourly);
    if(weather.request===controller)Object.assign(weather,{hours,fetched:Date.now()});
  }catch{
    if(weather.request===controller)weather.error=true;
  }finally{
    clearTimeout(timer);
    if(weather.request===controller){weather.request=null;refreshWeather();}
  }
}
function weatherFor(sky){
  if(!weather.enabled || sky.gap)return null;
  return weather.hours.get(Math.floor(sky.date.getTime()/3600000)*3600) || null;
}
function refreshWeather(sky){
  if(state.page!=="werkstatt")return;
  const layer=$("weatherLayer"), note=$("weatherNote"), credit=$("weatherCredit");
  if(!layer || !note || !credit)return;
  const hour=weather.enabled?weatherFor(sky || localSky(data.work)):null;
  layer.dataset.effect=hour?.effect || "";
  layer.setAttribute("style","--clouds:"+(hour?.cloud ?? 0));
  credit.hidden=!hour;
  const retry=$("weatherRetry");
  retry.hidden=!weather.enabled;
  retry.disabled=!!weather.request;
  let status="";
  if(hour){
    status=hour.label+(hour.temperature===null?"":" · "+Math.round(hour.temperature)+" °C");
    if(weather.error || Date.now()-weather.fetched>3*3600000)status+=" · Stand "+new Date(weather.fetched).toLocaleString("de-DE",{timeZone:skyPlace[3],day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
  }else if(weather.enabled){
    status=weather.request?"Vorhersage wird geladen …":weather.error?"Wetterdaten nicht verfügbar.":"Für diese Uhrzeit gibt es keine Vorhersage.";
  }
  note.textContent=status;
  if(hour)$("weatherCaption").textContent=hour.label+" · ";
}
