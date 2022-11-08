require('dotenv').config()
//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const app = express();
var fs = require('fs');
var multer = require('multer');

// Server port
const PORT = process.env.PORT || 8000;
//Create Connection
const conn = mysql.createConnection({
  host: process.env.DATABASE_URL,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
//app.use(multer().array());
app.use(bodyParser.urlencoded({ extended: true }));

//file uploaded using multer node module
const upload = multer({ dest: "uploads" });

//set folder public as static folder for static file
app.use('/assets',express.static(__dirname + '/public'));

//route for homepage
app.get('/',(req, res) => {
	const data = fs.readFileSync('./public/data/country.json', "utf8");
  let sql = "SELECT * FROM amidia_users";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('candidate_page',{
      results: results,
	  countryData: JSON.parse(data)
    });
  });
});

//route for insert data
app.post('/save', upload.single("resume"), (req, res) => {
  let data = {name: req.body.name, dob: req.body.dob, contary: req.body.contary, file_upload: req.file.filename};
  let sql = "INSERT INTO amidia_users SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});

//route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE amidia_users SET name='"+req.body.name+"', dob='"+req.body.dob+"' WHERE id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});

//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM amidia_users WHERE id="+req.body.product_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});

// download file
app.get('/uploads', function(req, res){
  const file = `${__dirname}/uploads/${req.query.fileName}`;
  res.download(file); // Set disposition and send it.
});

//server listening
app.listen(PORT, () => {
  console.log('Server is running at port '+ PORT);
});
