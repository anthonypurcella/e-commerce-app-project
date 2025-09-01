import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
const app = express();
const port = 3000;
import * as db from "../db/index.js";
import idExists from "./middleware/idExists.js";
import baseURLExtract from "../utils/baseURLExtract.js";

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM users");
    res.status(200).send(response.rows);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/products", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM products");
    const data = response.rows;
    console.log(data);
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/products/:id", baseURLExtract, idExists, async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM products WHERE id = $1", [
      req.params.id,
    ]);
    res.status(200).send(response.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/users/username/:username", async (req, res) => {
  try {
    const response = await db.query(
      "SELECT * FROM users WHERE user_name = $1",
      [req.params.username]
    );
    res.status(200).send(response.rows);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

app.get("/users/id/:id", baseURLExtract, idExists, async (req, res) => {
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

app.put("/products/:id", baseURLExtract, idExists, async (req, res) => {
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

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const usernameResponse = await db.query(
      "SELECT * FROM users WHERE user_name = $1",
      [username]
    );
    if (usernameResponse.rows[0]) {
      const passwordCompare = await bcrypt.compare(
        password,
        usernameResponse.rows[0].password_hash
      );
      if (passwordCompare) {
        res.status(200).send("Password Match!");
        console.log("Successful login!");
      } else {
        res.status(404).send("Password incorrect");
        console.log("Password incorrect");
      }
    } else {
      res.status(400).send("Username not found");
      console.log("Username not found");
    }
  } catch (err) {
    res.status(500).send("Server error");
    console.error(err);
  }
});

app.post("/users", async (req, res) => {
  const { first_name, last_name, email, user_name, password_hash } = req.body;

  if (first_name && last_name && email && user_name && password_hash) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password_hash, salt);

    try {
      const response = await db.query(
        "INSERT INTO users (first_name, last_name, email, user_name, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [first_name, last_name, email, user_name, passwordHash]
      );
      res.status(201).json({ message: "User created", user: response.rows[0] });
      console.log(response.rows);
    } catch (err) {
      res.send(err.message);
    }
  } else {
    res.status(400).send("Bad request");
  }
});

app.post("/products", async (req, res) => {
  const { productName, productPrice, productQuantity, productDescription } =
    req.body;

  try {
    const response = await db.query(
      "INSERT INTO products (product_name, product_price, product_quantity, product_description) VALUES ($1, $2, $3, $4) RETURNING *",
      [productName, productPrice, productQuantity, productDescription]
    );
    const data = response.rows;
    res.status(201).send("Product Created: " + data);
  } catch (err) {
    res.status(500).send(err.message);
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

app.delete("/products/:id", baseURLExtract, idExists, async (req, res) => {
  try {
    const response = await db.query("DELETE FROM products WHERE id = $1", [
      req.params.id,
    ]);
    res.status(200).send(`Product ${req.params.id} deleted`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
