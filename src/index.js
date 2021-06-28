const { getCollections } = require('./database')

async function run() {
  const collections = await getCollections()

  for (const collection of collections) {
    console.log(collection.name)
  }
}

run()
  .then(()=> process.exit())
  .catch(e => {
      console.error(e.message)
      process.exit(1);
  })
