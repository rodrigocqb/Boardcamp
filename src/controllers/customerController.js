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

async function createCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const validation = customerSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((v) => v.message);
    return res.status(400).send(errors);
  }
  try {
    const customer = (
      await connection.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf])
    ).rows[0];
    if (customer) {
      return res.status(409).send({ error: "Customer already exists" });
    }
    await connection.query(
      `INSERT INTO customers (name, phone, cpf, birthday) 
    VALUES ($1, $2, $3, $4)`,
      [name, phone, cpf, birthday]
    );
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export { getCustomers, getCustomer, createCustomer };
