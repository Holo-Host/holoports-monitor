const { getTestHoloports, getHoloportDetails } = require('./data-handler')
const { getAllPingResults } = require('./ping-utils')
const { closeDb } = require('./database')

async function run() {
  // Get all holoports registered for testing
  const testHoloports = await getTestHoloports()

  // Get their (and only their) {IP, name} from latest_zt_snap
  const holoportDetails = await getHoloportDetails(testHoloports)

  // Then filter out stale or incorrect entries
  // TODO - why is data duplicated and what is invalid data?
  const holoportDetailsFiltered = [
    { name: "dead_one", IP: "172.26.29.51" },
    { name: "5j60okm4zt9elo8gu5u4qgh2bv3gusdo7uo48nwdb2d18wk59h", IP: "172.26.29.50" },
    { name: "rkbpxayrx3b9mrslvp26oz88rw36wzltxaklm00czl5u5mx1w", IP: "172.26.134.99"}
  ]

  // Then loop through IPs and ssh-ping and record outcome
  // in a truly async style
  let pingResults = await getAllPingResults(holoportDetailsFiltered)

  // Then upload entries into appropriate collection
  // TODO - create collection {name, IP, timestamp, success, holoNet}
  for (const el of pingResults) {
    console.log(el)
  }
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
