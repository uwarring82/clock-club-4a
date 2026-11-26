# Clock Club · Sechs Probesätze

Gesucht ist eine erwachsene Person, die die englischen Sätze deutlich und in natürlichem britischem Englisch spricht. Mit diesen sechs Aufnahmen prüfen wir Verständlichkeit und Tempo, bevor jemand den vollständigen Satz von 144 Uhrzeiten einspricht.

| Datei | Uhr | Bitte als ganzen Satz sprechen |
| --- | --- | --- |
| 6-0.wav | 6:00 | It’s six o’clock. |
| 6-5.wav | 6:05 | It’s five past six. |
| 5-55.wav | 5:55 | It’s five to six. |
| 3-30.wav | 3:30 | It’s half past three. |
| 7-15.wav | 7:15 | It’s quarter past seven. |
| 6-45.wav | 6:45 | It’s quarter to seven. |

In einem ruhigen Raum mit gleichbleibendem Mikrofonabstand aufnehmen. Jeden Satz ruhig in einem Zug sprechen. Besonders bei „past“ und „to“ die Wörter am Satzende gut hörbar lassen. Mono-WAV mit 44,1 oder 48 kHz liefern. Die Probe zunächst außerhalb des öffentlichen Repositories anhören. Vor dem Hochladen die schriftliche Zustimmung der sprechenden Person für die Veröffentlichung auf GitHub, GitHub Pages und zur Weitergabe in der Offline-Datei einholen. Die unterschriebene Erklärung separat verwahren.

## Hörprobe auf den Geräten

Die Beispiele auf einem iPhone und einem tatsächlich verwendeten Schulgerät bei normaler Gerätelautstärke anhören. Beim Vergleich zwischen „five past six“ und „five to six“ bleibt der Text verdeckt. Prüfen, ob die beiden Uhrzeiten auch im langsamen Modus unterscheidbar sind. Festhalten, welches Gerät, welche Lautstärke und welcher Satz Schwierigkeiten gemacht haben.

## Übernahme nach Freigabe

Mit FFmpeg und Python ausführen:

```sh
python3 scripts/prepare_audio.py aufnahmen exportierte-clips
```

Das Skript erzeugt Mono-MP3 mit 48 kHz und 96 kbit/s und prüft die dekodierten Dateien auf −16 LUFS (Toleranz 0,4 LU) und höchstens −1 dBTP. Nach der Hörprobe die freigegebenen Sätze mit diesen Dateinamen in `docs/audio/` übernehmen. Bei einem vollständigen Stimmwechsel alle 144 Clips gemeinsam ersetzen. Der Offline-Export meldet die tatsächliche Endgröße.
