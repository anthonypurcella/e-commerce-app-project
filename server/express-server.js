import express from "express";
const app = express();
const port = 3000;
import * as db from "../db/index.js";
import idExists from "./middleware/idExists.js";
import baseURLExtract from "../utils/baseURLExtract.js";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Currently under API testing");
});

app.get("/users", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM users");
    res.status(200).send(response.rows);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/users/:id", baseURLExtract, idExists, async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM users WHERE id = $1", [
      req.params.id,
    ]);
    res.status(200).send(response.rows);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

app.put("/users/:id", baseURLExtract, idExists, async (req, res) => {
  const queryObjectKeys = Object.keys(req.query);
  const queryObjectValues = Object.values(req.query);

  const databaseObject = await db.query(
    `SELECT * FROM ${req.resourceType} WHERE id = $1`,
    [req.params.id]
  );
  const formattedDatabaseObjectKeys = Object.keys(databaseObject.rows[0]);

  for (let i = 0; i < formattedDatabaseObjectKeys.length; i++) {
    for (let j = 0; j < queryObjectKeys.length; j++) {
      if (formattedDatabaseObjectKeys[i] === queryObjectKeys[j]) {
        try {
          const response = await db.query(
            `UPDATE ${req.resourceType} SET ${formattedDatabaseObjectKeys[i]} = $1 WHERE id = $2`,
            [queryObjectValues[j], req.params.id]
          );
        } catch (err) {
          res.send(err.message);
        }
      }
    }
  }

  res.status(200).send(`${req.resourceType} with id ${req.params.id} updated`);
});

app.post("/users", async (req, res) => {
  const { first_name, last_name, email, user_name, password_hash } = req.body;

  if (first_name && last_name && email && user_name && password_hash) {
    try {
      const response = await db.query(
        "INSERT INTO users (first_name, last_name, email, user_name, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [first_name, last_name, email, user_name, password_hash]
      );
      res.status(201).send("User created");
      console.log(response.rows);
    } catch (err) {
      res.send(err.message);
    }
  } else {
    res.status(400).send("Bad request");
  }
});

app.delete("/users/:id", baseURLExtract, idExists, async (req, res) => {
  try {
    const response = await db.query("DELETE FROM users WHERE id = $1", [
      req.params.id,
    ]);
    res.status(200).send(`User ${req.params.id} deleted`);
  } catch (err) {
    res.send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
