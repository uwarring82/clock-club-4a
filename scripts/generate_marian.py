"""Generate Clock Club's 144 spoken times with the approved Marian voice."""
import base64
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def synthesize(sentence, token):
    payload = dict(input=sentence, language="en-GB", model="simba-3.5",
                   voice_id="marian", audio_format="wav")
    request = Request("https://api.speechify.ai/v1/audio/speech",
                      data=json.dumps(payload).encode(),
                      headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    for attempt in range(5):
        try:
            with urlopen(request, timeout=90) as response:
                result = json.load(response)
            return base64.b64decode(result["audio_data"], validate=True)
        except HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 4:
                raise
            delay = error.headers.get("Retry-After", "")
            time.sleep(int(delay) if delay.isdecimal() else 2 ** (attempt + 1))


if __name__ == "__main__":
    folder = Path(sys.argv[1])
    folder.mkdir(parents=True, exist_ok=True)
    # Ask the game for the exact text it displays for each clock.
    source = Path("docs/clock.js").read_text() + """
for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 5) {
        console.log(JSON.stringify([h + "-" + m, words({h, m})]));
    }
}
"""
    rows = subprocess.check_output(["node", "-e", source], text=True).splitlines()
    assert len(rows) == 144
    for row in rows:
        name, sentence = json.loads(row)
        print(name, sentence, flush=True)
        (folder / (name + ".wav")).write_bytes(synthesize(sentence, os.environ["SPEECHIFY_API_KEY"]))
