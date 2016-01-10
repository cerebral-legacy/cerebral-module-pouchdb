export default function change ({ module, input: { deleted, doc } }) {
  if (deleted) {
    module.state.unset([doc.type, doc._id])
  } else if (doc.type) {
    module.state.set([doc.type, doc.id], doc)
  }
}
