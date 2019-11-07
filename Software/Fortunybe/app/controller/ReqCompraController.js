//var mongoose   = require('mongoose');
//var ReqCompra = require('../models/ReqCompra');
var ParametrosFactorController = require('../controller/ParametrosFactorController');
var CentroCostoController = require('../controller/CentroCostoController');
var numMoneda = require('../services/numerosMonedas');
var maskDate = 'DD/MM/YY';
var InventarioController = require('./InventarioController');
var async = require('async');
//var Decimal = require('decimal');
module.exports = function () {
    
    function traerReqCompra(params, condicional, cb) {
        db.driver.execQuery(
            "SELECT " +
            "oc.* , pro.nombre nombre_00,pro1.nombre nombre_01, pro2.nombre nombre_02, pro3.nombre nombre_03,cat.nombre categoria, proy.nombre proyecto, est.nombre estado_req_compra, concat(hu.nombres , ' ' , hu.apellidos)  as solicitante  " +
            "FROM " +
            "Req_compra oc " +
            "LEFT JOIN " +
            "estado_Req_compra est ON oc.estado_id = est.id " +
            "LEFT JOIN " +
            "hs_usuario hu  ON oc.usuario_creacion = hu.id " +
            "LEFT JOIN "+    
            "proveedor pro ON pro.id = oc.proveedor_id0 " +     
		    "LEFT JOIN " +    
            "proveedor pro1 ON pro1.id = oc.proveedor_id1 " +      
			"LEFT JOIN " +    
            "proveedor pro2 ON pro2.id = oc.proveedor_id2 " +     
            "LEFT JOIN " +    
            "proveedor pro3 ON pro3.id = oc.proveedor_id3 " +
            " LEFT JOIN " +
            " categoria cat ON cat.id = oc.categoria " +
            " LEFT JOIN " +
            " proyectos proy ON proy.id = oc.proyecto " +
            "WHERE " +
            "oc.id = ?" + condicional + ";", [params],
            function (err, listObj) {
                if (err) {
                    console.log(err);
                    cb(500, { message: "Existe un error en el servicio" });
                } else {
                    if (listObj.length > 0) {
                        if (listObj[0].tipo_id != 1 && listObj[0].tipo_id <20) {
                            db.driver.execQuery(
                                "SELECT cd.*, a.codigo_articulo, a.nombre articulo" + " FROM req_compra_detalle cd" + " INNER JOIN articulo a ON cd.articulo_id = a.id" + " WHERE cd.req_compra_id = ?;", [params],
                                function (err, listObjDetails) {
                                    if (err) { } else {
                                        if (listObjDetails && listObjDetails != "") {
                                            listObj[0].detalles = listObjDetails
                                        }
                                    }
                                    cb(200, listObj);
                                }
                            );
                        } else {
                            db.driver.execQuery(
                                "SELECT cd.*,cd.descripcion articulo" + " FROM Req_compra_detalle cd" + " WHERE cd.Req_compra_id = ?;", [params],
                                function (err, listObjDetails) {
                                    if (err) { } else {
                                        if (listObjDetails && listObjDetails != "") {
                                            listObj[0].detalles = listObjDetails
                                        }
                                    }
                                    cb(200, listObj);
                                }
                            );
                        }
                    } else {
                        cb(500, { message: 'La Req de compra no existe.' });
                    }
                }
            }
        );
    }
    function crearReqCOmpra(userId, tenantId, body, cb) {
        console.log("******")
        console.log(body);
        var verificacion = {
            codigo: 200
        };
        if (body.estado_id == 9) {
            verificacion = verificarReqCompraGrabar(body);
        } else {
            verificacion = verificarReqCompra(body);
        }
        if (verificacion.codigo != 200) {
            cb(verificacion.codigo, { message: verificacion.texto });
        } else {
            if (body.idCotizacion == "") {
                body.idCotizacion = 0
            }
            var ReqCompraConstructor = global.db.models.req_compra;
            traerProyecto(body, function (errCodigo, Proyecto) {
                if (errCodigo != 200) {
                    cb(errCodigo, Proyecto)
                }
                else {
                    var proyectoId = Proyecto.idProyecto
                    var terminosycondiciones = body.terminos_condiciones ? (body.terminos_condiciones).split("\\%").join("\%") : "";
                    ReqCompraConstructor.create({
                        numero: body.numero,
                        fecha: body.fecha_requerimiento,
                        fecha_entrega: body.fecha_entrega,

                        moneda: body.moneda,
                        notas: body.notas,
                        centro_costo_id: body.centro_costo_id,
                        total_detalle: body.totalDetalle,
                        igv: body.impuestoAplicado,
                        orden_compra_id: body.idCotizacion,
                        total: body.total_ReqCompra,
                        tipo_id: body.tipo_id,
                        estado_id: body.estado_id,
                        centro_costo: body.centro_costo,
                        presupuestado: body.presupuestado,
                       
                        proveedor_id0: body.proveedor_id0,
                        proveedor_id1: body.proveedor_id1,
                        proveedor_id2: body.proveedor_id2,
                        proveedor_id3: body.proveedor_id3,

                        numero_secuencia: body.numero_secuencia,
                        usuario_creacion: userId,
                        fecha_creacion: new Date()
                        //,grupo_aprobacion_id: body.grupo_aprobacion_id
                    }, function (err, objReqCompra) {
                        if (err) {
                            console.log(err);

                            cb(500, { message: "Existe un error en el servicio" });
                        } else {
                            if (objReqCompra) {
                                var ReqCompraId = objReqCompra.id;
                                var ReqCompraConstructor = global.db.models.req_compra_detalle;
                                var correcto = true;
                                var detallesCreadosId = [];
                                for (i = 0; i < body.detalles.length; i++) {
                                    var detalle = body.detalles[i];
                                    // el body.estado_id==1 quiere decir que tiene un tipo de gasto
                                        ReqCompraConstructor.create({
                                            req_compra_id: ReqCompraId,
                                            numero: detalle.numero,
                                            pos: detalle.posicion,
                                            articulo_id: detalle.articulo_id,
                                            descripcion: detalle.articulo,
                                            cantidad: detalle.cantidad,
                                            precio_unitario: detalle.precio_unitario,
                                            precio_total: detalle.sub_total,
                                        }, function (err, obj) {
                                            if (err) {
                                                console.log(err);
                                                correcto = false
                                            } else {
                                                detallesCreadosId.push(obj.id);
                                            }
                                        });
                                   
                                    if (!correcto)
                                        break;
                                }
                                if (!correcto) {
                                    // Creacion incorrecta
                                    // Se debe eliminar la ReqCompra creada y los detalles que llegaron a ser creados
                                    for (detalle in detallesCreadosId) {
                                        // Eliminacion de los detalles creados
                                        ReqCompraConstructor.findOneAndRemove({ id: detalle.id, tenant: tenandId }, function (err) { });
                                    }
                                      console.log(err);
                                    cb(500, { message: "Existe un error en el Servicio" });
                                } else {
                                    // Creacion correcta  
                                    cb(200, objReqCompra);
                                }
                            } else {
                                  console.log(err);
                                cb(500, { message: "Existe un error en el Servicio" });
                            }
                        }
                    });
                }
            })
        }
    }
    function actualizarOrdCompra(userId, tenandId, paramId, toUpd, cb) {
        var verificacion = {
            codigo: 200
        };
        if (toUpd.estado_id == 1) {
            verificacion = verificarReqCompraGrabar(toUpd);
        } else {
            verificacion = verificarReqCompra(toUpd);
        }
        if (verificacion.codigo != 200) {
            cb(verificacion.codigo, { message: verificacion.texto });
        } else {
            if (toUpd.idCotizacion == "") {
                toUpd.idCotizacion = 0
            }
            
            traerProyecto(toUpd, function (errCodigo, Proyecto) {
                if (errCodigo != 200) {
                   
                    cb(errCodigo, Proyecto)
                }
                else {
                    
                    var proyectoId = Proyecto.idProyecto
                    
                    var cotizacionConstructor = global.db.models.req_compra;
                    cotizacionConstructor.get(paramId, function (err, objeto) {
                        if (err) {
                            cb(500, { message: "Existe un error en el servicio" });
                        } else if (objeto) {
                            var numeroCotizacion = objeto.numero
                            var terminosycondiciones = toUpd.terminos_condiciones ? (toUpd.terminos_condiciones).split("\\%").join("\%") : "";
                            var datosGrabar = {
                                numero: toUpd.numero,
                                fecha: toUpd.fecha_requerimiento,
                                fecha_entrega: toUpd.fecha_entrega,
                                moneda: toUpd.moneda,
                                notas: toUpd.notas,
                                total_detalle: toUpd.totalDetalle,
                                orden_compra_id: toUpd.orden_compra_id,
                                centro_costo: toUpd.centro_costo,
                                total: toUpd.total_ReqCompra,
                                tipo_id: toUpd.tipo_id,
                                estado_id: toUpd.estado_id,
                                presupuestado : toUpd.presupuestado,

                                proveedor_id0: toUpd.proveedor_id0,
                                proveedor_id1: toUpd.proveedor_id1,
                                proveedor_id2: toUpd.proveedor_id2,
                                proveedor_id3: toUpd.proveedor_id3,


                                usuario_modificacion: userId,
                                fecha_modificacion: new Date()
                            };
                            if (toUpd.centro_costo_id != ""){
                                datosGrabar.centro_costo_id = toUpd.centro_costo_id;    
                            }
                            

                            if (toUpd.estado_id == 2) {
                                datosGrabar.estado_id = 2;
                            }
                            if (toUpd.fecha_aceptacion_proveedor != "" && toUpd.fecha_aceptacion_proveedor != null) {
                                datosGrabar.estado_id = 6;
                                datosGrabar.fecha_aceptacion_proveedor = toUpd.fecha_aceptacion_proveedor;
                                datosGrabar.Req_compra_cliente = toUpd.Req_compra_cliente;
                            }
                            objeto.save(datosGrabar, function (err) {
                                if (err) {
                                    cb(500, { message: "Existe un error en el Servicio" });
                                } else {
                                    /* ELIMINACION Y POSTERIOR CREACION DE LAS FILAS DEL DETALLE */
                                    /*  if (toUpd.fecha_aceptacion_proveedor != "" && toUpd.fecha_aceptacion_proveedor != null) {
                                    crearCentroCosto(tenandId, userId, toUpd.proveedor_id, numeroCotizacion)
                                    }*/
                                    var Req_compra_DetailConstructor = global.db.models.req_compra_detalle;
                                    Req_compra_DetailConstructor.find({ Req_compra_id: paramId }).remove(function (err) {
                                        if (err) {
                                            cb(500, { message: "Existe un error en el servicio" });
                                        } else {
                                            var correcto = true;
                                            var detallesCreadosId = [];
                                            for (i = 0; i < toUpd.detalles.length; i++) {
                                                var detalle = toUpd.detalles[i];
                                                Req_compra_DetailConstructor.create({
                                                    req_compra_id: paramId,
                                                    numero: detalle.numero,
                                                    pos: detalle.posicion,
                                                    articulo_id: detalle.articulo_id,
                                                    descripcion: detalle.articulo,
                                                    cantidad: detalle.cantidad,
                                                    precio_unitario: detalle.precio_unitario,
                                                    precio_total: detalle.sub_total,
                                                }, function (err, obj) {
                                                    if (err) {
                                                        correcto = false
                                                    } else {
                                                        detallesCreadosId.push(obj.id);
                                                    }
                                                });
                                            }
                                            if (correcto) {
                                                cb(200, {});
                                            } else {
                                                cb(500, { message: "Existe un error en el Servicio" });
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            cb(404, { message: 'La Req de compra no existe.' });
                        }
                    });
                }
            })
        }
    }
    function eliminarReqCOmpra(tenantId, paramId, cb) {
        var ocConstructor = global.db.models.req_compra;
        ocConstructor.get(paramId, function (err, objOC) {
            //varifica si la Req de compra es de Gastos generales
            if (objOC.tipo_id == 6) {
                //verifica si el constructor tiene factura de proveedores
                var fpContstructor = global.db.models.factura_proveedores;
                fpContstructor.find({ Req_compra: objOC.id }).remove(function (err) {
                    if (err) {
                        return cb(500, { message: "Existe un error en el Servicio" });
                    }
                });
                var ReqCompraDetailConstructor = global.db.models.req_compra_detalle;
                ReqCompraDetailConstructor.find({ Req_compra_id: paramId }).remove(function (err) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        objOC.remove(function (err) {
                            if (err) {
                                cb(500, { message: "No se pudo eliminar la Req de compra" });
                            } else {
                                cb(200, {});
                            }
                        })
                    }
                });
            } else {
                //si no ejecuta el flujo normal
                var ReqCompraDetailConstructor = global.db.models.req_compra_detalle;
                ReqCompraDetailConstructor.find({ Req_compra_id: paramId }).remove(function (err) {
                    if (err) {
                        return cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        var ReqCompraConstructor = global.db.models.req_compra;
                        ReqCompraConstructor.find({ id: paramId }).remove(function (err) {
                            if (err) {
                                cb(500, { message: "No se pudo eliminar la Req de compra" });
                            } else {
                                cb(200, {});
                            }
                        })
                    }
                });
            }

        })


    }
    function traerProyecto(body, cb) {
        
        //if (body.centro_costo_id == "") {
            var CotizacionConstructor = global.db.models.cotizacion;
            CotizacionConstructor.find({ id: body.idCotizacion }, function (err, listCotizaciones) {
                if (err) {
                    cb(500, "Existe un error")
                } else {
                    if (listCotizaciones.length > 0) {                        
                        var CCConstructor = global.db.models.centro_costo;
                        CCConstructor.find({ codigo: listCotizaciones[0].numero }, function (err, listProyecto) {
                            if (err) {
                                cb(500, "Existe un error")
                            } else {
                                if (listProyecto.length > 0) {
                                    cb(200, { idProyecto: listProyecto[0].id })
                                } else {
                                    cb(404, "No encotrado")
                                }
                            }
                        });
                    } else {
                        cb(200, {})
                    }
                }
            });
       // }
        /*else {
            cb(200, { idProyecto: body.centro_costo_id })
        }*/
    }
    function calcTotal(detalle, cb) {
        var total = 0;
        var detalleLinea;
        var detalleLineas = [];
        for (var linea in detalle) {
            total = Decimal(total).add(Decimal(detalle[linea].cantidad).mul(detalle[linea].precio_unitario).toNumber());
            detalleLinea = {
                articulo_id: detalle[linea].articulo_id,
                /*descripcion:  detalle[linea].descripcion,*/
                cantidad: Decimal(detalle[linea].cantidad).toNumber(),
                precio_unitario: Decimal(detalle[linea].precio_unitario).toNumber(),
                sub_total: Decimal(detalle[linea].cantidad).mul(detalle[linea].precio_unitario).toNumber()
            };
            detalleLineas.push(detalleLinea);
        }
        cb(detalleLineas, total);
    };
    function verificarReqCompraGrabar(ReqCompra) {
        // Verificacion de campos
        if (!ReqCompra) {
            return { codigo: 400, texto: "Datos de Req nulos." };
        } else {
            return { codigo: 200, texto: "OK - PARCIAL" };
        }
    }
    function verificarReqCompra(ReqCompra) {
        // Verificacion de campos
        if (!ReqCompra) {
            return { codigo: 400, texto: "Req de compra nula." };
        } else if (!(ReqCompra.detalles && ReqCompra.detalles instanceof Array && ReqCompra.detalles.length > 0)) {
            return { codigo: 400, texto: "La Req de compra no posee líneas de detalle" };
        } else {
            // Evaluacion de montos
            var error = false;
            if (ReqCompra.total_ReqCompra == (ReqCompra.total + (parseFloat((ReqCompra.totalAdicional + ReqCompra.totalImpuestos).toFixed(2))))) {
                var total = 0;
                var detalle = {};
                for (i = 0; i < ReqCompra.detalles.length; i++) {
                    detalle = ReqCompra.detalles[i];
                    if (detalle.cantidad * detalle.precio_unitario_factor != detalle.sub_total_factor) {
                        error = true;
                    } else {
                        total = total + detalle.sub_total_factor;
                    }
                    if (error) break;
                }
                if ((parseFloat(total.toFixed(2)) > (ReqCompra.totalDetalle - 0.05)) || (parseFloat(total.toFixed(2)) < (ReqCompra.totalDetalle + 0.05))) {
                    error = false;
                } else {
                    error = true;
                }
            } else {
                error = false;
            }
            if (error)
                return { codigo: 400, texto: "Los montos no son coherentes." };
            else
                return { codigo: 200, texto: "OK - PARCIAL" };
        }
    }







    return {
        delete: function (tenantId, paramId, cb) {
            eliminarReqCOmpra(tenantId, paramId, function (errDelete, resulDelete) {
                if (errDelete != 200) {
                    cb(errDelete, resulDelete)
                }
                else {
                    cb(200, resulDelete)
                }
            })
        },
        deleteServicio: function (tenantId, paramId, cb) {
            db.driver.execQuery(
                "SELECT * FROM Req_compra where (tipo_id=5 or tipo_id=2) and id=?;",
                [paramId],
                function (err, listReqCompra) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listReqCompra.length > 0) {
                            eliminarReqCOmpra(tenantId, paramId, function (errDelete, resulDelete) {
                                if (errDelete != 200) {
                                    cb(errDelete, resulDelete)
                                }
                                else {
                                    cb(200, resulDelete)
                                }
                            })
                        } else {
                            cb(500, { message: 'No tiene autorización' });
                        }
                    }
                }
            );
        },
        deleteNoServicio: function (tenantId, paramId, cb) {
            db.driver.execQuery(
                "SELECT * FROM Req_compra where (tipo_id<>5 and tipo_id<>2)and id=?;",
                [paramId],
                function (err, listReqCompra) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listReqCompra.length > 0) {
                            eliminarReqCOmpra(tenantId, paramId, function (errDelete, resulDelete) {
                                if (errDelete != 200) {
                                    cb(errDelete, resulDelete)
                                }
                                else {
                                    cb(200, resulDelete)
                                }
                            })
                        } else {
                            cb(500, { message: 'No tiene autorización' });
                        }
                    }
                }
            );
        },
        getAll: function (tenantId, cb) {
            db.driver.execQuery(
                "SELECT C.*, EC.nombre estado_req_compra,case when OC.numero is not null then 'Ver' else '' end as oc,oc.id as oc_id,   CC.nombre centro_costo, concat(hu.nombres , ' ' , hu.apellidos)  AS solicitante "
                + " FROM Req_compra C"
                + " INNER JOIN estado_Req_compra EC ON C.estado_id = EC.id "
                + " LEFT JOIN orden_compra OC ON OC.id = C.orden_compra_id "

                + " LEFT JOIN centro_costo CC ON C.centro_costo_id = CC.id "
                + " INNER JOIN  hs_usuario hu  ON c.usuario_creacion = hu.id " 
                + " ORDER BY C.numero DESC;",
                [],
                function (err, listObj) {
                    if (err) {
                          console.log(err);
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listObj) {
                            cb(200, listObj);
                        } else {
                            cb(500, { message: 'No existen Req compra' });
                        }
                    }
                }
            );
        },
       
        getbyId: function (params, cb) {
            var condicional = ""
            traerReqCompra(params, condicional, function (errReq, resultReq) {
                if (errReq != 200) {

                    cb(errReq, resultReq);
                }
                else {
                    console.log(resultReq)
                    cb(200, resultReq)
                }
            })
        },
     
        create: function (userId, tenantId, body, cb) {
            crearReqCOmpra(userId, tenantId, body, function (errCReate, resulCreate) {
                if (errCReate != 200) {
                    cb(errCReate, resulCreate)
                }
                else {
                    cb(200, resulCreate)
                }
            })
        },
       
        update: function (userId, tenandId, paramId, toUpd, cb) {
            
            actualizarOrdCompra(userId, tenandId, paramId, toUpd, function (errOrdCompra, resOrdeCompra) {
                if (errOrdCompra != 200) {
                    cb(errOrdCompra, resOrdeCompra)
                }
                else {
                    cb(200, resOrdeCompra)
                }
            })
        },
       
        pasarInventario: function (userId, body, cb) {
            var detalleInventario = []
            for (i = 0; i < body.detalles.length; i++) {
                if (body.detalles[i].cantidad > 0) {
                    var itemDatos = {}
                    itemDatos.inventario_tipo_origen_id = 22//proviene de una Req de compra
                    itemDatos.entidad_id = body.idReqCompra
                    itemDatos.inventario_tipo_operacion_id = 2// compra nacional 
                    itemDatos.inventario_documento_id = body.idDocumento
                    itemDatos.inventario_tipo_documento_id = 2//factura             
                    itemDatos.articulo_id = body.detalles[i].articulo_id
                    itemDatos.cantidad = body.detalles[i].cantidad
                    itemDatos.costo_unitario = body.detalles[i].costo_final
                    itemDatos.fecha = new Date()
                    detalleInventario.push(itemDatos)
                }
            }
            async.each(detalleInventario, function (item, callback) {
                InventarioController().registroInventario('tenandId', userId, item, function (codigo, inventarioCreado) {
                    if (codigo == 200) {
                        callback()
                    } else {
                        callback(codigo, inventarioCreado);
                    }
                })
            }, function (errSG) {
                if (errSG) {
                    cb(500, { message: "error en el servicio" })
                }
                else {
                    cb(200, {})
                }
            })
        },
        generarFactura: function (userId, tenant, body, res, cb) {
            var ocConstructor = global.db.models.req_compra;
            ocConstructor.get(body.Req_compra_id, function (err, objeto) {
                if (err) {
                    cb(500, { message: "Existe un error en el servicio" });
                } else {
                    if (objeto) {
                        if (objeto.factura_id && objeto.factura_id > 0) {
                            cb(500, { message: "Ya existe una factura para esta Req de compra." });
                        } else if (objeto.estado_id == 6) {
                            // Se obtiene el detalle de la Req de compra
                            db.driver.execQuery(
                                "SELECT DE.cantidad," + " (CASE WHEN DE.articulo_id IS NULL THEN DE.descripcion ELSE A.nombre END ) detalle," + " DE.articulo_id, DE.precio_unitario, DE.precio_total " + "FROM Req_compra_detalle DE " + " LEFT JOIN articulo A ON DE.articulo_id = A.id" + " WHERE DE.Req_compra_id = ?;", [body.Req_compra_id],
                                function (err, listObjDetails) {
                                    if (err || !listObjDetails) {
                                        cb(500, { message: "Existe un error en el servicio" });
                                    } else if (listObjDetails instanceof Array && listObjDetails.length > 0) {
                                        var facturaConstructor = global.db.models.factura;
                                        // Creacion de factura
                                        listObj[0].detalles = listObjDetails
                                        cb(200, listObj);
                                    } else {
                                        cb(500, { message: "La Req de compra no tiene líneas de detalle." });
                                    }
                                }
                            );
                        } else {
                            cb(500, { message: "La Req de compra debe ser aprobada por el proveedor." });
                        }
                    } else {
                        cb(500, { message: "Req de compra no encontrada." });
                    }
                }
            });
        },
        getPrint: function (paramsId, cb) {
            var cotizacionConstructor = global.db.models.cotizacion;
            var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
            db.driver.execQuery(
                "SELECT " +
                "oc.*, " +
                "us.nombres AS creador_nombre," +
                "us.apellidos AS creador_apellido," +
                "us.cargo AS creador_cargo," +
                "us.id AS creador_id," +
                "cc.nombre AS centro_costo, " +
                "pr0.nombre as proveedor1, " +
                "ifnull(pr0.ruc,'') as proveedor_ruc1, " +
                 "pr1.nombre as proveedor2, " +
                "ifnull(pr1.ruc,'') as proveedor_ruc2, " + 
                "pr2.nombre as proveedor3, " +
                "ifnull(pr2.ruc,'') as proveedor_ruc3, " +
                 "pr3.nombre as proveedor4, " +
                "ifnull(pr3.ruc,'') as proveedor_ruc4 " +
                 "FROM " +
                "req_compra oc " +
                 "LEFT JOIN " +
                "hs_usuario us ON oc.usuario_creacion = us.id " +
                "LEFT JOIN " +
                "centro_costo cc ON oc.centro_costo_id = cc.id " +
                "LEFT JOIN " +
                "proveedor pr0 ON oc.proveedor_id0 = pr0.id " +
                 "LEFT JOIN " +
                "proveedor pr1 ON oc.proveedor_id1 = pr1.id " +
                 "LEFT JOIN " +
                "proveedor pr2 ON oc.proveedor_id2 = pr2.id " +
                 "LEFT JOIN " +
                "proveedor pr3 ON oc.proveedor_id3 = pr3.id " +
                "WHERE " +
                "oc.id =?;", [paramsId],
                function (err, listObj) {
                    if (err) {
                        console.log(err);
                        cb(500, { err: err });
                    } else {
                       if (listObj.length > 0) {
                            listObj[0].igv_valor = numMoneda(listObj[0].total_detalle * listObj[0].igv, 2, ".", ",");
                            listObj[0].total_detalle = numMoneda((listObj[0].total_detalle /*+ listObj[0].desc_especial + listObj[0].go_discount*/), 2, ".", ",");
                            var emision_dia = listObj[0].fecha.getDate() > 9 ? listObj[0].fecha.getDate() : "0" + listObj[0].fecha.getDate();
                            var emision_mes = (listObj[0].fecha.getMonth() + 1) > 9 ? (listObj[0].fecha.getMonth() + 1) : "0" + (listObj[0].fecha.getMonth() + 1);
                            listObj[0].fecha_emision = emision_dia + "/" + emision_mes + "/" + listObj[0].fecha.getFullYear();
                            var entrega_dia = listObj[0].fecha_entrega.getDate() > 9 ? listObj[0].fecha_entrega.getDate() : "0" + listObj[0].fecha_entrega.getDate();
                            var entrega_mes = (listObj[0].fecha_entrega.getMonth() + 1) > 9 ? (listObj[0].fecha_entrega.getMonth() + 1) : "0" + (listObj[0].fecha_entrega.getMonth() + 1);
                            listObj[0].fecha_entrega = entrega_dia + "/" + entrega_mes + "/" + listObj[0].fecha_entrega.getFullYear();
                            

                            listObj[0].igv_porcentaje = (listObj[0].igv * 100) + "%";
                            listObj[0].total = numMoneda(listObj[0].total, 2, ".", ",");
                            listObj[0].exworks = numMoneda((listObj[0].exworks + listObj[0].go_discount), 2, ".", ",");
                            listObj[0].desc_especial = numMoneda(listObj[0].desc_especial, 2, ".", ",");

                             listObj[0].CargoAprobador1=  listObj[0].creador_cargo;
                             listObj[0].NombreAprobador1 = listObj[0].creador_nombre + " " + listObj[0].creador_apellido;
                             listObj[0].idAprovador1 = listObj[0].creador_id;
                            listObj[0].terminos_condiciones =  listObj[0].TERM_FORMAT;


                            global.db.driver.execQuery(
                                "SELECT u.* FROM aprobacion ap inner join hs_usuario u on u.id=ap.usuario_id where ap.solicitud_id=?"
                                , [listObj[0].solicitud_id]
                                , function (err, listaUsuariosAprobacion) {
                                    if (err) {
                                     
                                        cb(500, { err: err });
                                    } else {

                                      //  if (listaUsuariosAprobacion.length > 1 || (listObj[0].tipo_id == 6 && listObj[0].estado_id == 2)) {// oblga a que existan dos personas que hayan aprobado o que se permita generar sin aprobacion los gastos generales
                                            if (listObj[0].tipo_id != 6 && listObj[0].estado_id != 2) {
                                                if(listaUsuariosAprobacion.length >= 1)
                                                {                                                    
                                                    listObj[0].CargoAprobador2 = listaUsuariosAprobacion[0].cargo
                                                    listObj[0].idAprovador2 = listaUsuariosAprobacion[0].id
                                                    listObj[0].NombreAprobador2 = listaUsuariosAprobacion[0].nombres + " " + listaUsuariosAprobacion[0].apellidos
                                                }
                                                
                                                
                                            }


                                            db.driver.execQuery(
                                                "SELECT " +
                                                "oc.tipo_id, " +
                                                "art.nombre nombre_articulo, art.codigo_articulo, " +
                                                "ocd.*, " +
                                                "IF(oc.tipo_id = 4 " +
                                                "AND tar.nombre = 'Producto', " +
                                                "'PC', " +
                                                "IF(oc.tipo_id = 3 " +
                                                "AND tar.nombre = 'Producto', " +
                                                "'UND', " +
                                                "tar.nombre)) AS tipo_articulo " +
                                                "FROM " +
                                                "Req_compra_detalle ocd " +
                                                "LEFT JOIN " +
                                                "articulo art ON ocd.articulo_id = art.id " +
                                                "LEFT JOIN " +
                                                "tipo_articulo tar ON art.tipo_id = tar.id " +
                                                "LEFT JOIN " +
                                                "Req_compra oc ON ocd.Req_compra_id = oc.id " +
                                                "WHERE " +
                                                "ocd.Req_compra_id = ?;"
                                                , [paramsId],
                                                function (err, listObjDetails) {
                                                    if (err) {

                                                        cb(500, { err: err });

                                                    } else {
                                                        if (listObjDetails.length > 0) {
                                                            var posicionMostrar = 10
                                                            //POSITION FIX 
                                                        if (listObjDetails.length < 10) {
                                                            listObj[0].valorlineaspintar = 10 - listObjDetails.length;
                                                        } else {
                                                            listObj[0].valorlineaspintar = 0;
                                                        }
                                                        //FiN POSICION FIX
                                                            for (var i = 0; i < listObjDetails.length; i++) {
                                                                listObjDetails[i].total = numMoneda(listObjDetails[i].cantidad * listObjDetails[i].precio_unitario, 2, ".", ",");
                                                                listObjDetails[i].precio_unitario = numMoneda(listObjDetails[i].precio_unitario, 2, ".", ",");
                                                                listObjDetails[i].pos = posicionMostrar
                                                                posicionMostrar = posicionMostrar + 10
                                                            }
                                                            //listObj[0].detalles = listObjDetails;
                                                            db.driver.execQuery(
                                                                "SELECT *" +
                                                                " FROM hs_parametros hsp", [],
                                                                function (err, listParameters) {
                                                                    if (err) {
                                                                        cb(500, { err: err });

                                                                    } else {
                                                                        if (listParameters.length > 0) {
                                                                            listObj[0].parametros = listParameters;
                                                                            db.driver.execQuery(
                                                                               /* "SELECT " +
                                                                                "hu.nombres, " +
                                                                                "hu.apellidos, " +
                                                                                "hu.sexo, " +
                                                                                "hu.celular, " +
                                                                                "hu.telefono, " +
                                                                                "hu.telefono2 " +
                                                                                " FROM hs_usuario hu " +
                                                                                " where hu.codigo =?;", [listParameters[13].valorParam],
                                                                                function (err, internationalUserInfo) {
                                                                                    if (err) {
                                                                                        cb(500, { err: err });
                                                                                         console.log('E' );

                                                                                    } else {
                                                                                        if (internationalUserInfo.length > 0) {
                                                                                            internationalUserInfo[0].isMan = internationalUserInfo[0].sexo == 'M' ? true : false;
                                                                                            listObj[0].internationalUserInfo = internationalUserInfo;
                                                                                            db.driver.execQuery(*/
                                                                                                "SELECT " +
                                                                                                "hu.nombres, " +
                                                                                                "hu.apellidos, " +
                                                                                                "hu.sexo, " +
                                                                                                "hu.celular, " +
                                                                                                "hu.telefono, " +
                                                                                                "hu.telefono2 " +
                                                                                                " FROM hs_usuario hu " +
                                                                                                " where hu.id =?;", [listObj[0].usuario_creacion],
                                                                                                function (err, nationalUserInfo) {
                                                                                                    if (err) {
                                                                                                        cb(500, { err: err });
                                                                                                    } else {
                                                                                                        if (nationalUserInfo.length > 0) {
                                                                                                            nationalUserInfo[0].isMan = nationalUserInfo[0].sexo == 'M' ? true : false;
                                                                                                            listObj[0].nationalUserInfo = nationalUserInfo;
                                                                                                            db.driver.execQuery(
                                                                                                                "SELECT * FROM hs_parametros" +
                                                                                                                " where nombreParam='telefono' or nombreParam='correo' or nombreParam='dispatch_address'",
                                                                                                                [],
                                                                                                                function (err, listObjParams) {
                                                                                                                    if (err) {
                                                                                                                        cb(500, { message: "Existe un error en el Servicio" });
                                                                                                                    } else {
                                                                                                                        listObj.datosEmpresa = []
                                                                                                                        for (i = 0; i < listObjParams.length; i++) {
                                                                                                                            if (listObjParams[i].nombreParam == "dispatch_address") {
                                                                                                                                var resPeriodo = listObjParams[i].valorParam.split(",");
                                                                                                                                listObj[0].direccionEmpresa = resPeriodo[0]
                                                                                                                                listObj[0].distritoEmpresa = resPeriodo[1]
                                                                                                                            }
                                                                                                                            if (listObjParams[i].nombreParam == "telefono") {
                                                                                                                                listObj[0].telefonoEmpresa = listObjParams[i].valorParam
                                                                                                                            }
                                                                                                                            if (listObjParams[i].nombreParam == "correo") {
                                                                                                                                listObj[0].correoEmpresa = listObjParams[i].valorParam
                                                                                                                            }
                                                                                                                        }
                                                                                                                        var cantMaxDetalle = 37
                                                                                                                        var cantOtrasPaginas = 57
                                                                                                                        var cantidadLineasFirmas = 13
                                                                                                                        var termino = false
                                                                                                                        var mostrarCabecera = true
                                                                                                                        if (Math.ceil(listObjDetails.length / cantMaxDetalle) > 1) {
                                                                                                                            var maximoParaFirmas = 55
                                                                                                                            listObj[0].cantPaginas = (Math.ceil((listObjDetails.length - cantMaxDetalle) / cantOtrasPaginas)) + 1
                                                                                                                            var ultimaPagina = false
                                                                                                                        }
                                                                                                                        else {
                                                                                                                            var maximoParaFirmas = 21
                                                                                                                            listObj[0].cantPaginas = Math.ceil(listObjDetails.length / cantMaxDetalle)
                                                                                                                            if (listObjDetails.length > maximoParaFirmas) {
                                                                                                                                var ultimaPagina = false
                                                                                                                            }
                                                                                                                            else {
                                                                                                                                var ultimaPagina = true
                                                                                                                            }
                                                                                                                        }
                                                                                                                        var datoenEnviar = [{ pagina: [] }]
                                                                                                                        var valorIniDetalle = 0
                                                                                                                        var valorFinDetalle = listObjDetails.length > cantMaxDetalle ? cantMaxDetalle : listObjDetails.length
                                                                                                                        for (m = 0; m < listObj[0].cantPaginas; m++) {
                                                                                                                            var objetoLista = new Object()
                                                                                                                            objetoLista = JSON.parse(JSON.stringify(listObj));
                                                                                                                            var detallesPagina = []
                                                                                                                            if (valorFinDetalle <= listObjDetails.length) {
                                                                                                                                for (i = valorIniDetalle; i < valorFinDetalle; i++) {
                                                                                                                                    if (listObjDetails[i].fecha_entrega != null) {
                                                                                                                                        var diaDetalle = listObjDetails[i].fecha_entrega.getDate() > 9 ? listObjDetails[i].fecha_entrega.getDate() : "0" + listObjDetails[i].fecha_entrega.getDate()
                                                                                                                                        var mesDetalle = listObjDetails[i].fecha_entrega.getMonth() > 9 ? listObjDetails[i].fecha_entrega.getMonth() + 1 : "0" + (listObjDetails[i].fecha_entrega.getMonth() + 1)
                                                                                                                                        listObjDetails[i].fecha_entrega = diaDetalle + "-" + mesDetalle + "-" + listObjDetails[i].fecha_entrega.getFullYear()
                                                                                                                                    }
                                                                                                                                    detallesPagina.push(listObjDetails[i])
                                                                                                                                }
                                                                                                                                if (detallesPagina.length == 0) {
                                                                                                                                    mostrarCabecera = false
                                                                                                                                }
                                                                                                                            }
                                                                                                                            else {

                                                                                                                                ultimaPagina = true
                                                                                                                                mostrarCabecera = false
                                                                                                                            }
                                                                                                                            datoenEnviar[0].pagina.push(objetoLista[0])
                                                                                                                            datoenEnviar[0].pagina[m].detalles = detallesPagina;
                                                                                                                            datoenEnviar[0].pagina[m].ultimaPagina = ultimaPagina
                                                                                                                            datoenEnviar[0].pagina[m].mostrarCabecera = mostrarCabecera
                                                                                                                            datoenEnviar[0].pagina[m].paginaActual = m + 1;
                                                                                                                            valorIniDetalle = valorFinDetalle;
                                                                                                                            if (!termino && ((valorFinDetalle + cantOtrasPaginas) > listObjDetails.length)) {
                                                                                                                                valorFinDetalle = listObjDetails.length

                                                                                                                                //if( ((valorFinDetalle - valorIniDetalle) > maximoParaFirmas) || ((cantMaxDetalle - (valorFinDetalle - valorIniDetalle))<cantidadLineasFirmas) )
                                                                                                                                if ((valorFinDetalle > maximoParaFirmas)) {
                                                                                                                                    listObj[0].cantPaginas = listObj[0].cantPaginas + 1
                                                                                                                                    datoenEnviar[0].pagina[0].cantPaginas = listObj[0].cantPaginas
                                                                                                                                    termino = true
                                                                                                                                    ultimaPagina = true
                                                                                                                                }
                                                                                                                                else {
                                                                                                                                    ultimaPagina = true
                                                                                                                                }
                                                                                                                            }
                                                                                                                            else {
                                                                                                                                valorFinDetalle = valorFinDetalle + cantOtrasPaginas
                                                                                                                            }
                                                                                                                        }
                                                                                                                      
                                                                                                                        cb(200, datoenEnviar);
                                                                                                                        
                                                                                                                    }
                                                                                                                })
                                                                                                        /*} else { 
                                                                                                               console.log('G' );
                                                                                                            cb(500, { err: 'NOT FOUND' }); }
                                                                                                    }
                                                                                                }
                                                                                            );*/
                                                                                        } else { 
                                                                                            cb(500, { err: 'NOT FOUND' }); }
                                                                                    }
                                                                                }
                                                                            );
                                                                        } else {
                                                                            cb(500, { err: 'NOT FOUND' });
                                                                        }
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            cb(500, { err: 'NOT FOUND' });
                                                        }
                                                    }
                                                }
                                            );
                                        /*}
                                        else {
                                            cb(404, { message: "No se encontro suficientes aprobaciones" });
                                        }*/
                                    }
                                })
                        } else {
                            cb(500, { err: 'NOT FOUND' });
                        }
                    }
                }
            );
        },
        proveedorRequiereCambios: function (userId, rolId,paramId, cb) {
            var ReqCompraConstructor = global.db.models.req_compra;
            ReqCompraConstructor.get(paramId, function (err, objeto) {
                if (err) {
                    
                    cb(500, { message: "Existe un error en el Servicio" });
                } else if (objeto) {
                    if (objeto.usuario_creacion != userId && rolId != 9) {
                        cb(401, { message: "No tiene permiso para realizar esta acción" })
                    }
                    else {
                        var datosGrabar = {
                            estado_id: 2,
                            usuario_modificacion: userId,
                            fecha_modificacion: new Date()
                        }
                        objeto.save(datosGrabar, function (err) {
                            if (err) {
                                cb(500, { message: "Existe un error en el Servicio" });
                            } else {
                                cb(200, {});
                            }
                        });
                    }
                } else {
                    cb(404, { message: 'No existe la cotización' });
                }
            });
        },
        esCancelable: function (userId, paramId, cb) {
            global.db.driver.execQuery(
                "SELECT IF(COUNT(*) = 0 AND Req_compra.usuario_creacion = ?, 1 , 0) cancelable FROM Req_compra " +
                "INNER JOIN orden_compra on orden_compra.req_compra_id = Req_compra.id " +
                "WHERE  Req_compra.id =?; ", [Number(userId), paramId],
                function (err, obj) {
                    if (err) {
                        console.log(err);
                        cb(500, { message: err });
                    } else {
                        cb(200, obj[0]);
                    }
                })
        },
        cancelarReqCompra: function (userId, paramId, cb) {
            var ReqCompraConstructor = global.db.models.req_compra;
            ReqCompraConstructor.get(paramId, function (err, obj) {
                if (err) {
                    console.log(error);
                    cb(500, { message: "Existe un error en el servicio" });
                } else {
                    if (obj) {
                        var datosGrabar = {
                            fecha_modificacion: new Date(),
                            usuario_modificacion: userId,
                            estado_id: 8
                        }
                        obj.save(datosGrabar, function (err) {
                            if (err) {
                                cb(500, { message: "Existe un error en el servicio" });
                            } else {
                                cb(200, {});
                            }
                        })
                    } else {
                        cb(404, { message: "No existe la Req de Compra" });
                    }

                }
            })
        },
        getCompraPendiente: function (userId, cb) {
            db.driver.execQuery(
                "SELECT c.id, C.numero, date_format(c.fecha_entrega, '%d-%m-%Y') as fecha, "
                + "if(c.estado_id <= 6 && (oc.estado_id is null || oc.estado_id  < 3) , EC.nombre, concat('OC ',EOC.nombre) ) as estado,"
                +" if(c.estado_id < 6,'REQDETALLE','ORDDETALLE') as  ruta, "
                + " if(c.estado_id < 6,c.id ,oc.id) as idref, CC.nombre centro_costo, concat(hu.nombres , ' ' , hu.apellidos)  AS solicitante "
                + " FROM Req_compra C"
                + " INNER JOIN estado_Req_compra EC ON C.estado_id = EC.id "
                + " LEFT JOIN centro_costo CC ON C.centro_costo_id = CC.id "
                + " LEFT JOIN orden_compra OC ON C.id = OC.req_compra_id "
                + " left JOIN estado_orden_compra EOC ON OC.estado_id = EOC.id "

                + " INNER JOIN  hs_usuario hu  ON c.usuario_creacion = hu.id " 
                + " where exists (SELECT 1 FROM hs_usuario_x_grupo_aprobacion HUGA "
                + "     inner join grupo_aprobacion GA on GA.id = HUGA.grupo_id "
                + "     inner join tipo_aprobacion TA on TA.ID = GA.tipo_aprobacion_id and ta.clase = 'COMPRADORES' "
                + "     where huga.usuario_id = ? ) and (oc.estado_id is null  or oc.estado_id not in (6,7,8)) " 

                + " ORDER BY C.numero DESC;",
                [userId],
                function (err, listObj) {
                    if (err) {
                          console.log(err);
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listObj) {
                            cb(200, listObj);
                        } else {
                            cb(500, { message: 'No existen Req compra' });
                        }
                    }
                }
            );
        },
       
        getMisSolicitudes: function (params, cb) {
             db.driver.execQuery(
                "SELECT c.id,C.numero, date_format(c.fecha_entrega, '%d-%m-%Y') as fecha,if(c.estado_id < 6,'REQDETALLE','ORDDETALLE') ruta, "
                + "if(c.estado_id < 6,c.id ,oc.id) idref, CC.nombre centro_costo, "
                + "if(c.estado_id <= 6 && (oc.estado_id is null || oc.estado_id  < 3) , EC.nombre, concat('OC ',EOC.nombre) ) as estado,"
                + " pr.nombre as proveedor  "
                + " FROM Req_compra C"
                + " INNER JOIN estado_Req_compra EC ON C.estado_id = EC.id "
                + " LEFT JOIN centro_costo CC ON C.centro_costo_id = CC.id "
                + " LEFT JOIN orden_compra OC ON C.id = OC.req_compra_id "
                + " left JOIN estado_orden_compra EOC ON OC.estado_id = EOC.id "
                + " left JOIN proveedor pr  ON pr.id = oc.proveedor_id "

                + " where c.usuario_creacion =  ? and (oc.estado_id is null  or OC.estado_id not in (6,7,8))" 
                + " ORDER BY C.numero DESC;",
                [params],
                function (err, listObj) {
                    if (err) {
                          console.log(err);
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listObj) {
                            cb(200, listObj);
                        } else {
                            cb(500, { message: 'No existen Req compra' });
                        }
                    }
                }
            );
        },
     
    }
}