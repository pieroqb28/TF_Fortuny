var AprobacionExternaController     = require('../controller/AprobacionExternaController');
module.exports = function (app) {

  app.route('/aprobacionesExternas')
    .post(function(req,res){
        AprobacionExternaController().responderSolictudAprobacion(req.body, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });

  
}

