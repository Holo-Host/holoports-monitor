# Holoports-monitor

A set of web-based tools for monitoring status of holoports on Holo Networks. Deployed to http://network-statistics.holo.host/holoports/.

#### List of Holoports

Shows data reported by each Holoport via `netstatsd` service in form of a table with filters. Includes each holoport that reported it's status within last 24h and displays the most recent record. Under the hood queries collection `host_statistics.holoport_status`.

#### Connectivity tester

Tool for testing connection from browser to Holoport via Holo Networks: browser -> router-gateway -> zerotier-layer -> holoport.

Once started in the browser, script will query `hp-stats-api` for all the holoports on-line within last 60 min. Then script will try on each holoport to establish http connection with `https://<holoport_url>/` and to open a websocket with `wss://<holoport_url>/hosting/`. Script assumes 10s timeout.

Finally success rate is reported.
