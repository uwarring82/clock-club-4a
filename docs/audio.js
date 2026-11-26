"use strict";
const player = new Audio();
let playbackId = 0;
function stopAudio() {
  playbackId++;
  player.onerror = null;
  player.pause();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
function clipSource(t) {
  const filename = t.h + "-" + t.m;
  return typeof embeddedAudio === "undefined" ? "audio/" + filename + ".mp3" : embeddedAudio[filename];
}
function play(t, slow=false) {
  stopAudio();
  const id = playbackId;
  let triedFallback = false;
  function unavailable() {
    if (id !== playbackId) return;
    say("Ton nicht verfügbar. " + words(t));
    showAudioText(t);
  }
  function fallback() {
    if (id !== playbackId || triedFallback) return;
    triedFallback = true;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { unavailable(); return; }
    const speech = new SpeechSynthesisUtterance(words(t));
    const voices = window.speechSynthesis.getVoices().filter(v=>/^en\b/i.test(v.lang.replace("_","-")));
    speech.voice = voices.find(v=>v.localService && /^en-GB$/i.test(v.lang)) || voices.find(v=>v.localService) || null;
    speech.lang = speech.voice?.lang || "en-GB";
    speech.rate = slow ? 0.8 : 1;
    speech.onerror = unavailable;
    window.speechSynthesis.speak(speech);
  }
  player.onerror = fallback;
  player.src = clipSource(t);
  player.preservesPitch = true;
  if ("webkitPreservesPitch" in player) player.webkitPreservesPitch = true;
  player.playbackRate = slow ? 0.8 : 1;
  player.play().catch(fallback);
}
