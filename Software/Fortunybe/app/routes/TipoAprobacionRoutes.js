
var TipoAprobacionController     = require('../controller/TipoAprobacionController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/TipoAprobacion/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				TipoAprobacionController().get(req.tenant,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})
		

}