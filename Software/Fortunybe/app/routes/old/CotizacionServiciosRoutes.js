var CotizacionController = require('../controller/CotizacionController');
var CotizacionServiciosController = require('../controller/CotizacionServiciosController');
var HS_AttachmentsController = require('../controller/HS_AttachmentsController');
var validateRolAccess = require('../services/validateRolAcess');
var exportPDF = require('../services/exportPDF');
var multer = require('multer');
var upload = multer({ dest: 'uploads/Cotizacion/' }).single('uploadfile');
var fs = require('fs');
module.exports = function (app) {
	app.route('/CotizacionServicios/Export/:id')
		.get(function (req, res) {
			// req.file is the `avatar` file
			var templatePDF = "cotizacionServiciosPDF"
			
			CotizacionServiciosController().getPrint(req.params.id, req.query.showExWork, function (status, result) {
				if (status == 200) {
					var nombrePdf=(result[0].pagina[0].NumCotizacion).split("/")
					nombrePdf = nombrePdf[0] + nombrePdf[1]
					exportPDF(status, result, templatePDF, nombrePdf, function (status, result) {
						res.writeHead(status, {"Content-Disposition": "inline;filename="+nombrePdf+".pdf", 'Content-Type': 'application/pdf' });
						res.end(result, 'binary');
					})
				}
				else { res.status(status).json(result); }
			});
		});
	app.route('/CotizacionServicios/Export/confirmacion/:id')
		.get(function (req, res) {
			var templatePDF = "liquidacionPDF"
			
			CotizacionServiciosController().getPrint(req.params.id, req.query.showExWork, function (status, result) {
				if (status == 200) {
					var nombrePdf=(result[0].pagina[0].NumCotizacion).split("/")
					nombrePdf = nombrePdf[0] + nombrePdf[1]
					exportPDF(status, result, templatePDF, nombrePdf, function (status, result) {
						res.writeHead(status, { "Content-Disposition": "inline;filename="+nombrePdf+".pdf",'Content-Type': 'application/pdf' });
						res.end(result, 'binary');
					})
				}
				else { res.status(status).json(result); }
			});
		});
	app.route('/margenCotizacion/Export/:id')
		.get(function (req, res) {
			var templatePDF = "margenPDF"
			var nombrePdf = "margenCotizacion"
			CotizacionController().getMarginPrint(req.params.id, function (status, result) {
				if (status == 200) {
					exportPDF(status, result, templatePDF, nombrePdf, function (status, result) {
						res.writeHead(status, { 'Content-Type': 'application/pdf' });
						res.end(result, 'binary');
					})
				}
				else { res.status(status).json(result); }
			});
		});
	app.route('/Cotizacion/upload/:id')
		.post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
			// req.file is the `avatar` file
			upload(req, res, function (err) {
				if (err) {
					// An error occurred when uploading
					res.status(500).json(err);
				} else {
					HS_AttachmentsController().post(req.userId, req.tenant, {
						filename: req.file.originalname,
						internalFilename: req.file.filename,
						tipoEntidad: 'Cotizacion',
						ruta: req.file.destination,
						idEntidad: req.params.id,
						size: req.file.size,
						contentType: req.file.mimetype
					}, function (returCode, result) {
						res.status(returCode).json(result);
					})
				}
				// Everything went fine
			})
			// req.body will hold the text fields, if there were any
		})
		.get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
			// req.file is the `avatar` file
			HS_AttachmentsController().get(req.tenant, 'Cotizacion', req.params.id, function (statuscode, result) {
				if (statuscode != 200) {
					res.status(statuscode).json(result);
				} else
					res.status(200).json(result);
			})
			// req.body will hold the text fields, if there were any
		})
		.delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
			// req.file is the `avatar` file
			HS_AttachmentsController().getOne(req.tenant, 'Cotizacion', req.params.id, function (stat, result) {
				if (stat != 200) {
					res.status(500).json(result);
				} else {
					if (result) {
						fs.unlink(result.ruta + result.internalFilename, function (errFile) {
							if (errFile)
								res.status(500).json(errFile);
							else {
								HS_AttachmentsController().delete(req.tenant, {
									tipoEntidad: 'Cotizacion',
									id: req.params.id
								}, function (statusCode, result) {
									res.status(statusCode, result);
								})
							}
						})
					} else {
						res.status(404).json(err);
					}
				}
			});
			// Everything went fine
			// req.body will hold the text fields, if there were any
		})
	app.route('/Cotizacion/download/:id')
		.get(function (req, res) {
			// req.file is the `avatar` file
			HS_AttachmentsController().getOne(req.tenant, 'Cotizacion', req.params.id, function (stat, result) {
				if (result) {
					fs.readFile('uploads/Cotizacion/' + result.internalFilename, function (err, data) {
						if (!err) {
							res.writeHead(200, { 'Content-Type': result.contentType });
							res.end(data, 'binary');
						} else {
							res.status(400).json('Not Found');
						}
					});
				}
			});
			// req.body will hold the text fields, if there were any
		})
	app.route('/CotizacionServicios/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {			
			CotizacionServiciosController().update(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.delete(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionServiciosController().delete(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionServiciosController().getbyId(req, res, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
	app.route('/CotizacionesNoCerradas')
		.get(function (req, res) {
			CotizacionServiciosController().getAllNotClosed(req.userId, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CotizacionServicios')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionServiciosController().getAll(req.tenant, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.post(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionServiciosController().create(req.userId, req.tenant, req.body, res, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
	app.route('/CotizacionFiltros')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionController().getByEstado(req.query, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
	app.route('/CotizacionRechazaCliente/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionController().clienteRechaza(req.userId, req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CotizacionAceptaCliente/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionController().clienteAcepta(req.tenant, req.userId, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CotizacionAgregarOrdenCompra/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionController().asignarOrderCompra(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CancelarCotizacion/:id')
		.put(/*function(req,res,next){validateRolAccess(req,res,next)}
,*/function (req, res) {
			CotizacionController().CancelarCotizacion(req.tenant, req.userId, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/ordenConfirmacionServicios/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			CotizacionServiciosController().confirmacionOrden(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/CotizacionLiquidacion/:id')
		.put(function (req, res, next) { validateRolAccess(req, res, next) },
		function (req, res) {
			CotizacionServiciosController().pasarLiquidacion(req.userId, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			})
		})
}