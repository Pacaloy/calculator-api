const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");
const { v4: uuidv4 } = require('uuid');

const app = express();

dotenv.config();
const port = process.env.API_PORT;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

// Get user history
app.get("/app/user/:uid/transaction", async (req, res) => {
  try {
    const { uid } = req.params;
    const allTransactions = await pool.query(
      "SELECT * FROM transactions WHERE user_uuid = $1",
      [uid]
    )

    res.json(allTransactions.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Create a user entry
app.post("/app/user", async (req, res) => {
  try {
    const { os } = req.body;
    const newUuid = uuidv4();
    await pool.query(
      "INSERT INTO users (uuid, os) VALUES ($1, $2) RETURNING *",
      [newUuid, os]
    );

    const response = { user: { uuid: newUuid } };

    res.json(response);
  } catch (err) {
    console.error(err.message);
  }
});

// Create a calculation entry
app.post("/app/user/:uid/transaction", async (req, res) => {
  try {
    const { uid } = req.params;
    const { calculation } = req.body;
    await pool.query(
      "INSERT INTO transactions (user_uuid, calculation) VALUES ($1, $2)",
      [uid, calculation]
    );

    res.json("OK");
  } catch (err) {
    console.error(err.message);
  }
});

// Clear user history
app.delete("/app/user/:uid/transaction", async (req, res) => {
  try {
    const { uid } = req.params;
    await pool.query(
      "DELETE FROM transactions WHERE user_uuid = $1",
      [uid]
    );

    res.json("Resource Deleted");
  } catch (err) {
    console.error(err.message);
  }
});

app.get('/', (req, res) => res.send('calculator-api'));
app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});
