const PouchDB = require('pouchdb')

const DB_URL = 'http://localhost:5984' // TODO
const BACKUP_URL = 'http://localhost:5985' // TODO

const replicatorDb = new PouchDB('_replicator')
replicatorDb.sync(`http://localhost:5984/_replicator`, {
  live: true,
  retry: true,
})

const replicateDb = async name => {
  // TODO: check if $name is already part of replication
  const all = await replicatorDb.allDocs({ include_docs: true })
  console.log(all.rows.map(row => row.doc))
  const replicationDoc = {
    _id: name.toString(),
    source: `${DB_URL}/${name}`,
    target: `${BACKUP_URL}/${name}`,
    createTarget: true,
    continuous: true, // TODO: really?
  }
  await replicatorDb.put(replicationDoc).catch(e => console.error(e))
}

replicateDb('sessions')
