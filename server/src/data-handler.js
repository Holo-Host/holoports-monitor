const { getDb } = require('./database')

// I'm sorry I don't know why we keep reading args into every file...
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

if (!argv.holoports_list)
    throw new Error(`script requires --holoports-list option.`)


module.exports.getHoloports = async (holoports_list) => {
  let holoports = []

  const collection = await getCollection(holoports_list)
  const cursor = await collection.find({})

  await cursor.forEach((el) => {
    if (el.enabled) holoports.push(el.name)
  })

  return holoports
}

module.exports.getHoloportDetails = async (holoports = undefined) => {
  let holoportDetails = []

  const collection = await getCollection('performance_summary')
  let searchParams = {}
  if (!!holoports) searchParams = { name: { $in: holoports }}

  const cursor = await collection.find(searchParams)

  await cursor.forEach((el) => {
    if (!el.zt_ipaddress.includes("172.26.")) return
    holoportDetails.push({name: el.name, IP: el.zt_ipaddress})
  })

  const retrieved_hps = holoportDetails.map(a => a.name)
  if (!!holoports) console.log("Missing holoports are \n:", holoports.filter(e => !retrieved_hps.includes(e)) )

  return holoportDetails
}

module.exports.insertHolportsStatus = async (pingResults) => {
  const collection = await getCollection('holoports_status')
  const response = await collection.insertMany(pingResults)
  console.log(`Saving ${response.insertedCount} ping results in database`)
}

getCollection = async (name) => {
  db = await getDb()
  return await db.collection(name);
}
