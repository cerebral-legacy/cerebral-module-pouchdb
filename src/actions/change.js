export default function (statePath) {
  const path = Array.isArray(statePath) ? statePath : [ statePath ];

  return function change({ input: { deleted, doc }, state }) {
    if (deleted) {
      state.unset([...path, doc.type, doc._id]);
    } else if (doc.type) {
      state.set([...path, doc.type, doc.id], doc);
    }
  };

};
