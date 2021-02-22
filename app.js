const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");

const conn = require("./connection/dbcon");
const app = express();
const port = process.env.PORT || '3000';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
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

app.post("/login", (req, res, next) => {
  const query = 'SELECT * FROM users where email = ?';
  conn.query(query, req.body.email, (err, result) => {
    if(err) throw err;
    if(result.length === 0){
      return res.status(401).json({
        message: "EMAIL_NOT_FOUND"
      });
    } else {
      bcrypt.compare(req.body.password, result[0].password)
        .then( resultCompare => {
          if(!resultCompare){
            return res.status(401).json({
              message: "PASSWORD_INVALID"
            });
          }
          res.status(200).json({
            message: "SUCCESS",
            user: {
              id: result[0].id,
              name: result[0].name,
              mobile: result[0].mobile,
              email: result[0].email
            }
          });
        })
        .catch(err => {
          res.status(500).json({
            message: "ERR"
          });
        });
      }
  });
});

app.post("/register", (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = {
      "email": req.body.email,
      "password": hash
    };
    const query = "Insert into users set ?";
    conn.query(query, user, (err, result) => {
      if(err) {
        if(err.code === "ER_DUP_ENTRY"){
          return res.status(409).json({
            message: "Email Exists",
            data: err
          });
        } else {
          throw err;
        }
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

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid MIME type");
    if(isValid){
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname;
    cb(null, name + '.jpg');
  }
});
app.put("/update", multer({storage: storage}).single("img"), (req, res, next) => {
  if(!req.file || !req.body.id || !req.body.name || !req.body.mobile){
    return res.json({
      message: 'NO_DATA',
    });
  }
  const url =  req.protocol + '://' + req.get("host");
  imagePath = url + "/images/" + req.file.filename
  const data = {
    name: req.body.name,
    mobile: req.body.mobile,
  };
  const query = `Update users set ? where id = '${req.body.id}'`;
  conn.query(query, data, (err, result) => {
    if(err) {
      if(err.code === "ER_DUP_ENTRY"){
        return res.status(409).json({
          message: "Mobile No already exists",
        });
      } else {
        throw err;
      }
    }
    if(result.affectedRows == 0){
      return res.status(401).json({
        message: "No Data Found",
        data: result
      });
    }
    if(result.changedRows == 0){
      return res.status(400).json({
        message: "Same Data cannot be Updated",
        data: result
      });
    }
    res.status(201).json({
      message: "Updated successfully",
      data: result
    });
  });
});

app.listen(port);
