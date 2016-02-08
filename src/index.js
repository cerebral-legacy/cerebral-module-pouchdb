import PouchDB from 'pouchdb'
import pouchAuth from 'pouchdb-authentication'
import changed from './chains/changed'
import init from './chains/init'

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
      changed,
      init
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
      // get all docs already stored
      const initSignal = module.getSignals().init
      db.local.allDocs({
        include_docs: true
      }, function (err, response) {
        if (err) {
          console.error('failed to get all docs', err)
          return
        }
        response.statePath = statePath
        initSignal(response)
      })
      // watch for future docs/changes
      const changedSignal = module.getSignals().changed
      db.local.changes({
        since: 'now',
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
