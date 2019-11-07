var HS_AttachmentsController = require('../controller/HS_AttachmentsController');
var validateRolAccess = require('../services/validateRolAcess');
var fs = require('fs');
module.exports = function (app) {

 
  
  app.route('/Adjuntos/download/:id')
    .get(function (req, res) {
      // req.file is the `avatar` file
      console.log('FFF');
      HS_AttachmentsController().getOne(req.tenant,/*'Cotizacion',*/req.params.id, function (stat, result) {
        if (result) {
          fs.readFile('uploads/' + result.internalFilename, function (err, data) {
            if (!err) {
              res.writeHead(200, { 'Content-Type': result.contentType });
              res.end(data, 'binary');
            } else {
              res.status(400).json('Not Found');
            }
          });
        }
      });
      // req.body will hold the text fields, if there were any
    })
 
  
}