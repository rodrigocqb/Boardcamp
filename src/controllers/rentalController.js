import dayjs from "dayjs";
import connection from "../database/database.js";
import rentalSchema from "../schemas/rentalSchema.js";
import joi from "joi";
import joiDate from "@joi/date";

async function getRentals(req, res) {
  const { customerId, gameId, limit, status } = req.query;
  let { offset, order, desc, startDate } = req.query;
  if (!offset) {
    offset = 0;
  }
  if (
    !order ||
    (order !== "id" &&
      order !== "customerId" &&
      order !== "gameId" &&
      order !== "rentDate" &&
      order !== "daysRented" &&
      order !== "returnDate" &&
      order !== "originalPrice" &&
      order !== "delayFee")
  ) {
    order = "id";
  }
  if (desc === "true") {
    desc = "DESC";
  } else {
    desc = "ASC";
  }
  const dateValidation = joi
    .extend(joiDate)
    .date()
    .format("YYYY-MM-DD")
    .validate(startDate);
  if (dateValidation.error) {
    console.log(startDate);
    startDate = undefined;
  }
  try {
    if (customerId && !gameId) {
      const rentals = (
        await connection.query(
          `SELECT rentals.*, 
          json_build_object('id', customers.id, 'name', customers.name) AS customer,
          json_build_object('id', games.id, 'name', games.name, 
          'categoryId', games."categoryId", 'categoryName', categories.name) AS game
          FROM rentals JOIN customers ON rentals."customerId" = customers.id
          JOIN games ON rentals."gameId" = games.id
          JOIN categories ON games."categoryId" = categories.id
          WHERE rentals."customerId" = $1 
          ${
            status === "closed" || status === "open"
              ? status === "open"
                ? 'AND rentals."returnDate" IS NULL'
                : 'AND rentals."returnDate" IS NOT NULL'
              : ""
          }
          ${startDate ? `AND rentals."rentDate" >= '${startDate}'` : ""}
          ORDER BY "${order}" ${desc}
          ${Number(limit) > 0 ? `LIMIT ${limit}` : ""} OFFSET $2;`,
          [customerId, offset]
        )
      ).rows;
      return res.status(200).send(rentals);
    } else if (!customerId && gameId) {
      const rentals = (
        await connection.query(
          `SELECT rentals.*, 
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 
        'categoryId', games."categoryId", 'categoryName', categories.name) AS game
        FROM rentals JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id
        JOIN categories ON games."categoryId" = categories.id
        WHERE rentals."gameId" = $1
        ${
          status === "closed" || status === "open"
            ? status === "open"
              ? 'AND rentals."returnDate" IS NULL'
              : 'AND rentals."returnDate" IS NOT NULL'
            : ""
        }
        ${startDate ? `AND rentals."rentDate" >= '${startDate}'` : ""}
        ORDER BY "${order}" ${desc}
        ${Number(limit) > 0 ? `LIMIT ${limit}` : ""} OFFSET $2;`,
          [gameId, offset]
        )
      ).rows;
      return res.status(200).send(rentals);
    } else if (customerId && gameId) {
      const rentals = (
        await connection.query(
          `SELECT rentals.*, 
          json_build_object('id', customers.id, 'name', customers.name) AS customer,
          json_build_object('id', games.id, 'name', games.name, 
          'categoryId', games."categoryId", 'categoryName', categories.name) AS game
          FROM rentals JOIN customers ON rentals."customerId" = customers.id
          JOIN games ON rentals."gameId" = games.id
          JOIN categories ON games."categoryId" = categories.id
          WHERE rentals."customerId" = $1 AND rentals."gameId" = $2
          ${
            status === "closed" || status === "open"
              ? status === "open"
                ? 'AND rentals."returnDate" IS NULL'
                : 'AND rentals."returnDate" IS NOT NULL'
              : ""
          }
          ${startDate ? `AND rentals."rentDate" >= '${startDate}'` : ""}
          ORDER BY "${order}" ${desc}
          ${Number(limit) > 0 ? `LIMIT ${limit}` : ""} OFFSET $3;`,
          [customerId, gameId, offset]
        )
      ).rows;
      return res.status(200).send(rentals);
    } else {
      const rentals = (
        await connection.query(
          `SELECT rentals.*, 
      json_build_object('id', customers.id, 'name', customers.name) AS customer,
      json_build_object('id', games.id, 'name', games.name, 
      'categoryId', games."categoryId", 'categoryName', categories.name) AS game
      FROM rentals JOIN customers ON rentals."customerId" = customers.id
      JOIN games ON rentals."gameId" = games.id
      JOIN categories ON games."categoryId" = categories.id
      ${
        status === "closed" || status === "open"
          ? status === "open"
            ? 'WHERE rentals."returnDate" IS NULL'
            : 'WHERE rentals."returnDate" IS NOT NULL'
          : ""
      }
      ${
        startDate
          ? status === "closed" || status === "open"
            ? `AND rentals."rentDate" >= '${startDate}'`
            : `WHERE rentals."rentDate" >= '${startDate}'`
          : ""
      }
      ORDER BY "${order}" ${desc}
      ${Number(limit) > 0 ? `LIMIT ${limit}` : ""} OFFSET $1;`,
          [offset]
        )
      ).rows;
      return res.status(200).send(rentals);
    }
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

async function endRental(req, res) {
  const { id } = req.params;
  try {
    const rental = res.locals.rental;
    if (rental.returnDate) {
      return res
        .status(400)
        .send({ error: "Rental has already been finished" });
    }
    const today = dayjs();
    const dateDifference = today.diff(rental.rentDate, "day");
    console.log(dateDifference);
    let delayFee = 0;
    if (dateDifference > rental.daysRented) {
      delayFee =
        (dateDifference - rental.daysRented) *
        (rental.originalPrice / rental.daysRented);
    }
    await connection.query(
      `UPDATE rentals 
    SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3`,
      [dayjs(today).format("YYYY-MM-DD"), delayFee, id]
    );
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function deleteRental(req, res) {
  const { id } = req.params;
  const rental = res.locals.rental;
  if (rental.returnDate === null) {
    return res.status(400).send({ error: "Rental is not yet finished" });
  }
  try {
    await connection.query("DELETE FROM rentals WHERE id = $1", [id]);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function getMetrics(req, res) {
  let { startDate, endDate } = req.query;
  const startDateValidation = joi
    .extend(joiDate)
    .date()
    .format("YYYY-MM-DD")
    .validate(startDate);
  if (startDateValidation.error) {
    console.log(startDate);
    startDate = undefined;
  }
  const endDateValidation = joi
    .extend(joiDate)
    .date()
    .format("YYYY-MM-DD")
    .validate(endDate);
  if (endDateValidation.error) {
    console.log(startDate);
    endDate = undefined;
  }
  try {
    const metrics = (
      await connection.query(`SELECT (SUM("originalPrice")+
      (SELECT SUM("delayFee") FROM rentals WHERE "delayFee" IS NOT NULL)) AS revenue,
    COUNT(*) AS rentals, 
    ROUND((AVG("originalPrice") + 
    (SELECT AVG("delayFee") FROM rentals WHERE "delayFee" IS NOT NULL))) as average FROM rentals
    ${startDate ? `WHERE "rentDate" >= '${startDate}'` : ""}
    ${
      endDate
        ? startDate
          ? `AND "rentDate" <= '${endDate}'`
          : `WHERE "rentDate" <= '${endDate}'`
        : ""
    };`)
    ).rows[0];
    res.status(200).send(metrics);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export { getRentals, createRental, endRental, deleteRental, getMetrics };
