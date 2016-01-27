import PouchDB from 'pouchdb'
import pouchAuth from 'pouchdb-authentication'
import changed from './signals/changed'

PouchDB.plugin(pouchAuth)

export default ({
  rootPath = null,
  readonly = false,
  remoteDb = null,
  localDb = null,
  documentTypes = null
} = {}) => {
  return (module) => {
    module.state({})

    // register signals
    module.signals({
      changed
    })

    // PouchDB.debug.enable('*')
    // PouchDB.debug.disable('*')

    // create the databases
    const db = {}
    if (localDb) {
      db.local = new PouchDB(localDb)
    }
    if (remoteDb) {
      db.remote = new PouchDB(remoteDb, {
        skipSetup: true
      })
    }

    // get all local docs
    if (db.local) {
      const statePath = rootPath && typeof rootPath === 'string' ? rootPath.split('.') : rootPath
      const changedSignal = module.getSignals().changed
      db.local.changes({
        since: 0,
        live: true,
        include_docs: true
      }).on('change', function (change) {
        if (!change.doc.type) {
          console.error('document type missing', change.doc)
          return
        }
        if (Array.isArray(documentTypes) && !documentTypes.includes(change.doc.type)) {
          return
        }
        change.statePath = statePath
        changedSignal(change)
      }).on('error', function (err) {
        console.error(localDb + ' db error', err)
      })
    }

    // setup sync
    if (db.remote && db.local) {
      if (readonly) {
        db.remote.replicate.to(db.local, {
          live: true,
          retry: true
        }).on('error', function (err) {
          console.error('db replication error', err)
        })
      } else {
        db.local.sync(db.remote, {
          live: true,
          retry: true
        }).on('error', function (err) {
          console.error('db replication error', err)
        })
      }
    }

    // expose db via serivces
    module.services(db)
  }
}
