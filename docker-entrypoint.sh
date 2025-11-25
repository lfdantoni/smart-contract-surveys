#!/bin/sh
set -e
ENV_PREFIX=${ENV_PREFIX:-APP_}
PUBLIC_DIR=/usr/share/nginx/html
ENV_FILE="$PUBLIC_DIR/env.js"

echo "[entrypoint] Generating runtime env vars with prefix '$ENV_PREFIX' into $ENV_FILE"

{
  echo "window.__ENV__ = {";
  # Collect prefixed env vars
  matched=false
  env | grep "^${ENV_PREFIX}" | while IFS='=' read -r line; do
    key=${line%%=*}
    value=${line#*=}
    # Escape quotes
    esc=$(printf '%s' "$value" | sed 's/"/\\"/g')
    jsonKey=${key#${ENV_PREFIX}}
    matched=true
    echo "  \"${jsonKey}\": \"${esc}\",";
  done
  echo "};";
} > "$ENV_FILE"

# Optional notice if no variables matched
if [ ! -s "$ENV_FILE" ]; then
  echo "window.__ENV__ = {};" > "$ENV_FILE"
fi

# Start Nginx
exec nginx -g 'daemon off;'
