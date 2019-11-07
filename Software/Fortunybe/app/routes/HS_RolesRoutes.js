var HS_RolesController     = require('../controller/HS_RolesController');
//var HS_AutenticarController= require('../controller/HS_AutenticarController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {


app.route('/HS_Roles')
   .get(function(req, res) {
    //HS_UsuarioController().recuperarPswd(req.userId,req.body.correo,'app.pronos.pe', function(statusCode, result){
    HS_RolesController().getAll(function(statusCode, result){
          res.status(statusCode).json(result);

        }); 

   });


}

