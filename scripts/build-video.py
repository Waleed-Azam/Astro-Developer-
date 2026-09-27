#!/usr/bin/env python3
"""Assemble docs/walkthrough.mp4 from screenshots + narration.

Usage:  python3 scripts/build-video.py
Needs:  docs/screenshots/{title-card,home-hero,work,project,contact,arch,outro-card}.png
        docs/audio/seg1..7.(mp3|m4a|wav)   (see docs/VIDEO_SCRIPT.md)
        ffmpeg (PATH or imageio-ffmpeg)
"""
import glob
import math
import pathlib
import re
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHOTS = ROOT / "docs/screenshots"
AUDIO = ROOT / "docs/audio"
OUT = ROOT / "docs/walkthrough.mp4"
TMP = ROOT / "docs/.video-tmp"

SEGMENTS = [
    ("title-card.png", 1),
    ("home-hero.png", 2),
    ("work.png", 3),
    ("project.png", 4),
    ("contact.png", 5),
    ("arch.png", 6),
    ("outro-card.png", 7),
]
FPS = 30
TAIL = 0.45  # seconds of breathing room after each narration segment


def ffmpeg() -> str:
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg  # pip install imageio-ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def duration(path: str) -> float:
    p = subprocess.run([ffmpeg(), "-hide_banner", "-i", path], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", p.stderr)
    assert m, f"could not read duration of {path}"
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))


def audio_for(n: int) -> str:
    cands = [c for c in sorted(glob.glob(str(AUDIO / f"seg{n}.*"))) if c.rsplit(".", 1)[-1] in ("mp3", "m4a", "wav", "aac")]
    assert cands, f"no audio found for segment {n} in {AUDIO}"
    return cands[0]


def main() -> None:
    ff = ffmpeg()
    TMP.mkdir(exist_ok=True)
    parts, total = [], 0.0
    for img, n in SEGMENTS:
        a = audio_for(n)
        ad = duration(a)
        frames = math.ceil((ad + TAIL) * FPS)
        vd = frames / FPS
        seg_out = TMP / f"seg{n}.mp4"
        z = f"1+0.09*on/{frames}" if n % 2 == 1 else f"1.09-0.09*on/{frames}"  # alternate zoom in/out
        vf = (
            f"scale=2400:1350,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d={frames}:s=1920x1080:fps={FPS}"
        )
        subprocess.run(
            [ff, "-y", "-hide_banner", "-loglevel", "error",
             "-loop", "1", "-i", str(SHOTS / img), "-i", a,
             "-filter_complex", f"[0:v]{vf}[v]", "-map", "[v]", "-map", "1:a",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "128k", "-af", "apad", "-t", f"{vd:.3f}", str(seg_out)],
            check=True,
        )
        print(f"seg{n}: {img} + {ad:.1f}s narration -> {vd:.2f}s", flush=True)
        parts.append(seg_out)
        total += vd
    (TMP / "list.txt").write_text("".join(f"file '{p}'\n" for p in parts))
    raw = TMP / "walkthrough-raw.mp4"
    subprocess.run([ff, "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0",
                    "-i", str(TMP / "list.txt"), "-c", "copy", str(raw)], check=True)
    fo = total - 0.9
    subprocess.run(
        [ff, "-y", "-hide_banner", "-loglevel", "error", "-i", str(raw),
         "-vf", f"fade=t=in:st=0:d=0.6,fade=t=out:st={fo:.3f}:d=0.9",
         "-af", f"afade=t=in:st=0:d=0.6,afade=t=out:st={fo:.3f}:d=0.9",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(OUT)], check=True)
    print(f"DONE {OUT.name} ({OUT.stat().st_size / 1e6:.1f} MB, {total:.1f}s = {total / 60:.2f} min)")


if __name__ == "__main__":
    main()
