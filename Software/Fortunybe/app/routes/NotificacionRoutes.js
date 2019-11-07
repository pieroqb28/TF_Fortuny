var NotificacionController = require('../controller/NotificacionController');
var validateRolAccess = require('../services/validateRolAcess');

module.exports = function(app) {
    app.route('/Notificacion')
        .get(function(req, res) {
            NotificacionController().getByUser(req.userId, function(statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
    app.route('/Notificacion/:id')
        
        .post(function(req, res) {
            NotificacionController().create(req.body, function(statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        .put(function(req, res) {
            NotificacionController().update(req.params.id, req.body, function(statusCode, result) {
                res.status(statusCode).json(result);
            })
        })
        .delete(function(req, res) {
            NotificacionController().delete(req.params.id, function(statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

      

}
