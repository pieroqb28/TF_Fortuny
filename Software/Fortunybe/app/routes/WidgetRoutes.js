var ReqCompraController     = require('../controller/ReqCompraController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

  // Servicio para saber si un usuario puede aprobar una solicitud.
  // Puede ser usado en cualquier proceso de aprobacion.
  	app.route('/listaComprasPendientes')
    .get(function(req,res){
        ReqCompraController().getCompraPendiente(req.userId, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });
	app.route('/listaSolicitudesPendientes')
    .get(function(req,res){
        ReqCompraController().getMisSolicitudes(req.userId, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });
  
}

