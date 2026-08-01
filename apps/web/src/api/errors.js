// Normalizes an axios error (or the { message, errors } shape the API's
// validate/error middleware sends) into a single human-readable string, so
// components never have to reach into error.response.data themselves.
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((issue) => issue.message).join(" ");
  }

  return data.message || fallback;
}

export function getStatus(error) {
  return error?.response?.status;
}
