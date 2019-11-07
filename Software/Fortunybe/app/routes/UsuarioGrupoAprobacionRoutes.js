
var UsuarioGrupoAprobacionController     = require('../controller/UsuarioGrupoAprobacionController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/UsuarioGrupoAprobacion/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				UsuarioGrupoAprobacionController().getByGrupo(req.tenant,req.query.idGrupo,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})

		.post(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				UsuarioGrupoAprobacionController().create(req.tenant, req.userId, req.body, function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		});
    
    app.route('/UsuarioGrupoAprobacion/:id')

    .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
      UsuarioGrupoAprobacionController().delete(req.tenant,req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);

        });  
        

       })
    .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          UsuarioGrupoAprobacionController().getById(req.tenant,req.params.id,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })
    .put(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {          
          UsuarioGrupoAprobacionController().update(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })


}