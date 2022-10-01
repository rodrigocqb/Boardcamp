import dayjs from "dayjs";
import connection from "../database/database.js";
import rentalSchema from "../schemas/rentalSchema.js";

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
        await connection.query(
          `SELECT id, name FROM customers WHERE id = $1;`,
          [rental.customerId]
        )
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

async function createRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const validation = rentalSchema.validate(req.body, { abortEarly: false });
  try {
    const customer = (
      await connection.query(`SELECT * FROM customers WHERE id = $1;`, [
        customerId,
      ])
    ).rows[0];
    const game = (
      await connection.query(`SELECT * FROM games WHERE id = $1;`, [gameId])
    ).rows[0];
    const gameRentals = (
      await connection.query(
        `SELECT * FROM rentals WHERE "returnDate" = null AND "gameId" = $1;`,
        [gameId]
      )
    ).rows.length;

    if (
      validation.error ||
      !customer ||
      !game ||
      (game !== undefined && game.stockTotal === gameRentals)
    ) {
      let errors = [];
      if (validation.error) {
        errors = validation.error.details.map((v) => v.message);
      }
      if (!customer) {
        errors.push({ error: "Selected customer does not exist" });
      }
      if (!game) {
        errors.push({ error: "Selected game does not exist" });
      }
      if (game !== undefined && game.stockTotal === gameRentals) {
        errors.push({ error: "All units of this game are already rented" });
      }
      return res.status(400).send(errors);
    }

    await connection.query(
      `INSERT INTO rentals 
    ("customerId", "gameId", "rentDate", "daysRented", 
    "returnDate", "originalPrice", "delayFee")
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        customerId,
        gameId,
        dayjs().format("YYYY-MM-DD"),
        daysRented,
        null,
        game.pricePerDay * daysRented,
        null,
      ]
    );
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export { getRentals, createRental };
