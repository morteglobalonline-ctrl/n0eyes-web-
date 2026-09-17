#!/bin/bash
# n0eyes web — yerel sunucu. Çift tıkla; tarayıcı http://localhost:8090 açılır. Kapatmak için bu pencereyi kapat.
cd "$(dirname "$0")"
lsof -ti tcp:8090 | xargs kill 2>/dev/null
(sleep 1; open "http://localhost:8090") &
exec python3 -m http.server 8090
