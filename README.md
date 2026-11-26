# Clock Club · Telling the Time

Ein englisches Uhrenspiel für die 4. Klasse. Die Kinder lesen eine analoge Uhr, zeichnen ihre Zeiger und ordnen gesprochenen englischen Sätzen die passende Uhrzeit zu. Jede Runde hat fünf Aufgaben. Drei Stufen führen von vollen Stunden über halbe und Viertelstunden bis zu Fünf-Minuten-Schritten.

[Spiel öffnen](https://uwarring82.github.io/clock-club-4a/) · [Offline-Fassung öffnen und speichern](https://uwarring82.github.io/clock-club-4a/Clock-Club-4a.html)

## Lokal spielen

Die Datei `docs/Clock-Club-4a.html` herunterladen und im Browser öffnen. Sie enthält die 144 Hörbeispiele, die Schrift und alle Übungen. Die Sternesammlung wird im Browser gespeichert.

## Bearbeiten und veröffentlichen

Die Online-Seite liegt in `docs/`. `clock.js` zeichnet die Uhr und formuliert die englischen Uhrzeiten. `app.js` enthält die Aufgaben und die Spielsteuerung. Bilder und Schrift liegen in `assets/`, die gesprochenen Uhrzeiten in `audio/`. Die Schriftlizenz steht in `docs/assets/Rubik-license.txt`.

Nach Änderungen aus dem Stammverzeichnis ausführen:

```sh
node scripts/verify.cjs
python3 scripts/export_offline.py
python3 -m http.server 8000 --directory docs
```

Die Vorschau läuft unter `http://localhost:8000/`. Die erzeugte Offline-Datei mit den Änderungen einchecken. GitHub Pages veröffentlicht den Ordner `/docs` des Branches `main`. Dafür in den Repository-Einstellungen unter **Pages → Deploy from a branch** einmalig **main** und **/docs** auswählen.
