const fs = require("fs").promises;

const USERS_JSON = `${__dirname}/bank.json`;

// update credit
// withdraw money
// transfer money

// get all users
const getAllUsers = async () => {
  try {
    const users = await fs.readFile(USERS_JSON, "utf-8");
    return users || JSON.stringify([]);
  } catch (error) {
    throw { message: error.code, code: 500 };
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
    throw { message: error.message, code: 500 };
  }
};

// add a user
const createUser = async ({ passport, isActive = true, credit = 0, cash = 0 }) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  credit = Number(credit);
  if (Number.isNaN(credit)) throw { message: `credit needs to be a number`, code: 406 };
  cash = Number(cash);
  if (Number.isNaN(cash)) throw { message: `cash needs to be a number`, code: 406 };
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
    throw { message: error.message, code: 500 };
  }
};

// deposit money
const depositMoney = async (passport, amount) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  amount = Number(amount);
  if (Number.isNaN(amount)) throw { message: `amount needs to be a number`, code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const user = users.find((user) => String(user.passport) === String(passport));
    user.cash += amount;
    try {
      await fs.writeFile(USERS_JSON, JSON.stringify(users));
      return user;
    } catch (error) {
      throw { message: error.message, code: 500 };
    }
  } catch (error) {
    throw { message: error.message, code: 500 };
  }
};

module.exports = { getAllUsers, getUserByPassport, createUser, depositMoney };
