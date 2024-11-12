export function formatErrors(errors) {
  const formattedErrors = {};
  errors.array().forEach((error) => {
    formattedErrors[error.path] = error.msg;
  });
  return formattedErrors;
}
