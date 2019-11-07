 var FamiliaController = require('../controller/FamiliaController');

module.exports = function (app) {

  app.route('/Familia')
  .get(function(req, res) {
    	FamiliaController().getFamilias(function(statusCode, result){
       		 res.status(statusCode).json(result);
  	  	});
  })

  app.route('/Familia/:id')
  .get(function(req, res) {
      FamiliaController().getFamiliaById(req.params.id,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })

  app.route('/SubFamilia/:id')
    .get(function(req, res) {
    		FamiliaController().getSubFamilias(req.params.id,function(statusCode, result){
         		 res.status(statusCode).json(result);
    	  	});
    })
  app.route('/FamiliaCompleta/:id')
    .get(function(req, res) {
    		FamiliaController().getFamiliaCompletaBySubFamiliaId(req.params.id,function(statusCode, result){
         		 res.status(statusCode).json(result);
    	  	});
    })
   
}