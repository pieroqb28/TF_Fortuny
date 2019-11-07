var CargoController     = require('../controller/CargoController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {
  app.route('/Cargo/:id')
  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    	CargoController().getById(req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

  .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
		CargoController().delete(req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })
  
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        CargoController().put(req.params.id,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })

  app.route('/Cargo/')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
     		CargoController().getAll(req.query.filtro,function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});   
  })
  .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
  		CargoController().create(req.body,function(statusCode, result){
           res.status(statusCode).json(result);
  	  	});
  })

  app.route('/CargoNombre/')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        CargoController().getByNombre(req.query.nombre,function(statusCode, result){
           res.status(statusCode).json(result);
        });   
  })

}