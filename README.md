# cerebral-module-pouchdb

A cerebral module for integrating the cerebral store with one or more [pouchdb](http://pouchdb.com/).

## Install

```
npm install cerebral-module-pouchdb
```

## Usage


From your main.js

```js
// your cerebral controller
import controller from './controller'

import pouchdb form 'cerebral-module-pouchdb'
import other from './modules/other'

// configure modules
const modules = {
  db: pouchdb({
    rootPath: ['docs'],   // optional - defaults to store docs in the module state
    readonly: false,      // optional - defaults to false will not sync client to server when true
    localDb: 'myappdb',   // optional - local db will sync with state when provided
    remoteDb: 'http://localhost/db/myappdb',  // optional - syncs with remote db when provided
    documentTypes: ['user', 'invoice']        // optional - defaults to all document types
  }),
  other
}

// init the modules
controller.modules(modules)
```

All pouchdb documents will now be synchronised to the cerebral state under `/db/[type]/[id]`.
Whilst your app can now read from this location, it should not write to the state directly,
instead cerebral-module-pouchdb adds a service that your app can use from your actions:

```js
export default function save ({ input: { doc }, services: { db }, output }) {
  // save the doc
  db.local.put(doc)
    .then(res => output.success(res))
    .catch(err => output.error(err))
}
```

## Authentication

cerebral-module-pouchdb also includes [pouchdb-authentication](https://github.com/nolanlawson/pouchdb-authentication).
You can use any of the authentication methods on the remote database.

```js
export default function save ({ input: { username, password }, services: { db }, output }) {
  db.remote.login(username, password, (error, response) => {
    if (error) {
      output.error(error)
    } else {
      output.success(response)
    }
  })
}
```

## Contribute

Fork repo

* `npm install`
* `npm start` runs dev mode which watches for changes and auto lints, tests and builds
* `npm test` runs the tests
* `npm run lint` lints the code
* `npm run build` compiles es6 to es5
