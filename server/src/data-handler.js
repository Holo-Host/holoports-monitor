const { getDb } = require('./database')

module.exports.getHoloportDetails = async () => {
  let holoportDetails = []

  const collection = await getCollection('performance_summary')
  const cursor = await collection.find({})

  await cursor.forEach((el) => {
    if (!el.zt_ipaddress.includes("172.26.")) return
    holoportDetails.push({name: el.name, IP: el.zt_ipaddress})
  })

  return holoportDetails
}

getCollection = async (name) => {
  db = await getDb()
  return await db.collection(name);
}
