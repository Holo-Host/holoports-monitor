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
  let channelSwitchResults = await execSshCommand(holoportDetails, 'switchChannel')

  // Format data
  channelSwitchResults = channelSwitchResults.map( el => {
    if (el.status === "rejected")
      return el.reason
    else if (el.status === "fulfilled")
      return el.value
    else
      return null
  })

  // const failedSwitch = channelSwitchResults.filter(function(el){ return !el.success })
  console.log(`Failed to switch ${channelSwitchResults.length} holoports to channel`)
  console.log("Unswitched holoports are: \n", channelSwitchResults)
  // await disableUnswitchedHoloports(failedSwitch)
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
