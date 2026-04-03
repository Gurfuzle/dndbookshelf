#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="mbswensen"
REMOTE_HOST="192.168.68.52"
REMOTE_PATH="/var/services/homes/mbswensen/rpg"
SSH_KEY="${HOME}/.ssh/id_ed25519_personal"
SSH_OPTS="-i $SSH_KEY -o IdentitiesOnly=yes"
LOCAL_CAMPAIGNS="$(cd "$(dirname "$0")" && pwd)/campaigns"

if [ ! -d "$LOCAL_CAMPAIGNS" ]; then
  echo "Error: campaigns directory not found at $LOCAL_CAMPAIGNS"
  exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
  echo "Error: SSH key not found at $SSH_KEY"
  exit 1
fi

echo "Deploying campaigns to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/campaigns/"

# Clear remote campaigns directory and push fresh copy
# -O forces legacy SCP protocol (required for Synology NAS)
ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "rm -rf ${REMOTE_PATH}/campaigns && mkdir -p ${REMOTE_PATH}/campaigns"
scp -O $SSH_OPTS -r "$LOCAL_CAMPAIGNS"/* "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/campaigns/"

echo "Done."
