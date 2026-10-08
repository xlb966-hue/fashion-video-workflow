#!/usr/bin/env bash
set -euo pipefail
# Codespaces 在仓库根目录执行。重连时复用已启动的应用。
if node scripts/check-preview.mjs >/dev/null 2>&1; then
  echo 'Fashion Video Studio 已在 3000 端口运行。'
  exit 0
fi
nohup npm run dev > /tmp/fashion-video-studio-preview.log 2>&1 < /dev/null &
printf '已启动 Fashion Video Studio（PID %s）。在 Ports / 端口 面板打开 3000。\n' "$!"
printf '启动日志：/tmp/fashion-video-studio-preview.log\n'
