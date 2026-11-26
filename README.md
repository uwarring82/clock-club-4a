# Clock Club · Telling the Time

[Öffentliche Lernseite](https://uwarring82.github.io/clock-club-4a/) · [Offline-Fassung](https://uwarring82.github.io/clock-club-4a/Clock-Club-4a.html)

Ein englisches Uhrenspiel für die 4. Klasse. Kinder starten direkt oder lesen, hören und stellen am Eingang die Uhr. Wer eine volle Stunde auf Englisch erkennt, hört zusätzlich einen Satz mit „quarter to“. Die Empfehlung für Raum und Stufe ist freiwillig. In der Uhrenwerkstatt spricht die verstellbare Uhr mit, in der Hörhöhle lassen sich englische Sätze langsam hören und mitlesen. Die Sprechbühne funktioniert ohne Mikrofon. Der Rätselraum kombiniert Lesen, Hören und Zeigerstellen in fünf Aufgaben.

Jede gelöste Aufgabe gibt einen Stern. Im Üben vorgemerkte Uhrzeiten kommen in passenden späteren Runden wieder. Die Sternesammlung zeigt auf dem jeweiligen Gerät, wie die Aufgaben gelöst wurden. „Neu anfangen“ löscht nach Bestätigung Sterne und Lernstand dieses Browsers. Es gibt keine Anmeldung und keine zentrale Klassenliste.

## Wetter in der Uhrenwerkstatt

Unter **Uhr einstellen → Wetter im Himmel zeigen** lädt der Browser stündliche Modelldaten von [Open-Meteo](https://open-meteo.com/) ([Datenlizenz CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). Beim Einschalten übermittelt er den auf 0,1 Grad gerundeten Spielort. Bewölkung und Wettersymbole richten sich nach der eingestellten Spielzeit. Beim Drehen wird die bereits geladene Vorhersage verwendet. Ein Ortswechsel schaltet das Wetter wieder aus. Ohne Internet und außerhalb der verfügbaren Stunden bleibt der astronomische Himmel nutzbar.

## Hörbeispiele

In der Uhrenwerkstatt kann der Minutenzeiger über mehrere Umdrehungen vorwärts und rückwärts bewegt werden. Deutsch zeigt die Zeit im 24-Stunden-Format, Englisch im 12-Stunden-Format mit am/pm. Beim ersten Besuch der Werkstatt können Kinder einen Beispielort oder ihren Gerätestandort wählen. Die Städte haben eigene Zeitzonen. Beim Gerätestandort verwendet die Werkstatt die Gerätezeitzone und rundet Koordinaten auf 0,1°. Der Spielort bleibt im Arbeitsspeicher. Die lokale Kopie von SunCalc 1.9.0 berechnet Sonnenstand, Mondstand und beleuchtete Mondfläche für das Ortsdatum und die Spielzeit. Eine Drehung über Mitternacht wechselt den Beobachtungstag. Die Landschaft zeigt eine schematische Ansicht des Himmels mit freiem Horizont. Die digitale Anzeige unterscheidet 00:00 Uhr (midnight) und 12:00 Uhr (noon, auch high noon). Alle 720 Uhrzeiten, beide Tageszeiten und die Begrüßung liegen als MP3 vor und sind in der Offline-Fassung eingebettet. Die Übungen verwenden daraus die 144 Uhrzeiten im Fünf-Minuten-Raster. Die synthetische Stimme Marian (Speechify, britisches Englisch) spricht alle Uhrzeiten. Das Spiel nutzt zuerst die Datei und bei einem Wiedergabefehler die englische Sprachausgabe des Geräts. „Langsam“ verwendet dieselbe Aufnahme mit 0,8-facher Geschwindigkeit. Ein Hörtest für den Vergleich mit menschlichen Aufnahmen steht im [Aufnahmeblatt](AUFNAHMEPROBE.md).

## Bearbeiten und veröffentlichen

Die Website liegt in `docs/`. `clock.js` zeichnet die Uhr, `learning.js` verwaltet Aufgaben, Empfehlungen und Lernstand. `audio.js` spielt die enthaltenen Sätze ab. `app.js` verbindet die Ansichten und die Bedienung.

```sh
node scripts/verify.cjs
python3 scripts/export_offline.py
python3 -m http.server 8000 --directory docs
```

Vorschau unter `http://localhost:8000/`. Die generierte Datei `docs/Clock-Club-4a.html` enthält das vollständige Spiel mit Bildern, Schriften und Hörbeispielen. Nach Änderungen neu erzeugen und einchecken. GitHub Pages veröffentlicht automatisch `main:/docs`. Die Lizenz der mitgelieferten Schrift steht in `docs/assets/Rubik-license.txt`.
