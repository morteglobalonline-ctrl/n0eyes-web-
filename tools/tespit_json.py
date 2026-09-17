#!/usr/bin/env python3
"""Klip -> tespit JSON (site 'Canlı Akış' bölümü kutuları tarayıcıda çizer).

  ~/Desktop/n0eyes/.venv/bin/python tools/tespit_json.py giris.mp4 cikis.json [--fps 8] [--conf 0.3]

Çıktı: {"w","h","fps","frames":[{"t":sn,"b":[[x1,y1,x2,y2,cls,conf,id],...]}]}
cls: 0 insan, 1 araç (otomobil/otobüs/kamyon), 2 motosiklet/bisiklet, 3 gemi. Koordinatlar piksel (kaynak çözünürlük).
ByteTrack id'leri tarayıcıda örnekler arası yumuşak geçiş için.
"""
import argparse, json, sys, os
import cv2
from ultralytics import YOLO

ap = argparse.ArgumentParser()
ap.add_argument("giris"); ap.add_argument("cikis")
ap.add_argument("--fps", type=float, default=8)
ap.add_argument("--conf", type=float, default=0.3)
ap.add_argument("--model", default=os.path.expanduser("~/Desktop/n0eyes/yolo11n.pt"))
ap.add_argument("--imgsz", type=int, default=960)
a = ap.parse_args()

SINIF = {0: 0, 2: 1, 5: 1, 7: 1, 1: 2, 3: 2, 8: 3}   # COCO -> site sınıfı (8 boat -> 3 gemi)
cap = cv2.VideoCapture(a.giris)
src_fps = cap.get(cv2.CAP_PROP_FPS) or 30
w, h = int(cap.get(3)), int(cap.get(4))
adim = max(1, round(src_fps / a.fps))
model = YOLO(a.model)
frames, n = [], 0
while True:
    ok, fr = cap.read()
    if not ok: break
    if n % adim == 0:
        r = model.track(fr, persist=True, conf=a.conf, imgsz=a.imgsz, classes=list(SINIF), verbose=False, tracker="bytetrack.yaml")[0]
        b = []
        if r.boxes is not None and len(r.boxes):
            xyxy = r.boxes.xyxy.cpu().numpy(); cls = r.boxes.cls.cpu().numpy(); cf = r.boxes.conf.cpu().numpy()
            ids = r.boxes.id.cpu().numpy() if r.boxes.id is not None else [-1] * len(cls)
            for (x1, y1, x2, y2), c, p, i in zip(xyxy, cls, cf, ids):
                b.append([round(float(x1)), round(float(y1)), round(float(x2)), round(float(y2)), SINIF[int(c)], round(float(p), 2), int(i)])
        frames.append({"t": round(n / src_fps, 3), "b": b})
    n += 1
json.dump({"w": w, "h": h, "fps": round(src_fps / adim, 3), "frames": frames}, open(a.cikis, "w"), separators=(",", ":"))
top = max((len(f["b"]) for f in frames), default=0)
print(f"{os.path.basename(a.giris)}: {len(frames)} örnek, tepe {top} nesne -> {a.cikis} ({os.path.getsize(a.cikis)//1024} KB)")
