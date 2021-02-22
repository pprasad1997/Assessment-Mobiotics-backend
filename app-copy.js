const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const conn = require("./connection/dbcon");
const app = express();
const port = process.env.PORT || '3000';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, PATCH, PUT, OPTIONS"
  );
  next();
});


app.post("/login/:email", async (req, res, next) => {
  try {
  console.log(req.body);
  console.log("pp");
  const query = 'SELECT * FROM users where email = ?';
  console.log("email = "+req.body.email);
  const resultData = await conn.query(query, req.params.email);
  if(resultData.length === 0){
    console.log("no email");
  }else{
    console.log("email");
  }
  next();
//   , (err, result) => {
//     if(err) throw err;
//     console.log("result = "+result);
//     res.status(200).json({
//       message: "email fetched"
//     });
//   });
} catch (err) {
  console.log(err);
  // handle errors here
}
});



// router.get('/flags/:id', async (req, res) => {

//   try {

//     const connection = await pool.createConnection();

//     try {
//       const sql = `SELECT f.id, f.width, f.height, f.code, f.filename
//                    FROM flags f
//                    WHERE f.id = ?
//                    LIMIT 1`;
//       const flags = await connection.query(sql, req.params.id);
//       if (flags.length === 0)
//         return res.status(404).send({ message: 'flag not found' });

//       return res.send();

//     } finally {
//       pool.releaseConnection(connection);
//     }

//   } catch (err) {
//     // handle errors here
//   }
// });






app.post("/register", (req, res, next) => {
  console.log()
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = {
      "name": req.body.name,
      "email": req.body.email,
      "mobile": req.body.mobile,
      "password": hash
    };
    const query = "Insert into users set ?";
    conn.query(query, user, (err, result) => {
      if(err){
        throw err;
      }
      res.status(201).json({
        message: "Data Added successfully",
        data: result
      });
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "bcrypt went wrong"
    });
  });
});
console.log("after connection");

app.listen(port);
