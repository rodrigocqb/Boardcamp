import { customerSchema } from "../schemas/customerSchema.js";

function customerSchemaValidation(req, res, next) {
  const validation = customerSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((v) => v.message);
    return res.status(400).send(errors);
  }
  next();
}

export default customerSchemaValidation;
