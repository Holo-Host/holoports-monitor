#! /usr/bin/env bash
# Ssh into holoport and query for parameters
# If successfull echo string in format: "holoNetwork channel totalHostedSC holoportModel"
#
# Usage:
# ./get-status.sh <hp-zt-ip-address> <ssh-key-path>

set -e

ssh -o StrictHostKeychecking=no -o LogLevel=ERROR root@$1 -i $2 bash <<EOF
  network=\$(nixos-option system.holoNetwork 2>/dev/null | sed -n '2 p' | tr -d \")
  # if system.holoNetwork is not set then it has to be default network (alphaNet)
  if [[ -z "\$network" ]]; then
    network="alphaNet"
  fi

  channel=\$(nix-channel --list | cut -d '/' -f 7)
  if [[ -z "\$channel" ]]; then
    channel="?"
  fi

  model=\$(nixos-option system.hpos.target 2>/dev/null | sed -n '2 p' | tr -d \")
  if [[ -z "\$model" ]]; then
    model="?"
  fi

  sc=\$(hpos-holochain-client --url=http://localhost/holochain-api dashboard 1 1)
  # exclude errors etc
  re='totalSourceChains'
  if ! [[ \$sc =~ \$re ]] ; then
    sc="?"
  fi

  echo "\$network \$channel \$model \$sc"
EOF
