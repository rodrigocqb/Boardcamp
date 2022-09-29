import connection from "../database/database.js";
import { categorySchema } from "../schemas/categorySchema.js";

async function getCategories(req, res) {
  try {
    const categories = await connection.query("SELECT * FROM categories;");
    res.status(200).send(categories.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function createCategory(req, res) {
  const { name } = req.body;
  const validation = categorySchema.validate(req.body);
  if (validation.error) {
    const error = validation.error.details[0].message;
    return res.status(400).send(error);
  }
  try {
    const exists = await connection.query(
      "SELECT * FROM categories WHERE name = $1;",
      [name]
    );
    if (exists.rows[0]) {
      return res.status(409).send({ error: "Category already exists" });
    }
    await connection.query("INSERT INTO categories (name) VALUES ($1);", [
      name,
    ]);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export { getCategories, createCategory };
