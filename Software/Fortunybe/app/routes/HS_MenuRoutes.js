 var HS_MenuController     = require('../controller/HS_MenuController');
 var HS_AutenticarController= require('../controller/HS_AutenticarController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports =  function (app) {
app.route('/HS_Menu/')
.get(function(req,res,next){
	validateRolAccess(req,res,next)}
      ,function(req, res) {

			HS_MenuController().getAll(req.rolId,function(statusCode, result){
				console.log(result);
       		 res.status(statusCode).json(result);

  	  	});
	});
	
};
