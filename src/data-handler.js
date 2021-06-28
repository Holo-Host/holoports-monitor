const { getDb } = require('./database')

module.exports.getCollection = async (name) => {
  db = await getDb()
  return await db.collection(name);
}