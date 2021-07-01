const { getDb } = require('./database')

module.exports.getTestHoloports = async () => {
  let testHoloports = []

  const collection = await getCollection('test_holoports')
  const cursor = await collection.find({})

  await cursor.forEach((el) => {
    testHoloports.push(el.name)
  })

  return testHoloports
}

module.exports.getHoloportDetails = async (holoports) => {
  let holoportDetails = []

  const collection = await getCollection('latest_zt_snap')
  const cursor = await collection.find({ name: { $in: holoports } })

  await cursor.forEach((el) => {
    holoportDetails.push({name: el.name, IP: el.physicalAddress}) // TODO: this has to be zt_address
  })

  return holoportDetails
}

getCollection = async (name) => {
  db = await getDb()
  return await db.collection(name);
}
