import * as db from "../../db/index.js";

export default async function attachCustomerById(req, res, next) {
  try {
    const response = await db.query(
      "SELECT id FROM users WHERE user_name = $1",
      [req.user.username]
    );

    if (!response.rows.length) {
      return res.status(404).send(`User with username: ${req.user.username} not found`);
    }

    req.customerId = response.rows[0].id;
    next();
  } catch (err) {
    res.status(500).send(`Server error: ${err.message}`);
  }
}
