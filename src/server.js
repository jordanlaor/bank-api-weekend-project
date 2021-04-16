const express = require("express");
const { getAllUsers, getUserByPassport, createUser, depositMoney } = require("./utils");

const app = express();
app.use(express.json());

// get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).send(users);
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// get user by passport
app.get("/api/users/:passport", async (req, res) => {
  try {
    const user = await getUserByPassport(req.params.passport);
    res.status(200).send({ ...user });
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// add a user
app.post("/api/users", async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).send({ ...user });
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// activate a user
app.put("/api/users/:passport/activate");

// deactivate a user
app.put("/api/users/:passport/deactivate");

// deposit money
app.put("/api/account/:passport/deposit", async (req, res) => {
  try {
    const user = await depositMoney(req.params.passport, req.body.amount);
    res.status(200).send({ ...user });
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// update credit
app.put("/api/account/:passport/credit");

// withdraw money
app.put("/api/account/:passport/withdraw");

// transfer money
app.put("/api/account/transfer/:from/:to");

const PORT = 3000;
app.listen(PORT, () => console.log("listening on port 3000..."));
