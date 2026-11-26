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

Zwei oder drei Kinder aus der 4. Klasse hören die sechs Sätze. Die Hörprobe ist freiwillig. Ein Kind hört auf einem Gerät bei fester, angenehmer Lautstärke. Über die Proben hinweg sollen ein iPhone und ein im Unterricht verwendetes Schulgerät vorkommen.

1. Die menschlichen Proben mit dem Skript unten auf denselben Zielpegel wie die vorhandenen MP3s bringen. Für jede der sechs Uhrzeiten beide Quellen bereitlegen. Den Clips neutrale Kennungen geben und den Schlüssel bei der erwachsenen Person lassen.
2. Je Kind zwei kurze Blöcke mit je zwölf Durchgängen vorsehen. In jedem Block kommt jeder Satz einmal mit jeder Stimme vor. Ein Block läuft bei normalem Tempo (1,0×), der andere bei 0,8× mit erhaltener Tonhöhe. Beim nächsten Kind die Reihenfolge der Blöcke wechseln. Innerhalb der Blöcke die Clips mischen und gleiche Uhrzeiten zeitlich trennen.
3. Nur den Ton vorspielen. Das Kind sieht weder Satz noch Dateinamen und darf eine Digitalzeit frei nennen, auf einer Uhr einstellen oder „weiß nicht“ sagen. Die erste Antwort eintragen. Die Lösung erst nach den Blöcken besprechen.
4. Erst anschließend A und B den Stimmen zuordnen. Pro Satz und Tempo die gewählten Uhrzeiten nebeneinanderlegen. Besonders auf Verwechslungen zwischen 6:05 und 5:55 achten. Zwei oder drei Kinder liefern Hinweise für eine neue Aufnahme, keine belastbare Rangliste der Stimmen.

Ein Blatt pro Kind und Gerät verwenden. Bitte keinen Namen auf das Blatt schreiben. In jede Zelle die tatsächlich gewählte Uhrzeit oder „weiß nicht“ eintragen. Das Blatt bleibt bei der Hörprobe.

Gerät: __________  Lautstärke: __________  Erstes Tempo: __________

| Zielzeit | A · 1,0× | B · 1,0× | A · 0,8× | B · 0,8× |
| --- | --- | --- | --- | --- |
| 6:00 | | | | |
| 6:05 | | | | |
| 5:55 | | | | |
| 3:30 | | | | |
| 7:15 | | | | |
| 6:45 | | | | |

Die bisherigen Vergleichsclips liegen unter `docs/audio/` als Mono-MP3 mit 16 kHz und 48 kbit/s.

## Übernahme nach Freigabe

Mit FFmpeg und Python ausführen:

```sh
python3 scripts/prepare_audio.py aufnahmen exportierte-clips
```

Das Skript erzeugt Mono-MP3 mit 48 kHz und 96 kbit/s und prüft die dekodierten Dateien auf −16 LUFS (Toleranz 0,4 LU) und höchstens −1 dBTP. Nach der Hörprobe die freigegebenen Sätze mit diesen Dateinamen in `docs/audio/` übernehmen. Bei einem vollständigen Stimmwechsel alle 144 Clips gemeinsam ersetzen. Der Offline-Export meldet die tatsächliche Endgröße.
