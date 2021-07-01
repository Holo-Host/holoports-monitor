const exec = require('child_process').exec

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

module.exports.getAllPingResults = async (holoports) => {
  // Convert array of holoports into array of promisses each resolving to ping-result-object
  return await Promise.all(holoports.map((hp) => runExec(hp)))
}

const runExec = async (holoport) => {
  if (!argv.sshKeyPath)
    throw new Error('hosted-happ-monitor requires --ssh-key-path option.')

  const command = `ssh root@${holoport.IP} -i ${argv.sshKeyPath} nixos-option system.holoNetwork | sed -n '2 p' | tr -d \\"`

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
