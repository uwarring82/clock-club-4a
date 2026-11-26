"""Record missing workshop times using the same words and voice as the game."""
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import subprocess
import tempfile

from generate_marian import synthesize
from prepare_audio import normalize

audio = Path("docs/audio")
script = Path("docs/clock.js").read_text() + """
for (let h=1; h<=12; h++) for (let m=0; m<60; m++)
  console.log(JSON.stringify([h+"-"+m, words({h,m})]));
for (const pm of [false,true]) {
  const t={h:12,m:0,pm};
  console.log(JSON.stringify([specialTime(t), words(t)]));
}
"""
rows = [json.loads(line) for line in subprocess.check_output(["node","-e",script],text=True).splitlines()]

def record(row):
    name, sentence = row
    if (audio / (name + ".mp3")).is_file():
        return
    with tempfile.TemporaryDirectory() as folder:
        wav = Path(folder) / (name + ".wav")
        wav.write_bytes(synthesize(sentence, os.environ["SPEECHIFY_API_KEY"]))
        normalize(wav, audio, 48000, "96k")
    print(name, sentence, flush=True)

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(record, rows))
