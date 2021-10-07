#! /usr/bin/env bash
# Ssh into holoport and query for parameters
# If successfull echo string in format: "holoNetwork channel totalHostedSC holoportModel"
#
# Usage:
# ./get-status.sh <hp-zt-ip-address> <ssh-key-path>

set -e

ssh -o BatchMode=yes -o ConnectTimeout=30 -o LogLevel=ERROR -o StrictHostKeyChecking=no root@$1 -i $2 bash <<EOF
  # run only on holoport-plus
  model=\$(nixos-option system.hpos.target 2>/dev/null | sed -n '2 p' | tr -d \")
  if [[ "\$model" == "holoport-plus" ]]; then
    ls -al /dev/disk/by-path/pci-0000\:00\:17.0-ata-1.0
  else
    exit 1
  fi
EOF
