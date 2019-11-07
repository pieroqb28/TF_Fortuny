 var CuentaContableController     = require('../controller/CuentaContableController');
 var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

  app.route('/DeshabilitarCContable/:id')
  .put(function(req, res) {

        CuentaContableController().deshabilitarCC(req.tenant,req.userId,req.params.id,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })
  app.route('/CuentaContable/:id')
  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    	CuentaContableController().getById(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

  .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
		CuentaContableController().delete(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        CuentaContableController().put(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })

  app.route('/CuentaContable/')
    .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    		CuentaContableController().getAll(req.tenant,function(statusCode, result){
         		 res.status(statusCode).json(result);
    	  	});
    })
    .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    		CuentaContableController().create(req.tenant,req.userId,req.body,function(statusCode, result){
             res.status(statusCode).json(result);
    	  	});
    })
}