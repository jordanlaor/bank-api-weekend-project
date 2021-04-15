const fs = require("fs").promises;
const express = require("express");
const {} = require("./utils");

const app = express();
app.use(express.json());

// get all users
app.get("/api/users", async (req, res) => {});

// add a user
app.post("/api/users", async (req, res) => {});

// deposit money
// update credit
// withdraw money
// transfer money
// user by passport
// get all users

const PORT = 3000;
app.listen(PORT, () => console.log("listening on port 3000..."));
