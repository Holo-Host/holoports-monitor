const exec = require('child_process').exec

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

// Set one timestamp for all the calls
const timestamp = Date.now()

/**
 * Execute ssh command in an async way on multiple holoports
 * @param  {Array} holoports List of holoports in a format { IP, name }
 * @return {Array} Array of results of executed commands in format
 *         { status:"fulfilled", value: <Object> } or { status:"rejected", reason: <Object> }
 */
module.exports.execSshCommand = async (holoports) => {
  // Check if ssh key path was passed to script
  if (!argv.sshKeyPath)
    throw new Error(`script requires --ssh-key-path option.`)

  // Convert array of holoports into array of promises each resolving to ping-result-object
  return await Promise.allSettled(holoports.map((hp) => getStatus(hp)))

/**
 * Gets status of holoports by executing an ssh command remotely.
 * In case of a failure to execute returns the reason of a failure reported by bash.
 * @param {*} hp holoport data in a format { IP, name }
 * @return {Promise} resolves to an object describing status of the holoport
 */
const getStatus = async (hp) => {
  // Note on timeouts: get-status.sh has 30s ssh timeout encoded. Make sure exec timeout here is set to more than 30s
  // Note on cwd: required for paths to work as expected in systemd service env
  return new Promise(function(resolve, reject) {
    exec(`./scripts/get-status.sh ${hp.IP} ${argv.sshKeyPath}`, { timeout: 60000, cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        reject(
          {
            name: hp.name,
            IP: hp.IP,
            error: stderr
          }
        )
      } else {
        // parse stdout to get details
        // const outcome = stdout.split(" ");
        resolve({
          name: hp.name,
          IP: hp.IP,
          outcome: outcome
        })
      }
    })
  })
}
