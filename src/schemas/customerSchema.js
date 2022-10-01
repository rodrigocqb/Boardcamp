import joi from "joi";
import joiDate from "@joi/date";

const customerSchema = joi.object({
  name: joi.string().required(),
  phone: joi
    .string()
    .pattern(/^[0-9]?[0-9]{10}$/)
    .required(),
  cpf: joi
    .string()
    .pattern(/^[0-9]{11}$/)
    .required(),
  birthday: joi.extend(joiDate).date().format("YYYY-MM-DD").required(),
});

export { customerSchema };
