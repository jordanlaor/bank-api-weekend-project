const fs = require("fs").promises;

const USERS_JSON = `${__dirname}/bank.json`;

// get all users
const getAllUsers = async () => {
  try {
    const users = await fs.readFile(USERS_JSON, "utf-8");
    return users || JSON.stringify([]);
  } catch (error) {
    throw { message: error.code, code: error.code || 500 };
  }
};

// get user by passport
const getUserByPassport = async (passport) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const user = users.find((user) => String(user.passport) === String(passport));
    if (user) return user;
    throw { message: "no such user was found", code: 404 };
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// add a user
const createUser = async ({ passport, isActive = true, credit = 0, cash = 0 }) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  credit = Number(credit);
  if (Number.isNaN(credit) || credit < 0) throw { message: `credit needs to be a number greater than or equal to zero`, code: 406 };
  cash = Number(cash);
  if (Number.isNaN(cash) || cash < -credit) throw { message: `cash needs to be a number and cant be lower than your credit`, code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    if (users.find((user) => String(user.passport) === String(passport))) {
      console.log("duplicate");
      throw { message: `user with passport id ${passport} already exist, can't have duplicates`, code: 400 };
    }
    const user = { passport, isActive: Boolean(isActive), credit, cash };
    users.push(user);
    try {
      await fs.writeFile(USERS_JSON, JSON.stringify(users));
      return user;
    } catch (error) {
      throw { message: error.message, code: 500 };
    }
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// deposit money
const depositMoney = async (passport, amount) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  if (!amount) throw { message: "you need to pass an amount to deposit", code: 406 };
  amount = Number(amount);
  if (Number.isNaN(amount) || amount <= 0) throw { message: `amount needs to be a positive number`, code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const user = users.find((user) => String(user.passport) === String(passport));
    if (!user) throw { message: "no such user was found", code: 404 };
    if (!user.isActive) throw { message: "user's account is not active, you can't deposit money to the account", code: 400 };
    user.cash += amount;
    try {
      await fs.writeFile(USERS_JSON, JSON.stringify(users));
      return user;
    } catch (error) {
      throw { message: error.message, code: 500 };
    }
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// withdraw money
const withdrawMoney = async (passport, amount) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  if (!amount) throw { message: "you need to pass an amount to deposit", code: 406 };
  amount = Number(amount);
  if (Number.isNaN(amount) || amount <= 0) throw { message: `amount needs to be a positive number`, code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const user = users.find((user) => String(user.passport) === String(passport));
    if (!user) throw { message: "no such user was found", code: 404 };
    if (!user.isActive) throw { message: "user's account is not active, you can't withdraw money from the account", code: 400 };

    const expectedCashLeft = user.cash - amount;
    if (expectedCashLeft < -user.credit) throw { message: "there is not enough cash in the account", code: 400 };
    user.cash = expectedCashLeft;
    try {
      await fs.writeFile(USERS_JSON, JSON.stringify(users));
      return user;
    } catch (error) {
      throw { message: error.message, code: 500 };
    }
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// transfer money
const transferMoney = async (to, from, amount) => {
  if (!to || !from) throw { message: "you need to pass a passport id for both giving and receiving accounts", code: 406 };
  if (!amount) throw { message: "you need to pass an amount to deposit", code: 406 };
  amount = Number(amount);
  if (Number.isNaN(amount) || amount <= 0) throw { message: `amount needs to be a positive number`, code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const giver = users.find((user) => String(user.passport) === String(from));
    const receiver = users.find((user) => String(user.passport) === String(to));
    if (!receiver || !giver) throw { message: "one of the passport ids is invalid", code: 404 };
    if (!receiver.isActive || !giver.isActive)
      throw { message: "one of the accounts is not active, you can't go through with the transfer", code: 400 };

    const expectedCashLeft = giver.cash - amount;
    if (expectedCashLeft < -giver.credit) throw { message: "there is not enough cash in the giving account", code: 400 };
    giver.cash = expectedCashLeft;
    receiver.cash += amount;
    try {
      await fs.writeFile(USERS_JSON, JSON.stringify(users));
      return { receiver, giver };
    } catch (error) {
      throw { message: error.message, code: 500 };
    }
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// update credit
const updateCredit = async (passport, newCredit) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  if (typeof newCredit === undefined) throw { message: "you need to pass a credit amount to update", code: 406 };
  newCredit = Number(newCredit);
  if (Number.isNaN(newCredit) || newCredit < 0) throw { message: `credit needs to be a positive number or zero`, code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const user = users.find((user) => String(user.passport) === String(passport));
    if (!user) throw { message: "no such user was found", code: 404 };
    if (!user.isActive) throw { message: "user's account is not active, you can't change it's credit", code: 400 };
    user.credit = newCredit;
    try {
      await fs.writeFile(USERS_JSON, JSON.stringify(users));
      return user;
    } catch (error) {
      throw { message: error.message, code: 500 };
    }
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// activate/deactivate
const changeActiveStatus = async (passport, status) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  if (typeof status === undefined) throw { message: "you need to pass a status", code: 406 };
  status = Boolean(status);
  try {
    const users = JSON.parse(await getAllUsers());
    const user = users.find((user) => String(user.passport) === String(passport));
    if (!user) throw { message: "no such user was found", code: 404 };
    user.isActive = status;
    try {
      await fs.writeFile(USERS_JSON, JSON.stringify(users));
      return user;
    } catch (error) {
      throw { message: error.message, code: 500 };
    }
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// filter with one query and many fields
const filterWithQuery = async (query, fields) => {
  if (typeof query === "undefined" || !fields) throw { message: "you need to pass a query and the fields to search in", code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const filterUsers = users.filter((user) => {
      for (const field in fields) {
        if (String(user[field]).includes(String(query))) return true;
      }
      return false;
    });
    console.log(filterUsers);
    if (filterUsers.length) return filterUsers;
    throw { message: "no user was found", code: 404 };
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

// filter with different field queries
const filterWithParams = async (fields) => {
  if (!fields) throw { message: "you need to pass the fields to search in", code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    let filterUsers = [...users];
    for (const field in fields) {
      filterUsers = filterUsers.filter((user) => {
        return String(user[field]).includes(String(fields[field]));
      });
    }
    if (filterUsers.length) return filterUsers;
    throw { message: "no user was found", code: 404 };
  } catch (error) {
    throw { message: error.message, code: error.code || 500 };
  }
};

module.exports = {
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
};
