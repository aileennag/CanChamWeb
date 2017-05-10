var express = require('express');
var router = express.Router();
var path = require('path');
var formidable = require('formidable');
var nodemailer = require('nodemailer');
var fs = require('fs');
const mysql = require('mysql');
module.exports = router;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'aileennag', 
  database: 'c9'
});

db.connect((err) => {
  if (err) {
    console.error('Unable to connect to the database.');
    throw err;
  } else {
    console.log('Connected to the database.');
  }
});
module.exports = router;
//------------------------------------------------------------------------------

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});


router.get('/loginapp/:email/:pass', function (req, res) {
  
  //console.log("1 "+req.params.email);
  //console.log("2 "+req.params.pass);

  var email = req.params.email;
  var pass = req.params.pass;
  
  var queryStringPass = 'SELECT * FROM admin WHERE usuario="'+email+'" AND passwd="'+pass+'";';
  
  
  db.query(queryStringPass, (err, rows) =>{
  if(err){
    //console.log(err);
    res.status(500).json(err);
  }else{
    
    //console.log(rows);
    res.json(rows);
    
  }
 });
});


/* *****************************************************************************                            Login Authetication
  *****************************************************************************/
router.get('/login', (req, res) =>{ 
  var usuario = req.query.user;
  var passwd = req.query.pass;
  
  var queryStringUser = 'SELECT * FROM admin WHERE usuario="'+usuario+'";';
  var queryStringPass = 'SELECT * FROM admin WHERE usuario="'+usuario+'" AND passwd="'+passwd+'";';
  
  db.query(queryStringUser,(err, rows) =>{
  if(err){
    console.log(err);
    res.status(500).json(err);
  }else{
    if(rows.length>=1){
      db.query(queryStringPass,(err, rows) =>{
        if(err){
          console.log(err);
          res.status(500).json(err);
        }else{
          if(rows.length>=1){
            
            if(usuario === 'expositor' && passwd == 'cancham123'){
              res.render('expositor',{ usuario: usuario});
            }else{
              res.render('index',{ usuario: usuario});
            }
            
            
          }else{
            res.send('error_autenticacion');
          }
        }
      });
    }else{
      res.send('error_autenticacion');
    }
  }
  });
});



/* *****************************************************************************                                Upload Files
  *****************************************************************************/
router.post('/upload', function(req, res){
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
  
  //create directory
  var dir = 'uploads';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }else{
    console.log("Directory already exist");
  }
  
  // store all uploads in the /uploads+name-event directory
  form.uploadDir = path.join(__dirname, "../"+dir);

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    
    //insert file in db
    var namefile = file.name;
    var liga = "http://admin-canchammx-aileennag.c9users.io/files/"+namefile;
    var repositorio = {nombre_archivo: namefile, liga_archivo: liga};
    db.query('INSERT INTO repositorio SET ?', repositorio, (err, rows) => {
      if(err){
        res.status(500).json(err);
      }else{
        console.log('listo');
      }
    });
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    var evento = req.body.seleccionarEvento;
    console.log(evento);
    res.end('success');
  });
  
  // parse the incoming request containing the form data
  form.parse(req);

});

/* *****************************************************************************                                Obtener Información
  *****************************************************************************/

router.get('/files/:namefile', function(req, res, next) {
    var namefile = req.params.namefile;
    res.sendFile(path.join(__dirname , '../uploads', namefile));
});

router.get('/eventos', (req, res) => { 
  res.header('Access-Control-Allow-Origin', "*"); 
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  db.query('SELECT nombre, fecha, direccion, descripcion FROM eventos WHERE fecha >= NOW() ORDER BY nombre', (err, rows) => { 
    if (err) {
      res.status(500).json(err); 
    } else {
      var result = rows.map((row) => { 
        return {
          nombre: row.nombre,
          fecha: row.fecha,
          direccion: row.direccion,
          descripcion: row.descripcion
        };
      });
      res.status(200).json(result);
    }
  });
});

router.get('/documentos', (req, res) => { 
  res.header('Access-Control-Allow-Origin', "*"); 
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  db.query('SELECT nombre_archivo, liga_archivo FROM repositorio', (err, rows) => { 
    if (err) {
      res.status(500).json(err); 
    } else {
      var result = rows.map((row) => { 
        return {
          nombre: row.nombre_archivo,
          liga: row.liga_archivo
        };
      });
      res.status(200).json(result);
    }
  });
});


/* *****************************************************************************                        Funciones Insertar Información
  *****************************************************************************/
router.get('/pregunta/:preg', function (req, res) {
  var str = req.params.preg;
    db.query('INSERT preguntasExpositor SET pregunta = ?',
      [str],
      (err, result) => {
        if (err) {
          console.log("3");
          res.status(500).json(err);
        } else {
        }
      });
   res.sendStatus(200);
});

router.get('/pregunta/:preg', function (req, res) {
  var str = req.params.preg;
    db.query('INSERT preguntasExpositor SET pregunta = ?',
      [str],
      (err, result) => {
        if (err) {
          console.log("3");
          res.status(500).json(err);
        } else {
        }
      });
   res.sendStatus(200);
});

router.get('/afiliate/:nombre/:apellidos/:org/:email', function (req, res) {
  res.header('Access-Control-Allow-Origin', "*"); 
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  var nombre = req.params.nombre;
  var apellidos = req.params.apellidos;
  var org = req.params.org;
  var email = req.params.email;
  console.log(nombre);
  console.log(apellidos);
  console.log(org);
  console.log(email);

  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    service: 'gmail',
      auth: {
        user: 'joud364@gmail.com',
        pass: 'thepowerofdoing'
      }
  });
  //, membership@chanchammx.com, info@canchammx.com
  var mailOptions = {
    from: '"CanChamMX App" <joud364@gmail.com>', // sender address (who sends)
    to: 'A01166738@itesm.mx', // list of receivers (who receives)
    subject: 'Solicitud de Membresía ', // Subject line
    //text: 'Hello world ', // plaintext body
    html: '<h2><b>Datos del solicitante </b></h2><b>Nombre: </b>'+nombre+'<br><b>Apellidos: </b>'+apellidos+'<br><b>Compañia: </b>'+org+'<br><b>Email: </b>'+email+'<p></p><h5>Enviado desde la aplicación movil <i>CanChamMX</i></h5>' // html body
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});
  
});

router.get('/insertarEvento', function (req, res) {
  var nombre = req.query.nombre;
  var fechahora = req.query.datetime+":00";
  var fecha = fechahora.replace("T", " ");
  var direccion = req.query.direccion;
  var descripcion = req.query.descripcion;
  var evento = {nombre: nombre, fecha: fecha, direccion: direccion, descripcion: descripcion};
    db.query('INSERT INTO eventos SET ?', evento, (err, rows) => {
      if(err){
        res.status(500).json(err);
      }else{
        console.log('listo');
      }
    });
});

router.post('/register/:nombre/:apellido_paterno/:apellido_materno/:email/:password', function(req, res) {
  res.header('Access-Control-Allow-Origin', "*"); 
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  var username = req.params.nombre;
  var userapellidopaterno = req.params.apellido_paterno;
  var userapellidomaterno = req.params.apellido_materno;
  var email = req.params.email;
  var password = req.params.password;
  
  
  db.query('INSERT INTO usuario (nombre, apellido_paterno, apellido_materno, mail, pass) values (?,?,?,?,?)', [username, userapellidopaterno, userapellidomaterno, email, password], (err, rows) => {
      if(err){
        console.log(err);
        res.status(500).json(err);
      }else{
        console.log('listo');
        res.send(true);
      }
    });
  
});

/* *****************************************************************************                        Funcion Borrar Información
  *****************************************************************************/
router.get('/delete/:id', function(req, res) {
  var id = req.params.id;
  console.log(id);
  db.query('DELETE FROM preguntasExpositor WHERE id = ?', [id], (err, result) => {
      if(err){
        res.status(500).json(err);
      }else{
        console.log('Deleted ' + result.affectedRows + ' rows');
        
      }
  });// no sé si funcione hay que probarlo 
  //console.log(req);
  res.redirect('/show?info=Preguntas+al+expositor');
  //res.send(id)
  
});


/* *****************************************************************************                        Funcion Consultar Información
  *****************************************************************************/
router.get('/repositorio', function(req, res, next) {
  db.query('SELECT nombre FROM eventos ORDER BY nombre', (err, rows) =>{
      if(err){
          res.status(500).json(err);
      }else{
          res.render('agregarArchivo.ejs', { rows: rows});
      }
  });
});

router.get('/expositor', function(req, res, next) {
  db.query('SELECT * FROM preguntasExpositor ORDER BY id', (err, rows) =>{
      if(err){
          res.status(500).json(err);
      }else{
          res.render('preguntasExpositor.ejs', { rows: rows});
      }
  });
});
  
function mydbqueryconsult(callback) {
  router.get('/show', function(req, res, next) {
    var info = req.query.info;
    if(info === 'Preguntas al expositor'){
      db.query('SELECT * FROM preguntasExpositor ORDER BY id', (err, rows) =>{
        if(err){
          res.status(500).json(err);
        }else{
          res.render('consultarPreguntas', { rows: rows});
        }
      });
    }
    if(info === 'Eventos'){
      db.query('SELECT * FROM eventos ORDER BY nombre', (err, rows) =>{
        if(err){
          res.status(500).json(err);
        }else{
          res.render('consultarEvento', { rows: rows});
        }
      });
    }
  });
  callback();
}

function wait1sec(){
    setTimeout(function(){
        mydbqueryconsult(wait1sec);
    }, 1000);
}


mydbqueryconsult(wait1sec);


/* *****************************************************************************                         Generate Key for Events
  *****************************************************************************/

function keyGen(keyLength) {
    var i, key = "", characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    var charactersLength = characters.length;

    for (i = 0; i < keyLength; i++) {
        key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
    }

    return key;
}

/*var keyFun = keyGen(5);
var name = "Cancham";
console.log(keyFun);
var simpleColors = {};

simpleColors[keyFun] = name;

for(var key in simpleColors){
  if(key === "colorA"){
    console.log(key);
    console.log(simpleColors[key]);
  }
   console.log(key);//for key name in your case it will be bar
   console.log(simpleColors[key]);// for key value in your case it will be baz
}*/

