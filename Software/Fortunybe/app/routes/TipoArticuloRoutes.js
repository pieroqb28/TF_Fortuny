
var TipoArticuloController     = require('../controller/TipoArticuloController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/TipoArticulo/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				TipoArticuloController().get(req.tenant,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})
		

}