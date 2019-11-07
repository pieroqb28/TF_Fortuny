var async = require('async');
var InventarioController = require('./InventarioController');
module.exports = function () {
    function validarCantidadArticulos(articulos) {
        if (articulos.length > 0) {
            var cantTotalArticulos = 0;
            var validacionArticulos = true
            for (i = 0; i < articulos.length; i++) {
                if (articulos[i].cantidad > articulos[i].cantidad_inventario || articulos[i].cantidad > articulos[i].cantidad_cliente /*|| articulos[i].cantidad_inventario < 0 && articulos[i].cantidad <= articulos[i].cantidad_cliente*/) {
                    validacionArticulos = false
                }
                cantTotalArticulos += articulos[i].cantidad;
            }
            if (cantTotalArticulos <= 0) {
                return false;
            } else {
                return validacionArticulos;
            }

        }
        else {
            return false
        }
    }
    return {
        getAll: function (tenantId, filtro, cb) {
            var filtroDespacho;
            if (!filtro && filtro != 0) {
                filtro = 2;
            }
            else if (filtro == undefined || !filtro) {
                filtro = 0;
            }
            switch (filtro) {
                case "0":
                    {
                        // Todos
                        filtroCliente = " ";
                        break;
                    }
                default:
                    {
                        filtroCliente = " ";
                        break;
                    }
            }
            global.db.driver.execQuery(
				/*"SELECT * "
				+ "FROM despacho "
				+ filtroDespacho + ";",*/
                "SELECT despacho.*, centro_costo.nombre proyecto, estado_despacho.estado estado_despacho FROM despacho" +
                " inner join centro_costo on despacho.centro_costo_id= centro_costo.id" +
                " inner join estado_despacho on despacho.estado_id=estado_despacho.id;",
                [],
                function (err, listaDespachos) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (listaDespachos) {
                            cb(200, listaDespachos);
                        } else {
                            cb(404, { message: 'NO EXISTEN DATOS DE CLIENTES' });
                        }
                    }
                });
        },
        obtenerGuiasRemision: function (req, res, cb) {
            global.db.driver.execQuery(
                "SELECT G.*,"
                + "	F.num_factura numero_factura, F.fecha_vencimiento, F.fecha_emision "
                + "FROM guia_remision G "
                + " LEFT JOIN factura F on G.factura_id = F.id "
                + "WHERE G.despacho_id = " + req.params.id + ";",
                [],
                function (err, listaGuias) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (listaGuias) {
                            cb(200, listaGuias);
                        } else {
                            cb(404, { message: 'NO SE ENCONTRARON GUIAS' });
                        }
                    }
                }
            );
        },
        getProductosDespachar: function (proyecto, cb) {
            db.driver.execQuery(
                "SELECT " +
                "articulo.id AS articulo_id, " +
                "inventario.costo_unitario, " +
                "cotizacion_detalle.cantidad cantidad, " +
                "SUM(inventario.cantidad) cantidad_inventario, " +
                "inventario.inventario_documento_id, " +
                "articulo.nombre AS nombre_articulo, " +
                "cotizacion_detalle.cantidad AS cantidad_cliente " +
                "FROM " +
                "centro_costo " +
                "LEFT JOIN " +
                "cotizacion ON centro_costo.codigo = cotizacion.numero " +
                "LEFT JOIN " +
                "cotizacion_detalle ON cotizacion.id = cotizacion_detalle.cotizacion_id " +
                "LEFT JOIN " +
                "articulo ON cotizacion_detalle.articulo_id = articulo.id " +
                "LEFT JOIN " +
                "inventario ON cotizacion_detalle.articulo_id = inventario.articulo_id " +
                "WHERE " +
                "centro_costo.id = ? " +
                "GROUP BY articulo.id "
                ,
                [proyecto],
                function (err, resultDetalles) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        cb(200, resultDetalles);
                    }
                }
            );
        },
        getById: function (tenantId, paramId, cb) {
            var despachoConstructor = global.db.models.despacho;
            despachoConstructor.find({ id: paramId }, function (err, listDespacho) {
                if (err) {
                    cb(500, { message: 'ERROR EN EL SERVICIO' });
                }
                else {
                    if (listDespacho.length > 0) {
                        db.driver.execQuery(
                            "SELECT distinct articulo.nombre nombre_articulo,despacho_detalle.*,carpeta_importacion.id carpeta_importacion_id from despacho_detalle INNER join articulo on articulo.id= despacho_detalle.articulo_id inner join despacho on despacho.id=despacho_detalle.despacho_id inner join carpeta_importacion on carpeta_importacion.centro_costo_id= despacho.centro_costo_id  where despacho_detalle.despacho_id=?",
                            [paramId],
                            function (err, listDespachoDetalle) {
                                if (err) {
                                    cb(500, { message: "Existe un error en el Servicio" });
                                } else {
                                    if (listDespachoDetalle.length > 0) {
                                        /* db.driver.execQuery(
                                             "SELECT costo_unitario,sum(cantidad) cantidad,articulo_id,inventario_documento_id from inventario where inventario_documento_id=? group by articulo_id",
                                             [listDespachoDetalle[0].carpeta_importacion_id],
                                         */
                                        db.driver.execQuery(
                                            "SELECT SUM(tbl.cantidad) cantidad, tbl.articulo_id, tbl.inventario_documento_id FROM ( " +
                                            "SELECT i.cantidad cantidad, i.articulo_id, i.inventario_documento_id FROM inventario i " +
                                            "WHERE EXISTS( " +
                                            "SELECT 1 FROM orden_compra oc WHERE (i.entidad_id = oc.id AND oc.tipo_id = 3 AND oc.centro_costo_id = 1 AND i.inventario_tipo_origen_id = 22)) " +
                                            "UNION ALL " +
                                            "SELECT i.cantidad cantidad, i.articulo_id, i.inventario_documento_id FROM inventario i " +
                                            "WHERE EXISTS( " +
                                            "SELECT 1 FROM carpeta_importacion ci WHERE (i.inventario_documento_id = ci.id AND ci.centro_costo_id = 1 AND i.inventario_tipo_origen_id = 1)))tbl " +
                                            "GROUP BY tbl.articulo_id ",
                                            [listDespacho[0].centro_costo_id, listDespacho[0].centro_costo_id],
                                            function (err, listInventario) {
                                                if (err) {
                                                    cb(500, { message: "Existe un error en el Servicio" });
                                                } else {
                                                    for (i = 0; i < listDespachoDetalle.length; i++) {
                                                        for (j = 0; j < listInventario.length; j++) {
                                                            if (listDespachoDetalle[i].articulo_id == listInventario[j].articulo_id) {
                                                                listDespachoDetalle[i] = JSON.parse(JSON.stringify(listDespachoDetalle[i]));
                                                                listDespachoDetalle[i]['costo_unitario'] = 1/*listInventario[j].costo_unitario;*/
                                                                listDespachoDetalle[i]['cantidad_inventario'] = listInventario[j].cantidad;
                                                                listDespachoDetalle[i]['cantidad_cliente'] = listInventario[j].cantidad;
                                                                listDespachoDetalle[i]['inventario_documento_id'] = listInventario[j].inventario_documento_id;
                                                            }
                                                        }
                                                    }
                                                    listDespacho[0] = JSON.parse(JSON.stringify(listDespacho[0]));
                                                    listDespacho[0]['listaArticulos'] = listDespachoDetalle;
                                                    var guiaRemisionConstructor = global.db.models.guia_remision;
                                                    guiaRemisionConstructor.find({ despacho_id: listDespacho[0].id }, function (errGuiaRemision, listGuiaRemision) {
                                                        if (errGuiaRemision) {
                                                            cb(500, { message: "Error de Sistema" })
                                                        }
                                                        else {
                                                            listDespacho[0]['GuiaRemision'] = listGuiaRemision
                                                            cb(200, listDespacho);
                                                        }
                                                    })
                                                }
                                            }
                                        );
                                    } else {
                                        cb(404, { message: 'NO EXISTEN DATOS DE DESPACHO' });
                                    }
                                }
                            }
                        );
						/*var despachoDetalleConstructor = global.db.models.despacho_detalle;
						despachoDetalleConstructor.find({despacho_id:paramId}, function (err, listDespachoDetalle) {
						if(err){
						cb(500,{message: 'ERROR EN EL SERVICIO'});
						}
						else{
						}
						});*/
                    } else {
                        cb(404, { message: 'NO EXISTEN DATOS DE DESPACHO' });
                    }
                }
            });
        },
        create: function (tenandId, userId, body, cb) {
            if (validarCantidadArticulos(body.articulos)) {
                var articulosEvaluar = body.articulos
                var articuloGrabar = []
                for (i = 0; i < articulosEvaluar.length; i++) {
                    if (articulosEvaluar[i].cantidad > 0) {
                        articuloGrabar.push(articulosEvaluar[i])
                    }
                }
                body.articulos = articuloGrabar
                var centroCostoConstructor = global.db.models.centro_costo;
                centroCostoConstructor.find({ id: body.proyecto }, function (err, listCentroCosto) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    }
                    else {
                        if (listCentroCosto.length > 0) {
                            var cotizacionConstructor = global.db.models.cotizacion;
                            cotizacionConstructor.find({ numero: listCentroCosto[0].codigo }, function (err, listcotizacion) {
                                if (err) {
                                    cb(500, { message: 'ERROR EN EL SERVICIO' });
                                }
                                else {
                                    if (listcotizacion.length > 0) {
                                        var despachoConstructor = global.db.models.despacho;
                                        var despachoPorCrear = {
                                            codigo: body.codigo,
                                            fecha_recepcion: body.fecha_recepcion,
                                            cotizacion_id: listcotizacion[0].id,
                                            cliente_id: listcotizacion[0].cliente_id,
                                            centro_costo_id: body.proyecto,
                                            estado_id: 1,
                                            fecha_creacion: new Date(),
                                            usuario_creacion: userId,
                                        };
                                        despachoConstructor.create(despachoPorCrear, function (err, obj) {
                                            if (err) {
                                                cb(500, { err: err });
                                            } else {
                                                if (obj) {
                                                    async.each(body.articulos, function (articulosDetalle, callback) {
                                                        var detalleCotizacionConstructor = global.db.models.cotizacion_detalle;
                                                        detalleCotizacionConstructor.find({ cotizacion_id: listcotizacion[0].id, articulo_id: articulosDetalle.articulo_id }, function (err, listDetalleCotizacion) {
                                                            if (err) {
                                                                callback(500, { message: 'ERROR EN EL SERVICIO' });
                                                            }
                                                            else {
                                                                if (listDetalleCotizacion.length > 0) {
                                                                    var despachoDetalleConstructor = global.db.models.despacho_detalle;
                                                                    var despachodetallePorCrear = {
                                                                        despacho_id: obj.id,
                                                                        cantidad: articulosDetalle.cantidad,
                                                                        articulo_id: articulosDetalle.articulo_id,
                                                                        cotizacion_detalle_id: listDetalleCotizacion[0].id
                                                                    };
                                                                    despachoDetalleConstructor.create(despachodetallePorCrear, function (err, objDetalle) {
                                                                        if (err) {
                                                                            callback(err)
                                                                        } else {
                                                                            callback()
                                                                        }
                                                                    });
                                                                } else {
                                                                    callback(404, { message: 'NO EXISTE DETALLE DE COTIZACION PARA ESTE ARTICULO' });
                                                                }
                                                            }
                                                        });
                                                    }, function (err) {
                                                        if (err) {
                                                            cb(500, { message: "error en el servicio" });
                                                        }
                                                        else {
                                                            cb(200, { id: obj.id })
                                                        }
                                                    });
                                                } else {
                                                    cb(500, { err: 'ERROR' });
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        cb(404, { message: "Proyecto no relacionado a una cotización" });
                                    }
                                }
                            })
                        }
                        else {
                            cb(404, { message: 'No existe Proyecto' });
                        }
                    }
                })
            }
            else {
                cb(500, { message: "Esta despachando mas de lo disponible o la cantidad es cero" })
            }
        },
        update: function (tenantId, userId, paramId, body, cb) {
            if (validarCantidadArticulos(body.articulos)) {
                var articulosEvaluar = body.articulos
                var articuloGrabar = []
                for (i = 0; i < articulosEvaluar.length; i++) {
                    if (articulosEvaluar[i].cantidad > 0) {
                        articuloGrabar.push(articulosEvaluar[i])
                    }
                }
                body.articulos = articuloGrabar
                var centroCostoConstructor = global.db.models.centro_costo;
                centroCostoConstructor.find({ id: body.proyecto }, function (err, listCentroCosto) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    }
                    else {
                        if (listCentroCosto.length > 0) {
                            var cotizacionConstructor = global.db.models.cotizacion;
                            cotizacionConstructor.find({ numero: listCentroCosto[0].codigo }, function (err, listcotizacion) {
                                if (err) {
                                    cb(500, { message: 'ERROR EN EL SERVICIO' });
                                }
                                else {
                                    if (listcotizacion.length > 0) {
                                        var despachoConstructor = global.db.models.despacho;
                                        despachoConstructor.get(paramId, function (err, obj) {
                                            if (err) {
                                                cb(500, { err: err });
                                            }
                                            else {
                                                if (obj) {
                                                    if (obj.estado_id == 1)// estado registrado pero no se ha despachado todavia
                                                    {
                                                        //obj.codigo= body.codigo,			  	 			  	 
                                                        obj.cotizacion_id = listcotizacion[0].id,
                                                            obj.cliente_id = listcotizacion[0].cliente_id,
                                                            obj.centro_costo_id = body.proyecto,
                                                            obj.fecha_modificacion = new Date(),
                                                            obj.usuario_modificacion = userId
                                                    }
                                                    obj.fecha_recepcion = body.fecha_recepcion,
                                                        obj.save(function (err) {
                                                            if (err) {
                                                                cb(500, { err: err });
                                                            }
                                                            else {
                                                                if (obj.estado_id == 1) {
                                                                    var detalleDespachoConstructor = global.db.models.despacho_detalle;
                                                                    detalleDespachoConstructor.find({ despacho_id: paramId }).remove(function (err) {
                                                                        if (err) {
                                                                            cb(500, { message: "error de servicio" })
                                                                        }
                                                                        else {
                                                                            async.each(body.articulos, function (articulosDetalle, callback) {
                                                                                var despachoDetalleConstructor = global.db.models.despacho_detalle;
                                                                                var despachodetallePorCrear = {
                                                                                    despacho_id: paramId,
                                                                                    cantidad: articulosDetalle.cantidad,
                                                                                    articulo_id: articulosDetalle.articulo_id,
                                                                                };
                                                                                despachoDetalleConstructor.create(despachodetallePorCrear, function (err, objDetalle) {
                                                                                    if (err) {
                                                                                        callback(err)
                                                                                    } else {
                                                                                        callback()
                                                                                    }
                                                                                });
                                                                            }, function (err) {
                                                                                if (err) {
                                                                                    cb(500, { message: "error en el servicio" });
                                                                                }
                                                                                else {
                                                                                    cb(200, { id: obj.id })
                                                                                }
                                                                            });
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    cb(200, { id: obj.id })
                                                                }
                                                            }
                                                        });
                                                }
                                                else {
                                                    cb(404, { message: 'NO EXISTE ARTICULO' });
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        cb(404, { message: "Proyecto no relacionado a una cotización" });
                                    }
                                }
                            })
                        }
                        else {
                            cb(404, { message: 'No existe Proyecto' });
                        }
                    }
                })
            }
            else {
                cb(500, { message: "Esta despachando mas de lo disponible o la cantidad es cero" })
            }
        },
        cerrarDespacho: function (tenantId, userId, paramId, cb) {
            var despachoConstructor = global.db.models.despacho;
            despachoConstructor.get(paramId, function (err, obj) {
                if (err) {
                    cb(500, { err: err });
                }
                else {
                    if (obj) {
                        obj.estado_id = 4
                        obj.fecha_modificacion = new Date(),
                            obj.usuario_modificacion = userId
                        obj.save(function (err) {
                            if (err) {
                                cb(500, { err: err });
                            }
                            else {
                                cb(200, "ok")
                            }
                        })
                    }
                }
            })
        },
        delete: function (tenantId, paramId, cb) {
            var detalleDespachoConstructor = global.db.models.despacho_detalle;
            detalleDespachoConstructor.find({ despacho_id: paramId }).remove(function (errDetalle) {
                if (errDetalle) {
                    cb(500, { message: "error de servicio" })
                }
                else {
                    var despachoConstructor = global.db.models.despacho;
                    despachoConstructor.get(paramId, function (err, objeto) {
                        if (objeto) {
                            objeto.remove(function (err) {
                                if (err) {
                                    return cb(500, { err: 'ERROR' });
                                } else {
                                    return cb(200, { id: paramId });
                                }
                            });
                        } else {
                            return cb(404, { err: 'NO ENCONTRADO' });
                        }
                    });
                }
            })
        },
        despachar: function (tenandId, userId, body, cb) {
            var numMaximoLineas = 30
            if (validarCantidadArticulos(body.articulos)) {
                var articulosEvaluar = body.articulos
                var articuloGrabar = []
                for (i = 0; i < articulosEvaluar.length; i++) {
                    if (articulosEvaluar[i].cantidad > 0) {
                        articuloGrabar.push(articulosEvaluar[i])
                    }
                }
                body.articulos = articuloGrabar
                async.each(body.articulos, function (articulosDetalle, callback) {
                    var objInventario = {}
                    objInventario.fecha = new Date()
                    objInventario.inventario_tipo_origen_id = 20
                    objInventario.entidad_id = body.despacho_id
                    objInventario.articulo_id = articulosDetalle.articulo_id
                    objInventario.inventario_tipo_operacion_id = 1
                    objInventario.cantidad = (articulosDetalle.cantidad) * (-1)
                    objInventario.costo_unitario = articulosDetalle.costo_unitario
                    objInventario.inventario_tipo_documento_id = 10
                    objInventario.inventario_documento_id = articulosDetalle.inventario_documento_id
                    InventarioController().registroInventario(tenandId, userId, objInventario, function (codigoInv, resultInv) {
                        if (codigoInv != 200) {
                            callback(codigoInv)
                        }
                        else {
                            callback()
                        }
                    })
                }, function (err) {
                    if (err) {
                        cb(500, { message: "error en el servicio" });
                    }
                    else {
                        var despachoConstructor = global.db.models.despacho;
                        despachoConstructor.get(body.despacho_id, function (err, obj) {
                            if (err) {
                                cb(500, { err: err });
                            }
                            else {
                                if (obj) {
                                    obj.estado_id = 3
                                    obj.fecha_modificacion = new Date(),
                                        obj.usuario_modificacion = userId
                                    obj.save(function (err) {
                                        if (err) {
                                            cb(500, { err: err });
                                        }
                                        else {
                                            var detalleDespachoConstructor = global.db.models.despacho_detalle;
                                            detalleDespachoConstructor.find({ despacho_id: body.despacho_id }, function (err, listADetalleDespacho) {
                                                if (err) {
                                                    cb(500, { message: 'ERROR EN EL SERVICIO' });
                                                }
                                                else {
                                                    if (listADetalleDespacho.length > 0) {
                                                        var totalGuias = Math.ceil(listADetalleDespacho.length / numMaximoLineas)
                                                        var cantIni = 0
                                                        if (listADetalleDespacho.length > numMaximoLineas) {
                                                            var cantMax = numMaximoLineas
                                                        }
                                                        else {
                                                            var cantMax = listADetalleDespacho.length
                                                        }
                                                        var guiaRemisionNumero = body.guia_remision_numero
                                                        var guiaRemisionSerie = body.guia_remision_serie
                                                        var i = 0
                                                        async.whilst(function () { return i < (totalGuias) },
                                                            function (cbf) {
                                                                var guiaRemisionConstructor = global.db.models.guia_remision;
                                                                var guiaRemisionPorCrear = {
                                                                    codigo: guiaRemisionSerie + "-" + guiaRemisionNumero,
                                                                    serie: guiaRemisionSerie,
                                                                    despacho_id: body.despacho_id,
                                                                    numero_pedido: body.datosGuiaRemision.numero_pedido,
                                                                    punto_llegada: body.datosGuiaRemision.punto_llegada,
                                                                    punto_partida: body.datosGuiaRemision.punto_partida,
                                                                    transporte_rs: body.datosGuiaRemision.transporte_rs,
                                                                    transporte_ruc: body.datosGuiaRemision.transporte_ruc,
                                                                    cotizacion_id: obj.cotizacion_id,
                                                                    fecha_creacion: new Date(),
                                                                    usuario_creacion: userId,
                                                                };
                                                                guiaRemisionConstructor.create(guiaRemisionPorCrear, function (err, objGuiaRemision) {
                                                                    if (err) {
                                                                        cbf(500, { err: err });
                                                                    } else {
                                                                        if (objGuiaRemision) {
                                                                            var listaArticulosGrabar = []
                                                                            for (m = cantIni; m < cantMax; m++) {
                                                                                listaArticulosGrabar.push(listADetalleDespacho[m])
                                                                            }
                                                                            async.each(listaArticulosGrabar, function (detallesDespacho, callback) {
                                                                                var guiaRemisionDetalleConstructor = global.db.models.guia_remision_detalle;
                                                                                var guiaRemisionDetallePorCrear = {
                                                                                    guia_remision_id: objGuiaRemision.id,
                                                                                    cantidad: detallesDespacho.cantidad,
                                                                                    articulo_id: detallesDespacho.articulo_id,
                                                                                    cantidad_recibida: detallesDespacho.cantidad,
                                                                                    despacho_detalle_id: detallesDespacho.id
                                                                                };
                                                                                guiaRemisionDetalleConstructor.create(guiaRemisionDetallePorCrear, function (err, objDetallegiaRemision) {
                                                                                    if (err) {
                                                                                        callback(500, { err: err });
                                                                                    } else {
                                                                                        if (objDetallegiaRemision) {
                                                                                            callback()
                                                                                        }
                                                                                        else {
                                                                                            callback(500, { err: "error al crear guisa de remision" });
                                                                                        }
                                                                                    }
                                                                                })
                                                                            }, function (err) {
                                                                                if (err) {
                                                                                    cbf(500, { message: "error en el servicio" });
                                                                                }
                                                                                else {
                                                                                    cantIni = cantMax
                                                                                    if ((cantMax + numMaximoLineas) >= listADetalleDespacho.length) {
                                                                                        cantMax = listADetalleDespacho.length
                                                                                    }
                                                                                    else {
                                                                                        cantMax = cantMax + numMaximoLineas
                                                                                    }
                                                                                    var cantNUmGuiaREmision = guiaRemisionNumero.length
                                                                                    guiaRemisionNumero = Number(guiaRemisionNumero) + 1
                                                                                    var nuevoNUmero = ""
                                                                                    for (h = 0; h < (cantNUmGuiaREmision - (guiaRemisionNumero.toString()).length); h++) {
                                                                                        nuevoNUmero = nuevoNUmero + '0'
                                                                                    }
                                                                                    guiaRemisionNumero = nuevoNUmero + guiaRemisionNumero
                                                                                    i++
                                                                                    cbf()
                                                                                }
                                                                            })
                                                                        }
                                                                        else {
                                                                            cbf(500, { err: "error al crear guisa de remision" });
                                                                        }
                                                                    }
                                                                })
                                                            },
                                                            function (err, result) {
                                                                if (err) {
                                                                    cb(500, { message: result })
                                                                }
                                                                else {
                                                                    cb(200, { id: obj.id })
                                                                }
                                                            })
                                                    } else {
                                                        cb(404, { message: 'NO EXISTEN DATOS DE ARTICULO' });
                                                    }
                                                }
                                            });
                                        }
                                    })
                                }
                            }
                        })
                    }
                });
            }
            else {
                cb(500, { message: "Esta despachando mas de lo disponible o la cantidad es cero" })
            }
        },
        ultimoDespachoCreado: function (tenandId, cb) {
            global.db.driver.execQuery(
                "SELECT * FROM despacho order by fecha_creacion desc limit 1;",
                [],
                function (err, ultimoDespacho) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (ultimoDespacho) {
                            cb(200, ultimoDespacho);
                        } else {
                            cb(404, { message: 'NO SE ENCONTRARON GUIAS' });
                        }
                    }
                }
            );
        }
    }
}