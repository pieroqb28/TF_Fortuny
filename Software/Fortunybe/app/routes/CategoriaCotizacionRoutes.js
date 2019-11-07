
var CategoriaCotizacionController     = require('../controller/CategoriaCotizacionController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/CategoriaCotizacion/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				CategoriaCotizacionController().get(req.tenant,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})
		

}