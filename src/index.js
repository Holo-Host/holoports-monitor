const { getCollection } = require('./data-handler')
const { closeDb } = require('./database')

async function run() {
  // Get all holoports registered for testing

  // Get their (and only their) details from latest_zt_snap

  // Then filter out stale or incorrect entries

  // Then ssh-ping and record outcome

  // Then upload entries into appropriate collection

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
