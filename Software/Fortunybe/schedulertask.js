// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var config =  require('./config');

//var database = require('./services/database');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var logger = require('morgan');
var orm   = require('orm');
var multer = require('multer');
var errorHandler = require('errorhandler');
var CronJob = require('cron').CronJob;


var alertsFactDespachos  = require('./app/tasks/alertsFactDespachos');
var alertsCotizacionesVencidas  = require('./app/tasks/alertsCotizacionesVencidas');
var CotizacionController  = require('./app/controller/CotizacionController');

module.exports = app;

function main() {

    new CronJob('0 0 23 * * *', function() {
      alertsFactDespachos().Ejecutar(function() {
        console.log('Se ha completado la tarea de enviar alerta por Despachos no facturados');  

      })
      
    }, null, true, 'America/Lima');

    new CronJob('0 0 23 * * *', function() {
      alertsCotizacionesVencidas().Ejecutar(function() {
        console.log('Se ha completado la tarea de enviar alerta por Cotizaciones Vencidas');  

      })
      
    }, null, true, 'America/Lima');
    
    new CronJob('1 0 00 * * *', function() {
      CotizacionController().BloquearCotizacion(function() {
          console.log('Se ha completado la tarea de enviar alerta por Cotizaciones Vencidas');  

      })
    }, null, true, 'America/Lima');

}

global.db=orm.connect(config.database); 
db.on('connect', function(err) {
  if (err)  console.error('Connection error: ' + err);
    else
    main();
}); // connect to database


//main();