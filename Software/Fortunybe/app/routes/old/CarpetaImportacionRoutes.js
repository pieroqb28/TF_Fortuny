var CarpetaImportacionController = require('../controller/CarpetaImportacionController');
var validateRolAccess = require('../services/validateRolAcess');

module.exports = function (app) {

  app.route('/CarpetaImportacion/')

    .get(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().get(req.tenant, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    })

    .post(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().create(req.tenant, req.userId, req.body, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    });

  app.route('/CarpetaImportacionDetalle/:id')
    .get(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().carpetaImportacionConDetalleId(req.params.id, function (statusCode, result) {

        res.status(statusCode).json(result);
      });
    });

  app.route('/CarpetaImportacion/:id')

    .delete(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().delete(req.params.id, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    })

    .get(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().getById(req.tenant, req.params.id, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    })

    .put(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().update(req.tenant, req.userId, req.params.id, req.body, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    });

  app.route('/Incoterm/')

    .get(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().getIncoterms(req.tenant, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    });

  app.route('/resumenImportacionCostos/:id')
    .get(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().getResumenCostos(req.tenant, req.params.id, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    })

  app.route('/importacionTraslado/')

    .post(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().trasladoCostos(req.tenant, req.userId, req.body, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    });

  app.route('/widgetCarpetaImportacionListado/')

    .get(function (req, res) {
      CarpetaImportacionController().listadoCarpetaImportacionWidget(function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    });

  app.route('/carpetaImportacionOrdenCompras/')

    .get(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().listadoOrdenCompras(req.tenant, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    });

  app.route('/carpetaImportacionOrdenCompraAsignables/:id')
    .get(function (req, res, next) { validateRolAccess(req, res, next) }
    , function (req, res) {
      CarpetaImportacionController().getTotalArticulosDisponiblesAsignables(req.params.id, function (statusCode, result) {
        res.status(statusCode).json(result);
      });
    })

  app.route('/ArticulosCarpetaImportacionParcial/')
    .post(function (req, res, next) {
      validateRolAccess(req, res, next)
    },
    function (req, res) {
      CarpetaImportacionController().createListadoArticulosxCarpetaImportacionParcial(req.body.dataArticulos.id, req.body.dataArticulos.id_orden_compra, req.body.dataArticulos.listadoArticulos, function (statusCode, result) {
        res.status(statusCode).json(result);
      })
    })
}
