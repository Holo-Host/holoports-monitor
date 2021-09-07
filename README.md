# test-holoports-monitor
Script for monitoring status of holoports connected to zerotier network `93afae5963c547f1`.

Reads list of holoports from `host_statistics.performance_summary` collection of mongoDB and stores status call outcome in `host_statistics.holoports_status`:

```json
{
  name: <string>,
  IP: <string>,
  timestamp: <timestamp>,
  sshSuccess: <string>,
  holoNetwork: <string>,
  channel: <string>,
  hostingInfo: <integer>,
  holoportModel: <strig>,
  error: <Error>
}
```

usage:

`node dist/getStatus.js --config-path config.json --ssh-key-path id_ed25519`

where `config.json` contains access credentials to mongoDB cluster and `id_ed25519` is an ssh key authorized to access holoports.
