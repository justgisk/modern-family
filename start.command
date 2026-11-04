#!/bin/zsh
cd "$(dirname "$0")"
source ~/.nvm/nvm.sh
IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
echo "Mac:    https://localhost:5173"
echo "iPhone: https://$IP:5173  (same wifi; accept cert warning, then Allow motion)"
(sleep 2 && open https://localhost:5173) &
npm run dev
