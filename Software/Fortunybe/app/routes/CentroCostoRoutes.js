var CentroCostoController = require('../controller/CentroCostoController');
var validateRolAccess = require('../services/validateRolAcess');

module.exports = function (app) {

	app.route('/DeshabilitarCCosto/:id')
		.put(function (req, res) {

			CentroCostoController().deshabilitarCC(req.tenant, req.userId, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CentroCosto/:id')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().getById(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})

		.delete(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().delete(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().put(req.tenant, req.userId, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})

	app.route('/CentroCostoValid/')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().getAllValid(req.tenant, req.query.filtro, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CentroCosto/')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().getAll(req.tenant, req.query.filtro, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})

		.post(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().create(req.tenant, req.userId, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CentroCostoNombre')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().getByCodigo(req.tenant, req.query.codigo, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CentroCostoCreador')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().getByOwner(req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CentroCostoServicios')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().getOnlyService(function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CentroCostoTipo')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CentroCostoController().getByType(req.query.type, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CentroCostoDespachar')
		.get(/*function (req, res, next) { validateRolAccess(req, res, next) }
		, */function (req, res) {
			CentroCostoController().getForDespacho(function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
}