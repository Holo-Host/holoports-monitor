const { getCollection } = require('./data-handler')
const { closeDb } = require('./database')

async function run() {
  // Get all holoports registered for testing
  // TODO - create collection

  // Get their (and only their) details from latest_zt_snap
  // TODO - how to filter collection.find() using an array of items?

  // Then filter out stale or incorrect entries
  // TODO - why is data duplicated and what is invalid data?

  // Then ssh-ping and record outcome
  // TODO - in a truly async style

  // Then upload entries into appropriate collection
  // TODO - create collection [name, IP, timestamp, ssh-outcome, HoloNet]

  // *** Tinkering ***
  const collection = await getCollection('latest_zt_snap')

  console.log(`Collection count: ${await collection.countDocuments()}`)

  const cursor = await collection.find({})

  await cursor.forEach((el) => {
    // First we need to filter out stale or unimportant data
    // console.log(el.description)

    // Then ssh-ping each node

  })
  // *** end Tinkering ***
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
