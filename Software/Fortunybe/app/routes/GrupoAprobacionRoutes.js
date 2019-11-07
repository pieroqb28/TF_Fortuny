
var GrupoAprobacionController     = require('../controller/GrupoAprobacionController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/GrupoAprobacion/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				GrupoAprobacionController().get(req.tenant,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})

		.post(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				GrupoAprobacionController().create(req.tenant, req.userId, req.body, function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		});

  app.route('/GrupoAprobacion/:id')

    .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
      GrupoAprobacionController().delete(req.tenant,req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);

        });
       })
    .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          GrupoAprobacionController().getById(req.tenant,req.params.id,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })
    .put(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          GrupoAprobacionController().update(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    });

  app.route('/UsuarioxGrupoAprobacion/:id')
    .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          GrupoAprobacionController().getUsersByIdGroup(req.tenant,req.params.id,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })


}