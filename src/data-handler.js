const { getDb } = require('./database')

module.exports.getTestHoloports = async () => {
  let testHoloports = []

  const collection = await getCollection('latest_zt_snap')
  const cursor = await collection.find({})

  await cursor.forEach((el) => {
    testHoloports.push(el.name)
  })

  return testHoloports
}

getCollection = async (name) => {
  db = await getDb()
  return await db.collection(name);
}
