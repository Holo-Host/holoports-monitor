const { getTestHoloports, getHoloportDetails, insertPingResults } = require('./data-handler')
const { execSshCommand } = require('./ping-utils')
const { closeDb } = require('./database')

async function run() {
  // Get {IP, name} of all holoports connected to zerotier
  const holoportDetails = await getHoloportDetails()

  // Then loop through IPs and check their status via ssh
  // in a truly async style
  let statuses = await execSshCommand(holoportDetails, 'getStatus')

  // Upload entries into collection holoports_status
  await insertPingResults(statuses)
}

run()
  .then(()=> {
    closeDb()
    process.exit()
  })
  .catch(e => {
      console.error(e.message)
      closeDb()
      process.exit(1);
  })
