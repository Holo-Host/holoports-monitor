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
console.log(holoports)
  const collection = await getCollection('latest_zt_snap ')
  const cursor = await collection.find({"name": { $in: holoports}})

  console.log(await cursor.count())

  await cursor.forEach((el) => {
    console.log(el.physicalAddress)
    holoportDetails.push({name: el.name, IP: el.physicalAddress})
  })

  return holoportDetails
}

getCollection = async (name) => {
  db = await getDb()
  return await db.collection(name);
}
