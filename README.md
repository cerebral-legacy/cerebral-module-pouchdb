# cerebral-pouchdb

A cerebral module for integrating the cerebral store with one or more pouch dbs.

## Install

```
npm install cerebral-pouchdb
```

## Usage


From your main.js

```js
// import your cerebral controller
import controller from './controller'

// import cerebral-pouchdb service
import pouchdb form 'cerebral-pouchdb'

// import your local modules
import home from './modules/home'
import notFound from './modules/notFound'

// prepare modules
const modules = {
  db: pouchdb({
    localDb: 'myappdb',
    remoteDb: 'http://localhost:3000/db/myappdb', // optional - syncs with remote db when provided
    documentTypes: ['user', 'invoice']            // optional - defaults to all document types
  }),
  home,
  notFound
}

// init the modules
controller.modules(modules)
```

## Contribute

Fork repo

* `npm install`
* `npm start` runs dev mode which watches for changes and auto lints, tests and builds
* `npm test` runs the tests
* `npm run lint` lints the code
* `npm run build` compiles es6 to es5
