const express = require("express");
const {
  getAllUsers,
  getUserByPassport,
  createUser,
  depositMoney,
  withdrawMoney,
  transferMoney,
  updateCredit,
  changeActiveStatus,
  filterWithQuery,
  filterWithParams,
} = require("./utils");

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

// activate/deactivate a user
app.put("/api/account/:passport/status", async (req, res) => {
  try {
    const user = await changeActiveStatus(req.params.passport, req.body.status);
    res.status(200).send({ ...user });
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

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
app.put("/api/account/:passport/credit", async (req, res) => {
  try {
    const user = await updateCredit(req.params.passport, req.body.credit);
    res.status(200).send({ ...user });
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// withdraw money
app.put("/api/account/:passport/withdraw", async (req, res) => {
  try {
    const user = await withdrawMoney(req.params.passport, req.body.amount);
    res.status(200).send({ ...user });
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// transfer money
app.put("/api/account/transfer/:from/:to", async (req, res) => {
  try {
    const users = await transferMoney(req.params.to, req.params.from, req.body.amount);
    res.status(200).send(users);
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// filter with query
app.get("/api/filter/query", async (req, res) => {
  try {
    const { query, ...fields } = req.query;
    const users = await filterWithQuery(query, fields);
    res.status(200).send(users);
  } catch (error) {
    res.status(error.code).send({ message: error.message });
  }
});

// filter with params
app.get("/api/filter/params", async (req, res) => {
  try {
    const users = await filterWithParams(req.query);
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(error.code).send({ message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("listening on port 3000..."));
