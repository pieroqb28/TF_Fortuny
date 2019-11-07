 var ClienteController     = require('../controller/ClienteController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {


  app.route('/Cliente/:id')
  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    	ClienteController().getById(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

  .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
		ClienteController().delete(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        ClienteController().put(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })


  app.route('/Cliente/')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
     		ClienteController().getAll(req.tenant,req.query.filtro,function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});   
  })
  .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
  		ClienteController().create(req.tenant,req.userId,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
  	  	});
  })

  app.route('/ClienteNombre/')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        ClienteController().getByNombre(req.tenant,req.query.nombre,function(statusCode, result){
           res.status(statusCode).json(result);
        });   
  })

}