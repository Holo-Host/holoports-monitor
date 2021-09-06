# test-holoports-monitor
Script for monitoring status of holoports participating in `alpha-program`.

Reads list of holoports from `host_statistics.alpha-program-holoports` collection of mongoDB and stores status call outcome in `host_statistics.test_holoports_status`:

```json
{
  name: <string>,
  IP: <string>,
  timestamp: <timestamp>,
  sshSuccess: <string>,
  holoNetwork: <string>,
  channel: <string>,
  totalHostedSC: <integer>,
  model: <strig>
}
```

usage:

`node dist/pingCheck.js --config-path config.json --ssh-key-path id_ed25519`

where `config.json` contains access credentials to mongoDB cluster and `id_ed25519` is an ssh key authorized to access holoports.
