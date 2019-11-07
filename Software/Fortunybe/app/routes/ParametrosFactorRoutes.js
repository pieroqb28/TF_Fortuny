
var ParametrosFactorController     = require('../controller/ParametrosFactorController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/ParametrosFactor/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				ParametrosFactorController().getByCotizacion(req.tenant,req.query.idCotizacion,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})

		.post(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				ParametrosFactorController().create(req.tenant, req.userId, req.body, function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		});
    
    app.route('/ParametrosFactor/:id')

    .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
      ParametrosFactorController().delete(req.tenant,req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);

        });  
        

       })
    .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          ParametrosFactorController().getById(req.tenant,req.params.id,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })
    .put(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {

          ParametrosFactorController().update(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })


}