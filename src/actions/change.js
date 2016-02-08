export default function change ({ input: { statePath, deleted, doc }, state }) {
  if (deleted) {
    state.unset([...statePath, doc.type, doc._id])
  } else if (doc.type) {
    state.set([...statePath, doc.type, doc._id], doc)
  }
}
