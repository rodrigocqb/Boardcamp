import connection from "../database/database.js";

async function isCpfRegistered(req, res, next) {
  const { cpf } = req.body;
  const customer = (
    await connection.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf])
  ).rows[0];
  if (customer) {
    return res.status(409).send({ error: "Customer already exists" });
  }
  next();
}

export default isCpfRegistered;
