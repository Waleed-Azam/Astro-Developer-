#!/usr/bin/env python3
"""Generate video title/outro cards + pad the architecture frame to 1920x1080.

Usage: python3 scripts/build-video-assets.py
Output: docs/screenshots/{title-card,outro-card,arch}.png
"""
from PIL import Image, ImageDraw, ImageFont
import pathlib

W, H = 1920, 1080
INK = (27, 26, 23)
PAPER = (250, 248, 244)
ACCENT = (201, 111, 74)
SAGE = (95, 113, 97)
GREY = (185, 180, 168)
DIM = (143, 138, 126)
OUT = pathlib.Path("docs/screenshots")


def font(bold_serif: bool, mono: bool, size: int):
    cands = []
    if mono:
        cands = ["DejaVuSansMono-Bold.ttf", "DejaVuSansMono.ttf"]
    elif bold_serif:
        cands = ["DejaVuSerif-Bold.ttf", "DejaVuSerif.ttf"]
    else:
        cands = ["DejaVuSans-Bold.ttf", "DejaVuSans.ttf"]
    for name in cands:
        for d in ("/usr/share/fonts/truetype/dejavu/", "/usr/share/fonts/"):
            p = d + name
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    print(f"  (fallback font for size {size})")
    return ImageFont.load_default(size=size)


def centered(draw, cx, y, text, fnt, fill):
    bb = draw.textbbox((0, 0), text, font=fnt)
    draw.text((cx - (bb[2] - bb[0]) / 2, y), text, font=fnt, fill=fill)


def title_card():
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)
    d.ellipse([W - 420, -260, W + 260, 420], fill=ACCENT)          # terracotta sun
    d.ellipse([-160, H - 300, 260, H + 120], fill=SAGE)            # sage blob
    d.ellipse([W - 700, H - 160, W - 560, H - 20], fill=(44, 43, 40))
    mono = font(False, True, 36)
    serif = font(True, False, 118)
    sans = font(False, False, 40)
    foot = font(False, True, 30)
    centered(d, W / 2, 300, "WEBFLOW  →  ASTRO  ·  END-TO-END MIGRATION DEMO", mono, ACCENT)
    centered(d, W / 2, 400, "Same design.", serif, PAPER)
    centered(d, W / 2, 540, "1/50th the JavaScript.", serif, ACCENT)
    centered(d, W / 2, 730, "A complete rebuild on Astro · Cloudflare · Resend · Railway · GitHub", sans, GREY)
    d.text((90, H - 110), "WALEED AZAM — ASTRO DEVELOPER", font=foot, fill=DIM)
    tag = "5-MINUTE WALKTHROUGH"
    bb = d.textbbox((0, 0), tag, font=foot)
    d.text((W - 90 - (bb[2] - bb[0]), H - 110), tag, font=foot, fill=DIM)
    img.save(OUT / "title-card.png")
    print("wrote title-card.png")


def outro_card():
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)
    d.ellipse([-260, -260, 420, 420], fill=ACCENT)
    d.ellipse([W - 260, H - 300, W + 160, H + 120], fill=SAGE)
    serif = font(True, False, 112)
    sans = font(False, False, 42)
    mono = font(False, True, 34)
    centered(d, W / 2, 360, "Thanks for watching.", serif, PAPER)
    centered(d, W / 2, 540, "Code, docs & migration playbook — link in the description.", sans, GREY)
    centered(d, W / 2, 700, "WALEED AZAM  ·  ASTRO DEVELOPER", mono, ACCENT)
    img.save(OUT / "outro-card.png")
    print("wrote outro-card.png")


def arch_frame():
    raw = Image.open(OUT / "arch-raw.png").convert("RGB")
    canvas = Image.new("RGB", (W, H), PAPER)
    # arch-raw is already 1920x1080; normalize background tint + add caption bar
    canvas.paste(raw, (0, 0))
    d = ImageDraw.Draw(canvas)
    mono = font(False, True, 34)
    centered(d, W / 2, H - 120, "STATIC PAGES ON THE EDGE  ·  ONE FUNCTION FORMS  ·  OWNED EMAIL + BACKUP", mono, DIM)
    canvas.save(OUT / "arch.png")
    print("wrote arch.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    title_card()
    outro_card()
    arch_frame()
