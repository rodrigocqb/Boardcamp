import connection from "../database/database.js";

async function isCustomerRegistered(req, res, next) {
  const { id } = req.params;
  try {
    const customer = (
      await connection.query(`SELECT * FROM customers WHERE id = $1;`, [id])
    ).rows[0];
    if (!customer) {
      return res.status(404).send({ error: "Customer not found" });
    }
    res.locals.customer = customer;
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export default isCustomerRegistered;
