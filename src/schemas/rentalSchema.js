import joi from "joi";

const rentalSchema = joi.object({
  customerId: joi.number().required(),
  gameId: joi.number().required(),
  daysRented: joi.number().positive().integer().required(),
});

export default rentalSchema;
