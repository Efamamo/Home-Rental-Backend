export function formatErrors(errors) {
  const formattedErrors = {};
  errors.array().forEach((error) => {
    formattedErrors[error.path] = error.msg;
  });
  return formattedErrors;
}

export function handleSocket(io) {
  io.on('connection', (socket) => {
    console.log('New User Connected', socket.id);
  });
}

export function compareAndOrderIds(id1, id2) {
  return id1.localeCompare(id2) <= 0 ? `${id1}-${id2}` : `${id2}-${id1}`;
}
