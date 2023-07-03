const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;
const DB_DATABASE = process.env.DB_DATABASE;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  try {
    if (token == AUTH_TOKEN) {
      next();
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const conn = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

conn.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected with the Database Successfully");
  }
});

const fetchData = (email) => {
  return new Promise((resolve, reject) => {
    finalData = {};
    conn.query("SELECT email, real_password from mdl_user", (err, results) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      for (let i = 0; i < results.length; i++) {
        if (results[i].email === email) {
          finalData.email = email;
          finalData.password = results[i].real_password;
          break;
        }
      }
      resolve(finalData);
    });
  });
};

const getUserData = async (email) => {
  try {
    const data = await fetchData(email);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

app.post("/getCredentials", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const data = await getUserData(email);
    return res.status(200).send({
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Server Started at http://localhost:${PORT}`);
});
