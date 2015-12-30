import PouchDB from 'pouchdb';
import changed from './signals/changed';

export default function ({
  remoteDb = null,
  localDb,
  statePath = 'data',
  documentTypes = null
} = {}) {
  return {
    init({ signals }) {

      // PouchDB.debug.enable('*')
      // PouchDB.debug.disable('*')

      // create the databases
      const db = {};
      if (process.env.NODE_ENV === 'test') {
        db.local = new PouchDB(localDb, { db: require('memdown') });
      } else {
        db.local = new PouchDB(localDb);
        if (remoteDb) {
          db.remote = new PouchDB(remoteDb);
        }
      }

      // get all local docs
      db.local.changes({
        since: 0,
        live: true,
        include_docs: true
      }).on('change', function (change) {
        if (!change.doc.type) {
          console.error('document type missing', change.doc);
          return;
        }
        if (Array.isArray(documentTypes) && !documentTypes.includes(change.doc.type)) {
          return;
        }
        signals.changed(change);
      }).on('error', function (err) {
        console.error(localDb + ' db error', err);
      });

      // setup sync
      if (db.remote) {
        db.local.sync(db.remote, {
          live: true,
          retry: true
        }).on('error', function (err) {
          console.error('db replication error', err);
        });
      }

      return {
        services: db.local
      };
    },
    signals: {
      changed: changed(statePath)
    },
    services: {}
  };
}
