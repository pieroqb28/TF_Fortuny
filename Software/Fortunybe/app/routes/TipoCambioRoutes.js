 var TipoCambioController     = require('../controller/TipoCambioController');
 var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

  
  app.route('/TipoCambio/:id')
  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    	TipoCambioController().getById(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

  .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
		TipoCambioController().delete(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        TipoCambioController().update(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })

  app.route('/TipoCambio/')
    .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    		TipoCambioController().getByMonedaFecha(req.tenant,req.query.moneda,req.query.fecha,function(statusCode, result){
         		 res.status(statusCode).json(result);
    	  	});
    })
    .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    		TipoCambioController().create(req.tenant,req.userId,req.body,function(statusCode, result){
             res.status(statusCode).json(result);
    	  	});
    })
}