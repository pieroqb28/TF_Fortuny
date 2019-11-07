// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var config =  require('./config');

//var database = require('./services/database');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors = require('cors');
var logger = require('morgan');
  var orm   = require('orm');



 var jwt = require('jsonwebtoken');
 var Base64 = require('js-base64').Base64;
 var secretHiddenKey = 'JzKa0t2ri9v28e5J5J4PkEO88YQkIE0O+ZoYBnUHmHga8/o/IduvU/Tht70iE=';

var multer = require('multer');
var errorHandler = require('errorhandler');


module.exports = app;



function main() {

  app.use(cors());
	app.use(logger('dev'));
   app.set('view engine', 'jade');
  	app.use(bodyParser.json());
  	app.use(bodyParser.urlencoded({ extended: true }));


    app.use(function (req, res, next) {

      next();
    });





   	app.set('port', process.env.PORT || 8051);
	
/*

    require('./app/models')(app);
    require('./app/controller')(app);
    require('./app/routes')(app);
*/









	if ('development' == app.get('env')) {
	  app.use(errorHandler());
	}



  	app.listen(app.get('port'), function(){
  
	});

var handlebars = require('handlebars');


    var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
fs.readFile('./app/views/cotizacionPDF.tmpl', function(err, data){
  if (!err) {
    // make the buffer into a string
    var source = data.toString();
    // call the render function
    var template = handlebars.compile(source);

    var data = { "NOMBRE": "Alan", "ARGO": "Somewhere, TX"
                 };
    var result = template(data);
      wkhtmltopdf(result,{ output: 'out.pdf' })


  } else {
    // handle file read error
  }
});





 






}


//global.db=orm.connect(config.database); 
//db.on('connect', function(err) {
//  if (err)  console.error('Connection error: ' + err);
//    else
    main();
//});



