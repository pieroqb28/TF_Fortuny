var InfluencerController     = require('../controller/InfluencerController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {


  app.route('/Influencer/:id')
  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        InfluencerController().getBy(req.tenant,req.userId,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) { console.log(req.body)
        InfluencerController().put(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
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
  
*/

  app.route('/Influencer')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        InfluencerController().getAll(req.tenant, req.userId,function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});   
  })
  .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) { console.log(req.body); console.log("aqui")
  		InfluencerController().create(req.tenant,req.userId,req.body,function(statusCode, result){
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