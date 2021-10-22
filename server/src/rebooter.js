const { getHoloports, getHoloportDetails } = require('./data-handler')
const { execSshCommand } = require('./ping-utils')
const { closeDb } = require('./database')

async function run() {
  // Get all holoports registered for testing
  const targetHoloports = await getHoloports()

  // Get their (and only their) {IP, name} from latest_zt_snap
  const holoportDetails = await getHoloportDetails(targetHoloports)

  // Then loop through IPs and ssh-ping and record outcome
  // in a truly async style
  let rebootResults = await execSshCommand(holoportDetails, 'rebootHoloports')
  const failedSwitch = rebootResults.filter(function(hp){ return !hp.success })
  console.log(`Failed to reboot ${failedSwitch.length} holoports`)
  console.log("Failed holoports are: \n", failedSwitch)
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
