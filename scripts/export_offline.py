"""Build the standalone Clock Club page using only Python's standard library."""

import base64
import json
from html.parser import HTMLParser
from pathlib import Path

SITE = Path(__file__).resolve().parents[1] / "docs"


def data_uri(path, mime):
    payload = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{payload}"


class EmbeddedAssets(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {"src", "href"} and not value.startswith(("data:", "#")):
                raise ValueError(f"External resource in standalone page: {value}")


def build():
    css = (SITE / "style.css").read_text()
    for font in sorted((SITE / "assets").glob("*.woff")):
        css = css.replace("assets/" + font.name, data_uri(font, "font/woff"))

    clips = {}
    for hour in range(1, 13):
        for minute in range(0, 60, 5):
            name = f"{hour}-{minute}"
            clips[name] = data_uri(SITE / "audio" / f"{name}.mp3", "audio/mpeg")

    names = ("clock", "learning", "audio", "app")
    scripts = "const embeddedAudio=" + json.dumps(clips, separators=(",", ":")) + ";\n"
    scripts += "\n".join((SITE / f"{name}.js").read_text() for name in names)
    scripts = scripts.replace("assets/clubhouse.svg", data_uri(SITE / "assets/clubhouse.svg", "image/svg+xml"))

    html = (SITE / "index.html").read_text().replace("assets/club.svg", data_uri(SITE / "assets" / "club.svg", "image/svg+xml"))
    html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>{css}</style>")
    for name in names:
        html = html.replace(f'<script src="{name}.js" defer></script>', "")
    license_text = (SITE / "assets" / "Rubik-license.txt").read_text()
    html = html.replace("</body>", f'<script>{scripts}</script>\n<script type="text/plain" id="font-license">{license_text}</script>\n</body>')
    EmbeddedAssets().feed(html)
    output = SITE / "Clock-Club-4a.html"
    output.write_text(html, encoding="utf-8")
    print(f"{output.name} · {len(clips)} Hörbeispiele · {output.stat().st_size:,} Bytes")


if __name__ == "__main__":
    build()
