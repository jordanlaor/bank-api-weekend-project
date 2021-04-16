const fs = require("fs").promises;

const USERS_JSON = `${__dirname}/src/bank.json`

// add a user
// deposit money
// update credit
// withdraw money
// transfer money


// get all users
const getAllUsers = () => {
  try {
    const users = await fs.readFile(USERS_JSON, "utf-8");
    return users || JSON.stringify([]);
  } catch (error) {
    throw { message: error.code, code: 500 };
  }
};

// user by passport
const getUserByPassport = (passport) => {
  if (!passport) throw { message: "you need to pass a passport id", code: 406 };
  try {
    const users = JSON.parse(await getAllUsers());
    const user = users.find((user) => user.passport === passport);
    if (user) return user;
    throw { message: "no such user was found", code: 404 };
  } catch (error) {
    throw { message: error.message, code: 500 };
  }
}

module.exports = { getAllUsers, getUserByPassport };
