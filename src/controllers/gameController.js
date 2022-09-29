import connection from "../database/database.js";

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

export { getGames };
