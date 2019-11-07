 var ProveedorController     = require('../controller/ProveedorController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {


  app.route('/Proveedor/:id')
  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
    	ProveedorController().getById(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

  .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
		ProveedorController().delete(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        ProveedorController().put(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })


  app.route('/Proveedor/')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
     		ProveedorController().getAll(req.tenant,function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});   
  })
  .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
  		ProveedorController().create(req.tenant,req.userId,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
  	  	});
  })
  app.route('/ProveedorCentroCosto')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        ProveedorController().getByCentroCosto(req.query.centroCosto,function(statusCode, result){
           res.status(statusCode).json(result);
        });   
  })

app.route('/ProveedorFiltro')

  .get(/*function(req,res,next){validateRolAccess(req,res,next)}
      ,*/function(req, res) {
        ProveedorController().getByFiltro(req.query.nombre,function(statusCode, result){
           res.status(statusCode).json(result);
        });   
  })
   
}