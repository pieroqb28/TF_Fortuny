 var TipGastoImportacionController     = require('../controller/TipGastoImportacionController');
 var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

  app.route('/tipoGastoImportacion')
    .get(/*function(req,res,next){validateRolAccess(req,res,next)}
      ,*/function(req, res) {
    		TipGastoImportacionController().getAll(req.tenant,function(statusCode, result){
         		 res.status(statusCode).json(result);
    	  	});
    })
    
}