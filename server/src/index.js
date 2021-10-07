const { getHoloportDetails } = require('./data-handler')
const { execSshCommand } = require('./ping-utils')
const { closeDb } = require('./database')

async function run() {
  // Get {IP, name} of all holoports connected to zerotier
  const holoportDetails = await getHoloportDetails()

  // Then loop through IPs and check their status via ssh
  // in a truly async style
  let stats = await execSshCommand(holoportDetails)

  // Format data
  stats = stats.map( el => {
    if (el.status === "rejected")
      console.log(el.value.error)
      return el.reason
    else if (el.status === "fulfilled") {
      console.log(el.value.outcome)
      return el.value
    }
    else
      return null
  })

  // print results
  console.log(`Total: ${stats.length}`)
  // stats.forEach(el => console.log(el))
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
