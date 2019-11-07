
var TipoOrdenCompraController     = require('../controller/TipoOrdenCompraController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/TipoOrdenCompra/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				TipoOrdenCompraController().get(req.tenant,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})
		

}