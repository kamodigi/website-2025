#!/bin/sh
# Coolify のボリュームは root の持ち物で作られるので、権限を落とす前に pb_data の持ち主を直す
chown -R pb:pb /pb/pb_data
exec su-exec pb /pb/pocketbase "$@"
