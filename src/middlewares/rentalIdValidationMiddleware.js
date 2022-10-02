import connection from "../database/database.js";

async function checkRental(req, res, next) {
  const { id } = req.params;
  try {
    const rental = (
      await connection.query("SELECT * FROM rentals WHERE id = $1", [id])
    ).rows[0];
    if (!rental) {
      return res.status(404).send({ error: "Rental does not exist" });
    }
    res.locals.rental = rental;
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export default checkRental;
