import connection from "../database/database.js";

async function getRentals(req, res) {
  const { customerId, gameId } = req.query;
  try {
    let rentals;
    if (customerId && !gameId) {
      rentals = (
        await connection.query(
          `SELECT * FROM rentals WHERE "customerId" = $1;`,
          [customerId]
        )
      ).rows;
    } else if (!customerId && gameId) {
      rentals = (
        await connection.query(`SELECT * FROM rentals WHERE "gameId" = $1;`, [
          gameId,
        ])
      ).rows;
    } else if (customerId && gameId) {
      rentals = (
        await connection.query(
          `SELECT * FROM rentals WHERE "customerId" = $1 AND "gameId" = $2;`,
          [customerId, gameId]
        )
      ).rows;
    } else {
      rentals = (await connection.query(`SELECT * FROM rentals;`)).rows;
    }
    rentals.forEach(async (rental) => {
      rental.customer = (
        await connection.query(`SELECT id, name FROM customers WHERE id = $1`, [
          rental.customerId,
        ])
      ).rows[0];
      rental.game = (
        await connection.query(`SELECT games.id, games.name, games."categoryId", 
        categories.name AS "categoryName"
            FROM games JOIN categories 
            ON games."categoryId" = categories.id;`)
      ).rows[0];
    });
    res.status(200).send(rentals);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export { getRentals };
