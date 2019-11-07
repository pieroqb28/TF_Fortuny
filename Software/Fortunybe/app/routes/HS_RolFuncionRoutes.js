 var HS_RolFuncionController     = require('../controller/HS_RolFuncionController');
 var HS_AutenticarController= require('../controller/HS_AutenticarController');
  var validateRolAccess     = require('../services/validateRolAcess');
 module.exports = function (app) {

app.route('/HS_RolFuncion/:id')
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {


  	  HS_RolFuncionController().update(req.userId,req.tenant,req.params.id, req.body,res, function(statusCode, result){
        res.status(statusCode).json(result);

  	  });

  	  
  	
  })
  .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
  	  HS_RolFuncionController().delete(req,res, function(statusCode, result){
        res.status(statusCode).json(result);

  	  });
		
  	
  })
.get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
	 HS_RolFuncionController().getbyId(req.params.id, function(statusCode, result){
        res.status(statusCode).json(result);

  	  });
  	 
  });

app.route('/HS_RolFuncion')
	 .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
      HS_RolFuncionController().getAll(function(statusCode, result){
	 	      res.status(statusCode).json(result);

  		  });

	 })

  
  .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
  	 	 
  	 	 HS_RolFuncionController().create(req.userId,req.tenant,req.body,res, function(statusCode, result){
        res.status(statusCode).json(result);

  		  });

  	
  });
}