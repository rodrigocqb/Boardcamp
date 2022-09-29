import joi from "joi";

const gameSchema = joi.object({
  name: joi.string().required(),
  image: joi.string().uri().required(),
  stockTotal: joi.number().integer().positive().required(),
  categoryId: joi.number().required(),
  pricePerDay: joi.number().positive().required(),
});

export { gameSchema };
