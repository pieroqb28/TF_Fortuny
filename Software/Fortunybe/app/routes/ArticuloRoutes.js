 var ArticuloController     = require('../controller/ArticuloController');

module.exports = function (app) {


  app.route('/Articulo/:id')
  .get(function(req, res) {
    	ArticuloController().getById(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

  .delete(function(req, res) {
		ArticuloController().delete(req.tenant,req.params.id, function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })
  .put(function(req, res) {
        ArticuloController().put(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  });

  app.route('/Articulo/')
    .get(function(req, res) {
    		ArticuloController().getAll(req.tenant,function(statusCode, result){
         		 res.status(statusCode).json(result);
    	  	});
    })
    .post(function(req, res) {
    		ArticuloController().create(req.tenant,req.userId,req.body,function(statusCode, result){
             res.status(statusCode).json(result);
    	  	});
    })

  app.route('/ArticuloCarga/')
    .post(function(req, res) {
        ArticuloController().createMasive(req.tenant,req.userId,req.body,function(statusCode, result){
             res.status(statusCode).json(result);
          });
    });
  app.route('/ArticuloTipo/:id')
  .get(function(req, res) {
      ArticuloController().getByTipo(req.tenant,req.params.id, function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })

}