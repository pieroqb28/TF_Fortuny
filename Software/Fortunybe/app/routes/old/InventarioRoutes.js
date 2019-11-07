var InventarioController = require('../controller/InventarioController');
var validateRolAccess = require('../services/validateRolAcess');
module.exports = function (app) {
    app.route('/Inventario')
        .get(function (req, res, next) {
            validateRolAccess(req, res, next)
        },
        function (req, res) {

            InventarioController().getAll(function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
    app.route('/Inventario/:id')

        .post(function (req, res, next) {
            validateRolAccess(req, res, next)
        }, function (req, res) {
            InventarioController().create(req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        .put(function (req, res, next) {
            validateRolAccess(req, res, next)
        }, function (req, res) {
            InventarioController().update(req.params.id, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            })
        })
        .delete(function (req, res, next) {
            validateRolAccess(req, res, next)
        }, function (req, res) {
            InventarioController().delete(req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

    app.route('/InventarioTipoDocumento')
        .get(function (req, res, next) {
            validateRolAccess(req, res, next)
        }, function (req, res) {

            InventarioController().getTipoDocumento(function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
    app.route('/InventarioTipoOperacion')
        .get(function (req, res, next) {
            validateRolAccess(req, res, next)
        }, function (req, res) {

            InventarioController().getTipoOperacion(function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
    app.route('/InventarioTipoOrigen')
        .get(function (req, res, next) {
            validateRolAccess(req, res, next)
        }, function (req, res) {

            InventarioController().getTipoOrigen(function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
    app.route('/RegistroInventario')
        .post(function (req, res) {
            req.body.fecha = new Date(req.body.fecha);
            InventarioController().registroInventario(req.tenandId, req.userId, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
    app.route('/RegistroDocumentoManual')
        .post(function (req, res) {
            req.body.fecha = new Date(req.body.fecha);
            InventarioController().registroDocumentoManual(req.userId, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

    

}
