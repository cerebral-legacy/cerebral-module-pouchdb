export default function change ({ module, input: { statePath, deleted, doc }, state }) {
  if (statePath) {
    if (deleted) {
      state.unset([...statePath, doc.type, doc._id])
    } else if (doc.type) {
      state.set([...statePath, doc.type, doc._id], doc)
    }
  } else {
    if (deleted) {
      module.state.unset([doc.type, doc._id])
    } else if (doc.type) {
      module.state.set([doc.type, doc._id], doc)
    }
  }
}
