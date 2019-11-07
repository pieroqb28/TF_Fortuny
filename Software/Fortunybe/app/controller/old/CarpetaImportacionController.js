var InventarioController = require('../controller/InventarioController');
var async = require('async');
module.exports = function () {
    function costosCarpeta(idCarpeta, cb) {
        // Se obtiene el total, el cual se usara para el prorrateo
        var carpetaDetalleConstructor = global.db.models.carpeta_importacion_detalle;
        carpetaDetalleConstructor.find({ carpeta_importacion_id: idCarpeta }, function (err, listaDetalles) {
            if (err) {
                cb(500, { message: "Error: intente nuevamente en unos minutos." });
            } else {
                if (listaDetalles) {
                    var total = 0;
                    for (var i = 0; i < listaDetalles.length; i++) {
                        total = listaDetalles[i].total_base + total;
                    }
                    if (total > 0) {
                        // Con el total, se hace la query que obtiene los montos por elemento por detalle
                        // 2016-10-17 09:37:03
                        
                        var query =
                            " SELECT  " +
                            " ME.CIE, " +
                            " ME.nombre, " +
                            " ROUND(((ME.suma) * (CID.total_base / (" + total + ")) / CID.cantidad),2) monto, " +
                            " CID.id, " +
                            " A.nombre elemento, " +
                            " A.nombre elemento, " +
                            " CID.cantidad, " +
                            " CID.costo_base, " +
                            " CID.total_base, " +
                            " CID.id detalle_carpeta_id, " +
                            " CID.articulo_id, " +
                            " CID.cantidad, " +
                            " CID.cantidad, " +
                            " CID.inventario_id, " +
                            " IFNULL(CDF.id, '') factura_base " +
                            " FROM " +
                            " (SELECT  " +
                            " TBL.prorrateo, TBL.id, TBL.CIE, TBL.nombre, SUM(TBL.suma) suma " +
                            " FROM " +
                            " (SELECT  " +
                            " CI.prorrateo, " +
                            " CI.id, " +
                            " CDOC.carpeta_importacion_elemento_id CIE, " +
                            " CIE.nombre, " +
                            " SUM(IF(CDOC.moneda != 'PEN', CDOC.monto * tipo_cambio.cambio, CDOC.monto)) suma " +
                            " FROM " +
                            " carpeta_importacion_documento CDOC " +
                            " INNER JOIN carpeta_importacion_elemento CIE ON CIE.id = CDOC.carpeta_importacion_elemento_id " +
                            " AND CIE.nombre <> 'FB' " +
                            " AND CIE.contable = 1 " +
                            " INNER JOIN carpeta_importacion CI ON CIE.carpeta_importacion_id = CI.id " +
                            " LEFT JOIN tipo_cambio ON (tipo_cambio.moneda = CDOC.moneda " +
                            " AND tipo_cambio.fecha = CDOC.fecha) " +
                            " WHERE " +
                            " CI.id = " + idCarpeta + " UNION ALL SELECT  " +
                            " carpeta_importacion.prorrateo, " +
                            " carpeta_importacion.id, " +
                            " carpeta_importacion_documento.carpeta_importacion_elemento_id CIE, " +
                            " carpeta_importacion_elemento.nombre, " +
                            " SUM(IF(carpeta_importacion_documento.moneda != 'PEN', carpeta_import_doc_detalle_carpeta.monto * tipo_cambio.cambio, carpeta_import_doc_detalle_carpeta.monto)) AS suma " +
                            " FROM " +
                            " carpeta_import_doc_detalle_carpeta " +
                            " LEFT JOIN carpeta_importacion_documento_detalle ON carpeta_import_doc_detalle_carpeta.id_documento_detalle = carpeta_importacion_documento_detalle.id " +
                            " LEFT JOIN carpeta_importacion_documento ON carpeta_importacion_documento_detalle.documento_id = carpeta_importacion_documento.id " +
                            " LEFT JOIN carpeta_importacion_elemento ON carpeta_import_doc_detalle_carpeta.id_carpeta_importacion_elemento = carpeta_importacion_elemento.id " +
                            " LEFT JOIN carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
                            " LEFT JOIN tipo_cambio ON (carpeta_importacion_documento.moneda = tipo_cambio.moneda " +
                            " AND carpeta_importacion_documento.fecha = tipo_cambio.fecha) " +
                            " WHERE " +
                            " carpeta_importacion.id = " + idCarpeta + ") TBL ) ME " +
                            " INNER JOIN " +
                            " carpeta_importacion_detalle CID ON CID.carpeta_importacion_id = ME.id " +
                            " INNER JOIN " +
                            " articulo A ON CID.articulo_id = A.id " +
                            " LEFT JOIN " +
                            " carpeta_importacion_elemento CEF ON CEF.carpeta_importacion_id = " + idCarpeta + " " +
                            " AND CEF.nombre = 'FB' " +
                            " AND CEF.contable = 1 " +
                            " LEFT JOIN " +
                            " carpeta_importacion_documento CDF ON CDF.carpeta_importacion_elemento_id = CEF.id " +
                            " ORDER BY CID.id; ";
                        global.db.driver.execQuery(query, [], function (err, listaCostos) {
                            if (err) {
                                cb(500, { message: "Error: intente nuevamente en unos minutos." });
                            } else {
                                console.log(listaCostos);
                                if (listaCostos) {
                                    var listaFinal = [];
                                    var objeto = {};
                                    var totalCostos = 0;
                                    var listaColumnas = [];
                                    var listaCampos = [];
                                    var numElementos = 0;
                                    var numCampo = 0;
                                    for (var i = 0; i < listaCostos.length; i++) {
                                        if (objeto.id && objeto.id != listaCostos[i].id) {
                                            // Si es un cambio de detalle, se hace push en el arreglo
                                            objeto.costo_final = objeto.costo_base + totalCostos;
                                            listaFinal.push(objeto)
                                            objeto = {};
                                            totalCostos = 0;
                                            numElementos = numElementos + 1;
                                            numCampo = 0;
                                        } else if (objeto.id && objeto.id == listaCostos[i].id) {
                                            // Se continua en el mismo detalle
                                            if (numElementos == 0) { // Solo si es el primer item
                                                listaColumnas.push(listaCostos[i].nombre);
                                                listaCampos.push("campo" + i);
                                            }
                                            //objeto[listaCostos[i].nombre] = listaCostos[i].monto;
                                            objeto["campo" + numCampo] = listaCostos[i].monto;
                                            totalCostos = totalCostos + listaCostos[i].monto;
                                            numCampo = numCampo + 1;
                                        }
                                        if (!objeto.id) {
                                            // Se instancia un nuevo item
                                            objeto.id = listaCostos[i].id;
                                            objeto.nombre = listaCostos[i].elemento;
                                            objeto.costo_base = 0;//listaCostos[i].costo_base;
                                            objeto.detalle_carpeta_id = listaCostos[i].detalle_carpeta_id;
                                            objeto.articulo_id = listaCostos[i].articulo_id;
                                            objeto.cantidad = listaCostos[i].cantidad;
                                            objeto.inventario_id = listaCostos[i].inventario_id;
                                            objeto.factura_base = listaCostos[i].factura_base;
                                            objeto["campo" + numCampo] = listaCostos[i].monto;
                                            if (numElementos == 0) { // Solo si es el primer item
                                                listaColumnas.push(listaCostos[i].nombre);
                                                listaCampos.push("campo" + i);
                                            }
                                            totalCostos = totalCostos + listaCostos[i].monto;
                                            numCampo = numCampo + 1;
                                        }
                                    }
                                    // Se pushea el ultimo item
                                    if (objeto.id) {
                                        objeto.costo_final = objeto.costo_base + totalCostos;
                                        listaFinal.push(objeto)
                                    }
                                    console.log(listaFinal);
                                    var listaJson = [];
                                    listaJson.push({
                                        campos: listaCampos,
                                        columnas: listaColumnas,
                                        resumen: listaFinal
                                    });
                                    cb(200, listaJson);
                                } else {
                                    cb(500, { message: 'No se encontraron documentos para esta carpeta.' });
                                }
                            }
                        });
                    }
                } else {
                    cb(500, { message: 'No se encontraron productos en esta carpeta.' });
                }
            }
        });
    }
    function ultimoCorrelativoCarpetaImportacionParcial(codigoCarpeta, cb) {
        global.db.driver.execQuery(
            "SELECT  IFNULL(correlativo_carpeta_importacion_parcial,0) correlativo FROM carpeta_importacion " +
            "WHERE codigo = ? ORDER BY carpeta_importacion.correlativo_carpeta_importacion_parcial DESC LIMIT 1",
            [codigoCarpeta],
            function (err, result) {
                if (err) {
                    console.log(err);
                    cb(500, { message: err });
                } else {
                    /*Si no devuelve nada significa que es el primero que se va a crear */
                    if (!result.correlativo) {
                        cb(200, 0);
                    } else {
                        cb(200, result.correlativo);
                    }

                }
            });
    }
    return {
        get: function (tenantId, cb) {
            global.db.driver.execQuery(
                "SELECT C.id, C.codigo, C.fecha, C.proveedor_id, P.nombre, OC.numero numero_oc, E.id estado_id, E.nombre estado FROM carpeta_importacion C INNER JOIN orden_compra OC ON C.orden_compra_id = OC.id INNER JOIN proveedor P ON C.proveedor_id = P.id INNER JOIN estado_carpeta_importacion E ON C.estado_id = E.id ORDER BY C.codigo DESC", [],
                function (err, lstCarpetas) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (lstCarpetas) {
                            cb(200, lstCarpetas);
                        } else {
                            cb(401, { message: 'No se encontraron carpetas de importación.' });
                        }
                    }
                });
        },
        listadoOrdenCompras: function (tenantId, cb) {
            global.db.driver.execQuery(
                /*"SELECT C.*, EC.nombre estado_orden_compra, CL.nombre proveedor_nombre, CC.codigo centro_costo FROM orden_compra c INNER JOIN estado_orden_compra EC ON C.estado_id = EC.id INNER JOIN proveedor CL ON C.proveedor_id= CL.id INNER JOIN centro_costo CC ON C.centro_costo_id = CC.id where c.tipo_id=4 and (c.estado_id=5 or c.estado_id=6 or c.estado_id=7 ) and NOT EXISTS(    select oc.* from orden_compra oc    inner join carpeta_importacion ci on ci.orden_compra_id= oc.id    where oc.id=c.id );",*/
                " SELECT DISTINCT tbl.* FROM ( " +
                " /* FILTRA TODAS LAS CARPETAS TOTALES QUE ALMENOS 1 ESTE REGISTRADA */ " +
                " SELECT  " +
                " c.id, " +
                " c.numero, " +
                " c.proveedor_id, " +
                " c.notas, " +
                " c.centro_costo_id, " +
                " c.termino_pago, " +
                " c.orden_trabajo, " +
                " c.moneda, " +
                " c.estado_id, " +
                " c.tipo_id, " +
                " c.total_detalle, " +
                " c.igv, " +
                " c.total, " +
                " c.id_cotizacion, " +
                " c.desc_especial, " +
                " c.exworks, " +
                " c.impuesto_id, " +
                " c.impuesto_monto, " +
                " EC.nombre estado_orden_compra, " +
                " CL.nombre proveedor_nombre, " +
                " CC.codigo centro_costo " +
                " FROM " +
                " orden_compra c " +
                " INNER JOIN " +
                " estado_orden_compra EC ON C.estado_id = EC.id " +
                " INNER JOIN " +
                " proveedor CL ON C.proveedor_id = CL.id " +
                " INNER JOIN " +
                " centro_costo CC ON C.centro_costo_id = CC.id " +
                " WHERE " +
                " c.tipo_id = 4 " +
                " AND (c.estado_id = 5 OR c.estado_id = 6 " +
                " OR c.estado_id = 7)  " +
                " AND NOT EXISTS( SELECT  " +
                " oc.* " +
                " FROM " +
                " orden_compra oc " +
                " INNER JOIN " +
                " carpeta_importacion ci ON ci.orden_compra_id = oc.id " +
                " WHERE " +
                " oc.id = c.id ) " +
                "                                  " +
                " UNION ALL " +
                "                          " +
                " SELECT  c.id, " +
                " c.numero, " +
                " c.proveedor_id, " +
                " c.notas, " +
                " c.centro_costo_id, " +
                " c.termino_pago, " +
                " c.orden_trabajo, " +
                " c.moneda, " +
                " c.estado_id, " +
                " c.tipo_id, " +
                " c.total_detalle, " +
                " c.igv, " +
                " c.total, " +
                " c.id_cotizacion, " +
                " c.desc_especial, " +
                " c.exworks, " +
                " c.impuesto_id, " +
                " c.impuesto_monto, " +
                " EC.nombre estado_orden_compra, " +
                " CL.nombre proveedor_nombre, " +
                " CC.codigo centro_costo " +
                " FROM  " +
                " carpeta_importacion ci " +
                " INNER JOIN  " +
                " orden_compra c ON ci.orden_compra_id = c.id " +
                " INNER JOIN " +
                " estado_orden_compra EC ON c.estado_id = ec.id " +
                " INNER JOIN " +
                " proveedor CL ON  c.proveedor_id = CL.id " +
                " INNER JOIN " +
                " centro_costo cc ON c.centro_costo_id = cc.id " +
                " WHERE ci.tipo_carpeta_importacion = 'P' " +
                " AND c.tipo_id = 4 " +
                " AND (c.estado_id = 5 OR c.estado_id = 6 OR c.estado_id = 7)  " +
                " /*SE VERIFICA ADEMAS QUE LA SUMA DE LA RESTA DEL TOTAL DE LA ORDEN DE COMPRA  " +
                " MENOS LAS CARPETAS DE IMPORTACION PARCIALES SEA MAYOR A 0 (SE REGISTRARON TODOS LOS ARTICULOS)*/ " +
                " AND fun_calculo_orden_compra_articulos_restantes(c.id) > 0 " +
                " ) tbl; ",
                [],
                function (err, listOrdenCompras) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (listOrdenCompras) {
                            cb(200, listOrdenCompras);
                        } else {
                            cb(401, { message: 'No se encontraron carpetas de importación.' });
                        }
                    }
                });
        },
        getIncoterms: function (tenantId, cb) {
            var incotermConstructor = global.db.models.incoterm;
            incotermConstructor.find({}, function (err, listaIncoterms) {
                if (err) {
                    cb(500, { message: err });
                } else {
                    if (listaIncoterms) {
                        cb(200, listaIncoterms);
                    } else {
                        cb(500, { message: 'NOT FOUND' });
                    }
                }
            });
        },
        getById: function (tenantId, idCarpeta, cb) {
            var carpetaConstructor = global.db.models.carpeta_importacion;
            carpetaConstructor.find({ id: idCarpeta }, function (err, grupoDatos) {
                if (err) {
                    cb(500, { message: 'Ocurrió un error.' });
                } else {
                    if (grupoDatos.length > 0) {
                        cb(200, grupoDatos);
                    } else {
                        cb(404, { message: 'No se encontraron carpetas de importación.' });
                    }
                }
            });
        },
        create: function (tenandId, userid, params, cb) {
            if (!(params.codigo && params.orden_compra_id && params.proveedor_id && params.fecha && params.incoterm && params.pais && params.moneda && params.prorrateo && params.incoterm_id && params.centro_costo_id)) {
                cb(400, { message: 'Carpeta sin los campos mínimos' });
            } else {
                var orden_compraConstructor = global.db.models.orden_compra;
                orden_compraConstructor.get(params.orden_compra_id, function (error, ordenCompra) {
                    if (error) {
                        console.log(error)
                        cb(500, { message: "Error: intente nuevamente en unos minutos." });
                    } else if (ordenCompra) {
                        if ((ordenCompra.carpeta_importacion_id && ordenCompra.carpeta_importacion_id > 0 && ordenCompra.correlativo_carpeta_importacion_parcial == 'T')) {
                            cb(400, { message: 'La orden de compra ya posee una carpeta de importación.' });
                        } else {
                            var carpetaConstructor = global.db.models.carpeta_importacion;
                            /*Si el tipo de carpeta de importacion es Parcial debería poder buscar el correlativo*/
                            async.waterfall([
                                function (callback) {
                                    var correlativo;
                                    if (params.tipo_carpeta_importacion == 'P') {
                                        ultimoCorrelativoCarpetaImportacionParcial(params.codigo, function (code, res) {
                                            if (code != 200) {
                                                console.log(res.message);
                                                callback(res.message);
                                            } else {
                                                callback(res + 1);
                                            }
                                        })
                                    } else {
                                        callback();
                                    }
                                }],
                                function (correlativ) {
                                    if (typeof correlativ === 'string') {
                                        //Si es un texto es porque envia el error del mensaje del fallo.
                                        cb(500, { message: correlativ });
                                    } else {
                                        carpetaConstructor.create({
                                            codigo: params.codigo,
                                            guia_aerea: params.guia_aerea,
                                            orden_compra_id: params.orden_compra_id,
                                            proveedor_id: params.proveedor_id,
                                            fecha: new Date() /*params.fecha*/,
                                            fecha_creacion: new Date(),
                                            pais: params.pais,
                                            numero_proforma: params.numero_proforma,
                                            moneda: params.moneda,
                                            prorrateo: params.prorrateo,
                                            incoterm_id: params.incoterm_id,
                                            centro_costo_id: params.centro_costo_id,
                                            estado_id: 1,
                                            usuario_creacion: userid,
                                            tipo_carpeta_importacion: params.tipo_carpeta_importacion,
                                            correlativo_carpeta_importacion_parcial: correlativ

                                        }, function (err1, carpetaCreada) {
                                            if (err1) {
                                                cb(500, { message: "Error: intente nuevamente en unos minutos." });
                                            } else {
                                                // Se obtienen los tipos de gasto a aplicar segun el incoterm
                                                global.db.driver.execQuery(
                                                    "SELECT ITG.tipo_gasto_id, ITG.incluido, TG.nombre, TG.contable" + " FROM incoterm_x_tipo_gasto_importacion ITG" + " INNER JOIN tipo_gasto_importacion TG ON ITG.tipo_gasto_id = TG.id" + " WHERE incoterm_id = ?;", [params.incoterm_id],
                                                    function (err2, gastos) {
                                                        if (err2) {
                                                            cb(500, { message: "Error: intente nuevamente en unos minutos." });
                                                        } else {
                                                            var elementosCrear = [];
                                                            var cantidadIncluidos = 0;
                                                            for (var i = 0; i < gastos.length; i++) {
                                                                if (gastos[i].incluido == 1) {
                                                                    cantidadIncluidos = cantidadIncluidos + 1;
                                                                } else {
                                                                    elementosCrear.push({
                                                                        carpeta_importacion_id: carpetaCreada.id,
                                                                        nombre: gastos[i].nombre,
                                                                        monto: 0,
                                                                        contable: gastos[i].contable
                                                                    });
                                                                }
                                                            }
                                                            if (cantidadIncluidos > 0) {
                                                                elementosCrear.unshift({
                                                                    carpeta_importacion_id: carpetaCreada.id,
                                                                    nombre: "Factura " + params.incoterm,
                                                                    monto: 0,
                                                                    contable: 1
                                                                });
                                                                /*
                                                                Se agrega una categoria, la cual SOLO tendra la factura "general"
                                                                de toda la carpeta. Este numero de factura sera el que se 
                                                                insertara como documento origen en el inventario.
                                                                */
                                                                elementosCrear.unshift({
                                                                    carpeta_importacion_id: carpetaCreada.id,
                                                                    nombre: "FB", //Factura base
                                                                    monto: 0
                                                                });
                                                            }
                                                            var carpetaElementoConstructor = global.db.models.carpeta_importacion_elemento;
                                                            carpetaElementoConstructor.create(elementosCrear, function (err, items) {
                                                                if (err) {
                                                                    cb(500, { message: "Error: intente nuevamente en unos minutos." });
                                                                } else {
                                                                    //Si la carpeta es parcial se procede a crear el detalle aparte, cuando se crea 
                                                                    //el listado de articulos 
                                                                    if (carpetaCreada.tipo_carpeta_importacion != 'P') {
                                                                        // Se procede a crear el detalle de la carpeta de importacion
                                                                        var orden_compra_DetailConstructor = global.db.models.orden_compra_detalle;
                                                                        orden_compra_DetailConstructor.find({ orden_compra_id: params.orden_compra_id },
                                                                            function (err3, detalleOrden) {
                                                                                if (err3) {
                                                                                    cb(500, { message: "Error: intente nuevamente en unos minutos." });
                                                                                } else {
                                                                                    var carpetaDetalle = [];
                                                                                    for (var i = 0; i < detalleOrden.length; i++) {
                                                                                        carpetaDetalle.push({
                                                                                            carpeta_importacion_id: carpetaCreada.id,
                                                                                            articulo_id: detalleOrden[i].articulo_id,
                                                                                            cantidad: detalleOrden[i].cantidad,
                                                                                            costo_base: detalleOrden[i].precio_unitario,
                                                                                            total_base: detalleOrden[i].precio_total,
                                                                                            cantidad_total: detalleOrden[i].cantidad
                                                                                        });
                                                                                    }
                                                                                    if (carpetaDetalle.length > 0) {
                                                                                        var carpetaDetalleConstructor = global.db.models.carpeta_importacion_detalle;
                                                                                        carpetaDetalleConstructor.create(carpetaDetalle, function (err4, items) {
                                                                                            if (err4) {
                                                                                                cb(500, { message: "Error: intente nuevamente en unos minutos." });
                                                                                            } else {
                                                                                                ordenCompra.carpeta_importacion_id = carpetaCreada.id;
                                                                                                ordenCompra.save(function (err) { });
                                                                                                cb(200, carpetaCreada);
                                                                                            }
                                                                                        });
                                                                                    } else {
                                                                                        ordenCompra.carpeta_importacion_id = carpetaCreada.id;
                                                                                        ordenCompra.save(function (err) { });
                                                                                        cb(200, carpetaCreada);
                                                                                    }
                                                                                }
                                                                            });
                                                                    } else {
                                                                        /*se graba el id de la carpeta en la orden de compra para que no se liste
                                                                        en el query de los totales*/
                                                                        ordenCompra.carpeta_importacion_id = carpetaCreada.id;
                                                                        ordenCompra.save(function (err) { });
                                                                        cb(200, carpetaCreada);
                                                                    }

                                                                }
                                                            });
                                                        }
                                                    });
                                            }
                                        });
                                    }

                                })
                        }
                    } else {
                        cb(400, { message: 'La orden de compra especificada no existe.' });
                    }
                });
            }
        },
        getResumenCostos: function (tenantId, idCarpeta, cb) {
            costosCarpeta(idCarpeta, cb);
        },
        getTotalArticulosDisponiblesAsignables: function (ordenCompraId, cb) {
            global.db.driver.execQuery(

                " SELECT tbl.articulo_id, tbl.descripcion, tbl.codigo_articulo codigo, tbl.total, SUM(tbl.maxima) maxima, '0' cantidad FROM  " +
                " ( " +
                /*TRAE LA ORDEN DE COMPRA CON TODOS LOS ARTICULOS*/
                " SELECT ocd.articulo_id, ocd.descripcion, a.codigo_articulo, ocd.cantidad total, ocd.cantidad maxima  " +
                " FROM orden_compra_detalle ocd  " +
                " INNER JOIN articulo a on ocd.articulo_id = a.id " +
                " WHERE orden_compra_id = ? " +
                " UNION ALL " +
                /*TRAE TODOS LOS ARTICULOS EN OTRAS CARPETAS DE IMPORTACION PARCIALES CON LA MISMA ORDEN DE COMPRA 
                  EN NEGATIVO PARA AL SUMARLAS  CON EL TOTAL DEVUELVA LA CANTIDAD MAXIMA A DESPACHAR*/
                " SELECT cipa.id_articulo, a.descripcion, a.codigo_articulo, 0 total, cipa.cantidad*(-1) maxima  " +
                " FROM carpeta_importacion_parcial_articulo cipa  " +
                " INNER JOIN articulo a ON cipa.id_articulo = a.id " +
                " WHERE cipa.id_orden_compra = ? " +
                " ) tbl " +
                " group by articulo_id, descripcion "
                ,
                [ordenCompraId, ordenCompraId],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        cb(500, { message: err });
                    } else {
                        if (result.length > 0) {
                            cb(200, result);
                        }
                        else {
                            cb(500, { message: "No hay articulos para mostrar" });
                        }
                    }
                });
        },
        createListadoArticulosxCarpetaImportacionParcial: function (idCarpeta, idOrdenCompra, listadoArticulos, cb) {
            var listadoGuardar = [];
            async.each(listadoArticulos, function (item, callback) {
                var carpetaImportacionParcialArticuloConstructor = global.db.models.carpeta_importacion_parcial_articulo;
                var itemGuardar = {
                    id_carpeta_importacion: idCarpeta,
                    id_orden_compra: idOrdenCompra,
                    id_articulo: item.articulo_id,
                    cantidad: item.cantidad
                };
                if (itemGuardar.cantidad > 0) {
                    listadoGuardar.push(itemGuardar);
                    carpetaImportacionParcialArticuloConstructor.create(itemGuardar, function (err) {
                        if (err) {
                            console.log(err);
                            callback(500, { message: err });
                        } else {
                            callback();
                        }
                    })
                } else {
                    callback();
                }
            },
                function (errorCallback) {
                    if (errorCallback) {
                        console.log(errorCallback)
                        cb(500, errorCallback.message);
                    } else {
                        //Si se creo correctamente el listado de los articulos 
                        // se crea el detalle de la orden de compra 
                        var orden_compra_DetailConstructor = global.db.models.orden_compra_detalle;
                        orden_compra_DetailConstructor.find({ orden_compra_id: idOrdenCompra },
                            function (err3, detalleOrden) {
                                if (err3) {
                                    console.log(err3);
                                    cb(500, { message: "Error: intente nuevamente en unos minutos." });
                                } else {
                                    var carpetaDetalle = [];
                                    for (var j = 0; j < listadoGuardar.length; j++) {
                                        detalleGuardar = {};
                                        detalleGuardar.carpeta_importacion_id = idCarpeta;
                                        detalleGuardar.articulo_id = listadoGuardar[j].id_articulo;
                                        detalleGuardar.cantidad = listadoGuardar[j].cantidad;
                                        detalleGuardar.cantidad_total = listadoGuardar[j].cantidad;
                                        for (var k = 0; k < detalleOrden.length; k++) {
                                            if (listadoGuardar[j].id_articulo == detalleOrden[k].articulo_id) {
                                                detalleGuardar.costo_base = detalleOrden[k].precio_unitario;
                                                break;
                                            }
                                        }
                                        detalleGuardar.total_base = detalleGuardar.cantidad_total * detalleGuardar.costo_base;
                                        carpetaDetalle.push(detalleGuardar);
                                    }
                                    if (carpetaDetalle.length > 0) {
                                        var carpetaDetalleConstructor = global.db.models.carpeta_importacion_detalle;
                                        carpetaDetalleConstructor.create(carpetaDetalle, function (err4, items) {
                                            if (err4) {
                                                console.log(err4);
                                                cb(500, { message: "Error: intente nuevamente en unos minutos." });
                                            } else {
                                                // ordenCompra.carpeta_importacion_id = idOrdenCompra;
                                                // ordenCompra.save(function (err) { });
                                                cb(200, {});
                                            }
                                        });
                                    } else {
                                        // ordenCompra.carpeta_importacion_id = idOrdenCompra;
                                        // ordenCompra.save(function (err) { });
                                        cb(200, {});
                                    }
                                }
                            });


                    }
                })
        },
        trasladoCostos: function (tenandId, userid, params, cb) {
            var carpetaId = params.carpeta_id;
            var carpetaCerrada = params.cerrado
            costosCarpeta(carpetaId, function (codigo, rpta) {
                if (codigo == 200) {
                    var listaItems = rpta[0].resumen;
                    var itemsInventario = [];
                    for (var i = 0; i < listaItems.length; i++) {
                        var item = {
                            fecha: new Date(),
                            inventario_tipo_documento_id: 2,
                            // De la tabla inventario_tipo_documento, 'Factura'
                            // ha sido comentado y reemplazada porque esto esta obligando a que la fcatura_base haya sido registrada, lo cual esta bien, pero si por algun motivo este es borrado o no regsitrada, se íerde toda la tramnsaccion y genera un error
                            //inventario_documento_id: listaItems[i].factura_base,    // De la tabla carpeta_importacion_documento, para la factura
                            // del elemento "FB" - factura base que ira al inventario
                            inventario_documento_id: carpetaId,
                            inventario_tipo_origen_id: 1,
                            entidad_id: listaItems[i].id,
                            articulo_id: listaItems[i].articulo_id,
                            cantidad: listaItems[i].cantidad,
                            costo_unitario: listaItems[i].costo_final,
                            inventario_id: listaItems[i].inventario_id
                        };
                        if (listaItems[i].inventario_id && listaItems[i].inventario_id > 0) {
                            // Ya existe un registro en inventario de este detalle
                            // -> Es un ajuste
                            item.inventario_tipo_operacion_id = 99; // AJUSTES
                        } else {
                            item.inventario_tipo_operacion_id = 18; // IMPORTACIÓN
                        }
                        itemsInventario.push(item);
                    }
                    async.each(itemsInventario, function (item, callback) {
                        InventarioController().registroInventario(tenandId, userid, item, function (codigo, inventarioCreado) {
                            if (codigo == 200) {
                                // Almacenar el id de la fila 
                                var carpetaDetalleConstructor = global.db.models.carpeta_importacion_detalle;
                                carpetaDetalleConstructor.get(item.entidad_id, function (err, detalleCarpeta) {
                                    if (!detalleCarpeta.inventario_id || detalleCarpeta.inventario_id == null || detalleCarpeta.inventario_id == 0) {

                                        detalleCarpeta.inventario_id = inventarioCreado.id
                                        detalleCarpeta.save();
                                    }
                                    callback();
                                });
                            } else {
                                callback(codigo, inventarioCreado);
                            }
                        })
                    }, function (errSG) {
                        if (errSG) {
                            cb(500, { err: errSG.message });
                        } else {
                            var estadoCarpeta = "";
                            if (carpetaCerrada) {

                                estadoCarpeta = 4
                            }
                            else {
                                estadoCarpeta = 3
                            }
                            var carpImportacionConstructor = global.db.models.carpeta_importacion;
                            carpImportacionConstructor.get(carpetaId, function (err, obj) {
                                if (err) {
                                    cb(500, { err: err });
                                }
                                else {
                                    if (obj) {
                                        obj.estado_id = estadoCarpeta,
                                            obj.save(function (err) {
                                                if (err) {
                                                    cb(500, { err: err });
                                                }
                                                else {
                                                    //Si todo sale bien, entonces se procede a actualizar los documentos de importacion seteandoles la fecha de pase
                                                    var timestamp = new Date();
                                                    global.db.driver.execQuery(
                                                        "SELECT " +
                                                        "carpeta_importacion_documento.id " +
                                                        "FROM " +
                                                        "carpeta_importacion_documento " +
                                                        "INNER JOIN " +
                                                        "carpeta_importacion_elemento ON carpeta_importacion_documento.carpeta_importacion_elemento_id = carpeta_importacion_elemento.id " +
                                                        "INNER JOIN " +
                                                        "carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
                                                        "where carpeta_importacion.id = ? ",
                                                        [carpetaId], function (err, listidDoctoUpd) {
                                                            if (err) {
                                                                cb(500, { err: err });
                                                            } else {
                                                                console.log(listidDoctoUpd);
                                                                var contador = 0;
                                                                async.whilst(function () { return contador < listidDoctoUpd.length },
                                                                    function (callback) {
                                                                        var carpetaImportacionDocumentoConstructor = global.db.models.carpeta_importacion_documento;
                                                                        carpetaImportacionDocumentoConstructor.get(listidDoctoUpd[contador].id, function (err, documentoImp) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            }
                                                                            documentoImp.fecha_pase = timestamp;
                                                                            documentoImp.save(function (err) {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                    callback(new Error(err));
                                                                                } else {
                                                                                    console.log("guardado");
                                                                                    contador++;
                                                                                    callback();
                                                                                }
                                                                            });
                                                                        });
                                                                    },
                                                                    function (err) {
                                                                        if (err) {
                                                                            console.log(err)
                                                                        } else {
                                                                            global.db.driver.execQuery(
                                                                                "SELECT " +
                                                                                "carpeta_import_doc_detalle_carpeta.id " +
                                                                                "FROM " +
                                                                                "carpeta_import_doc_detalle_carpeta " +
                                                                                "LEFT JOIN " +
                                                                                "carpeta_importacion_elemento ON carpeta_import_doc_detalle_carpeta.id_carpeta_importacion_elemento = carpeta_importacion_elemento.id " +
                                                                                "LEFT JOIN " +
                                                                                "carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
                                                                                "WHERE " +
                                                                                "carpeta_importacion.id = ? ",
                                                                                [carpetaId]
                                                                                , function (err, specialDocuments) {
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                    } else {
                                                                                        var count = 0;
                                                                                        async.whilst(function () { return count < specialDocuments.length },
                                                                                            function (callback) {
                                                                                                var documentosEspecialesConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
                                                                                                documentosEspecialesConstructor.get(specialDocuments[count].id, function (err, doctoUpd) {
                                                                                                    doctoUpd.fecha_pase = timestamp;
                                                                                                    doctoUpd.save(function (err) {
                                                                                                        if (err) {
                                                                                                            console.log(err);
                                                                                                            callback(new Error(err));
                                                                                                        } else {
                                                                                                            console.log("guardado");
                                                                                                            count++;
                                                                                                            callback();
                                                                                                        }
                                                                                                    })
                                                                                                })
                                                                                            },
                                                                                            function (err) {
                                                                                                if (err) {
                                                                                                    console.log(err);
                                                                                                } else {
                                                                                                    cb(200, { id: carpetaId });
                                                                                                }
                                                                                            })
                                                                                    }
                                                                                }
                                                                            )
                                                                        }
                                                                    }
                                                                )
                                                            }
                                                        }
                                                    );
                                                }
                                            });
                                    }
                                    else {
                                        cb(404, { message: 'NO EXISTE CARPETA DE IMPORTACION' });
                                    }
                                }
                            });
                            //cb(200, {});
                        }
                    });
                } else {
                    cb(codigo, rpta);
                }
            });
        },
        carpetaImportacionConDetalleId: function (paramsId, cb) {
            global.db.driver.execQuery(
                "SELECT C.*," +
                " OC.numero numero_oc, E.id estado_id, E.nombre estado, " +
                " P.nombre as nombre_proveedor," +
                " cc.nombre as centro_costo, " +
                " inc.nombre as incoterm_nombre " +
                " FROM carpeta_importacion C " +
                " INNER JOIN orden_compra OC ON C.orden_compra_id = OC.id " +
                " INNER JOIN proveedor P ON C.proveedor_id = P.id " +
                " INNER JOIN estado_carpeta_importacion E ON C.estado_id = E.id" +
                " INNER JOIN centro_costo cc ON c.centro_costo_id = cc.id " +
                " INNER JOIN incoterm inc on c.incoterm_id = inc.id " +
                " WHERE c.id = ?;", [paramsId],
                function (err, lstCarpetas) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (lstCarpetas) {
                            global.db.driver.execQuery(
                                "SELECT cid.*," +
                                " art.nombre" +
                                " FROM carpeta_importacion_detalle cid " +
                                " INNER JOIN articulo art ON cid.articulo_id = art.id " +
                                " WHERE cid.carpeta_importacion_id = ?;", [paramsId],
                                function (err, lstCarpDetalle) {
                                    if (err) {
                                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                                    } else {
                                        if (lstCarpDetalle) {
                                            lstCarpetas[0].detalles = lstCarpDetalle;
                                            cb(200, lstCarpetas);
                                        } else {
                                            cb(401, { message: 'No se encontraron carpetas de importación.' });
                                        }
                                    }
                                });
                        } else {
                            cb(401, { message: 'No se encontraron carpetas de importación.' });
                        }
                    }
                });
        },
        listadoCarpetaImportacionWidget: function (cb) {
            global.db.driver.execQuery(
                "SELECT ci.*, cc.nombre as centro_costo, " +
                " oc.numero as orden_compra," +
                " es.nombre as estado" +
                " FROM carpeta_importacion ci " +
                " INNER JOIN centro_costo cc on ci.centro_costo_id =  cc.id " +
                " INNER JOIN orden_compra oc on ci.orden_compra_id = oc.id " +
                " INNER JOIN estado_carpeta_importacion es on ci.estado_id = es.id" +
                " WHERE ci.estado_id != 4", [],
                function (err, lstCarpetas) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (lstCarpetas) {
                            cb(200, lstCarpetas);
                        } else {
                            cb(401, { message: 'No se encontraron carpetas de importación.' });
                        }
                    }
                });
        },
        delete: function (paramId, cb) {
            global.db.driver.execQuery(
                "SELECT CIE.* FROM carpeta_importacion_elemento CIE inner join carpeta_importacion_documento CID On CID.carpeta_importacion_elemento_id = CIE.id where CIE.carpeta_importacion_id=?", [paramId],
                function (err, lstDocumentos) {
                    if (err) {
                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                    } else {
                        if (lstDocumentos.length == 0) {
                            global.db.driver.execQuery(
                                "SELECT CIE.* FROM carpeta_importacion_elemento CIE inner join carpeta_import_doc_detalle_carpeta CIDD On CIDD.id_carpeta_importacion_elemento = CIE.id where CIE.carpeta_importacion_id=?", [paramId],
                                function (err, lstDocumentosEspeciales) {
                                    if (err) {
                                        cb(500, { message: 'ERROR EN EL SERVICIO' });
                                    } else {
                                        if (lstDocumentosEspeciales.length == 0) {
                                            var carpetaDetalleConstructor = global.db.models.carpeta_importacion_detalle;
                                            carpetaDetalleConstructor.find({ carpeta_importacion_id: paramId }).remove(function (err, resultDetalleCarpeta) {
                                                if (err) {
                                                    cb(400, { message: err });
                                                } else {
                                                    if (resultDetalleCarpeta != undefined) {
                                                        var carpetaConstructor = global.db.models.carpeta_importacion;
                                                        carpetaConstructor.find({ id: paramId }).remove(function (err, resultCarpeta) {
                                                            if (err) {
                                                                cb(400, { message: err });
                                                            } else {
                                                                if (resultCarpeta != undefined) {
                                                                    var ordenCompraConstructor = global.db.models.orden_compra;
                                                                    ordenCompraConstructor.find({ carpeta_importacion_id: paramId }, function (err, objOrdenCOmpra) {
                                                                        if (err) {
                                                                            cb(500, { err: err });
                                                                        }
                                                                        else {
                                                                            if (objOrdenCOmpra) {
                                                                                ordenCompraConstructor.get(objOrdenCOmpra[0].id, function (err, obj) {
                                                                                    if (err) {
                                                                                        cb(500, { err: err });
                                                                                    }
                                                                                    else {
                                                                                        if (obj) {
                                                                                            obj.carpeta_importacion_id = null,
                                                                                                obj.save(function (err) {
                                                                                                    if (err) {
                                                                                                        cb(500, { message: "Existe un error en el sistema" });
                                                                                                    }
                                                                                                    else {
                                                                                                        global.db.driver.execQuery(
                                                                                                        "select tipo_carpeta_importacion from carpeta_importacion where id=?"
                                                                                                        ,[paramsId],function(err,carpeta_tipo){

                                                                                                            if(err)
                                                                                                            {
                                                                                                                cb(500, { message: "Existe un error en el sistema" });
                                                                                                            }
                                                                                                            else
                                                                                                            {
                                                                                                                if(carpeta_tipo[0].tipo_carpeta_importacion == "P")
                                                                                                                {
                                                                                                                    var carpetaImportacionParcialArticuloConstructor= global.db.models.carpeta_importacion_parcial_articulo;
                                                                                                                    carpetaImportacionParcialArticuloConstructor.find({id_carpeta_importacion:paramsId}).remove(function (err) {
                                                                                                                        
                                                                                                                        if(err)
                                                                                                                        {
                                                                                                                            cb(500, { message: "Existe un error en el sistema" });
                                                                                                                        }
                                                                                                                        else
                                                                                                                        {
                                                                                                                            cb(200, { id: paramId });
                                                                                                                        }
                                                                                                                    })
                                                                                                                    
                                                                                                                }
                                                                                                                else
                                                                                                                {
                                                                                                                    cb(200, { id: paramId });
                                                                                                                }
                                                                                                            }


                                                                                                            
                                                                                                        })
                                                                                                        
                                                                                                    }
                                                                                                });
                                                                                        }
                                                                                        else {
                                                                                            cb(200, 'ok');
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }
                                                                            else {
                                                                                cb(200, 'ok');
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    cb(500, { message: "NO EXISTE Carpeta" });
                                                                }
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        var carpetaConstructor = global.db.models.carpeta_importacion;
                                                        carpetaConstructor.find({ id: paramId }).remove(function (err, resultCarpeta) {
                                                            cb(200, { message: "ok" });
                                                        })
                                                    }
                                                }
                                            });
                                        } else {
                                            cb(401, { message: 'No puede eliminar esta carpeta tiene documentos asociados' });
                                        }
                                    }
                                });
                        } else {
                            cb(401, { message: 'No puede eliminar esta carpeta tiene documentos asociados' });
                        }
                    }
                });
        },
    }
};