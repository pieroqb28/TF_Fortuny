var NumeroSerieController = require('../controller/NumeroSerieController');

module.exports = function(app) {
  app.route('/NumeroSerie')
    .get(function(req, res) {
      NumeroSerieController().getByTipoDocumento(req.query.tipoDocumento,req.query.filtro, function(statusCode, result) {
        res.status(statusCode).json(result);
      });
    })
 
    .post(function(req, res) {      
      NumeroSerieController().create(req.params.id, req.body, function(statusCode, result) {
        res.status(statusCode).json(result);
      });
    });

    app.route('/UltimoNumeroDocumento')
    .get(function(req, res) {
      NumeroSerieController().UltimoNumeroDocumento(req.query.tipoDocumento,function(statusCode, result) {
        res.status(statusCode).json(result);
      });
    })
}
