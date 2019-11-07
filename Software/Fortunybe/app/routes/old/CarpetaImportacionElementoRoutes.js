var carpetaImportacionElementoController     = require('../controller/carpetaImportacionElementoController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

	app.route('/elementoImportacion/:id')

		.get(function(req,res,next){ validateRolAccess(req,res,next)}
      ,function(req, res) {
				carpetaImportacionElementoController().getElementoByCarpeta(req.tenant,req.params.id,function(statusCode, result){
      		res.status(statusCode).json(result);
	 			});
		})
	app.route('/elementoImportacionMonto/:id')
	.put(function(req,res,next){ validateRolAccess(req,res,next)}
      ,function(req, res) {
				carpetaImportacionElementoController().actualizarMonto(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
      		res.status(statusCode).json(result);
	 			});
		})


}