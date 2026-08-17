import { ApiError } from "../utils/ApiError.js";

// Wraps a Zod schema so route handlers stay declarative:
//   router.post("/", validate(createProductSchema), createProduct)
// Validated + coerced data replaces req.body so controllers never re-parse.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw ApiError.unprocessable("Validation failed", errors);
  }
  req.body = result.data;
  next();
};

export default validate;
