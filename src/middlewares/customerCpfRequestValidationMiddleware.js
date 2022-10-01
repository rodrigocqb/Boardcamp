import connection from "../database/database.js";

async function isCpfRegistered(req, res, next) {
  const { cpf } = req.body;
  try {
    if (req.params.id !== undefined) {
      const customerCpf = res.locals.customer.cpf;
      if (customerCpf === cpf) {
        return next();
      }
    }
    const customer = (
      await connection.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf])
    ).rows[0];
    if (customer) {
      return res
        .status(409)
        .send({ error: "A customer with that CPF already exists" });
    }
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export default isCpfRegistered;
