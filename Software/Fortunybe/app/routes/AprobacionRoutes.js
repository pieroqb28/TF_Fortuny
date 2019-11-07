var AprobacionController     = require('../controller/AprobacionController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

  // Servicio para saber si un usuario puede aprobar una solicitud.
  // Puede ser usado en cualquier proceso de aprobacion.
  app.route('/listaAprobacionesPendientes')
    .get(function(req,res){
        AprobacionController().aprobacionesPendientes(req.userId, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });

  
}

