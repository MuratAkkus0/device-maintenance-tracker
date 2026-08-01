// Validates req.body against a zod schema before it reaches the controller.
// On success, req.body is replaced with the parsed (coerced/trimmed) data
// so downstream code can trust its shape.
export default function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
}
