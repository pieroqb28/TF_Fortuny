
var DespachoController     = require('../controller/DespachoController');
var validateRolAccess     = require('../services/validateRolAcess');


module.exports = function (app) {

	app.route('/Despacho/')
  		.get(
  			function(req,res,next){
          validateRolAccess(req,res,next)
  			},function(req, res) {
  				DespachoController().getAll(req.tenant,req.query.filtro,function(statusCode, result){
            		res.status(statusCode).json(result);
          		});
        	}
        )

      .post(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          DespachoController().create(req.tenant,req.userId, req.body, function(statusCode, result){
              res.status(statusCode).json(result);
          });
      });
  app.route('/Despacho/:id')

      .get(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          DespachoController().getById(req.tenant,req.params.id,function(statusCode, result){
                res.status(statusCode).json(result);
              });
          }
        )

      .put(
        function(req,res,next){
          validateRolAccess(req,res,next)
        },function(req, res) {
          
          DespachoController().update(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
              res.status(statusCode).json(result);
          });
      })

      .delete(/*function(req,res,next){validateRolAccess(req,res,next)}
      ,*/function(req, res) {
      DespachoController().delete(req.tenant,req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);

        });  
        

       })


  app.route('/DespachoGuias/:id')
      .get(
        function(req,res,next){
          validateRolAccess(req,res,next);
        },function(req, res) {
          DespachoController().obtenerGuiasRemision(req,res, function(statusCode, result){
            res.status(statusCode).json(result);
          });
      });
  app.route('/cerrarDespacho/:id')
      .put(
        function(req,res,next){
          validateRolAccess(req,res,next);
        },function(req, res) {
          DespachoController().cerrarDespacho(req.tenant,req.userId,req.params.id, function(statusCode, result){
            res.status(statusCode).json(result);
          });
      });
  app.route('/ProductosDespachar')
      .get(
        function(req,res,next){
          validateRolAccess(req,res,next);
        },function(req, res) {
          DespachoController().getProductosDespachar(req.query.proyecto, function(statusCode, result){
            res.status(statusCode).json(result);
          });
      });

  app.route('/despachar')
      .post(
        function(req,res,next){
          validateRolAccess(req,res,next);
        },function(req, res) {
          DespachoController().despachar(req.tenant,req.userId,req.body, function(statusCode, result){
            res.status(statusCode).json(result);
          });
      });

  app.route('/ultimoDespacho')
      .get(
        function(req,res,next){
          validateRolAccess(req,res,next);
        },function(req, res) {          
          DespachoController().ultimoDespachoCreado(req.query.proyecto, function(statusCode, result){
            res.status(statusCode).json(result);
          });
      });

}