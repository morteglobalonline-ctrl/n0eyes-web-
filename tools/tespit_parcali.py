#!/usr/bin/env python3
"""Kalabalık / uzak sahne için PARÇALI tespit (SAHI mantığı) -> site JSON'u (tespit_json.py ile aynı şema).

  ~/Desktop/n0eyes/.venv/bin/python tools/tespit_parcali.py giris.mp4 cikis.json \
      [--fps 8] [--parca 384] [--bindirme 96] [--imgsz 1024] [--conf 0.25] [--model yolo11s.pt]

Kare, `parca` piksellik örtüşen karelere bölünür; her parça `imgsz`'ye büyütülerek ayrı taranır (10 px'lik yaya
~30 px olur). Sonuçlar tam kare koordinatına taşınır, sınıf bazlı NMS ile birleştirilir. Kimlik: örnekler arası
açgözlü IoU eşleme (tarayıcıdaki yumuşatma için yeterli).
"""
import argparse, json, os
import cv2, numpy as np, torch
from ultralytics import YOLO
from torchvision.ops import nms

ap = argparse.ArgumentParser()
ap.add_argument("giris"); ap.add_argument("cikis")
ap.add_argument("--fps", type=float, default=8)
ap.add_argument("--parca", type=int, default=384)
ap.add_argument("--bindirme", type=int, default=96)
ap.add_argument("--imgsz", type=int, default=1024)
ap.add_argument("--conf", type=float, default=0.25)
ap.add_argument("--iou", type=float, default=0.5)
ap.add_argument("--model", default=os.path.expanduser("~/Desktop/n0eyes/yolo11s.pt"))
ap.add_argument("--tam-kare", action="store_true", help="ek olarak tam kareyi de tara (büyük nesneler için)")
a = ap.parse_args()

SINIF = {0: 0, 2: 1, 5: 1, 7: 1, 1: 2, 3: 2}
cap = cv2.VideoCapture(a.giris)
src_fps = cap.get(cv2.CAP_PROP_FPS) or 30
W, H = int(cap.get(3)), int(cap.get(4))
adim = max(1, round(src_fps / a.fps))
model = YOLO(a.model)
dev = "mps" if torch.backends.mps.is_available() else "cpu"

# parça ızgarası
def izgara(n, p, b):
    xs, x = [], 0
    while True:
        xs.append(min(x, max(0, n - p)))
        if x + p >= n: break
        x += p - b
    return sorted(set(xs))
XS, YS = izgara(W, a.parca, a.bindirme), izgara(H, a.parca, a.bindirme)
print(f"{W}x{H} @ {src_fps:.0f} fps -> {len(XS)}x{len(YS)} parça, örnek {src_fps/adim:.1f} fps, cihaz {dev}")

def tespit(fr):
    parcalar, ofs = [], []
    for y in YS:
        for x in XS:
            parcalar.append(fr[y:y + a.parca, x:x + a.parca]); ofs.append((x, y))
    if a.tam_kare:
        parcalar.append(fr); ofs.append((0, 0))
    rs = model.predict(parcalar, imgsz=a.imgsz, conf=a.conf, classes=list(SINIF), device=dev, verbose=False, half=False)
    B, S, C = [], [], []
    for r, (ox, oy) in zip(rs, ofs):
        if r.boxes is None or not len(r.boxes): continue
        xyxy = r.boxes.xyxy.cpu().numpy(); cf = r.boxes.conf.cpu().numpy(); cl = r.boxes.cls.cpu().numpy()
        if (ox, oy) == (0, 0) and a.tam_kare and r is rs[-1]:
            pass  # tam kare: ofset yok
        for (x1, y1, x2, y2), p, c in zip(xyxy, cf, cl):
            B.append([x1 + ox, y1 + oy, x2 + ox, y2 + oy]); S.append(float(p)); C.append(SINIF[int(c)])
    if not B: return []
    B = torch.tensor(B); S = torch.tensor(S); C = torch.tensor(C)
    keep = []
    for c in C.unique():
        idx = (C == c).nonzero().flatten()
        k = nms(B[idx], S[idx], a.iou)
        keep += idx[k].tolist()
    return [[*map(lambda v: round(float(v)), B[i].tolist()), int(C[i]), round(float(S[i]), 2)] for i in keep]

def iou(p, q):
    ix1, iy1, ix2, iy2 = max(p[0], q[0]), max(p[1], q[1]), min(p[2], q[2]), min(p[3], q[3])
    inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
    if not inter: return 0.0
    return inter / ((p[2]-p[0])*(p[3]-p[1]) + (q[2]-q[0])*(q[3]-q[1]) - inter)

frames, n, sonraki_id, onceki = [], 0, 1, []
while True:
    ok, fr = cap.read()
    if not ok: break
    if n % adim == 0:
        b = tespit(fr)
        # açgözlü IoU eşleme ile kimlik
        kullanildi = set()
        for kutu in sorted(b, key=lambda k: -k[5]):
            en, en_j = 0.3, -1
            for j, o in enumerate(onceki):
                if j in kullanildi or o[4] != kutu[4]: continue
                v = iou(kutu, o)
                if v > en: en, en_j = v, j
            if en_j >= 0: kutu.append(onceki[en_j][6]); kullanildi.add(en_j)
            else: kutu.append(sonraki_id); sonraki_id += 1
        onceki = b
        frames.append({"t": round(n / src_fps, 3), "b": b})
        if len(frames) % 20 == 0: print(f"  {len(frames)} örnek, son karede {len(b)} nesne", flush=True)
    n += 1
json.dump({"w": W, "h": H, "fps": round(src_fps / adim, 3), "frames": frames}, open(a.cikis, "w"), separators=(",", ":"))
top = max((len(f["b"]) for f in frames), default=0)
kisi = max((sum(1 for k in f["b"] if k[4] == 0) for f in frames), default=0)
print(f"{os.path.basename(a.giris)}: {len(frames)} örnek, tepe {top} nesne / {kisi} kişi -> {a.cikis} ({os.path.getsize(a.cikis)//1024} KB)")
