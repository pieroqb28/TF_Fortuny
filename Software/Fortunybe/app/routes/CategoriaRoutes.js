 var CategoriaController     = require('../controller/CategoriaController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

app.route('/CategoriaFiltro')

  .get(/*function(req,res,next){validateRolAccess(req,res,next)}
      ,*/function(req, res) {
        CategoriaController().getByFiltro(req.query.nombre,function(statusCode, result){
           res.status(statusCode).json(result);
        });   
  })
   
}