var ReqCompraController = require('../controller/ReqCompraController');
var HS_AttachmentsController = require('../controller/HS_AttachmentsController');
var validateRolAccess = require('../services/validateRolAcess');
var exportPDF = require('../services/exportPDF');
var multer = require('multer');
var upload = multer({ dest: 'uploads/ReqCompra/' }).single('uploadfile');
var fs = require('fs');

module.exports = function (app) {

    app.route('/ReqCompra/upload/:id')
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            upload(req, res, function (err) {
                if (err) {
                    // An error occurred when uploading
                    res.status(500).json(err);
                } else {

                    HS_AttachmentsController().post(req.userId, req.tenant, {
                        filename: req.file.originalname,
                        internalFilename: req.file.filename,
                        tipoEntidad: 'ReqCompra',
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

            HS_AttachmentsController().get(req.tenant, 'ReqCompra', req.params.id, function (statuscode, result) {
                if (statuscode != 200) {
                    res.status(statuscode).json(result);
                } else
                    res.status(200).json(result);
            })

            // req.body will hold the text fields, if there were any
        })
        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            // req.file is the `avatar` file

            HS_AttachmentsController().getOne(req.tenant, 'ReqCompra', req.params.id, function (stat, result) {
                if (stat != 200) {
                    res.status(500).json(result);
                } else {
                    if (result) {
                        fs.unlink(result.ruta + result.internalFilename, function (errFile) {
                            if (errFile)
                                res.status(500).json(errFile);
                            else {

                                HS_AttachmentsController().delete(req.tenant, {
                                    tipoEntidad: 'ReqCompra',
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


    app.route('/ReqCompra/download/:id')
        .get(function (req, res) {
            // req.file is the `avatar` file
            HS_AttachmentsController().getOne(req.tenant, 'ReqCompra', req.params.id, function (stat, result) {
                if (result) {
                    fs.readFile('uploads/ReqCompra/' + result.internalFilename, function (err, data) {
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

    /*------------------------------------------------------------------
    ------------------------------------------------------------------
                    Req COMPRA ACCCESO TOTAL
    ------------------------------------------------------------------
    ------------------------------------------------------------------*/


    app.route('/ReqCompra/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().update(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })

        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().delete(req.tenant, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().getbyId(req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });

    app.route('/ReqCompra')
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().getAll(req.tenant, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        // puedes crear cualquier Req de compra
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().create(req.userId, req.tenant, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });

    /*------------------------------------------------------------------
    ------------------------------------------------------------------
                    Req COMPRA SOLO DE SERVICIOS
    ------------------------------------------------------------------
    ------------------------------------------------------------------*/

  /*  app.route('/ReqCompraServicios')
        // solo te permite crear solo OC de servicios
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().getAllServicios(req.tenant, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().createServicio(req.userId, req.tenant, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });
    app.route('/ReqCompraServicios/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().updateServicio(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })

        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().deleteServicio(req.tenant, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().getbyIdServicio(req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });
*/

    /*------------------------------------------------------------------
    ------------------------------------------------------------------
                    Req COMPRA EXCEPTO DE SERVICIOS
    ------------------------------------------------------------------
    ------------------------------------------------------------------*/

/*    app.route('/ReqComprarNoServicios')
        // solo te rpermite crear OC excepto los de servicios
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().getAllNoServicios(req.tenant, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().createNoServicio(req.userId, req.tenant, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });

    app.route('/ReqComprarNoServicios/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().updateNoServicio(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })

        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().deleteNoServicio(req.tenant, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().getbyIdNoServicio(req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });

*/
    /*----------------------------------------------------------------------------------------------------------------
      ----------------------------------------------------------------------------------------------------------------*/

 /*   app.route('/ReqCompraFactura')
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().generarFactura(req.userId, req.tenant, req.body, res, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });
    app.route('/pasarInventarioReqCompraFactura')
        .post(function (req, res) {
            ReqCompraController().pasarInventario(req.userId, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });*/
    app.route('/proveedorRequiereCambios/:id')
        .put(function (req, res) {
            ReqCompraController().proveedorRequiereCambios(req.userId,req.rolId, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })
    app.route('/ReqCompraCancelar/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().cancelarReqCompra(req.userId, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
                console.log(result)
            });
        })
    app.route('/ReqCompraVerificarCancelable/:id')
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            ReqCompraController().esCancelable(req.userId, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
                console.log(result);
            });
        })
    app.route('/ReqCompra/Export/:id')
        .get(function (req, res) {
            var templatePDF = "";
            var nombrePDF = "";
                 templatePDF = "ReqCompraNacionalPDF";
                 nombrePDF = "ReqCompraNacional";
            
            
            ReqCompraController().getPrint(req.params.id, function (status, result) {
                if (status == 200) {
                    var nombrePdf = (result[0].pagina[0].numero).split("/")
                    nombrePdf = nombrePdf[0] + nombrePdf[1]

                    console.log(result[0].pagina[0]);
                    exportPDF(status, result, templatePDF, nombrePDF, function (status, result) {
                        res.writeHead(status, { "Content-Disposition": "inline;filename=" + nombrePdf + ".pdf", 'Content-Type': 'application/pdf' });
                        res.end(result, 'binary');
                    })
                } else {
                    res.status(status).json(result);
                }
            });
        });


}
