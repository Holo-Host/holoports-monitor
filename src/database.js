const fs = require('fs')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const { MongoClient } = require('mongodb')

let db

async function getDb() {
  if (db) return db // return existing db connection if exists

  if (!argv.configPath)
    throw new Error('hosted-happ-monitor requires --config-path option.')

  let data = fs.readFileSync(`${argv.configPath}`)
  let credentials = await JSON.parse(data)
  const username = credentials.MONGO_USERNAME
  const password = credentials.MONGO_PASSWORD
  const dbName = credentials.MONGO_DBNAME

  // Connection URL
  const url = `mongodb+srv://${username}:${password}@cluster0.hjwna.mongodb.net/${dbName}?retryWrites=true&w=majority`

  // Open db connection and store it in global db (instanton pattern)
  console.log('Connecting to db...');
  const client = new MongoClient(url)
  await client.connect()
  db = client.db(dbName)
  return db
}



module.exports.getCollections = async () => {
  db = await getDb()
  return await db.listCollections().toArray();
}

