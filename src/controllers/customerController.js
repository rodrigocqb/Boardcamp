import connection from "../database/database.js";

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
  try {
    const customer = res.locals.customer;
    res.status(200).send(customer);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function createCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  try {
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

async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;
  try {
    await connection.query(
      `UPDATE customers SET
    name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5`,
      [name, phone, cpf, birthday, id]
    );
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export { getCustomers, getCustomer, createCustomer, updateCustomer };
