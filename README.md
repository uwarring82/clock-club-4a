# Clock Club · Telling the Time

[Öffentliche Lernseite](https://uwarring82.github.io/clock-club-4a/) · [Offline-Fassung](https://uwarring82.github.io/clock-club-4a/Clock-Club-4a.html)

Ein englisches Uhrenspiel für die 4. Klasse. Kinder starten direkt oder probieren am Eingang drei kurze Aufgaben aus. Die Empfehlung für Raum und Stufe ist freiwillig. In der Uhrenwerkstatt spricht die verstellbare Uhr mit, in der Hörhöhle lassen sich englische Sätze langsam hören und mitlesen. Die Sprechbühne funktioniert ohne Mikrofon. Der Rätselraum kombiniert Lesen, Hören und Zeigerstellen in fünf Aufgaben.

Jede gelöste Aufgabe gibt einen Stern. Im Üben vorgemerkte Uhrzeiten kommen in passenden späteren Runden wieder. Die Sternesammlung zeigt auf dem jeweiligen Gerät, wie die Aufgaben gelöst wurden. „Neu anfangen“ löscht nach Bestätigung Sterne und Lernstand dieses Browsers. Es gibt keine Anmeldung und keine zentrale Klassenliste.

## Hörbeispiele

Alle 144 englischen Sätze sind als MP3 enthalten. Die vorhandene Stimme ist synthetisch. Das Spiel nutzt zuerst die Datei und bei einem Wiedergabefehler die englische Sprachausgabe des Geräts. „Langsam“ verwendet dieselbe Aufnahme mit 0,8-facher Geschwindigkeit. Die nächsten Schritte für eine erwachsene britische Stimme stehen im [Aufnahmeblatt](AUFNAHMEPROBE.md).

## Bearbeiten und veröffentlichen

Die Website liegt in `docs/`. `clock.js` zeichnet die Uhr, `learning.js` verwaltet Aufgaben, Empfehlungen und Lernstand. `audio.js` spielt die enthaltenen Sätze ab. `app.js` verbindet die Ansichten und die Bedienung.

```sh
node scripts/verify.cjs
python3 scripts/export_offline.py
python3 -m http.server 8000 --directory docs
```

Vorschau unter `http://localhost:8000/`. Die generierte Datei `docs/Clock-Club-4a.html` enthält das vollständige Spiel mit Bildern, Schriften und Hörbeispielen. Nach Änderungen neu erzeugen und einchecken. GitHub Pages veröffentlicht automatisch `main:/docs`. Die Lizenz der mitgelieferten Schrift steht in `docs/assets/Rubik-license.txt`.
