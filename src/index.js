const { getTestHoloports } = require('./data-handler')
const { getAllPingResults } = require('./ping-utils')
const { closeDb } = require('./database')

async function run() {
  // Get all holoports registered for testing
  // TODO - create collection in mongodb and populate with test values
  const testHoloports = await getTestHoloports()
  console.log(testHoloports.length)

  // Get their (and only their) {IP, name} from latest_zt_snap
  // TODO - how to filter collection.find() using an array of items?

  // Then filter out stale or incorrect entries
  // TODO - why is data duplicated and what is invalid data?

  const holoports = [
    { name: "abba1", IP: "172.26.29.51" },
    { name: "abba2", IP: "172.26.29.50" }
  ]

  // Then loop through IPs and ssh-ping and record outcome
  // in a truly async style
  let pingResults = await getAllPingResults(holoports)

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
