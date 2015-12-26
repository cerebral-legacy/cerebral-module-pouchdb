import PouchDB from 'pouchdb';
import changed from './chains/changed';

export default function ({
  remoteDb = null,
  localDb,
  statePath = 'data',
  documentTypes = null
} = {}) {
  return {
    name: 'pouchdb_' + localDb,
    init(controller) {

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

      // add the local db to services
      if (!controller.services.db) {
        controller.services.db = {};
      }
      controller.services.db[localDb] = db.local;

      // register the changed signal
      controller.signal('pouchdb.' + localDb + 'Changed', changed(statePath));

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
        controller.signals.pouchdb[localDb + 'Changed'](change);
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
    }
  };
}
