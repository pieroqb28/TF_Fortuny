var FacturacionController = require('../controller/FacturacionController');
var HS_AttachmentsController = require('../controller/HS_AttachmentsController');
var validateRolAccess = require('../services/validateRolAcess');
var exportPDF = require('../services/exportPDF');
var exportRAW = require('../services/exportRAW');
var toWord = require('../services/exportWord');
var multer = require('multer');
var upload = multer({ dest: 'uploads/Cotizacion/' }).single('uploadfile');

module.exports = function (app) {

	app.route('/Facturacion/ToWord/:id')
		.get(function (req, res) {

			var templatePDF = "facturaPDF";
			var nombrePdf = "factura";

			FacturacionController().getPrint(req.params.id, function (status, result) {

				if (status == 200) {
					toWord(status, result, templatePDF, nombrePdf, function (status, result) {
						res.writeHead(status, { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
						res.end(result, 'binary');
						FacturacionController().marcarImpreso(req.params.id);

					});
				}

			})
		});
	app.route('/Facturacion/ExportRAW/:id')
		.get(function (req, res) {
			FacturacionController().getPrint(req.params.id, function (status, result) {
				if (status == 200) {
					exportRAW(status, result, req.query.type, function (status, result) {
						res.status(status).json({ result: result });
					});
				} else {
					res.status(status).json(result);
				}
			})
		});

	app.route('/Facturacion/Export/:id')

		.get(function (req, res) {

			var templatePDF = "";
			var nombrePdf = "";
			switch (req.query.type) {
				case '1': {
					templatePDF = "facturaPDF";
					nombrePdf = "factura";
					break;
				}
				case '2': {
					templatePDF = "boletaPDF";
					nombrePdf = "boleta";
					break;
				}
				case '3': {
					templatePDF = "guiaRemisionPDF";
					nombrePdf = "guiaRemision";
					break;
				}
				case '4': {
					templatePDF = "notaDebitoPDF";
					nombrePdf = "notaDebito";
					break;
				}
				case '5': {
					templatePDF = "notaCreditoPDF";
					nombrePdf = "notaCredito";
					break;
				}
			}
			var idAux = req.params.id;
			FacturacionController().getPrint(req.params.id, function (status, result) {

				if (status == 200) {
					exportPDF(status, result, templatePDF, nombrePdf, function (status, result) {
						res.writeHead(status, { 'Content-Type': 'application/pdf' });
						res.end(result, 'binary');
						// MODIFICADO: se actualiza el estado de la factura a "3 - IMPRESO"
						FacturacionController().marcarImpreso(idAux);

					})
				}
				else {
					res.status(status).json(result);
				}

			});

		});

	app.route('/Refacturacion/:id')

		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().refacturar(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
	app.route('/Anular/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) },
		function (req, res) {
			FacturacionController().anular(req.userId, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			})
		})
	app.route('/Facturacion/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().update(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})

		.delete(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().delete(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})

		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().getbyId(req, res, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});

	app.route('/FacturacionDespacho')

		.post(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().facturarDespacho(req.userId, req.tenant, req.body, res, function (statusCode, result) {
				//.create(req.userId,req.tenant,req.body,res, function(statusCode, result){

				res.status(statusCode).json(result);
			});
		});

	app.route('/Facturacion')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().getAll(req.tenant, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})

		.post(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().create(req.userId, req.tenant, req.body, res, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});

	app.route('/FacturasVencidas')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().factVencidas(req.tenant, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})

	app.route('/ultimoDocumentoEmitido')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			FacturacionController().ultimoDocumento(req.query, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})



}