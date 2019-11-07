var SolicitudCotizacionController     = require('../controller/SolicitudCotizacionController');
//var SolicitudClienteController     = require('../controller/SolicitudClienteController');
var SolicitudOrdenCompraController     = require('../controller/SolicitudOrdenCompraController');
var SolicitudReqCompraController     = require('../controller/SolicitudReqCompraController');

var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

  // Servicio para saber si un usuario puede aprobar una solicitud.
  // Puede ser usado en cualquier proceso de aprobacion.
  app.route('/PermisoAprobarSolicitud/:id')
    .get(function(req,res){
        SolicitudCotizacionController().getPermission(req.userId, req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });

  /* COTIZACIONES */
 /* app.route('/SolicitudCotizacion/:id')
    .get(function(req,res){
        SolicitudCotizacionController().getbyId(req,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    })

    .put(function(req,res){
        SolicitudCotizacionController().update(req.userId,req.tenant,req.params.id, req.body,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });

  app.route('/SolicitudCotizacion')
    .post(function(req, res) {
        SolicitudCotizacionController().create(req.userId,req.body, function(statusCode, result){
             res.status(statusCode).json(result);
          });
    });

  /* CLIENTES */
  /*app.route('/SolicitudCliente/:id')
    .get(function(req,res){
        SolicitudClienteController().getbyId(req,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    })

    .put(function(req,res){
        SolicitudClienteController().update(req.userId,req.tenant,req.params.id, req.body,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });

  app.route('/SolicitudCliente')
    .post(function(req, res) {
          SolicitudClienteController().create(req.userId,req.body, function(statusCode, result){
               res.status(statusCode).json(result);
          });
    });

*/
   app.route('/ReenviarSolicitud/:id')
    .get(function(req,res){
        SolicitudOrdenCompraController().resendNotif(req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    })
  /* ORDEN DE COMPRA */
  app.route('/SolicitudOrdenCompra/:id')
    .get(function(req,res){
        SolicitudOrdenCompraController().getbyId(req,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    })

    .put(function(req,res){
        SolicitudOrdenCompraController().update(req.userId,req.tenant,req.params.id, req.body,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });

  app.route('/SolicitudOrdenCompra')
    .post(function(req, res) {
        SolicitudOrdenCompraController().create(req.userId,req.body, function(statusCode, result){
             res.status(statusCode).json(result);
        });
    });
  app.route('/SolicitudReqCompra/:id')
    .get(function(req,res){
        SolicitudReqCompraController().getbyId(req,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    })

    .put(function(req,res){
        SolicitudReqCompraController().update(req.userId,req.tenant,req.params.id, req.body,res, function(statusCode, result){
          res.status(statusCode).json(result);
        });
    });

  app.route('/SolicitudReqCompra')
    .post(function(req, res) {
        SolicitudReqCompraController().create(req.userId,req.body, function(statusCode, result){
             res.status(statusCode).json(result);
        });
    });
}

