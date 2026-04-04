#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# D&D Storybook – Ubuntu Server Setup
#
# Installs dependencies, builds the app, and configures
# Nginx + systemd to serve the storybook.
#
# Assumes Java 17, Node.js 22, and Nginx are already installed
# (shared with rpgdashboard). Reuses existing SSL wildcard cert.
#
# Run as a user with sudo privileges (not as root directly).
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAVA_VERSION="17"
GRADLE_VERSION="8.12"
BACKEND_PORT="8025"
HOSTNAME="dndbookshelf.swensenfamily.local"

echo "========================================="
echo "  D&D Storybook – Server Setup (Ubuntu)"
echo "========================================="
echo

# ── 1. Verify prerequisites ─────────────────────────────────

echo "[1/6] Checking prerequisites..."

if ! java -version 2>&1 | grep -q "version \"${JAVA_VERSION}"; then
  echo "  ERROR: Java ${JAVA_VERSION} not found. Install it first (or run rpgdashboard setup.sh)."
  exit 1
fi
echo "  → Java: $(java -version 2>&1 | head -1)"

if ! command -v node &>/dev/null; then
  echo "  ERROR: Node.js not found. Install it first (or run rpgdashboard setup.sh)."
  exit 1
fi
echo "  → Node: $(node -v) / npm $(npm -v)"

if ! command -v nginx &>/dev/null; then
  echo "  ERROR: Nginx not found. Install it first."
  exit 1
fi
echo "  → Nginx installed"

export JAVA_HOME="/usr/lib/jvm/java-${JAVA_VERSION}-openjdk-$(dpkg --print-architecture)"

# ── 2. Gradle wrapper ───────────────────────────────────────

echo "[2/6] Regenerating Gradle wrapper..."
GRADLE_HOME="/opt/gradle/gradle-${GRADLE_VERSION}"
if [ ! -x "${GRADLE_HOME}/bin/gradle" ]; then
  echo "  Installing Gradle ${GRADLE_VERSION}..."
  curl -fsSL "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" -o /tmp/gradle.zip
  sudo mkdir -p /opt/gradle
  sudo unzip -qo /tmp/gradle.zip -d /opt/gradle
  rm /tmp/gradle.zip
fi
export PATH="${GRADLE_HOME}/bin:${PATH}"

cd "$SCRIPT_DIR/backend"
gradle wrapper --gradle-version "${GRADLE_VERSION}"
chmod +x gradlew

# ── 3. Production config ────────────────────────────────────

echo "[3/6] Creating production config..."
PROD_CONFIG="$SCRIPT_DIR/production.yml"
if [ ! -f "$PROD_CONFIG" ]; then
  cat > "$PROD_CONFIG" <<YAML
# D&D Storybook – Production overrides
app:
  campaigns-path: ${SCRIPT_DIR}/campaigns
YAML
  echo "  → Created $PROD_CONFIG"
else
  echo "  → $PROD_CONFIG already exists, skipping"
fi

# ── 4. Build application ────────────────────────────────────

echo "[4/6] Building application..."

echo "  → Building backend..."
cd "$SCRIPT_DIR/backend"
./gradlew build -x test --no-daemon

echo "  → Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install

echo "  → Building frontend..."
npm run build

# ── 5. Configure Nginx ──────────────────────────────────────

SSL_DIR="/etc/ssl/swensenfamily"
SSL_CERT="${SSL_DIR}/cert.pem"
SSL_KEY="${SSL_DIR}/key.pem"

echo "[5/6] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/dndbookshelf > /dev/null <<EOF
# D&D Storybook – HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${HOSTNAME};

    ssl_certificate     ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    root ${SCRIPT_DIR}/frontend/dist;
    index index.html;

    # Proxy API requests to the Spring Boot backend
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Serve frontend; fall back to index.html for SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/dndbookshelf /etc/nginx/sites-enabled/dndbookshelf
sudo nginx -t

# Ensure nginx can traverse the directory tree
TRAVERSE_PATH="${SCRIPT_DIR}/frontend/dist"
while [ "$TRAVERSE_PATH" != "/" ]; do
  chmod o+x "$TRAVERSE_PATH" 2>/dev/null || sudo chmod o+x "$TRAVERSE_PATH"
  TRAVERSE_PATH="$(dirname "$TRAVERSE_PATH")"
done

# ── 6. Create systemd service ───────────────────────────────

echo "[6/6] Creating systemd service..."
BACKEND_JAR=$(ls -1 "$SCRIPT_DIR/backend/build/libs"/*.jar | grep -v plain | head -1)

sudo tee /etc/systemd/system/dndbookshelf.service > /dev/null <<EOF
[Unit]
Description=D&D Storybook Backend
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=${SCRIPT_DIR}/backend
ExecStart=${JAVA_HOME}/bin/java -jar ${BACKEND_JAR} --spring.config.additional-location=file:${PROD_CONFIG}
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload

# ── Start services ───────────────────────────────────────────

echo
echo "Starting services..."

sudo systemctl enable dndbookshelf
sudo systemctl restart dndbookshelf

echo -n "  Waiting for backend"
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${BACKEND_PORT}/api/campaigns" &>/dev/null; then
    echo " ready!"
    break
  fi
  echo -n "."
  sleep 2
done

sudo systemctl restart nginx

IP_ADDR="$(hostname -I | awk '{print $1}')"

echo
echo "========================================="
echo "  Setup complete – all services running!"
echo "========================================="
echo
echo "  Backend  →  localhost:${BACKEND_PORT} (systemd: dndbookshelf)"
echo "  Nginx    →  port 443 (HTTPS)"
echo
echo "Access the app:"
echo "  https://${HOSTNAME}"
echo
echo "─── DNS SETUP ──────────────────────────────────────────────"
echo
echo "  Add this to /etc/hosts on each client device:"
echo
echo "  ${IP_ADDR}    ${HOSTNAME}"
echo
echo "───────────────────────────────────────────────────────────"
echo
echo "Useful commands:"
echo "  sudo systemctl status dndbookshelf    # backend status"
echo "  sudo journalctl -u dndbookshelf -f    # tail backend logs"
echo "  sudo systemctl restart dndbookshelf   # restart backend"
echo
