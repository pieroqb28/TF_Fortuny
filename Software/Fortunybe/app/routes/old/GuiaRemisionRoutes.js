var GuiaRemisionController = require('../controller/GuiaRemisionController');
var exportRAW = require('../services/exportRAW');
module.exports = function (app) {
	app.route('/GuiaRemision/')
		.get(function (req, res) {
			GuiaRemisionController().getByDespacho(req.tenant, req.query.idDespacho, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/GuiaRemision/:id')
		.put(function (req, res) {
			GuiaRemisionController().actualizarCabecera(req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
	app.route('/BuscarGuiaRemision/')
		.get(function (req, res) {
			GuiaRemisionController().getByCodigo(req.tenant, req.query.codigoGuia, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/GuiaRemision/ExportRAW/:id')
		.get(function (req, res) {
			GuiaRemisionController().GuiaRemisionPrint(req.params.id, function (statusCode, result) {
				if (statusCode != 200) {
					res.status(statusCode).json(result);
				} else {
					exportRAW(statusCode, result, '3', function (status, resultRAW) {
						if (status != 200) {
							res.status(status).json(resultRAW);
						} else {
							res.status(status).json(resultRAW);
						}
					});
				}
			})
		})
}