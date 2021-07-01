const exec = require('child_process').exec

module.exports.getAllPingResults = async (holoports) => {
  let arr = []
  // Convert array of holoports into array of promisses each resolving to ping-result-object
  for (const holoport of holoports) {
    arr.push(runExec(holoport))
  }

  return await Promise.all(arr)
}

const runExec = async (holoport) => {
  const command = `ssh root@${holoport.IP} -i ~/.ssh/id_ed25519 nixos-option system.holoNetwork | sed -n '2 p' | tr -d \\"`

  return new Promise(function(resolve, reject) {
    exec(command, { timeout: 4000 }, (error, stdout, stderr) => {

      let outcome = null

      if (!error) outcome = stdout.trim()

      resolve({
        name: holoport.name,
        IP: holoport.IP,
        timestamp: Date.now(),
        success: (outcome != null),
        holoNet: outcome
      });
    });
  });
}