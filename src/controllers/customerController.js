import connection from "../database/database.js";
import { customerSchema } from "../schemas/customerSchema.js";

async function getCustomers(req, res) {
  const { cpf } = req.query;
  try {
    if (cpf) {
      const customers = (
        await connection.query(`SELECT * FROM customers WHERE cpf LIKE $1;`, [
          `${cpf}%`,
        ])
      ).rows;
      return res.status(200).send(customers);
    }
    const customers = (await connection.query(`SELECT * FROM customers;`)).rows;
    return res.status(200).send(customers);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function getCustomer(req, res) {
  const { id } = req.params;
  try {
    const customer = (
      await connection.query(`SELECT * FROM customers WHERE id = $1;`, [id])
    ).rows[0];
    if (!customer) {
      return res.status(404).send({ error: "Customer not found" });
    }
    res.status(200).send(customer);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function createCustomer(req, res) {}

export { getCustomers, getCustomer, createCustomer };
