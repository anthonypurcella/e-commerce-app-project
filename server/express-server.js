import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = 3000;
import * as db from "../db/index.js";
import idExists from "./middleware/idExists.js";
import baseURLExtract from "../utils/baseURLExtract.js";
import { authenticateToken } from "./middleware/auth.js";
import attachCustomerById from "./middleware/attachCustomerId.js";

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(cookieParser());

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

app.get("/cart", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM cart");
    const data = response.rows;
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/orders", async (req, res) => {
  try {
    const response = await db.query('SELECT * FROM orders');
    res.status(200).send(response.rows);
  } catch (err) {
    res.status(500).send(`Server err: ${err.message}`);
  }
});

app.get("/orders/users/:id", authenticateToken, attachCustomerById, async (req, res) => {
    try {
      const response = await db.query("SELECT * FROM orders WHERE customer_id = $1", [req.customerId]);
      res.status(200).send(response.rows);
    } catch (err) {
      res.status(500).send(`Server err: ${err.message}`);
    }
});

app.get("/users/cart", authenticateToken, async (req, res) => {
  const customerId = await db.query(
    "SELECT id FROM users WHERE user_name = $1",
    [req.user.username]
  );
  const extractedCustomerId = customerId.rows[0].id;

  try {
    const response = await db.query(
      "SELECT * FROM cart WHERE customer_id = $1",
      [extractedCustomerId]
    );
    const data = response.rows;
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

app.put(
  "/cart/product/:id",
  authenticateToken,
  attachCustomerById,
  async (req, res) => {
    const { productQuantity } = req.body;

    if (productQuantity === 0) {
      try {
        const response = await db.query(
          "DELETE FROM cart WHERE product_id = $1 AND customer_id = $2",
          [req.params.id, req.customerId]
        );
        res.status(200).send("Quantity set to 0 - Product removed from cart");
      } catch (err) {
        res.status(500).send(`Server error: ${err.message}`);
      }
    }

    try {
      const response = await db.query(
        "UPDATE cart SET quantity = $1 WHERE product_id = $2 AND customer_id = $3 RETURNING *",
        [productQuantity, req.params.id, req.customerId]
      );
      const data = response.rows;
      console.log(data);
      res
        .status(200)
        .send(
          `Product ${req.params.id} updated quantity to ${productQuantity}`
        );
    } catch (err) {
      res.status(500).send(`Server error: ${err.message}`);
    }
  }
);

app.put("/orders/:id", async (req, res) => {
  const {newStatus} = req.body;

    try {
      const response = await db.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [newStatus, req.params.id]);
      res.status(200).send(response.rows);
    } catch (err) {
      res.status(500).send(`Server err: ${err.message}`);
    }
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
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        res.cookie("authToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).send("Password Match!");
        console.log("Successful login!");
        console.log(token);
      } else {
        res.status(401).send("Password incorrect");
        console.log("Password incorrect");
      }
    } else {
      res.status(401).send("Username not found");
      console.log("Username not found");
    }
  } catch (err) {
    res.status(500).send("Server error");
    console.error(err);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  console.log("Successful log out");
  res.status(200).send("Successful logout");
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

app.post("/cart", authenticateToken, attachCustomerById, async (req, res) => {
  const { productId, productQuantity } = req.body;
  try {
    const productCheck = await db.query(
      "SELECT * FROM cart WHERE product_id = $1",
      [productId]
    );

      if (!productCheck.rows.length) {
        try {
          const response = await db.query(
            "INSERT INTO cart (customer_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
            [req.customerId, productId, productQuantity]
          );
          const data = response.rows;
          res.status(201).send("Added to cart: " + data);
        } catch (err) {
          res.status(500).send(`Server error: ${err.message}`);
        }
      } else {
        try {
          const response = await db.query(
            "UPDATE cart SET quantity = quantity + $1 WHERE product_id = $2",
            [productQuantity, productId]
          );
          const data = response.rows;
          res.status(200).send("Product already in cart - Added quantity");
        } catch (err) {
          res.status(500).send(`Server error: ${err.message}`);
        }
      }
  } catch (err) {
    res.status(500).send(`Sever error: ${err.message}`);

    
  }
});

app.post("/orders", authenticateToken, attachCustomerById, async (req, res) => {
  
  let orderTotal = 0;

  try {
    const getCustomerCart = await db.query(
      "SELECT * FROM cart WHERE customer_id = $1",
      [req.customerId]
    );

    for (let i = 0; i < getCustomerCart.rows.length; i++) {
      const getProductPrice = await db.query(
        "SELECT product_price FROM products WHERE id = $1",
        [getCustomerCart.rows[i].product_id]
      );
      const productPrice = getProductPrice.rows[0].product_price;
      const productTotal = productPrice * getCustomerCart.rows[i].quantity;
      orderTotal = orderTotal + productTotal;
    }

    const response = await db.query(
      "INSERT INTO orders (customer_id, order_date, order_total, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.customerId, new Date(), Math.round(orderTotal * 100) / 100, "pending"]
    );
    console.log(response.rows);
    res.status(200).send("Order created"); 
  } catch (err) {
    res.status(500).send(`Server error: ${err.message}`);
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

app.delete(
  "/cart/product/:id",
  authenticateToken,
  attachCustomerById,
  async (req, res) => {
    try {
      const response = await db.query(
        "DELETE FROM cart WHERE product_id = $1 AND customer_id = $2",
        [req.params.id, req.customerId]
      );
      res.status(200).send("Deleted from cart");
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

app.delete("/cart", authenticateToken, attachCustomerById, async (req, res) => {
  try {
    const response = await db.query("DELETE FROM cart WHERE customer_id = $1", [
      req.customerId,
    ]);
    res.status(200).send("Deleted all items from cart");
  } catch (err) {
    res.status(500).send(`Server error: ${err.message}`);
  }
});

app.delete("/orders/:id", async (req, res) => {
    try {
      const response = await db.query("DELETE FROM orders WHERE id = $1", [req.params.id]);
      res.status(200).send(response.rows);
    } catch (err) {
      res.status(500).send(`Server err: ${err.message}`);
    }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
