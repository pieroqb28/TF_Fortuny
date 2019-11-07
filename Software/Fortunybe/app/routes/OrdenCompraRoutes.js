var OrdenCompraController = require('../controller/OrdenCompraController');
var HS_AttachmentsController = require('../controller/HS_AttachmentsController');
var validateRolAccess = require('../services/validateRolAcess');
var exportPDF = require('../services/exportPDF');
var multer = require('multer');
var upload = multer({ dest: 'uploads/OrdenCompra/' }).single('uploadfile');
var fs = require('fs');

module.exports = function (app) {

    app.route('/OrdenCompra/upload/:id')
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            upload(req, res, function (err) {
                if (err) {
                    // An error occurred when uploading
                    res.status(500).json(err);
                } else {

                    HS_AttachmentsController().post(req.userId, req.tenant, {
                        filename: req.file.originalname,
                        internalFilename: req.file.filename,
                        tipoEntidad: 'OrdenCompra',
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

            HS_AttachmentsController().get(req.tenant, 'OrdenCompra', req.params.id, function (statuscode, result) {
                if (statuscode != 200) {
                    res.status(statuscode).json(result);
                } else
                    res.status(200).json(result);
            })

            // req.body will hold the text fields, if there were any
        })
        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            // req.file is the `avatar` file

            HS_AttachmentsController().getOne(req.tenant, 'OrdenCompra', req.params.id, function (stat, result) {
                if (stat != 200) {
                    res.status(500).json(result);
                } else {
                    if (result) {
                        fs.unlink(result.ruta + result.internalFilename, function (errFile) {
                            if (errFile)
                                res.status(500).json(errFile);
                            else {

                                HS_AttachmentsController().delete(req.tenant, {
                                    tipoEntidad: 'OrdenCompra',
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


    app.route('/OrdenCompra/download/:id')
        .get(function (req, res) {
            // req.file is the `avatar` file
            HS_AttachmentsController().getOne(req.tenant, 'OrdenCompra', req.params.id, function (stat, result) {
                if (result) {
                    fs.readFile('uploads/OrdenCompra/' + result.internalFilename, function (err, data) {
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
                    ORDEN COMPRA ACCCESO TOTAL
    ------------------------------------------------------------------
    ------------------------------------------------------------------*/


    app.route('/OrdenCompra/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().update(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })

        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().delete(req.tenant, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().getbyId(req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });

    app.route('/OrdenCompra')
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().getAll(req.tenant, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        // puedes crear cualquier orden de compra
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().create(req.userId, req.tenant, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });

    /*------------------------------------------------------------------
    ------------------------------------------------------------------
                    ORDEN COMPRA SOLO DE SERVICIOS
    ------------------------------------------------------------------
    ------------------------------------------------------------------*/

    app.route('/OrdenCompraServicios')
        // solo te permite crear solo OC de servicios
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().getAllServicios(req.tenant, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().createServicio(req.userId, req.tenant, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });
    app.route('/OrdenCompraServicios/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().updateServicio(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })

        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().deleteServicio(req.tenant, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().getbyIdServicio(req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });


    /*------------------------------------------------------------------
    ------------------------------------------------------------------
                    ORDEN COMPRA EXCEPTO DE SERVICIOS
    ------------------------------------------------------------------
    ------------------------------------------------------------------*/

    app.route('/OrdenComprarNoServicios')
        // solo te rpermite crear OC excepto los de servicios
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().getAllNoServicios(req.tenant, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().createNoServicio(req.userId, req.tenant, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });

    app.route('/OrdenComprarNoServicios/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().updateNoServicio(req.userId, req.tenant, req.params.id, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })

        .delete(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().deleteNoServicio(req.tenant, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        })

        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().getbyIdNoServicio(req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });


    /*----------------------------------------------------------------------------------------------------------------
      ----------------------------------------------------------------------------------------------------------------*/

    app.route('/OrdenCompraFactura')
        .post(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().generarFactura(req.userId, req.tenant, req.body, res, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });
    app.route('/pasarInventarioOrdenCompraFactura')
        .post(/*function(req, res, next) { validateRolAccess(req, res, next) }, */function (req, res) {
            OrdenCompraController().pasarInventario(req.userId, req.body, function (statusCode, result) {
                res.status(statusCode).json(result);
            });
        });
    app.route('/proveedorRequiereCambios/:id')
        .put(/*function (req, res, next) { validateRolAccess(req, res, next) },*/ function (req, res) {
            OrdenCompraController().proveedorRequiereCambios(req.userId,req.rolId, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);

            });
        })
    app.route('/OrdenCompraCancelar/:id')
        .put(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().cancelarOrdenCompra(req.userId, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
                console.log(result)
            });
        })
    app.route('/OrdenCompraVerificarCancelable/:id')
        .get(function (req, res, next) { validateRolAccess(req, res, next) }, function (req, res) {
            OrdenCompraController().esCancelable(req.userId, req.params.id, function (statusCode, result) {
                res.status(statusCode).json(result);
                console.log(result);
            });
        })
    app.route('/OrdenCompra/Export/:id')
        .get(function (req, res) {
            var templatePDF = "";
            var nombrePDF = "";
            if (req.query.type >= 20){
                 templatePDF = "ordenCompraNacionalPDF";
                 nombrePDF = "ordenCompraNacional";
            }else{
                    switch (req.query.type) {
                    case '1':
                    case '2':
                    case '3':
                    case '5':
                    case '6':
                        {
                            templatePDF = "ordenCompraNacionalPDF";
                            nombrePDF = "ordenCompraNacional";
                            break;
                        }

                    case '4':
                        {
                            templatePDF = "ordenCompraNacionalPDF"
                            nombrePDF = "ordenCompraNacionalPDF"
                            break;
                        }
                }
            }
            
            OrdenCompraController().getPrint(req.params.id, function (status, result) {
                if (status == 200) {
                    var nombrePdf = (result[0].pagina[0].numero).split("/")
                    nombrePdf = nombrePdf[0] + nombrePdf[1]
                    exportPDF(status, result, templatePDF, nombrePDF, function (status, result) {
                        res.writeHead(status, { "Content-Disposition": "inline;filename=" + nombrePdf + ".pdf", 'Content-Type': 'application/pdf' });
                        res.end(result, 'binary');
                    })
                } else {
                    res.status(status).json(result);
                }
            });
        })
    app.route('/OrdenCompra/OrdenConf/:id')
        .get(function (req, res) {
            var templatePDF = "";
            var nombrePDF = "";
            
                templatePDF = "cartaConformidadPDF";
                nombrePDF = "cartaConformidad";
            
            
            OrdenCompraController().getPrintConf(req.params.id, function (status, result) {
                if (status == 200) {
                    var nombrePdf = (result[0].pagina[0].orden_compra).split("/")
                    nombrePdf = nombrePdf[0] + nombrePdf[1]
                    console.log(result);
                    exportPDF(status, result, templatePDF, nombrePDF, function (status, result) {
                        res.writeHead(status, { "Content-Disposition": "inline;filename=" + nombrePdf + ".pdf", 'Content-Type': 'application/pdf' });
                        res.end(result, 'binary');
                    })
                } else {
                    res.status(status).json(result);
                }
            });
        })





        ;


}
