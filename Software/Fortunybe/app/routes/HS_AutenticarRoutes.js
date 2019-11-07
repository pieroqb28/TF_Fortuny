
var HS_AutenticarController     = require('../controller/HS_AutenticarController');
var HS_Usuario     = require('../models/HS_Usuario');


module.exports = function (app) {

app.route('/HS_Autenticar/')
  .post(function(req, res) {
//req.body.jwt
  		HS_AutenticarController().validarJWT(req.tenant,req.body.jwt, function(statusCode, result){
	 	      res.status(statusCode).json(result);

  		  });
  		
  });
			//return  res.status(500).json({err: 'NOT TOKEN`'});
	}