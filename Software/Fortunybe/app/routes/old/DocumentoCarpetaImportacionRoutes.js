var documentoCarpetaImportacionController = require('../controller/documentoCarpetaImportacionController');
var validateRolAccess = require('../services/validateRolAcess');
module.exports = function (app) {
	app.route('/resumenImportacion/:id')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
			documentoCarpetaImportacionController().getResumenDocumentos(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/elementoImportacion/:id')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			documentoCarpetaImportacionController().getElementoByCarpeta(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/datosOrdenCompra/:id')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			documentoCarpetaImportacionController().getCarpetaImportWithOC(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/documentoCarpImportacion')
		.post(function (req, res, next) { validateRolAccess(req, res, next) }
        , function (req, res) {
			documentoCarpetaImportacionController().crearDocumento(req.userId, req.tenant, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.get(function (req, res, next) { validateRolAccess(req, res, next) },
		function (req, res) {
			documentoCarpetaImportacionController().getAll(function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
    app.route('/detalleDocumentoCarpImportacion/:id')
		.get(function (req, res) {
			documentoCarpetaImportacionController().getDetailedDocumentById(req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		});
   	app.route('/documentoCarpImportacion/:id')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			documentoCarpetaImportacionController().getDocumentoById(req.tenant, req.params.id, req.query.idAsociado, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.put(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			documentoCarpetaImportacionController().actualizarDocumento(req.tenant, req.userId, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.delete(/*function(req,res,next){ validateRolAccess(req,res,next)}
	      ,*/function (req, res) {
			  
			documentoCarpetaImportacionController().eliminarDocumento(req.params.id, req.query, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/documentoCarpImportacionElemento/:id')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			documentoCarpetaImportacionController().getDocumentoByElemento(req.tenant, req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	app.route('/documentoRecientes')
		.get(function (req, res, next) { validateRolAccess(req, res, next) }
		, function (req, res) {
			documentoCarpetaImportacionController().getDocumentoRecientes(req.tenant, req.query.carpeta, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
	//  CASO ESPECIAL: esta ruta lleva a crear un documento pero donde los items del detalle pueden ser asociadas a una o varias carpetas de importacion diferentes.
	app.route('/documentoCarpImportacionDetalleAsignado')
		.post(/*function(req,res,next){validateRolAccess(req,res,next)}
        ,*/function (req, res) {
			documentoCarpetaImportacionController().crearDocumentoConCarpetaAsociada(req.userId, req.tenant, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
    app.route('/documentoImportacionEspecial/:id')
		.put(/*function(req,res,next){validateRolAccess(req,res,next)}
	      ,*/function (req, res) {
			documentoCarpetaImportacionController().actualizarDocumentoEspecial(req.tenant, req.userId, req.params.id, req.body, function (statusCode, result) {
				res.status(statusCode).json(result);
			});
		})
		.delete(function (req, res) {
					
			documentoCarpetaImportacionController().eliminarDocumentoEspecial(req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			})
		})
	
	app.route('/documentoDetalleEspecial/:id')
		
		.delete(function (req, res) {					
			documentoCarpetaImportacionController().eliminardetalleDocumentoespecial(req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			})
		})
	
	app.route('/documentoEspecialPadre/:id')
		
		.delete(function (req, res) {					
			documentoCarpetaImportacionController().eliminarDocumentoEspecialPadre(req.params.id, function (statusCode, result) {
				res.status(statusCode).json(result);
			})
		})
}