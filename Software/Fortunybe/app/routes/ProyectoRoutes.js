 var ProyectoController     = require('../controller/ProyectoController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {

app.route('/ProyectosFiltro')

  .get(/*function(req,res,next){validateRolAccess(req,res,next)}
      ,*/function(req, res) {
        ProyectoController().getByFiltro(req.query.nombre,function(statusCode, result){
           res.status(statusCode).json(result);
        });   
  })
   
}