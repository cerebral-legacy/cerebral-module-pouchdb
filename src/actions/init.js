export default function init ({ input: { statePath, rows }, state }) {
  const docs = rows.reduce((docs, row) => {
    const doc = row.doc
    if (!doc._deleted && doc.type) {
      if (!docs[doc.type]) {
        docs[doc.type] = {}
      }
      docs[doc.type][doc._id] = doc
    }
    return docs
  }, {})
  state.merge(statePath, docs)
}
