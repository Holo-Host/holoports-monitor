const exec = require('child_process').exec

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

// Set one timestamp for all the calls
const timestamp = Date.now()

/**
 * Execute ssh command in an async way on multiple holoports
 * @param  {Array} holoports List of holoports in a format { IP, name }
 * @param  {String} command Name of the function to execute
 * @return {Array} Array of results of executed commands in format
 *         { status:"fulfilled", value: <Object> } or { status:"rejected", reason: <Object> }
 */
module.exports.execSshCommand = async (holoports, command) => {
  // Check if ssh key path was passed to script
  if (!argv.sshKeyPath)
    throw new Error(`script requires --ssh-key-path option.`)

  // Convert array of holoports into array of promises each resolving to ping-result-object
  if(command === 'getStatus')
    return await Promise.allSettled(holoports.map((hp) => getStatus(hp)))
  else if(command === 'switchChannel')
    return await Promise.allSettled(holoports.map((hp) => switchChannel(hp)))
  else if(command === 'rebootHoloports')
    return await Promise.allSettled(holoports.map((hp) => rebootHoloports(hp)))
  else
    throw new Error(`Unknown command: ${command}`)
}

/**
 * Gets status of holoports by executing an ssh command remotely.
 * In case of a failure to execute returns the reason of a failure reported by bash.
 * @param {*} hp holoport data in a format { IP, name }
 * @return {Promise} resolves to an object describing status of the holoport
 */
const getStatus = async (hp) => {
  // Note on timeouts: get-status.sh has 30s ssh timeout encoded. Make sure exec timeout here is set to more than 30s
  return new Promise(function(resolve, reject) {
    exec(`./scripts/get-status.sh ${hp.IP} ${argv.sshKeyPath}`, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        reject(
          {
            name: hp.name,
            IP: hp.IP,
            timestamp: timestamp,
            sshSuccess: false,
            holoNetwork: null,
            channel: null,
            hostingInfo: null,
            holoportModel: null,
            error: stderr
          }
        )
      } else {
        // parse stdout to get details
        const outcome = stdout.split(" ");
        resolve({
          name: hp.name,
            IP: hp.IP,
            timestamp: timestamp,
            sshSuccess: true,
            holoNetwork: outcome[0],
            channel: outcome[1],
            holoportModel: outcome[2],
            hostingInfo: outcome[3],
            error: null
        })
      }
    })
  })
}

const switchChannel = async (holoport) => {
  // Check if target-channel was passed to script
  if (!argv.targetChannel)
    throw new Error(`switchChannel requires --target-channel option.`)

  const command = `ssh root@${holoport.IP} -i ${argv.sshKeyPath} hpos-update ${argv.targetChannel}`

  return new Promise(function(resolve, reject) {
    exec(command, { timeout: 4000 }, (error, stdout, stderr) => {
      resolve({
        name: holoport.name,
        IP: holoport.IP,
        timestamp: Date.now(),
        success: stdout.trim() === `Switching HoloPort to channel: ${argv.targetChannel}`,
      })
    })
  })
}

// this will always error?
const rebootHoloports = async (holoport) => {
  const command = `ssh root@${holoport.IP} -i ${argv.sshKeyPath} "rm -rf /var/lib/holochain-rsm && rm -rf /var/lib/configure-holochain && reboot"`

  return new Promise(function(resolve, reject) {
    exec(command, { timeout: 4000 }, (error, stdout, stderr) => {
      resolve({
        name: holoport.name,
        IP: holoport.IP,
        timestamp: Date.now(),
        success: stderr.trim() === `Connection to ${holoport.IP} closed by remote host.`,
      })
    })
  })
}

