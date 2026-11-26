"""Normalize a folder of sentence recordings into verified mono MP3 clips."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
import subprocess
import tempfile


def ffmpeg(args):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-nostats", "-y", *args],
                          check=True, capture_output=True, text=True).stderr


def measure(path):
    log = ffmpeg(["-i", str(path), "-af", "loudnorm=I=-16:TP=-1.8:LRA=7:print_format=json",
                  "-f", "null", "-"])
    return json.JSONDecoder().raw_decode(log[log.rindex("{"):])[0]


def normalize(source, output, rate, bitrate):
    measured = measure(source)
    with tempfile.TemporaryDirectory(dir=output) as work:
        clip = Path(work) / (source.stem + ".mp3")
        # Check the decoded MP3. Encoder gain and overshoot vary by sentence.
        gain, ceiling = -16 - float(measured["input_i"]), -1.7
        for _ in range(5):
            filters = (f"aresample=96000,volume={gain}dB,"
                       f"alimiter=limit={10 ** (ceiling / 20)}:level=false:latency=true")
            ffmpeg(["-i", str(source), "-af", filters, "-ar", str(rate), "-ac", "1",
                    "-c:a", "libmp3lame", "-b:a", bitrate, str(clip)])
            stats = measure(clip)
            level, peak = float(stats["input_i"]), float(stats["input_tp"])
            if abs(level + 16) <= 0.4 and peak <= -1:
                clip.replace(output / clip.name)
                return level, peak
            gain += -16 - level
            ceiling -= max(0, peak + 1.2)
        raise ValueError(f"{source.name}: {level} LUFS, {peak} dBTP")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("source", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--rate", type=int, default=48000)
    p.add_argument("--bitrate", default="96k")
    args = p.parse_args()
    files = sorted(f for f in args.source.iterdir() if f.suffix.lower() in {".wav", ".mp3", ".flac"})
    if not files or args.source.resolve() == args.output.resolve():
        p.error("Choose a source with recordings and a separate output directory")
    if len({f.stem for f in files}) != len(files) or any(
        not re.fullmatch(r"(?:[1-9]|1[0-2])-(?:0|5|[1-5][05])", f.stem) for f in files):
        p.error("Use one hour-minute file per sentence, for example 6-5.wav")
    args.output.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda f: normalize(f, args.output, args.rate, args.bitrate), files))
    levels, peaks = zip(*results)
    print(f"{len(files)} clips: {min(levels):.2f} to {max(levels):.2f} LUFS; max {max(peaks):.2f} dBTP")


if __name__ == "__main__":
    main()
