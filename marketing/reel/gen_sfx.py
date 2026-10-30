"""Reel uchun sound effectlarni sintez qiladi (litsenziya muammosisiz) -> public/sfx/*.wav"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).parent / "public" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def lowpass(x, cutoff):
    """Bir qutbli low-pass; cutoff skalyar yoki har bir namuna uchun massiv (Hz)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def sweep(f0, f1, d, curve=1.0):
    tt = t(d)
    f = f0 + (f1 - f0) * (tt / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def fade(x, a=0.005, r=0.02):
    n = len(x)
    env = np.ones(n)
    na, nr = int(SR * a), int(SR * r)
    if na:
        env[:na] = np.linspace(0, 1, na)
    if nr:
        env[-nr:] *= np.linspace(1, 0, nr)
    return x * env


def save(name, x, gain=0.9):
    x = fade(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    stereo = np.stack([x, x], axis=1)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype("<i2").tobytes())
    print(name, f"{len(x) / SR:.2f}s")


def whoosh(d=0.7, f0=300, f1=4000):
    tt = t(d)
    noise = rng.standard_normal(len(tt))
    cutoff = f0 + (f1 - f0) * np.sin(np.pi * tt / d) ** 2
    x = lowpass(noise, cutoff)
    x = highpass(x, 120)
    env = np.sin(np.pi * tt / d) ** 1.5
    return x * env


def hit():
    d = 0.9
    tt = t(d)
    body = sweep(120, 42, d, 0.35) * np.exp(-tt * 5)
    click = lowpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 60)
    return body + 0.5 * click


def pop(f=700):
    d = 0.14
    tt = t(d)
    return sweep(f * 0.6, f * 1.6, d, 0.4) * np.exp(-tt * 38)


def click():
    d = 0.05
    tt = t(d)
    x = highpass(rng.standard_normal(len(tt)), 2000) * np.exp(-tt * 180)
    return x + 0.6 * np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 120)


def tick():
    d = 0.08
    tt = t(d)
    return np.sin(2 * np.pi * 1850 * tt) * np.exp(-tt * 70) + 0.4 * np.sin(2 * np.pi * 3700 * tt) * np.exp(-tt * 110)


def ding():
    d = 1.4
    tt = t(d)
    f = 1318.5
    x = sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt * k) for m, a, k in [(1, 1, 3), (2.0, 0.35, 5), (2.76, 0.25, 7), (5.4, 0.1, 11)])
    return x


def shimmer():
    d = 1.1
    x = np.zeros(int(SR * d))
    notes = [1046.5, 1318.5, 1568.0, 2093.0, 2637.0]
    for i, f in enumerate(notes):
        start = int(SR * i * 0.06)
        tt = t(d - i * 0.06)
        tone = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4.5) * (1 + 0.3 * np.sin(2 * np.pi * 9 * tt))
        x[start:start + len(tone)] += tone * (0.9 - i * 0.1)
    return x


def riser(d=1.6):
    tt = t(d)
    prog = tt / d
    noise = lowpass(rng.standard_normal(len(tt)), 400 + 7000 * prog ** 2)
    tone = sweep(180, 1400, d, 2.0) * 0.35 + sweep(181.5, 1410, d, 2.0) * 0.35
    return (noise * 0.8 + tone) * prog ** 2.2


def impact():
    d = 1.8
    tt = t(d)
    boom = sweep(90, 34, d, 0.3) * np.exp(-tt * 2.6)
    crack = lowpass(rng.standard_normal(len(tt)), 5000) * np.exp(-tt * 14)
    tail = lowpass(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 3) * 0.25
    return boom + 0.45 * crack + tail


def type_burst(n=6, gap=0.055):
    c = click()
    x = np.zeros(int(SR * (gap * n + 0.08)))
    for i in range(n):
        s = int(SR * gap * i)
        x[s:s + len(c)] += c * (0.7 + 0.3 * rng.random())
    return x


save("whoosh", whoosh())
save("swoosh", whoosh(0.4, 600, 6000), 0.7)
save("hit", hit())
save("pop", pop(), 0.75)
save("pop_hi", pop(1000), 0.75)
save("click", click(), 0.6)
save("tick", tick(), 0.45)
save("ding", ding(), 0.6)
save("shimmer", shimmer(), 0.55)
save("riser", riser(), 0.8)
save("impact", impact(), 0.95)
save("type", type_burst(), 0.5)
