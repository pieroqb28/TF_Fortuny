var numerosLetras = require('../services/numerosLetras');
var numMesLetras = require('../services/numMesLetras');
var numMoneda = require('../services/numerosMonedas');
var async = require('async');
var maskDate = 'DD/MM/YY';
module.exports = function () {
	function verificarFacturaGrabar(factura) {
		// Verificacion de campos
		if (!factura) {
			return { codigo: 400, texto: "Datos de factura nulos." };
		} else if (!factura.num_factura && factura.num_factura != "") {
			return { codigo: 400, texto: "Debe ingresar el número de factura." };
		} else {
			return { codigo: 200, texto: "OK - PARCIAL" };
		}
	}
	function ultimoDocumentoEmitido(tipo_documento, numero_serie, cb) {
		if (!tipo_documento || !numero_serie) {
			cb(400, { texto: "No se ha enviado todos los datos necesarios" });
		}
		else {
			if (tipo_documento == "GuiaRemision") {
				db.driver.execQuery(
					"select guia_remision.codigo as num_documento from guia_remision where guia_remision.serie = ? " +
					" ORDER BY guia_remision.codigo DESC " +
					" LIMIT 1;  ", [numero_serie],
					function (err, ultimaGuiaRemision) {
						if (err) {
							cb(500, { err: err });
						} else {
							if (ultimaGuiaRemision.length > 0) {
								cb(200, ultimaGuiaRemision[0].num_documento);
							}
							else {
								cb(200, 0)
							}
						}
					});
			}
			else {
				db.driver.execQuery(
					"select factura.num_factura as num_documento from factura where tipo_documento = ? AND serie = ?" +
					" ORDER BY cast(factura.num_factura as signed) DESC " +
					" LIMIT 1;  ", [tipo_documento, numero_serie],
					function (err, objDocumentoValido) {
						if (err) {
							cb(500, { err: err });
						} else {
							if (objDocumentoValido.length > 0) {
								cb(200, objDocumentoValido[0].num_documento);
							}
							else {
								cb(200, 0)
							}
						}
					});
			}
		}
	}
	function generarFacturasAnuladas(tipo_documento, numero_serie, usuario_id, numero) {
		var numeroBD = ultimoDocumentoEmitido(tipo_documento, numero_serie, function (status, result) {
			if (!tipo_documento && !numero_serie && !usuario_id && !numero) {
			} else {
				if (Number(result) > numero) {
				}
				if (numero - Number(result) != 1) {
					for (var i = Number(result) + 1; i < numero; i++) {
						var documentoAnuladoConstructor = global.db.models.documento_anulado;
						documentoAnuladoCrear = {
							numero: i,
							serie: numero_serie,
							usuario_id: usuario_id,
							causa: "",
							tipo_documento: tipo_documento,
							fecha: new Date()
						}
						documentoAnuladoConstructor.create(documentoAnuladoCrear, function (err, obj) {
							if (err) {
							} else { }
						});
					}
				}
			}
		})
	}
	function verificarFacturaEmision(factura) {
		if (!factura) {
			return { codigo: 400, texto: "Datos de factura nulos." };
		} else if (!(factura.num_factura && factura.cliente_id && factura.moneda && factura.fecha_vencimiento
			&& factura.fecha_emision)) {
			return { codigo: 400, texto: "Factura sin los campos mínimos." };
		} else if (!(factura.detalles && factura.detalles instanceof Array && factura.detalles.length > 0)) {
			return { codigo: 400, texto: "La factura no posee líneas de detalle." };
		} else {
			// Evaluacion de montos
			var error = false;
			if (factura.total_factura == (factura.sub_total + factura.igv)) {
				var total = 0;
				var detalle = {};
				for (i = 0; i < factura.detalles.length; i++) {
					detalle = factura.detalles[i];
					total = total + detalle.precio_unitario;
				}
				if ((parseFloat(total.toFixed(2)) > (factura.sub_total - 0.05)) || (parseFloat(total.toFixed(2)) < (factura.sub_total + 0.05))) {
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
	function verificarGuias(guias) {
		if (!guias || guias.length == 0) {
			return { codigo: 400, texto: "No se ha seleccionado guias" };
		} else {
			// Evaluacion de datos por cada guia
			var textoError = null
			for (var i = 0; i < guias.length; i++) {
				var guia = guias[i];
				if (!(guia.guia_remision_id && guia.despacho_id && guia.fecha_vencimiento_factura && guia.fecha_emision_factura
					&& guia.numero_factura /*&& guia.cuenta_contable*/)) { // comentado porque la cuenta conmtable ya no se va a usar
					textoError = "Una o más guías con datos insuficientes.";
					break;
				}
			}
			if (textoError)
				return { codigo: 400, texto: textoError };
			else
				return { codigo: 200, texto: "OK - PARCIAL" };
		}
	}
	function creacionFacturas(guias, lote_id, cb) {

		var impuesto_valor = guias[0].impuesto_valor
		var impuesto_id = guias[0].impuesto_id
		var cotizacionConstructor = global.db.models.cotizacion;
		var facturaConstructor = global.db.models.factura;
		var facturaDetalleConstructor = global.db.models.cotizacion;
		var guiaRemisionConstructor = global.db.models.guia_remision;
		var facturasCreadas = [];
		/*
		Para cada guia de remision, se hace lo siguiente:
		1.- Se obtienen los datos de la cotizacion asociada.
		2.- Se crea la factura, sin monto.
		3.- Se obtienen los datos para crear el detalle de la factura y se crean estas filas
		4.- Se actualiza el monto de la factura.
		5.- Se actualiza la guia de remision con el id de la factura creada
		Al final de haber creado todas las facturas, se edita y se actualiza el lote con el # de las facturas creadas.
		*/
		async.each(guias, function (guia, callback) {
			// 1.-

			cotizacionConstructor.find({ id: guia.cotizacion_id }, function (errG, datos) {
				if (errG) {
					callback(new Error(errG));
				} else {
					if (datos) {
						var cotizacion = datos[0];
						// 2.-
						var numeroFactura = guia.numero_factura
						var extraeNumFactura = numeroFactura.split("-")
						facturaConstructor.create({
							serie: extraeNumFactura[0],
							num_factura: extraeNumFactura[1],
							fecha_emision: guia.fecha_emision_factura,
							centro_costo_id: guia.centro_costo_id,
							centro_costo: "8",
							cliente_id: cotizacion.cliente_id,
							orden_compra: cotizacion.orden_compra_cliente,
							guia_remision_id: guia.guia_remision_id,
							despacho_id: guia.despacho_id,
							condicion_venta: guia.condicion_venta,
							fecha_vencimiento: guia.fecha_vencimiento_factura,
							moneda: cotizacion.moneda,
							lote_id: lote_id,
							estado_factura_id: 1,
							tipo_factura_id: 1,
							tipo_documento: "Factura",
							cuenta_detraccion: guia.cuenta_contable
						}, function (err, obj) {
							if (err) {
								callback(new Error(err));
							} else {
								if (obj) {
									facturasCreadas.push(obj);
									// 3.-
									db.driver.execQuery(
										"INSERT INTO factura_detalle (factura_id, cantidad, detalle, articulo_id, precio_unitario, total)"
										+ " SELECT " + obj.id + ", G.cantidad_recibida cantidad, A.nombre detalle,  A.id articulo_id,"
										+ "  CD.precio_unitario_factor precio_unitario,( CD.precio_unitario_factor * G.cantidad_recibida) total"
										+ " FROM guia_remision_detalle G"
										+ "  INNER JOIN despacho_detalle DD ON DD.id = G.despacho_detalle_id"
										+ "  INNER JOIN cotizacion_detalle CD ON CD.id = DD.cotizacion_detalle_id"
										+ "  INNER JOIN articulo A ON G.articulo_id = A.id "
										+ " WHERE G.guia_remision_id = ? ;",
										[guia.guia_remision_id],
										function (err) {
											if (err) {
												callback(new Error(err));
											} else {
												// 4.-
												db.driver.execQuery(
													"SELECT SUM(total) subTotal FROM factura_detalle WHERE factura_id = ? ;",
													[obj.id],
													function (err, listTotal) {
														if (err) {
															callback(new Error(err));
														} else if (listTotal) {
															var subTotal = listTotal[0].subTotal;
															facturaConstructor.find({ id: obj.id }).each(function (factura) {
																factura.sub_total = subTotal;
																factura.igv = parseFloat((subTotal * impuesto_valor).toFixed(2));
																factura.impuesto_valor = impuesto_valor;
																factura.impuesto_id = impuesto_id;
																factura.total_factura = factura.sub_total + factura.igv;
																impuesto_id = 5;
																impuesto_valor = 0.18;
															}).save(function (err) {
																// 5.-
																if (err) {
																	callback(new Error(err));
																} else {
																	guiaRemisionConstructor.find({ id: guia.guia_remision_id }).each(function (guia_objeto) {
																		guia_objeto.factura_id = obj.id;
																	}).save(function (err) {
																		if (err) {
																			callback(new Error(err));
																		} else {
																			callback();
																		}
																	});
																}
															});
														} else {
															callback(new Error("ERROR"));
														}
													});
											}
										});
								} else {
									callback(new Error("ERROR"));
								}
							}
						});
					} else {
						callback(new Error("NO SE ENCONTRO COTIZACION"));
					}
				}
			});
		}, function (errSG) {
			if (errSG) {
				cb(500, { err: errSG })
			} else {
				cb(200, { creados: facturasCreadas })
			}
		});
	}
	return {
		delete: function (tenantId, paramId, cb) {
			var facturaConstructor = global.db.models.factura;
			facturaConstructor.get(paramId, function (error1, objeto) {
				if (error1) {
					cb(500, { err: error1 });
				} else if (objeto) {
					// Se valida que la factura este en estado 1 - En Progreso
					if (objeto.estado_factura_id == 1) {
						var facturaDetalleConstructor = global.db.models.factura_detalle;
						// Se remueven los detalles
						facturaDetalleConstructor.find({ factura_id: paramId }).remove(function (error2) {
							if (error2) {
								cb(500, { err: error2 });
							} else {
								// Se remueve la factura
								objeto.remove(function (error3) {
									if (error3) {
										cb(500, { err: error3 });
									} else {
										cb(200, {});
									}
								})
							}
						});
					} else {
						cb(500, { message: "La factura ya fue emitida y no puede ser eliminada." });
					}
				} else {
					cb(404, { message: "La factura no existe." });
				}
			});
		},
		getbyId: function (req, res, cb) {
			db.driver.execQuery(
				"SELECT F.*, C.nombre cliente_nombre, EF.estado estado_factura, D.codigo despacho, G.codigo guia_remision"
				+ " FROM factura F"
				+ " INNER JOIN cliente C ON f.cliente_id = C.id"
				+ " INNER JOIN estado_factura EF ON EF.id = F.estado_factura_id"
				+ " LEFT JOIN despacho D ON F.despacho_id = D.id"
				+ " LEFT JOIN guia_remision G ON G.id = F.guia_remision_id"
				+ " WHERE F.id =?;",
				[req.params.id],
				function (err, listObj) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (listObj.length > 0) {
							var facturaDetalleConstructor = global.db.models.factura_detalle;
							// Para propositos de visualizacion, las cantidades se muestran positivas
							for (var i = 0; i < listObj.length; i++) {
								var factura = listObj[i];
								if (factura.sub_total < 0) factura.sub_total = factura.sub_total * (-1);
								if (factura.igv < 0) factura.igv = factura.igv * (-1);
								if (factura.total_factura < 0) factura.total_factura = factura.total_factura * (-1);
							}
							facturaDetalleConstructor.find({ factura_id: req.params.id }, function (errG, detalles) {
								if (errG) {
									cb(500, { err: errG });
								} else {
									if (detalles) {
										// Para propositos de visualizacion, las cantidades se muestran positivas
										for (var i = 0; i < detalles.length; i++) {
											var detalle = detalles[i];
											if (detalle.precio_unitario < 0) detalle.precio_unitario = detalle.precio_unitario * (-1);
											if (detalle.total < 0) detalle.total = detalle.total * (-1);
										}
										listObj[0].detalles = detalles;
									}
									cb(200, listObj);
								}
							});
						} else {
							cb(500, { err: 'NOT FOUND' });
						}
					}
				});
		},
		getAll: function (tenantId, cb) {
			db.driver.execQuery(
				"SELECT F.*, C.nombre cliente_nombre, EF.estado estado_factura"
				+ " FROM factura F"
				+ " INNER JOIN cliente C ON F.cliente_id = C.id"
				+ " INNER JOIN estado_factura EF ON EF.id = F.estado_factura_id;",
				[],
				function (err, listObj) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (listObj) {
							cb(200, listObj);
						} else {
							cb(500, { err: 'NOT FOUND' });
						}
					}
				}
			);
		},
		create: function (userId, tenantId, body, res, cb) {
			var verificacion = {
				codigo: 200
			};
			if (body.estado_id == 1) {
				verificacion = verificarFacturaGrabar(body);
			} else {
				verificacion = verificarFacturaEmision(body);
			}
			if (verificacion.codigo != 200) {
				cb(verificacion.codigo, { message: verificacion.texto });
			} else {
				generarFacturasAnuladas(body.tipo_documento, body.serie, userId, body.num_factura);
				var facturaConstructor = global.db.models.factura;
				var factura = {
					num_factura: body.num_factura,
					fecha_emision: body.fecha_emision,
					cliente_id: body.cliente_id,
					orden_compra: body.orden_compra_cliente,
					guia_remision_id: body.guia_remision_id,
					centro_costo: body.centro_costo,
					despacho_id: body.despacho_id,
					lote_id: body.lote_id,
					impuesto_id: body.impuesto_id,
					impuesto_valor: body.impuesto_valor,
					condicion_venta: body.condicion_venta,
					fecha_vencimiento: body.fecha_vencimiento,
					moneda: body.moneda,
					serie: body.serie,
					referencia: body.referencia,
					sub_total: body.sub_total,
					igv: body.igv,
					total_factura: body.total_factura,
					estado_factura_id: body.estado_id,
					tipo_factura_id: 2, // Las facturas de tipo 1 - Productos solo pueden ser registradas a traves del proceso de despacho y facturacion
					cuenta_detraccion: body.cuenta_detraccion,
					fecha_creacion: new Date(),
					usuario_creacion: userId
				};
				if (body.tipo_documento && body.tipo_documento.length > 0) {
					factura.tipo_documento = body.tipo_documento;
					if (body.tipo_documento === "NotaCredito") {
						// Para calculos de montos, el valor se almacena en negativo
						factura.sub_total = factura.sub_total * (-1);
						factura.igv = factura.igv * (-1);
						factura.total_factura = factura.total_factura * (-1);
					}
				} else {
					factura.tipo_documento = "Factura";
				}
				facturaConstructor.create(factura, function (err, obj) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (obj) {
							var factura_id = obj.id;
							var facturaDetalleConstructor = global.db.models.factura_detalle;
							async.each(body.detalles, function (detalle, callback) {
								var detalleFactura = {
									factura_id: factura_id,
									cantidad: detalle.cantidad,
									detalle: detalle.detalle,
									articulo_id: detalle.articulo_id,
									precio_unitario: detalle.precio_unitario,
									total: detalle.total
								};
								if (body.tipo_documento === "NotaCredito") {
									detalleFactura.precio_unitario = detalleFactura.precio_unitario;
									detalleFactura.total = detalleFactura.total * (-1);
								}
								facturaDetalleConstructor.create(detalleFactura, function (err, obj) {
									if (err) {
										callback(new Error(err));
									} else {
										if (obj) {
											callback();
										} else {
											callback(new Error(err));
										}
									}
								});
							}, function (errSG) {
								if (errSG) {
									cb(500, { message: errSG, code: '2003' });
								} else {
									cb(200, { creados: obj });
								}
							});
						} else {
							cb(500, { err: 'ERROR' });
						}
					}
				});
			}
		},
		update: function (userId, tenandId, paramId, toUpd, cb) {
			var verificacion = {
				codigo: 200
			};
			if (toUpd.estado_id == 1) {
				verificacion = verificarFacturaGrabar(toUpd);
			} else {
				verificacion = verificarFacturaEmision(toUpd);
			}
			if (verificacion.codigo != 200) {
				cb(verificacion.codigo, { message: verificacion.texto });
			} else {
				// Adicionalmente se debe verificar que tenga id y que este exista
				var facturaConstructor = global.db.models.factura;
				facturaConstructor.get(paramId, function (err, objeto) {
					if (err) {
						cb(500, { err: err });
					} else if (objeto) {
						// La factura solo es modificable si esta en estado 1 - En Progreso
						if (objeto.estado_factura_id == 1) {
							var datosGrabar = {
								num_factura: toUpd.num_factura,
								fecha_emision: toUpd.fecha_emision,
								cliente_id: toUpd.cliente_id,
								orden_compra: toUpd.orden_compra_cliente,
								guia_remision_id: toUpd.guia_remision_id,
								centro_costo: toUpd.centro_costo,
								despacho_id: toUpd.despacho_id,
								lote_id: toUpd.lote_id,
								condicion_venta: toUpd.condicion_venta,
								fecha_vencimiento: toUpd.fecha_vencimiento,
								moneda: toUpd.moneda,
								impuesto_id: toUpd.impuesto_id,
								impuesto_valor: toUpd.impuesto_valor,
								referencia: toUpd.referencia,
								sub_total: toUpd.sub_total,
								igv: toUpd.igv,
								total_factura: toUpd.total_factura,
								estado_factura_id: toUpd.estado_id,
								cuenta_detraccion: toUpd.cuenta_detraccion,
								tipo_documento: toUpd.tipo_documento,
								usuario_modificacion: userId,
								fecha_modificacion: new Date()
							};
							if (datosGrabar.tipo_documento === "NotaCredito") {
								// Para calculos de montos, el valor se almacena en negativo
								datosGrabar.sub_total = datosGrabar.sub_total * (-1);
								datosGrabar.igv = datosGrabar.igv * (-1);
								datosGrabar.total_factura = datosGrabar.total_factura * (-1);
							}
							objeto.save(datosGrabar, function (err) {
								if (err) {
									cb(500, { err: err });
								} else {
									// ELIMINACION Y POSTERIOR CREACION DE LAS FILAS DEL DETALLE
									var facturaDetalleConstructor = global.db.models.factura_detalle;
									facturaDetalleConstructor.find({ factura_id: paramId }).remove(function (err) {
										if (err) {
											cb(500, { err: err });
										} else {
											async.each(toUpd.detalles, function (detalle, callback) {
												var detalleFactura = {
													factura_id: paramId,
													cantidad: detalle.cantidad,
													detalle: detalle.detalle,
													articulo_id: detalle.articulo_id,
													precio_unitario: detalle.precio_unitario,
													total: detalle.total
												};
												if (datosGrabar.tipo_documento === "NotaCredito") {
													detalleFactura.precio_unitario = detalleFactura.precio_unitario;
													detalleFactura.total = detalleFactura.total * (-1);
												}
												facturaDetalleConstructor.create(detalleFactura, function (err, obj) {
													if (err) {
														callback(new Error(err));
													} else {
														if (obj) {
															callback();
														} else {
															callback(new Error(err));
														}
													}
												});
											}, function (errSG) {
												if (errSG) {
													cb(500, { message: errSG, code: '2003' });
												} else {
													cb(200, {});
												}
											});
										}
									});
								}
							});
						} else {
							cb(403, { message: 'FACTURA NO EDITABLE' });
						}
					} else {
						cb(404, { message: 'FACTURA NO ENCONTRADA' });
					}
				});
			}
		},
		anular: function (userId, paramId, toUpd, cb) {
			if (!(toUpd.num_factura && toUpd.fecha_emision && toUpd.fecha_vencimiento)) {
				cb(400, { message: "FALTAN DATOS" });
			} else {
				// Adicionalmente se debe verificar que tenga id y que este exista
				var facturaConstructor = global.db.models.factura;
				facturaConstructor.get(paramId, function (err, objeto) {
					if (err) {
						cb(500, { err: err });
					} else if (objeto) {
						// Solo se puede refacturar si la factura esta en estado 2 (emitida) o 3 (impresa) y se cambia a 5 (Anulada)
						if (objeto.estado_factura_id > 1) {
							objeto.usuario_modificacion = toUpd.usuario_modificacion;
							objeto.fecha_modificacion = new Date();
							objeto.estado_factura_id = 5;
							objeto.save(function (err) {
								if (err) {
									cb(500, { err: err });
								} else {
									cb(200, {});
								}
							});
						} else {
							cb(403, { message: 'FACTURA NO TERMINADA' });
						}
					} else {
						cb(404, { message: 'FACTURA NO ENCONTRADA' });
					}
				});
			}
		},
		refacturar: function (userId, tenandId, paramId, toUpd, cb) {
			var verificacion = {
				codigo: 200
			};
			if (!(toUpd.num_factura && toUpd.fecha_emision && toUpd.fecha_vencimiento)) {
				cb(400, { message: "FALTAN DATOS" });
			} else {
				// Adicionalmente se debe verificar que tenga id y que este exista
				var facturaConstructor = global.db.models.factura;
				facturaConstructor.get(paramId, function (err, objeto) {
					if (err) {
						cb(500, { err: err });
					} else if (objeto) {
						// Solo se puede refacturar si la factura esta en estado 2 (emitida) o 3 (impresa)
						if (objeto.estado_factura_id > 1) {
							var enviarAnulado = objeto.num_factura;
							objeto.num_factura = toUpd.num_factura;
							objeto.fecha_emision = toUpd.fecha_emision;
							objeto.fecha_vencimiento = toUpd.fecha_vencimiento;
							objeto.estado_factura_id = 2;
							objeto.save(function (err) {
								if (err) {
									cb(500, { err: err });
								} else {
									//PASO EL NUMERO ACTUAL A DOCUMENTOS ANULADOS
									var documentoAnuladoConstructor = global.db.models.documento_anulado;
									documentoAnuladoCrear = {
										numero: enviarAnulado,
										serie: objeto.serie,
										usuario_id: objeto.usuario_id,
										causa: "CAMBIO DE NUMERACION",
										tipo_documento: objeto.tipo_documento,
										fecha: new Date()
									}
									documentoAnuladoConstructor.create(documentoAnuladoCrear, function (err, item) {
										if (err) {
											cb(500, { err: err })
										} else {
											cb(200, {});
										}
									})

								}
							});
						} else {
							cb(403, { message: 'FACTURA NO TERMINADA' });
						}
					} else {
						cb(404, { message: 'FACTURA NO ENCONTRADA' });
					}
				});
			}
		},
		facturarDespacho: function (userId, tenantId, body, res, cb) {
			var verificacion = verificarGuias(body);

			if (verificacion.codigo == 200) {
				//if (body[0].lote_id && body[0].lote_id > 0){
				if (!(body[0].lote_id && body[0].lote_id > 0)) {
					var loteConstructor = global.db.models.lote_facturas;
					loteConstructor.create({
						despacho_id: body[0].despacho_id,
						facturas_creadas: 0,
						facturas_impresas: 0
					}, function (err, obj) {
						if (err) {
							cb(500, { err: err });
						} else {
							if (obj) {
								creacionFacturas(body, obj.id, cb);
							} else {
								cb(500, { err: "NO SE PUDO CREAR EL LOTE" });
							}
						}
					});
				} else {
					creacionFacturas(body, body[0].lote_id, cb);
				}
			} else {
				cb(verificacion.codigo, { message: verificacion.texto })
			}
		},
		factVencidas: function (tenantId, cb) {
			db.driver.execQuery(
				"select fact.*,cli.nombre nombre_cliente"
				+ " from factura fact"
				+ " INNER JOIN cliente cli ON fact.cliente_id=cli.id "
				+ " where fecha_vencimiento<now() AND estado_factura_id !=4"
				+ " ORDER BY fecha_vencimiento ASC;",
				[],
				function (err, listObj) {
					if (err) {
						cb(500, { err: "Error en el Sistema" });
					} else {
						cb(200, listObj);
					}
				}
			);
		},
		getPrint: function (paramsId, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
			db.driver.execQuery(
				"SELECT "
				+ " cli.nombre nombreCliente,"
				+ " cli.direccion direccionCliente,"
				+ " cli.ruc rucCliente,"
				+ " cli.telefono  telefonoCliente,"
				+ " cli.direccion2  ciudadCliente,"
				+ " guiRem.codigo numGuiaRem, "
				+ " fac.orden_compra, "
				+ " fac.fecha_emision, "
				+ " fac.fecha_vencimiento, "
				+ " fac.centro_costo_id, "
				+ " IFNULL(fac.referencia,'') referencia, "
				+ " fac.num_factura, "
				+ " fac.condicion_venta, "
				+ " fac.sub_total, "
				+ " fac.igv, "
				+ " fac.moneda, "
				+ " fac.total_factura "
				+ " FROM factura fac LEFT JOIN cliente cli "
				+ " ON fac.cliente_id=cli.id LEFT JOIN guia_remision guiRem "
				+ " ON fac.guia_remision_id=guiRem.id "
				+ " where fac.id=?; ",
				[paramsId],
				function (err, listObj) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (listObj.length > 0) {
							listObj[0].total_factura_letras = numerosLetras(listObj[0].total_factura, listObj[0].moneda);
							listObj[0].fechaDia = listObj[0].fecha_emision.getDate() > 9 ? listObj[0].fecha_emision.getDate() : "0" + listObj[0].fecha_emision.getDate();
							listObj[0].fechaMes = numMesLetras(listObj[0].fecha_emision.getMonth() + 1);
							listObj[0].fechaAnio = (listObj[0].fecha_emision.getFullYear()).toString().substr(2, 4);
							//listObj[0].sub_total= listObj[0].sub_total.toFixed(2);
							//listObj[0].igv = listObj[0].igv.toFixed(2);
							//listObj[0].total_factura = listObj[0].total_factura.toFixed(2);
							listObj[0].sub_total = numMoneda(Math.abs(listObj[0].sub_total, 2, ".", ","));
							listObj[0].igv = numMoneda(Math.abs(listObj[0].igv, 2, ".", ","));
							listObj[0].total_factura = numMoneda(Math.abs(listObj[0].total_factura, 2, ".", ","));
							var vencimiento_dia = listObj[0].fecha_vencimiento.getDate() > 9 ? listObj[0].fecha_vencimiento.getDate() : "0" + listObj[0].fecha_vencimiento.getDate();
							var vencimiento_mes = (listObj[0].fecha_vencimiento.getMonth() + 1) > 9 ? (listObj[0].fecha_vencimiento.getMonth() + 1) : "0" + (listObj[0].fecha_vencimiento.getMonth() + 1);
							listObj[0].fecha_vencimiento = vencimiento_dia + "/" + vencimiento_mes + "/" + listObj[0].fecha_vencimiento.getFullYear();
							db.driver.execQuery(
								"  SELECT *"
								+ " FROM factura_detalle facDet"
								+ " where facDet.factura_id=?;",
								[paramsId],
								function (err, listObjDetails) {
									if (err) {
										cb(500, { err: err });
									} else {
										if (listObjDetails.length > 0) {
											for (var i = 0; i < listObjDetails.length; i++) {
												//listObjDetails[i].precio_unitario = parseFloat(listObjDetails[i].precio_unitario).toFixed(2);
												//listObjDetails[i].total = (listObjDetails[i].cantidad * listObjDetails[i].precio_unitario).toFixed(2);
												listObjDetails[i].total = numMoneda(Math.abs(listObjDetails[i].cantidad * listObjDetails[i].precio_unitario, 2, ".", ","));
												listObjDetails[i].precio_unitario = numMoneda(Math.abs(listObjDetails[i].precio_unitario, 2, ".", ","));
											}
											listObj[0].detalles = listObjDetails
											cb(200, listObj);
										}
										else {
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
		},
		marcarImpreso: function (paramId) {
			var facturaConstructor = global.db.models.factura;
			facturaConstructor.get(paramId, function (err, objeto) {
				if (err) {
				} else if (objeto) {
					objeto.estado_factura_id = 3;
					objeto.save(function (err) { });
				}
			});
		},
		ultimoDocumento: function (params, cb) {
			ultimoDocumentoEmitido(params.tipo_documento, params.numero_serie, function (err, ultimoNumero) {
				if (err != 200) {
					cb(err, { message: ultimoNumero })
				}
				else {
					cb(200, { ultimoNumero: ultimoNumero })
				}
			})
		}
	}
}