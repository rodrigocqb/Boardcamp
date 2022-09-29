import connection from "../database/database.js";
import { gameSchema } from "../schemas/gameSchema.js";

async function getGames(req, res) {
  const nameQuery = req.query.name;
  try {
    if (nameQuery) {
      const games = await connection.query(
        "SELECT * FROM games WHERE LOWER (name) LIKE $1;",
        [`${nameQuery.toLowerCase()}%`]
      );
      return res.status(200).send(games.rows);
    }
    const games = await connection.query("SELECT * FROM games;");
    res.status(200).send(games.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function createGame(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  const validation = gameSchema.validate(req.body, { abortEarly: false });
  try {
    const category = await connection.query(
      "SELECT * FROM categories WHERE id = $1",
      [categoryId]
    );
    if (validation.error || !category.rows[0]) {
      let errors = [];
      if (validation.error) {
        errors = validation.error.details.map((v) => v.message);
      }
      if (!categoryId) {
        errors.push("Selected category does not exist");
      }
      return res.status(400).send(errors);
    }
    const exists = await connection.query(
      "SELECT * FROM games WHERE name = $1",
      [name]
    );
    if (exists.rows[0]) {
      return res
        .status(409)
        .send({ error: "A game with that name already exists" });
    }
    await connection.query(
      'INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);',
      [name, image, stockTotal, categoryId, pricePerDay]
    );
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export { getGames, createGame };
