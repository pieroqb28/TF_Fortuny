
var BuquesController     = require('../controller/BuquesController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/Buques/')
  		.get(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				BuquesController().getbyClient(req.tenant,req.query.cliente_id,function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		})

		.post(
  			function(req,res,next){
  				validateRolAccess(req,res,next)
  			},function(req, res) {
  				BuquesController().create(req.tenant, req.userId, req.body, function(statusCode, result){
        			res.status(statusCode).json(result);
  	 			});
		});
    
    app.route('/Buques/:id')

    .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
      BuquesController().delete(req.tenant,req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);

        });  
        

       })
    .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          BuquesController().getById(req.tenant,req.params.id,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })
    .put(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          
          BuquesController().update(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
              res.status(statusCode).json(result);
          });
    })


}