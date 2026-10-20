"""Analyse a song for beat-synced Reels: tempo (BPM), beat phase and the drop (where the energy jumps).

  python music_analyze.py <song.mp3>            -> prints JSON, writes <song>.json next to the file
Needs ffmpeg on PATH and numpy. No other dependency.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

SR, HOP, NFFT = 11025, 128, 1024


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def analyse(path):
    x = decode(path)
    n = 1 + (len(x) - NFFT) // HOP
    win = np.hanning(NFFT).astype(np.float32)
    frames = np.lib.stride_tricks.as_strided(x, (n, NFFT), (x.strides[0] * HOP, x.strides[0])) * win
    mag = np.log1p(np.abs(np.fft.rfft(frames, axis=1)))
    flux = np.maximum(0, np.diff(mag, axis=0)).sum(axis=1)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = SR / HOP
    # tempo: autocorrelation of the onset envelope, mild prior around 125 BPM
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    lags = np.arange(int(fps * 60 / 180), int(fps * 60 / 60))
    bpms = 60 * fps / lags
    score = ac[lags] * np.exp(-0.5 * (np.log2(bpms / 125) / 0.9) ** 2)
    k = int(np.argmax(score))
    if 0 < k < len(score) - 1:  # parabolic interpolation for sub-lag precision
        a, b_, c = score[k - 1], score[k], score[k + 1]
        k = k + 0.5 * (a - c) / (a - 2 * b_ + c + 1e-12)
    bpm = float(60 * fps / (lags[0] + k))
    # beat phase: offset that best lines a beat grid up with onsets
    period = 60 * fps / bpm
    ph = max(range(int(period)) if period >= 1 else [0], key=lambda o: flux[np.minimum(len(flux) - 1, np.round(np.arange(o, len(flux) - 1, period)).astype(int))].sum())
    beat0 = ph / fps
    # drop: biggest jump in low-band energy (next 8 s vs previous 8 s), searched in the first 80 % of the song
    low = mag[:, 1:int(NFFT * 200 / SR)].mean(axis=1)
    sec = int(fps)
    e = np.convolve(low, np.ones(sec) / sec, "same")
    w, best, drop = 8 * sec, -1e9, 0.0
    for i in range(w, int(len(e) * 0.8) - w, sec // 4):
        d = e[i:i + w].mean() - e[i - w:i].mean()
        if d > best:
            best, drop = d, i / fps
    drop = beat0 + round((drop - beat0) / (60 / bpm)) * (60 / bpm)  # snap to the beat grid
    return {"bpm": round(bpm, 2), "beat0": round(beat0, 3), "drop": round(max(0.0, drop), 3), "duration": round(len(x) / SR, 2)}


if __name__ == "__main__":
    p = Path(sys.argv[1])
    meta = analyse(p)
    p.with_suffix(".json").write_text(json.dumps(meta, indent=1))
    print(json.dumps(meta))
