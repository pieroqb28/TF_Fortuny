var ListController     = require('../controller/ListController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

  app.route('/List/:id')
  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) { 
        ListController().getById(req.tenant,req.userId,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

/*
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
*/

  app.route('/List')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
     		ListController().getAll(req.tenant, req.userId,function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});   
  })
  .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) { 
  		ListController().create(req.tenant,req.userId,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
  	  	});
  })
  app.route('/ListPhotos')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
     		ListController().getPhotos(req.tenant, req.userId,function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});   
  })
  
  
  app.route('/ListxInfl')

  /*.get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
     		ListController().getGroupInList(req.tenant,req.params.id,function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});   
  })*/
  .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) { 
  		ListController().createLxI(req.tenant,req.userId,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
  	  	});
  })
  app.route('/ListxInfl/:id')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {console.log("entraa acaaaa");console.log(req.params.id)
     		ListController().getGroupInList(req.tenant, req.userId,req.params.id,function(statusCode, result){
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