
var EstadoClienteController     = require('../controller/EstadoClienteController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/EstadoCliente/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				EstadoClienteController().get(req.tenant,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})
		

}