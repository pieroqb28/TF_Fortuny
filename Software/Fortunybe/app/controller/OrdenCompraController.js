     //var mongoose   = require('mongoose');
//var ordenCompra = require('../models/ordenCompra');
var ParametrosFactorController = require('../controller/ParametrosFactorController');
var CentroCostoController = require('../controller/CentroCostoController');
var numMoneda = require('../services/numerosMonedas');
var maskDate = 'DD/MM/YY';
var InventarioController = require('./InventarioController');
var async = require('async');
//var Decimal = require('decimal');
module.exports = function () {
    
    function traerOrdenCompra(params, condicional, cb) {
        db.driver.execQuery(
            "SELECT " +
            " pro.nombre, oc.*,cat.nombre categoria, proy.nombre proyecto, est.nombre estado_OrdenCompra, sum(fp.total_factura) pago_proveedor, concat(hu.nombres , ' ' , hu.apellidos) solicitante, " +
            "case when hu.id is null then  false else true end     as canConfirm " +
            "FROM " +
            "orden_compra oc " +
            "INNER JOIN " +
            "estado_orden_compra est ON oc.estado_id = est.id " +
            "LEFT JOIN " +
            "factura_proveedores fp ON oc.id= fp.orden_compra " +
            "LEFT JOIN " +
            " req_compra RC ON rc.id = oc.req_compra_id " +
            "LEFT JOIN " +
            "hs_usuario hu ON hu.id= RC.usuario_creacion " +
            " LEFT JOIN "+
            "proveedor pro ON pro.id = oc.proveedor_id " +
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
                                "SELECT cd.*, a.codigo_articulo, a.nombre articulo" + " FROM orden_compra_detalle cd" + " INNER JOIN articulo a ON cd.articulo_id = a.id" + " WHERE cd.orden_compra_id = ?;", [params],
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
                                "SELECT cd.*,cd.descripcion articulo" + " FROM orden_compra_detalle cd" + " WHERE cd.orden_compra_id = ?;", [params],
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
                        cb(500, { message: 'La orden de compra no existe.' });
                    }
                }
            }
        );
    }
    function crearOrdenCOmpra(userId, tenantId, body, cb) {
        
        var verificacion = {
            codigo: 200
        };
        if (body.estado_id == 9) {
            verificacion = verificarordenCompraGrabar(body);
        } else {
            verificacion = verificarordenCompra(body);
        }
        if (verificacion.codigo != 200) {
            cb(verificacion.codigo, { message: verificacion.texto });
        } else {
            if (!body.req_compra_id  || body.req_compra_id == "") {
                body.req_compra_id = 0
            }
            var ordenCompraConstructor = global.db.models.orden_compra;
            traerProyecto(body, function (errCodigo, Proyecto) {
                  console.log(body)
                if (errCodigo != 200) {
                    cb(errCodigo, Proyecto)
                }
                else {
                    var proyectoId = Proyecto.idProyecto
                    var terminosycondiciones = body.terminos_condiciones ? (body.terminos_condiciones).split("\\%").join("\%") : "";
                    if (!body.impuestoAplicado){
                        body.impuestoAplicado = 0;
                    }
                    console.log("este es el id de categoria")
                    console.log(body.categoria_id)
                    
                    ordenCompraConstructor.create({
                        proveedor_id: body.proveedor_id,
                        numero: body.numero,
                        fecha: body.fecha_requerimiento,
                        fecha_entrega: body.fecha_entrega,
                        clase_compra: body.clase_compra,

                        moneda: body.moneda,
                        notas: body.notas,
                        centro_costo_id: body.centro_costo_id,
                        termino_pago: body.termino_pago,
                        orden_trabajo: body.orden_trabajo,
                        total_detalle: body.totalDetalle,
                        igv: body.impuestoAplicado,
                        impuesto_id: body.impuesto_id,
                        impuesto_monto: (body.impuestoAplicado * body.totalDetalle),
                        req_compra_id: body.req_compra_id,
                        total: body.total_ordenCompra,
                        tipo_id: body.tipo_id,
                        estado_id: body.estado_id,
                        centro_costo: body.centro_costo,
                        our_ref: body.our_ref,
                        your_ref: body.your_ref,
                        desc_especial: body.desc_especial,
                        porc_desc_especial: body.porc_desc_especial,
                        exworks: body.exworks,
                        exonerado: body.exonerado,
                        impuesto_adicional: body.impuesto_adicional,
                        porcentaje_impuesto_adicional: body.porcentaje_impuesto_adicional,
                        terminos_condiciones: terminosycondiciones,
                        go_discount: body.go_discount,
                        porc_go_discount: body.porc_go_discount,
                        gastos_extras: body.gastos_extras,
                        numero_secuencia: body.numero_secuencia,
                        usuario_creacion: userId,
                        categoria:body.categoria_id,
                        proyecto:body.proyecto_id,
                        fecha_creacion: new Date()
                        
                        //,grupo_aprobacion_id: body.grupo_aprobacion_id
                    }, function (err, objordenCompra) {
                        if (err) {
                            console.log(err);
                            cb(500, { message: "Existe un error en el servicio" });
                        } else {
                            if (objordenCompra) {
                                var ordenCompraId = objordenCompra.id;
                                var ordenCompraConstructor = global.db.models.orden_compra_detalle;
                                var correcto = true;
                                var detallesCreadosId = [];
                                for (i = 0; i < body.detalles.length; i++) {
                                    var detalle = body.detalles[i];
                                    // el body.estado_id==1 quiere decir que tiene un tipo de gasto
                                    if (body.tipo_id == 1 || body.tipo_id >= 20 || (body.tipo_id != 6 && detalle.codigo_articulo && detalle.codigo_articulo != "") || (body.tipo_id != 1 && detalle.codigo_articulo && detalle.codigo_articulo != "")) {
                                        ordenCompraConstructor.create({
                                            orden_compra_id: ordenCompraId,
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
                                    if (!correcto)
                                        break;
                                }
                                if (!correcto) {
                                    // Creacion incorrecta
                                    // Se debe eliminar la ordenCompra creada y los detalles que llegaron a ser creados
                                    for (detalle in detallesCreadosId) {
                                        // Eliminacion de los detalles creados
                                        ordenCompraConstructor.findOneAndRemove({ id: detalle.id, tenant: tenandId }, function (err) { });
                                    }
                                      console.log(err);
                                    cb(500, { message: "Existe un error en el Servicio" });
                                } else {
                                      console.log(err);
                                    // Creacion correcta       
                                    // SI VINO DE REQ ACTUALIZAR 
                                    if (body.req_compra_id != "" && body.req_compra_id   != 0){
                                        var reqCompraConstructor = global.db.models.req_compra;
                                        reqCompraConstructor.get(body.req_compra_id, function (err, objeto) {
                                            objeto.fecha_modificacion = new Date();
                                            objeto.orden_compra_id =ordenCompraId ;
                                            objeto.estado_id = 6;
                                            objeto.usuario_modificacion =  userId;
                                            objeto.save(function (err) { 
                                                    if (err){
                                                        cb(500, {message: err});
                                                    } else{
                                                        cb(200, objordenCompra);    
                                                    } 
                                                    
                                            });
                                        });

                                    }else{
                                         cb(200, objordenCompra);
                                    }
                                    
    


                                   
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
            verificacion = verificarordenCompraGrabar(toUpd);
        } else {
            verificacion = verificarordenCompra(toUpd);
        }
        if (verificacion.codigo != 200) {
            cb(verificacion.codigo, { message: verificacion.texto });
        } else {
            if (toUpd.req_compra_id == "") {
                toUpd.req_compra_id = 0
            }
            
            traerProyecto(toUpd, function (errCodigo, Proyecto) {
                if (errCodigo != 200) {
                   
                    cb(errCodigo, Proyecto)
                }
                else {
                    
                    var proyectoId = Proyecto.idProyecto
                    
                    var cotizacionConstructor = global.db.models.orden_compra;
                    cotizacionConstructor.get(paramId, function (err, objeto) {
                        if (err) {
                            cb(500, { message: "Existe un error en el servicio" });
                        } else if (objeto) {
                            var numeroCotizacion = objeto.numero
                            var terminosycondiciones = toUpd.terminos_condiciones ? (toUpd.terminos_condiciones).split("\\%").join("\%") : "";
                            if (toUpd.impuestoAplicado){
                                toUpd.impuestoAplicado = 0;
                            }
                            var datosGrabar = {
                                proveedor_id: toUpd.proveedor_id,
                                numero: toUpd.numero,
                                fecha: toUpd.fecha_requerimiento,
                                fecha_entrega: toUpd.fecha_entrega,
                                moneda: toUpd.moneda,
                                clase_compra: toUpd.clase_compra,
                                notas: toUpd.notas,
                                termino_pago: toUpd.termino_pago,
                                orden_trabajo: toUpd.orden_trabajo,
                                total_detalle: toUpd.totalDetalle,
                                req_compra_id: toUpd.req_compra_id,
                                centro_costo: toUpd.centro_costo,
                                igv: toUpd.impuestoAplicado,
                                impuesto_id: toUpd.impuesto_id,
                                impuesto_monto: (toUpd.impuestoAplicado * toUpd.totalDetalle),
                                total: toUpd.total_ordenCompra,
                                tipo_id: toUpd.tipo_id,
                                estado_id: toUpd.estado_id,
                                our_ref: toUpd.our_ref,
                                your_ref: toUpd.your_ref,
                                exonerado: toUpd.exonerado,
                                impuesto_adicional: toUpd.impuesto_adicional,
                                porcentaje_impuesto_adicional: toUpd.porcentaje_impuesto_adicional,
                                desc_especial: toUpd.desc_especial,
                                porc_desc_especial: toUpd.porc_desc_especial,
                                exworks: toUpd.exworks,
                                terminos_condiciones: terminosycondiciones,
                                go_discount: toUpd.go_discount,
                                porc_go_discount: toUpd.porc_go_discount,
                                gastos_extras: toUpd.gastos_extras,
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
                                datosGrabar.orden_compra_cliente = toUpd.orden_compra_cliente;
                            }
                             if (datosGrabar.estado_id == 6){
                                console.log('confirmador_id' +  userId);
                                datosGrabar.confirmador_id = userId;
                                
                            }  
                            objeto.save(datosGrabar, function (err) {
                                if (err) {
                                    cb(500, { message: "Existe un error en el Servicio" });
                                } else {
                                    /* ELIMINACION Y POSTERIOR CREACION DE LAS FILAS DEL DETALLE */
                                    /*  if (toUpd.fecha_aceptacion_proveedor != "" && toUpd.fecha_aceptacion_proveedor != null) {
                                    crearCentroCosto(tenandId, userId, toUpd.proveedor_id, numeroCotizacion)
                                    }*/
                                    var orden_compra_DetailConstructor = global.db.models.orden_compra_detalle;
                                    orden_compra_DetailConstructor.find({ orden_compra_id: paramId }).remove(function (err) {
                                        if (err) {
                                            cb(500, { message: "Existe un error en el servicio" });
                                        } else {
                                            var correcto = true;
                                            var detallesCreadosId = [];
                                            for (i = 0; i < toUpd.detalles.length; i++) {
                                                var detalle = toUpd.detalles[i];
                                                orden_compra_DetailConstructor.create({
                                                    orden_compra_id: paramId,
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
                            cb(404, { message: 'La orden de compra no existe.' });
                        }
                    });
                }
            })
        }
    }
    function eliminarOrdenCOmpra(tenantId, paramId, cb) {
        var ocConstructor = global.db.models.orden_compra;
        ocConstructor.get(paramId, function (err, objOC) {
            //varifica si la orden de compra es de Gastos generales
            if (objOC.tipo_id == 6) {
                //verifica si el constructor tiene factura de proveedores
                var fpContstructor = global.db.models.factura_proveedores;
                fpContstructor.find({ orden_compra: objOC.id }).remove(function (err) {
                    if (err) {
                        return cb(500, { message: "Existe un error en el Servicio" });
                    }
                });
                var ordenCompraDetailConstructor = global.db.models.orden_compra_detalle;
                ordenCompraDetailConstructor.find({ orden_compra_id: paramId }).remove(function (err) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        objOC.remove(function (err) {
                            if (err) {
                                cb(500, { message: "No se pudo eliminar la orden de compra" });
                            } else {
                                cb(200, {});
                            }
                        })
                    }
                });
            } else {
                //si no ejecuta el flujo normal
                var ordenCompraDetailConstructor = global.db.models.orden_compra_detalle;
                ordenCompraDetailConstructor.find({ orden_compra_id: paramId }).remove(function (err) {
                    if (err) {
                        return cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        var ordenCompraConstructor = global.db.models.orden_compra;
                        ordenCompraConstructor.find({ id: paramId }).remove(function (err) {
                            if (err) {
                                cb(500, { message: "No se pudo eliminar la orden de compra" });
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
    function verificarordenCompraGrabar(ordenCompra) {
        // Verificacion de campos
        if (!ordenCompra) {
            return { codigo: 400, texto: "Datos de orden nulos." };
        } else if (!ordenCompra.proveedor_id && ordenCompra.proveedor_id != "") {
            return { codigo: 400, texto: "Debe ingresar el proveedor de la orden de compra." };
        } else {
            return { codigo: 200, texto: "OK - PARCIAL" };
        }
    }
    function verificarordenCompra(ordenCompra) {
        // Verificacion de campos
        if (!ordenCompra) {
            return { codigo: 400, texto: "Orden de compra nula." };
        } else if (!(ordenCompra.detalles && ordenCompra.detalles instanceof Array && ordenCompra.detalles.length > 0)) {
            return { codigo: 400, texto: "La orden de compra no posee líneas de detalle" };
        } else {
            // Evaluacion de montos
            var error = false;
            if (ordenCompra.total_ordenCompra == (ordenCompra.total + (parseFloat((ordenCompra.totalAdicional + ordenCompra.totalImpuestos).toFixed(2))))) {
                var total = 0;
                var detalle = {};
                for (i = 0; i < ordenCompra.detalles.length; i++) {
                    detalle = ordenCompra.detalles[i];
                    if (detalle.cantidad * detalle.precio_unitario_factor != detalle.sub_total_factor) {
                        error = true;
                    } else {
                        total = total + detalle.sub_total_factor;
                    }
                    if (error) break;
                }
                if ((parseFloat(total.toFixed(2)) > (ordenCompra.totalDetalle - 0.05)) || (parseFloat(total.toFixed(2)) < (ordenCompra.totalDetalle + 0.05))) {
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
            eliminarOrdenCOmpra(tenantId, paramId, function (errDelete, resulDelete) {
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
                "SELECT * FROM orden_compra where (tipo_id=5 or tipo_id=2) and id=?;",
                [paramId],
                function (err, listOrdenCompra) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listOrdenCompra.length > 0) {
                            eliminarOrdenCOmpra(tenantId, paramId, function (errDelete, resulDelete) {
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
                "SELECT * FROM orden_compra where (tipo_id<>5 and tipo_id<>2)and id=?;",
                [paramId],
                function (err, listOrdenCompra) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listOrdenCompra.length > 0) {
                            eliminarOrdenCOmpra(tenantId, paramId, function (errDelete, resulDelete) {
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
                "SELECT C.*, EC.nombre estado_orden_compra, CL.nombre proveedor_nombre, CC.nombre centro_costo, TA.nombre AS flujo"
                + " FROM orden_compra C"
                + " INNER JOIN estado_orden_compra EC ON C.estado_id = EC.id"
                + " INNER JOIN proveedor CL ON C.proveedor_id= CL.id"
                + " LEFT JOIN centro_costo CC ON C.centro_costo_id = CC.id "
                  + " left join solicitud_aprobacion SA ON SA.id = C.solicitud_id"
                + " left join tipo_aprobacion TA  ON TA.id = SA.tipo_aprobacion_id"
                + " ORDER BY C.numero DESC;",
                [],
                function (err, listObj) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listObj) {
                            cb(200, listObj);
                        } else {
                            cb(500, { message: 'No existen orden compra' });
                        }
                    }
                }
            );
        },
        getAllServicios: function (tenantId, cb) {
            db.driver.execQuery(
                "SELECT C.*, EC.nombre estado_orden_compra, CL.nombre proveedor_nombre, CC.nombre centro_costo"
                + " FROM orden_compra c"
                + " INNER JOIN estado_orden_compra EC ON C.estado_id = EC.id"
                + " INNER JOIN proveedor CL ON C.proveedor_id= CL.id"
                + " INNER JOIN centro_costo CC ON C.centro_costo_id = CC.id where c.tipo_id==2 or c.tipo_id==5 ;",
                [],
                function (err, listObj) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listObj) {
                            cb(200, listObj);
                        } else {
                            cb(500, { message: 'No existen orden compra' });
                        }
                    }
                }
            );
        },
        getAllNoServicios: function (tenantId, cb) {
            db.driver.execQuery(
                "SELECT C.*, EC.nombre estado_orden_compra, CL.nombre proveedor_nombre, CC.nombre centro_costo"
                + " FROM orden_compra c"
                + " INNER JOIN estado_orden_compra EC ON C.estado_id = EC.id"
                + " INNER JOIN proveedor CL ON C.proveedor_id= CL.id"

                + " INNER JOIN centro_costo CC ON C.centro_costo_id = CC.id "
              
                +" where c.tipo_id<>2 and c.tipo_id<>5;",
                [],
                function (err, listObj) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listObj) {
                            cb(200, listObj);
                        } else {
                            cb(500, { message: 'No existen orden compra' });
                        }
                    }
                }
            );
        },
        getbyId: function (params, cb) {
            var condicional = ""
            traerOrdenCompra(params, condicional, function (errOrden, resultOrden) {
                if (errOrden != 200) {
                    cb(errOrden, resultOrden)
                }
                else {
                    cb(200, resultOrden)
                }
            })
        },
        getbyIdServicio: function (params, cb) {
            var condicional = " and (c.tipo_id=5 or c.tipo_id=2)"
            traerOrdenCompra(params, condicional, function (errOrden, resultOrden) {
                if (errOrden != 200) {
                    cb(errOrden, resultOrden)
                }
                else {
                    cb(200, resultOrden)
                }
            })
        },
        getbyIdNoServicio: function (params, cb) {
            var condicional = " and (c.tipo_id<>5 and c.tipo_id<>2)"
            traerOrdenCompra(params, condicional, function (errOrden, resultOrden) {
                if (errOrden != 200) {
                    cb(errOrden, resultOrden)
                }
                else {
                    cb(200, resultOrden)
                }
            })
        },
        create: function (userId, tenantId, body, cb) {
            crearOrdenCOmpra(userId, tenantId, body, function (errCReate, resulCreate) {
                if (errCReate != 200) {
                    cb(errCReate, resulCreate)
                }
                else {
                    cb(200, resulCreate)
                }
            })
        },
        createServicio: function (userId, tenantId, body, cb) {
            if (body.tipo_id == 2 || body.tipo_id == 5) {
                crearOrdenCOmpra(userId, tenantId, body, function (errCReate, resulCreate) {
                    if (errCReate != 200) {
                        cb(errCReate, resulCreate)
                    }
                    else {
                        cb(200, resulCreate)
                    }
                })
            }
            else {
                cb(500, "No tiene autorización")
            }
        },
        createNoServicio: function (userId, tenantId, body, cb) {
            if (body.tipo_id != 2 && body.tipo_id != 5) {
                crearOrdenCOmpra(userId, tenantId, body, function (errCReate, resulCreate) {
                    if (errCReate != 200) {
                        cb(errCReate, resulCreate)
                    }
                    else {
                        cb(200, resulCreate)
                    }
                })
            }
            else {
                cb(500, "No tiene autorización")
            }
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
        updateServicio: function (userId, tenandId, paramId, toUpd, cb) {
            db.driver.execQuery(
                "SELECT * FROM orden_compra where (tipo_id=5 or tipo_id=2) and id=?;",
                [paramId],
                function (err, listOrdenCompra) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listOrdenCompra.length > 0) {
                            actualizarOrdCompra(userId, tenandId, paramId, toUpd, function (errOrdCompra, resOrdeCompra) {
                                if (errOrdCompra != 200) {
                                    cb(errOrdCompra, resOrdeCompra)
                                }
                                else {
                                    cb(200, resOrdeCompra)
                                }
                            })
                        } else {
                            cb(500, { message: 'No tiene autorización' });
                        }
                    }
                }
            );
        },
        updateNoServicio: function (userId, tenandId, paramId, toUpd, cb) {
            db.driver.execQuery(
                "SELECT * FROM orden_compra where (tipo_id<>5 and tipo_id<>2) and id=?;",
                [paramId],
                function (err, listOrdenCompra) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {
                        if (listOrdenCompra.length > 0) {
                            actualizarOrdCompra(userId, tenandId, paramId, toUpd, function (errOrdCompra, resOrdeCompra) {
                                if (errOrdCompra != 200) {
                                    cb(errOrdCompra, resOrdeCompra)
                                }
                                else {
                                    cb(200, resOrdeCompra)
                                }
                            })
                        } else {
                            cb(500, { message: 'No tiene autorización' });
                        }
                    }
                }
            );
        },
       
        pasarInventario: function (userId, body, cb) {
            var detalleInventario = []
            for (i = 0; i < body.detalles.length; i++) {
                if (body.detalles[i].cantidad > 0) {
                    var itemDatos = {}
                    itemDatos.inventario_tipo_origen_id = 22//proviene de una orden de compra
                    itemDatos.entidad_id = body.idOrdenCompra
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
            var ocConstructor = global.db.models.orden_compra;
            ocConstructor.get(body.orden_compra_id, function (err, objeto) {
                if (err) {
                    cb(500, { message: "Existe un error en el servicio" });
                } else {
                    if (objeto) {
                        if (objeto.factura_id && objeto.factura_id > 0) {
                            cb(500, { message: "Ya existe una factura para esta orden de compra." });
                        } else if (objeto.estado_id == 6) {
                            // Se obtiene el detalle de la orden de compra
                            db.driver.execQuery(
                                "SELECT DE.cantidad," + " (CASE WHEN DE.articulo_id IS NULL THEN DE.descripcion ELSE A.nombre END ) detalle," + " DE.articulo_id, DE.precio_unitario, DE.precio_total " + "FROM orden_compra_detalle DE " + " LEFT JOIN articulo A ON DE.articulo_id = A.id" + " WHERE DE.orden_compra_id = ?;", [body.orden_compra_id],
                                function (err, listObjDetails) {
                                    if (err || !listObjDetails) {
                                        cb(500, { message: "Existe un error en el servicio" });
                                    } else if (listObjDetails instanceof Array && listObjDetails.length > 0) {
                                        var facturaConstructor = global.db.models.factura;
                                        // Creacion de factura
                                        listObj[0].detalles = listObjDetails
                                        cb(200, listObj);
                                    } else {
                                        cb(500, { message: "La orden de compra no tiene líneas de detalle." });
                                    }
                                }
                            );
                        } else {
                            cb(500, { message: "La orden de compra debe ser aprobada por el proveedor." });
                        }
                    } else {
                        cb(500, { message: "Orden de compra no encontrada." });
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
                "replace(oc.terminos_condiciones,'\\\\n','<br>')  as TERM_FORMAT," +
                "us.nombres AS creador_nombre," +
                "us.apellidos AS creador_apellido," +
                "us.cargo AS creador_cargo," +
                "us.id AS creador_id," +
                "cc.nombre AS centro_costo, " +
                "pr.nombre AS nombre_proveedor, " +
                "pr.telefono AS telefono_proveedor, " +
                "pr.contacto1 AS contacto1_proveedor, " +
                "pr.banco AS banco, " +
                "pr.tipo_cuenta AS tipo_cuenta, " +
                "pr.nro_cuenta AS nro_cuenta, " +
                "pr.cci AS cci, " +
                "pr.titular AS titular, " +
                "pr.tasa AS tasa, " +
                "pr.nro_det AS nro_det, " +
                "pr.email1 AS email1_proveedor, " +
             
                "pr.ruc AS ruc_proveedor, " +
                "concat( concat(concat(ifnull(pr.direccion,'') , ' '),ifnull(pr.direccion2,' ')),ifnull(pr.pais  ,' ')) AS direccion_proveedor, " +
                "pr.direccion2 AS direccion_proveedor2, " +
                "pr.pais AS pais_proveedor, " +
                "oc.termino_pago AS forma_pago, " + 
                "toc.nombre AS tipo_orden_compra, " +
                "tax.nombre AS impuesto " +
                "FROM " +
                "orden_compra oc " +
                 "LEFT JOIN " +
                "hs_usuario us ON oc.usuario_creacion = us.id " +
                "LEFT JOIN " +
                "centro_costo cc ON oc.centro_costo_id = cc.id " +
                "LEFT JOIN " +
                "proveedor pr ON oc.proveedor_id = pr.id " +
              
                "LEFT JOIN " +
                "tipo_orden_compra toc ON oc.tipo_id = toc.id " +
                "LEFT JOIN " +
                "impuestos tax ON oc.impuesto_id = tax.idimpuestos " +
                "WHERE " +
                "oc.id =?;", [paramsId],
                function (err, listObj) {
                    if (err) {
                        console.log(err);
                        cb(500, { err: err });
                    } else {
                       if (listObj.length > 0) {
                            listObj[0].igv_valor =  numMoneda(listObj[0].impuesto_monto);    //numMoneda(listObj[0].total_detalle * listObj[0].igv, 2, ".", ",");
                            listObj[0].total_detalle = numMoneda((listObj[0].total_detalle + listObj[0].desc_especial + listObj[0].go_discount), 2, ".", ",");
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
                                "SELECT date_format(ap.fechaAprobacion,'%d-%m-%Y') fechaAprobacion,sa.codigo AS codAprov, u.* FROM aprobacion ap inner join hs_usuario u on u.id=ap.usuario_id  inner join solicitud_aprobacion sa on ap.solicitud_id = sa.id where ap.solicitud_id=?"
                                , [listObj[0].solicitud_id]
                                , function (err, listaUsuariosAprobacion) {
                                    if (err) {
                                     
                                        cb(500, { err: err });
                                    } else {

                                      //  if (listaUsuariosAprobacion.length > 1 || (listObj[0].tipo_id == 6 && listObj[0].estado_id == 2)) {// oblga a que existan dos personas que hayan aprobado o que se permita generar sin aprobacion los gastos generales
                                            if (listObj[0].tipo_id != 6 && listObj[0].estado_id != 2) {
                                                if(listaUsuariosAprobacion.length >= 1)
                                                {                                                    
                                                    listObj[0].CargoAprobador2 = 'Aprobado Digitalmente:<br>' +listaUsuariosAprobacion[0].codAprov + '<br>' + listaUsuariosAprobacion[0].fechaAprobacion
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
                                                "orden_compra_detalle ocd " +
                                                "LEFT JOIN " +
                                                "articulo art ON ocd.articulo_id = art.id " +
                                                "LEFT JOIN " +
                                                "tipo_articulo tar ON art.tipo_id = tar.id " +
                                                "LEFT JOIN " +
                                                "orden_compra oc ON ocd.orden_compra_id = oc.id " +
                                                "WHERE " +
                                                "ocd.orden_compra_id = ?;"
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
                                                                                                                        console.log("aca estamos");
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
        getPrintConf: function (paramsId, cb) {

        var cotizacionConstructor = global.db.models.cotizacion;
            var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
            db.driver.execQuery(
                "select " +
                "concat(hu.nombres, ' ', hu.apellidos) as persona_legal, " +
                "hu.cargo as cargo_aprobador, " +
                "pr.nombre as nombre_proveedor, " + 
                "ifnull(date_format(oc.fecha_aceptacion_proveedor,'%d-%m-%Y'),'') as dia_confirmacion_entrega, " +

                "oc.numero as orden_compra, "+
                "oc.moneda as moneda, " +
                "oc.total as monto_factura " +
                "from " +
                "orden_compra oc " +
                "LEFT JOIN " +
                "proveedor pr ON oc.proveedor_id = pr.id " +
                "LEFT JOIN " +
                "hs_usuario hu ON oc.confirmador_id = hu.id " +
                "WHERE " +
                "oc.id =?;", [paramsId],
                function (err, listObj) {
                    if (err) {
                        console.log(err);
                        cb(500, { err: err });
                    } else {
                       if (listObj.length > 0) {
                            listObj[0].monto_factura =  numMoneda(listObj[0].monto_factura);    //numMoneda(listObj[0].total_detalle * listObj[0].igv, 2, ".", ",");
                            listObj[0].nombre_aprobador =  listObj[0].persona_legal;    //numMoneda(listObj[0].total_detalle * listObj[0].igv, 2, ".", ",");

                            listObj[0].firma_aprobador = 'Aprobado Digitalmente: '  + listObj[0].dia_confirmacion_entrega;


                                            db.driver.execQuery(
                                                "SELECT " +
                                                "ocd.descripcion " +
                                                "FROM " +
                                                "orden_compra_detalle ocd " +
                                                "WHERE " +
                                                "ocd.orden_compra_id = ?;"
                                                , [paramsId],
                                                function (err, listObjDetails) {
                                                    if (err) {

                                                        cb(500, { err: err });

                                                    } else {
                                                        if (listObjDetails.length > 0) {
                                                            listObj[0].servicio  = '';
                                                            for (var i = 0; i < listObjDetails.length; i++) {
                                                                listObj[0].servicio  = listObj[0].servicio + listObjDetails[i].descripcion + ' ';
                                                             //  listObjDetails[i].pos = posicionMostrar
                                                              //  posicionMostrar = posicionMostrar + 10
                                                            }
                                                            //listObj[0].detalles = listObjDetails;
                                                           
                                                                   var objetoLista = new Object()
                                                           objetoLista = JSON.parse(JSON.stringify(listObj));
                                                                                                                                                                                                                                               objetoLista = JSON.parse(JSON.stringify(listObj));

                                                            var datoenEnviar = [{ pagina: [] }];
                                                            datoenEnviar[0].pagina.push(objetoLista[0]);
                                                           datoenEnviar.listObj;
                                                            console.log("aca estamos");
                                                            console.log(datoenEnviar);
                                                            cb(200, datoenEnviar);
                                                            
                                                        }
                                                   
                                                    }
                                                }
                                            );
                                        /*}
                                        else {
                                            cb(404, { message: "No se encontro suficientes aprobaciones" });
                                        }*/
                                    }
                              }  });
                       
            
        },
        proveedorRequiereCambios: function (userId, rolId,paramId, cb) {
            var ordenCompraConstructor = global.db.models.orden_compra;
            ordenCompraConstructor.get(paramId, function (err, objeto) {
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
                "SELECT IF(COUNT(*) = 0 AND orden_compra.usuario_creacion = ?, 1 , 0) cancelable FROM orden_compra " +
                "INNER JOIN factura_proveedores on factura_proveedores.orden_compra = orden_compra.id " +
                "WHERE  orden_compra.id =?; ", [Number(userId), paramId],
                function (err, obj) {
                    if (err) {
                        console.log(err);
                        cb(500, { message: err });
                    } else {
                        cb(200, obj[0]);
                    }
                })
        },
        cancelarOrdenCompra: function (userId, paramId, cb) {
            var ordenCompraConstructor = global.db.models.orden_compra;
            ordenCompraConstructor.get(paramId, function (err, obj) {
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
                        cb(404, { message: "No existe la Orden de Compra" });
                    }

                }
            })
        }
    }
}