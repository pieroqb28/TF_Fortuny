
var TextoCotizacionController     = require('../controller/TextoCotizacionController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/TextoCotizacion/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				TextoCotizacionController().get(req.tenant,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})

		.post(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				TextoCotizacionController().create(req.tenant, req.userId, req.body, function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		});
    
    app.route('/TextoCotizacion/:id')

    .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
      TextoCotizacionController().delete(req.tenant,req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);

        });  
        

       })
    .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          TextoCotizacionController().getById(req.tenant,req.params.id,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })
    .put(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {

          TextoCotizacionController().update(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })

      app.route('/TextoCotizacionNombre')
      .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          TextoCotizacionController().getByNombre(req.tenant,req.query.nombre,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })


}