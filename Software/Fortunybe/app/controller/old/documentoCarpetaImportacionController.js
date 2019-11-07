var carpetaImportacionElementoController = require('./carpetaImportacionElementoController');
var TipoCambioController = require('./TipoCambioController');
var async = require('async');
var self = module.exports = function () {
	function AsociarDocumentoCarpetaDetalle(userId, tenantId, body, docuementoParam, cb) {
		var idDocumento = docuementoParam
		async.waterfall([
			function crearDetalleAsociado(callback) {
				var detallesDocumento = body.detalles
				var totalDocumento = 0
				var i = 0
				async.whilst(function () { return i < detallesDocumento.length },
					function (cbf) {
						async.waterfall([
							function crearDetalleDocumento(callbackDetalle) {
								var documentoImportacionDetalleConstructor = global.db.models.carpeta_importacion_documento_detalle;
								documentoImportacionDetalleConstructor.create({
									detalle: detallesDocumento[i].detalle,
									documento_id: idDocumento
								}, function (err, objDocumentoImportacion) {
									if (err) {
										callbackDetalle(500, { message: "Existe un error en el servicio" });
									} else {
										if (objDocumentoImportacion) {
											var carpetaAsociada = detallesDocumento[i].carpetaAsignada
											var idDocumentoDetalle = objDocumentoImportacion.id
											callbackDetalle(null, idDocumentoDetalle, carpetaAsociada);
										} else {
											callbackDetalle(500, { message: "Existe un error en el Servicio" });
										}
									}
								});
							},
							function detalleAsociadoCarpeta(idDocumentoDetalle, datosCarpetasAsociar, callbackDetalle) {
								var j = 0
								var totalDetalle = 0
								async.whilst(function () { return j < datosCarpetasAsociar.length },
									function (cbfCarpeta) {
										async.waterfall([
											function buscarCarpeta(callbackCarpetaAsociada) {
												var carpetaImportacionConstructor = global.db.models.carpeta_importacion;
												carpetaImportacionConstructor.find({ codigo: datosCarpetasAsociar[j].carpetaImportacion }, function (err, listObj) {
													if (err) {
														return callbackCarpetaAsociada(500, { err: "Error en el Servicio" });
													} else {
														if (listObj.length > 0) {
															return callbackCarpetaAsociada(null, listObj[0].id);
														} else {
															return callbackCarpetaAsociada(500, { err: 'No existe carpeta' });
														}
													}
												});
											},
											function buscarElemento(idCarpetaEncontrada, callbackCarpetaAsociada) {
												var carpetaImportacionElementoConstructor = global.db.models.carpeta_importacion_elemento;
												carpetaImportacionElementoConstructor.find({ carpeta_importacion_id: idCarpetaEncontrada, nombre: body.tipo_documento }, function (err, listObj) {
													if (err) {
														return callbackCarpetaAsociada(500, { err: "Error en el Servicio" });
													} else {
														if (listObj.length > 0) {
															return callbackCarpetaAsociada(null, listObj[0].id);
														} else {
															return callbackCarpetaAsociada(500, { err: 'No existe elemento para esta carpeta' });
														}
													}
												});
											},
											function asociarCarpetaDetalle(idElementoEncontrado, callbackCarpetaAsociada) {
												var carpetaImportacionDetalleConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
												carpetaImportacionDetalleConstructor.create({
													id_documento_detalle: idDocumentoDetalle,
													id_carpeta_importacion_elemento: idElementoEncontrado,
													monto: datosCarpetasAsociar[j].cantidad
												}, function (err, objDocumentoImportacion) {
													if (err) {
														callbackCarpetaAsociada(500, { message: "Existe un error en el servicio" });
													} else {
														if (objDocumentoImportacion) {
															var carpetaElementoConstructor = global.db.models.carpeta_importacion_elemento;
															carpetaElementoConstructor.get(idElementoEncontrado, function (err, obj) {
																if (err) {
																	callbackCarpetaAsociada(500, { err: err });
																}
																else {
																	TipoCambioController().getByMonedaFecha(tenantId, body.moneda, body.fecha, function (errTipoCambio, valorTipoCambio) {
																		if (errTipoCambio != 200) {
																			errTipoCambio(err, { message: valorTipoCambio })
																		}
																		else {
																			var carpetaElementoConstructor = global.db.models.carpeta_importacion_elemento;
																			carpetaElementoConstructor.get(idElementoEncontrado, function (err, obj) {
																				if (err) {
																					callbackCarpetaAsociada(500, { err: err });
																				}
																				else {
																					if (body.moneda != "PEN") {
																						valorSuma = datosCarpetasAsociar[j].cantidad * valorTipoCambio[0].cambio
																					}
																					else {
																						valorSuma = datosCarpetasAsociar[j].cantidad
																					}
																					if (obj) {
																						obj.monto = obj.monto + Number(parseFloat(valorSuma)),
																							obj.save(function (err) {
																								if (err) {
																									callbackCarpetaAsociada(500, { err: err });
																								}
																								else {
																									callbackCarpetaAsociada(null, datosCarpetasAsociar[j].cantidad);
																								}
																							});
																					}
																					else {
																						callbackCarpetaAsociada(404, { message: 'NO EXISTE ELEMENTO' });
																					}
																				}
																			});
																		}
																	})
																}
															});
														} else {
															callbackCarpetaAsociada(500, { message: "Existe un error en el Servicio" });
														}
													}
												});
											}
										], function (error, results) {
											if (error == null) {
												totalDetalle = totalDetalle + Number(parseFloat(results))
												j++
												cbfCarpeta(null, totalDetalle)
											}
											else {
												j++
												cbfCarpeta(error, results)
											}
										});
									},
									function (err, result) {
										if (err) {
											callbackDetalle(500, { err: "error" })
										}
										else {
											var documentoDetalleImportacionConstructor = global.db.models.carpeta_importacion_documento_detalle;
											documentoDetalleImportacionConstructor.get(idDocumentoDetalle, function (err, obj) {
												if (err) {
													callbackDetalle(500, { err: "Existe un error en el servicio" });
												}
												else {
													if (obj) {
														obj.total = parseFloat(totalDetalle.toFixed(2)),
															// save the user
															obj.save(function (err) {
																if (err) {
																	callbackDetalle(500, { err: "Existe un error en el servicio" });
																}
																else {
																	callbackDetalle(null, totalDetalle)
																}
															});
													}
													else {
														callbackDetalle(404, { err: 'NO EXISTE DOCUMENTO DE IMPORATCION' });
													}
												}
											});
										}
									});
							}
						], function (error, results) {
							if (error == null) {
								totalDocumento = totalDocumento + Number(parseFloat(results))
								i++
								cbf(null, results)
							}
							else {
								i++
								cbf(error, results)
							}
						});
					},
					function (err, result) {
						if (err) {
							callback(500, { err: err })
						}
						else {
							var documentoImportacionConstructor = global.db.models.carpeta_importacion_documento;
							documentoImportacionConstructor.get(idDocumento, function (err, obj) {
								if (err) {
									callback(500, { err: "Existe un error en el servicio" });
								}
								else {
									if (obj) {
										obj.monto = parseFloat(totalDocumento.toFixed(2)),
											obj.save(function (err) {
												if (err) {
													callback(500, { err: "Existe un error en el servicio" });
												}
												else {
													callback(null, idDocumento)
												}
											});
									}
									else {
										callback(404, { err: 'NO EXISTE DOCUMENTO DE IMPORATCION' });
									}
								}
							});
						}
					});
			}
		], function (error, results) {
			if (error == null) {
				cb(200, results)
			}
			else {
				cb(error, results)
			}
		});
	}
	function validaEliminarDocumentoEspecial(idDocumentoEspecial, cb) {
		global.db.driver.execQuery(
			"SELECT " +
			"COUNT(carpeta_importacion_documento_detalle.id) AS cantidadDetalle " +
			"FROM " +
			"carpeta_importacion_documento_detalle " +
			"WHERE " +
			"carpeta_importacion_documento_detalle.documento_id = (SELECT " +
			"carpeta_importacion_documento_detalle.documento_id " +
			"FROM " +
			"carpeta_import_doc_detalle_carpeta " +
			"LEFT JOIN " +
			"carpeta_importacion_documento_detalle ON carpeta_import_doc_detalle_carpeta.id_documento_detalle = carpeta_importacion_documento_detalle.id " +
			"WHERE " +
			"carpeta_import_doc_detalle_carpeta.id = ?) ",
			[idDocumentoEspecial], function (err, cant) {
				if (err) {

					cb(false);
				} else {

					if (cant == 0) {
						cb(true);
					}
					else {
						cb(false);
					}
				}
			}
		)
	}
	return {
		getCarpetaImportWithOC: function (tenantId, idCarpeta, cb) {
			global.db.driver.execQuery(
				"SELECT ci.codigo,ci.moneda, oc.numero numeroOC,oc.proveedor_id, p.nombre proveedor,oc.centro_costo_id,cc.codigo centro_costo FROM carpeta_importacion ci INNER JOIN orden_compra oc ON ci.orden_compra_id=oc.id INNER JOIN proveedor p ON oc.proveedor_id=p.id INNER JOIN centro_costo cc ON oc.centro_costo_id=cc.id where ci.id=?;",
				[idCarpeta],
				function (err, listdatos) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						if (listdatos) {
							cb(200, listdatos);
						} else {
							cb(401, { message: 'No existen datos para esta carpeta de importación' });
						}
					}
				});
		},
		getResumenDocumentos: function (tenantId, idCarpeta, cb) {
			var query = "SELECT CIE.nombre concepto, SUM(CASE WHEN CID.codigo IS NULL THEN 0 ELSE 1 END) cantidad"
				+ " FROM carpeta_importacion_elemento CIE"
				+ " LEFT JOIN carpeta_importacion_documento CID ON CIE.id = CID.carpeta_importacion_elemento_id"
				+ " WHERE CIE.carpeta_importacion_id = " + idCarpeta
				+ " GROUP BY (CIE.id);";
			global.db.driver.execQuery(query, [],
				function (err, listdatos) {
					if (err) {
						cb(500, { message: 'Ocurrió un error al obtener los datos.' });
					} else {
						if (listdatos) {
							cb(200, listdatos);
						} else {
							cb(401, { message: 'No existen datos para esta carpeta de importación.' });
						}
					}
				});
		},
		getDocumentoById: function (tenantId, idDocumento, datoAsociado, cb) {
			var documentosConstructor = global.db.models.carpeta_importacion_documento;
			documentosConstructor.find({ id: idDocumento }, function (err, listObj) {
				if (err) {
					cb(500, { err: "Error en el Servicio" });
				} else {
					if (listObj) {
						if (!listObj[0].carpeta_importacion_elemento_id) {
							var carpetaImportacionConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
							carpetaImportacionConstructor.find({ id: datoAsociado }, function (errEspecial, listObjEspecial) {
								if (errEspecial) {
									cb(500, { err: "Error en el Servicio" });
								}
								else {
									if (listObjEspecial.length > 0) {
										listObj[0] = JSON.parse(JSON.stringify(listObj[0]));
										listObj[0]['monto'] = listObjEspecial[0].monto;
										listObj[0]['id_asociado'] = listObjEspecial[0].id;
										listObj[0]['carpeta_importacion_elemento_id'] = listObjEspecial[0].id_carpeta_importacion_elemento
										cb(200, listObj);
									}
									else {
										cb(500, { err: "Datos erroneos" });
									}
								}
							})
						}
						else {
							cb(200, listObj);
						}
					} else {
						cb(500, { err: 'No existen documentos para este elemento' });
					}
				}
			});
		},
		getDocumentoByElemento: function (tenantId, idElemento, cb) {
			var documentosConstructor = global.db.models.carpeta_importacion_documento;
			documentosConstructor.find({ carpeta_importacion_elemento_id: idElemento }, function (err, listObj) {
				if (err) {
					cb(500, { err: "Error en el Servicio" });
				} else {
					if (listObj) {
						global.db.driver.execQuery(
							"select cd.id id, cie.id carpeta_importacion_elemento_id,cd.codigo, cie.nombre elemento,cd.proveedor_id,cd.fecha,cd.codigo,cidda.id id_asociado from carpeta_import_doc_detalle_carpeta cida inner join carpeta_importacion_elemento cie on cie.id=cida.id_carpeta_importacion_elemento inner join carpeta_importacion ci on ci.id=cie.carpeta_importacion_id inner join carpeta_importacion_documento_detalle cid on cid.id=cida.id_documento_detalle inner join carpeta_importacion_documento cd on cd.id=cid.documento_id inner join carpeta_import_doc_detalle_carpeta cidda on (cidda.id_carpeta_importacion_elemento=cie.id and cidda.id_documento_detalle=cid.id) where cie.id=? group by cidda.id",
							[idElemento],
							function (err, listdatosEspeciales) {
								if (err) {
									cb(500, { message: 'ERROR EN EL SERVICIO' });
								} else {
									if (listdatosEspeciales.length > 0) {
										for (i = 0; i < listdatosEspeciales.length; i++) {
											listdatosEspeciales[i] = JSON.parse(JSON.stringify(listdatosEspeciales[i]));
											listdatosEspeciales[i]['linea'] = i + 1
											listObj.push(listdatosEspeciales[i])
										}
										cb(200, listObj);
									} else {
										cb(200, listObj);
									}
								}
							});
					} else {
						cb(500, { err: 'No existen documentos para este elemento' });
					}
				}
			});
		},
		getDocumentoRecientes: function (tenantId, carpetaId, cb) {
			global.db.driver.execQuery(
				"select d.*,det.nombre elemento from carpeta_importacion_documento d" +
				" INNER JOIN carpeta_importacion_elemento det ON d.carpeta_importacion_elemento_id=det.id " +
				" INNER JOIN carpeta_importacion ci ON det.carpeta_importacion_id=ci.id" +
				" where ci.id=?" +
				" ORDER BY fecha DESC LIMIT 5",
				//"select d.*,det.nombre elemento from carpeta_importacion_documento d INNER JOIN carpeta_importacion_elemento det ON d.carpeta_importacion_elemento_id=det.id ORDER BY fecha DESC LIMIT 5",
				[carpetaId],
				function (err, listdatos) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						if (listdatos) {
							global.db.driver.execQuery(
								"select cd.id,ciddc.id id_asociado,cie.id carpeta_importacion_elemento_id, cie.nombre elemento,cd.proveedor_id,cd.fecha,cd.codigo from carpeta_import_doc_detalle_carpeta cida inner join carpeta_importacion_elemento cie on cie.id=cida.id_carpeta_importacion_elemento inner join carpeta_importacion ci on ci.id=cie.carpeta_importacion_id inner join carpeta_importacion_documento_detalle cid on cid.id=cida.id_documento_detalle inner join carpeta_importacion_documento cd on cd.id=cid.documento_id inner join carpeta_import_doc_detalle_carpeta ciddc on (ciddc.id_documento_detalle=cid.id and ciddc.id_carpeta_importacion_elemento=cie.id) where ci.id=?",
								//"select d.*,det.nombre elemento from carpeta_importacion_documento d INNER JOIN carpeta_importacion_elemento det ON d.carpeta_importacion_elemento_id=det.id ORDER BY fecha DESC LIMIT 5",
								[carpetaId],
								function (err, listdatosEspeciales) {
									if (err) {
										cb(500, { message: 'ERROR EN EL SERVICIO' });
									} else {
										var totalReportes = listdatos.length
										if (listdatosEspeciales.length > 0 && totalReportes <= 5) {
											for (i = 0; i < listdatosEspeciales.length; i++) {
												listdatosEspeciales[i] = JSON.parse(JSON.stringify(listdatosEspeciales[i]));
												listdatosEspeciales[i]['linea'] = i + 1
												listdatos.push(listdatosEspeciales[i])
												totalReportes = totalReportes + 1
											}
											cb(200, listdatos);
										} else {
											cb(200, listdatos);
										}
									}
								});
						} else {
							cb(401, { message: 'No existen datos para esta carpeta de importación' });
						}
					}
				});
		},
		crearDocumento: function (userId, tenantId, body, cb) {
			//esta condicional es especial para el documento de dua
			if (body.impuestoEspecialSunatDua) {
				var dosPorCiento = Math.ceil(body.monto * 0.02)
				var porcentajeRestante = Math.ceil(body.monto * (body.impuesto_valor - 0.02))
				var impuestoMontoDocumento = dosPorCiento + porcentajeRestante
			}
			else {
				var impuestoMontoDocumento = body.monto * body.impuesto_valor
			}
			var documentoImportacionConstructor = global.db.models.carpeta_importacion_documento;
			documentoImportacionConstructor.create({
				carpeta_importacion_elemento_id: body.carpeta_importacion_elemento_id,
				codigo: body.codigo,
				fecha: body.fecha,
				fecha_registro: body.fecha_registro,
				proveedor_id: body.proveedor_id,
				moneda: body.moneda,
				//tipo_cambio:body.tipo_cambio,
				monto: body.monto,
				impuesto_id: body.impuesto_id,
				impuesto_valor: body.impuesto_valor,
				impuesto_monto: impuestoMontoDocumento,
				//impuesto_monto:body.monto * body.impuesto_valor,
				//cuenta_id:body.cuenta_contable_id,
				centro_costo_id: body.centro_costo_id,
				usuario_creacion: userId,
				fecha_creacion: new Date(),
			}, function (err, objDocumentoImportacion) {
				if (err) {
					cb(500, { message: "Existe un error en el servicio" });
				} else {
					if (objDocumentoImportacion) {
						cb(200, objDocumentoImportacion);
					} else {
						cb(500, { message: "Existe un error en el Servicio" });
					}
				}
			});
		},
		actualizarDocumento: function (tenantId, userId, paramId, body, cb) {
			
			TipoCambioController().getByMonedaFecha(tenantId, body.moneda, body.fecha, function (errTipoCambio, valorTipoCambio) {
				
				if (errTipoCambio != 200 && body.moneda != "PEN") {
					cb(500, { message: "Por favor revisa el tipo de cambio" });
				}
				else {
					//esta condicional es especial para el documento de dua
					if(body.moneda != "PEN")
					{
						body.tipo_cambio= valorTipoCambio[0].cambio
					}
					else
					{
						body.tipo_cambio = 1
					}
					if (body.impuestoEspecialSunatDua) {
						var dosPorCiento = Math.ceil(body.monto * 0.02)
						var porcentajeRestante = Math.ceil(body.monto * (body.impuesto_valor - 0.02))
						var impuestoMontoDocumento = dosPorCiento + porcentajeRestante
					}
					else {
						var impuestoMontoDocumento = body.monto * body.impuesto_valor
					}
					var documentoImportacionConstructor = global.db.models.carpeta_importacion_documento;
					documentoImportacionConstructor.get(paramId, function (err, obj) {
						if (err) {
							cb(500, { err: "Existe un error en el servicio" });
						}
						else {
							if (obj) {								
								var valorInicialMonto = obj.monto
								if (obj.carpeta_importacion_elemento_id != null) {
									obj.monto = body.monto
								}
								obj.codigo = body.codigo,
									obj.fecha = body.fecha,
									obj.proveedor_id = body.proveedor_id,
									obj.moneda = body.moneda,
									obj.tipo_cambio = body.tipo_cambio,
									obj.impuesto_id = body.impuesto_id,
									obj.impuesto_valor = body.impuesto_valor,
									obj.impuesto_monto = impuestoMontoDocumento,
									//obj.cuenta_id=body.cuenta_contable_id,
									obj.fecha_registro = body.fecha_registro,
									obj.centro_costo_id = body.centro_costo_id,
									obj.fecha_modificacion = new Date(),
									obj.usuario_modificacion = userId,
									// save the user
									obj.save(function (err) {
										if (err) {
											cb(500, { err: "Existe un error en el servicio" });
										}
										else {
											
											var diferencia = body.monto - valorInicialMonto
											var valorEnviar = {}
											valorEnviar.monto = diferencia
											valorEnviar.moneda = body.moneda
											valorEnviar.tipo_cambio = body.tipo_cambio

											if (obj.carpeta_importacion_elemento_id != null) {
												carpetaImportacionElementoController().actualizarMonto(tenantId, userId, obj.carpeta_importacion_elemento_id, valorEnviar, function (err, montoActualizado) {
													cb(200, { id: obj.id })
												})
											}
											else {
												async.waterfall([
													function actualizarLinea(callback) {
														var carpetaImpDocConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
														carpetaImpDocConstructor.get(body.id_asociado, function (err, obj) {
															if (err) {
																callback(500, { err: err });
															}
															else {
																if (obj) {
																	var deltaMonto = obj.monto - Number(parseFloat(body.monto))
																	var idDetalleDocumento = obj.id_documento_detalle
																	var idelementoCarpeta = obj.id_carpeta_importacion_elemento
																	obj.monto = body.monto,
																		obj.save(function (err) {
																			if (err) {
																				callback(500, { err: err });
																			}
																			else {
																				callback(null, deltaMonto, idDetalleDocumento, idelementoCarpeta);
																			}
																		});
																}
																else {
																	callback(404, { message: 'NO EXISTE DETALLE' });
																}
															}
														});
													},
													function actualizardetalle(deltaMonto, idDetalleDocumento, idelementoCarpeta, callback) {
														async.series([
															function actualizarDetalle(callBackActualizar) {
																var carpetaImpDocConstructor = global.db.models.carpeta_importacion_documento_detalle;
																carpetaImpDocConstructor.get(idDetalleDocumento, function (err, objActualizar) {
																	if (err) {
																		callBackActualizar(500, { err: err });
																	}
																	else {
																		if (objActualizar) {
																			var idDocumento = objActualizar.documento_id
																			objActualizar.total = objActualizar.total - deltaMonto,
																				objActualizar.save(function (err) {
																					if (err) {
																						callBackActualizar(500, { err: err });
																					}
																					else {
																						var documentoConstructor = global.db.models.carpeta_importacion_documento;
																						documentoConstructor.get(idDocumento, function (err, objDocumento) {
																							if (err) {
																								callBackActualizar(500, { err: err });
																							}
																							else {
																								if (objDocumento) {
																									objDocumento.monto = objDocumento.monto - deltaMonto,
																										objDocumento.save(function (err) {
																											if (err) {
																												callBackActualizar(500, { err: err });
																											}
																											else {
																												callBackActualizar(null, deltaMonto);
																											}
																										});
																								}
																								else {
																									callBackActualizar(404, { message: 'NO EXISTE DETALLE' });
																								}
																							}
																						});
																					}
																				});
																		}
																		else {
																			callBackActualizar(404, { message: 'NO EXISTE DETALLE' });
																		}
																	}
																});
															},
															function actualizarElemento(callBackActualizar) {
																var elementoConstructor = global.db.models.carpeta_importacion_elemento;
																elementoConstructor.get(idelementoCarpeta, function (err, objElemento) {
																	if (err) {
																		callBackActualizar(500, { err: err });
																	}
																	else {
																		if (objElemento) {
																			objElemento.monto = objElemento.monto - deltaMonto,
																				objElemento.save(function (err) {
																					if (err) {
																						callBackActualizar(500, { err: err });
																					}
																					else {
																						callBackActualizar(null, deltaMonto);
																					}
																				});
																		}
																		else {
																			callBackActualizar(404, { message: 'NO EXISTE DETALLE' });
																		}
																	}
																});
															}
														], function (error, results) {
															if (error == null) {
																callback(null, results)
															}
															else {
																callback(error, results)
															}
														});
													},
												], function (error, results) {
													if (error == null) {
														cb(200, { id: paramId })
													}
													else {
														cb(error, results)
													}
												});
											}
										}
									});
							}
							else {
								cb(404, { err: 'NO EXISTE DOCUMENTO DE IMPORATCION' });
							}
						}
					});
				}

			})

		},
		actualizarDocumentoEspecial: function (tenantId, userId, paramId, body, cb) {
			var documentoImportacionConstructor = global.db.models.carpeta_importacion_documento;
			documentoImportacionConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: "Existe un error en el servicio" });
				}
				else {
					if (obj) {
						obj.codigo = body.codigo,
							obj.fecha = body.fecha,
							fecha_registro = body.fecha_registro,
							obj.proveedor_id = body.proveedor_id,
							obj.moneda = body.moneda,
							obj.tipo_cambio = body.tipo_cambio,
							obj.impuesto_id = body.impuesto_id,
							obj.impuesto_valor = body.impuesto_valor,
							obj.impuesto_monto = body.monto * body.impuesto_valor,
							//obj.cuenta_id=body.cuenta_contable_id,
							//obj.centro_costo_id = body.centro_costo_id,
							obj.fecha_modificacion = new Date(),
							obj.usuario_modificacion = userId,
							// save the user
							obj.save(function (err) {
								if (err) {
									cb(500, { err: "Existe un error en el servicio" });
								}
								else {
									var carpetaImportacionDetalleConstructor = global.db.models.carpeta_importacion_documento_detalle;
									carpetaImportacionDetalleConstructor.find({ documento_id: paramId }, function (err, listObjDetalles) {
										if (err) {
											cb(500, { err: "Error en el Servicio" });
										} else {
											if (listObjDetalles.length > 0) {
												var i = 0
												async.whilst(function () { return i < listObjDetalles.length },
													function (cbf) {
														
														var carpetaImporDetalleAsocConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
														carpetaImporDetalleAsocConstructor.find({ id_documento_detalle: listObjDetalles[i].id }, function (err, listObjLineaDetalle) {
															if (err) {
																i++
																cbf(500, { err: err });
															}
															else {
																if (listObjLineaDetalle) {
																	var j = 0
																	
																	async.whilst(function () { return j < listObjLineaDetalle.length },
																		function (cbfLinea) {
																			var carpetaImportElementoConstructor = global.db.models.carpeta_importacion_elemento;
																			carpetaImportElementoConstructor.get(listObjLineaDetalle[i].id_carpeta_importacion_elemento, function (err, obj) {
																				if (err) {
																					j++
																					cbfLinea(500, { err: err });
																				}
																				else {
																					if (obj) {
																						obj.monto = obj.monto - listObjLineaDetalle[i].monto
																						obj.save(function (err) {
																							if (err) {
																								j++
																								cbfLinea(500, { err: err });
																							}
																							else {
																								carpetaImporDetalleAsocConstructor.find({ id: listObjLineaDetalle[i].id }).remove(function (err) {
																									if (err) {
																										j++
																										cbfLinea(500, { err: err });
																									} else {
																										j++
																										cbfLinea(null, 'eliminado');
																									}
																								})
																							}
																						});
																					}
																					else {
																						j++
																						cbfLinea(404, { message: 'NO EXISTE ARTICULO' });
																					}
																				}
																			});
																		},
																		function (err, result) {
																			if (err) {
																				i++
																				cbf(500, { err: "error" })
																			}
																			else {
																				i++
																				cbf(null, null)
																			}
																		})
																}
																else {
																	i++
																	cbf(500, { err: err });
																}
															}
														})
													},
													function (err, result) {
														if (err) {
															cb(500, { err: "error" })
														}
														else {
															var carpetaImportAsocConstructor = global.db.models.carpeta_importacion_documento_detalle;
															carpetaImportAsocConstructor.find({ documento_id: paramId }).remove(function (err) {
																if (err) {
																	cb(500, { err: err });
																} else {
																	AsociarDocumentoCarpetaDetalle(userId, tenantId, body, paramId, function (errorActualizar, resultActualizar) {
																		if (errorActualizar != 200) {
																			cb(errorActualizar, resultActualizar)
																		}
																		else {
																			cb(200, paramId)
																		}
																	})
																}
															})
														}
													});
											}
											else {
												cb(500, { message: "No existe detalle" })
											}
										}
									})
								}
							});
					}
					else {
						cb(404, { err: 'NO EXISTE DOCUMENTO DE IMPORATCION' });
					}
				}
			});
		},
		//listar todos los documentos
		getAll: function (cb) {
			db.driver.execQuery(
				"select cidoc.codigo, " +
				" cidoc.id," +
				" cidoc.fecha," +
				" cidoc.moneda," +
				" cidoc.monto," +
				" cidoc.fecha_pase," +
				" cimp.codigo as numero_carpeta," +
				" prov.nombre as nombre_proveedor," +
				" cc.codigo as centro_costo_nombre," +
				" ccont.nombreCuenta as cuenta_contable_nombre," +
				" concat (u.nombres , ' ' , u.apellidos) as usuario_creacion" +
				" from carpeta_importacion_documento cidoc" +
				" left join carpeta_importacion_elemento cie" +
				" on cidoc.carpeta_importacion_elemento_id = cie.id" +
				" left join carpeta_importacion cimp" +
				" on cie.carpeta_importacion_id = cimp.id" +
				" left join centro_costo cc " +
				" on cidoc.centro_costo_id = cc.id" +
				" left join proveedor prov" +
				" on cidoc.proveedor_id = prov.id" +
				" left join cuenta_contable ccont" +
				" on cidoc.cuenta_id = ccont.id" +
				" left join hs_usuario u" +
				" on cidoc.usuario_creacion = u.id " +
				" order by cidoc.fecha_creacion DESC"
				,
				[],
				function (err, listObj) {
					if (err) {
						cb(500, { message: "Existe un error en el Servicio" });
					} else {
						if (listObj) {
							cb(200, listObj);
						} else {
							cb(500, { message: 'No existen cotizaciones' });
						}
					}
				}
			);
		},	//fin de listar los documentos
		//Obtener el detalle del documento 
		getDetailedDocumentById: function (paramId, cb) {
			db.driver.execQuery(
				"select cidoc.*," +
				" cimp.codigo as numero_carpeta," +
				" prov.nombre as nombre_proveedor," +
				" cc.codigo as centro_costo_nombre," +
				" concat (u.nombres , ' ' , u.apellidos) as usuario_creacion_nombre" +
				" from carpeta_importacion_documento cidoc" +
				" left join carpeta_importacion_elemento cie" +
				" on cidoc.carpeta_importacion_elemento_id = cie.id" +
				" left join carpeta_importacion cimp" +
				" on cie.carpeta_importacion_id = cimp.id" +
				" left join centro_costo cc " +
				" on cidoc.centro_costo_id = cc.id" +
				" left join proveedor prov" +
				" on cidoc.proveedor_id = prov.id" +
				" left join hs_usuario u" +
				" on cidoc.usuario_creacion = u.id" +
				" where cidoc.id = ?;",
				[paramId],
				function (err, listObj) {
					if (err) {
						cb(500, { message: "Existe un error en el Servicio" });
					} else {
						if (listObj) {
							if (!listObj[0].numero_carpeta) {
								var carpetaImportacionDetalleConstructor = global.db.models.carpeta_importacion_documento_detalle;
								carpetaImportacionDetalleConstructor.find({ documento_id: paramId }, function (err, listObjDetalles) {
									if (err) {
										cb(500, { err: "Error en el Servicio" });
									} else {
										if (listObjDetalles.length > 0) {
											var i = 0
											async.whilst(function () { return i < listObjDetalles.length },
												function (cbf) {
													db.driver.execQuery(
														"select cdd.monto cantidad,cdd.id id_detalle_documento,ci.codigo carpetaImportacion,cie.nombre tipo_documento from carpeta_import_doc_detalle_carpeta cdd inner join carpeta_importacion_elemento cie on cdd.id_carpeta_importacion_elemento=cie.id inner join carpeta_importacion ci on ci.id=cie.carpeta_importacion_id where id_documento_detalle=?",
														[listObjDetalles[i].id],
														function (err, listObjDetallesCarpeta) {
															if (err) {
																cbf(500, { message: "Existe un error en el Servicio" });
															} else {
																if (listObjDetallesCarpeta.length > 0) {
																	listObjDetalles[i] = JSON.parse(JSON.stringify(listObjDetalles[i]));
																	listObjDetalles[i]['carpetaAsignada'] = listObjDetallesCarpeta;
																	listObj[0] = JSON.parse(JSON.stringify(listObj[0]));
																	listObj[0]['tipo_documento'] = listObjDetallesCarpeta[0].tipo_documento;
																	listObj[0]['id_detalle_documento'] = listObjDetallesCarpeta[0].id_detalle_documento;
																	i++
																	cbf()
																} else {
																	listObjDetalles[i]['carpetaAsignada'] = [];
																	i++
																	cbf();
																}
															}
														}
													);
												},
												function (err, result) {
													if (err) {

														cb(500, { err: "error" })
													}
													else {
														listObj[0] = JSON.parse(JSON.stringify(listObj[0]));
														listObj[0]['detalles'] = listObjDetalles;
														cb(200, listObj);
													}
												});
										} else {
											cb(200, listObj)
										}
									}
								});
								//cb(200,listObj);	
							}
							else {
								cb(200, listObj);
							}
						} else {
							cb(500, { message: 'No existen cotizaciones' });
						}
					}
				}
			);
		},
		//  CASO ESPECIAL: esta funcion crea un documento pero donde los items del detalle pueden ser asociadas a una o varias carpetas de importacion diferentes.
		crearDocumentoConCarpetaAsociada: function (userId, tenantId, body, cb) {
			
			async.waterfall([
				function crearDocumento(callback) {
					var documentoImportacionConstructor = global.db.models.carpeta_importacion_documento;
					documentoImportacionConstructor.create({
						//carpeta_importacion_elemento_id:body.carpeta_importacion_elemento_id,
						codigo: body.codigo,
						fecha: body.fecha,
						fecha_registro: body.fecha_registro,
						proveedor_id: body.proveedor_id,
						moneda: body.moneda,
						tipo_cambio: body.tipo_cambio,
						//monto:body.monto,
						impuesto_id: body.impuesto_id,
						impuesto_valor: body.impuesto_valor,
						//cuenta_id:body.cuenta_contable_id,
						//centro_costo_id: body.centro_costo_id,
						usuario_creacion: userId,
						fecha_creacion: new Date(),
					}, function (err, objDocumentoImportacion) {
						if (err) {
							callback(500, { message: "Existe un error en el servicio" });
						} else {
							if (objDocumentoImportacion) {
								var idDocumento = objDocumentoImportacion.id
								callback(null, idDocumento);
							} else {
								callback(500, { message: "Existe un error en el Servicio" });
							}
						}
					});
				},
				function crearDetalleAsociado(idDocumento, callback) {
					var detallesDocumento = body.detalles
					var totalDocumento = 0
					var i = 0
					async.whilst(function () { return i < detallesDocumento.length },
						function (cbf) {
							async.waterfall([
								function crearDetalleDocumento(callbackDetalle) {
									var documentoImportacionDetalleConstructor = global.db.models.carpeta_importacion_documento_detalle;
									documentoImportacionDetalleConstructor.create({
										detalle: detallesDocumento[i].detalle,
										documento_id: idDocumento
									}, function (err, objDocumentoImportacion) {
										if (err) {
											callbackDetalle(500, { message: "Existe un error en el servicio" });
										} else {
											if (objDocumentoImportacion) {
												var carpetaAsociada = detallesDocumento[i].carpetaAsignada
												var idDocumentoDetalle = objDocumentoImportacion.id
												callbackDetalle(null, idDocumentoDetalle, carpetaAsociada);
											} else {
												callbackDetalle(500, { message: "Existe un error en el Servicio" });
											}
										}
									});
								},
								function detalleAsociadoCarpeta(idDocumentoDetalle, datosCarpetasAsociar, callbackDetalle) {
									var j = 0
									var totalDetalle = 0
									async.whilst(function () { return j < datosCarpetasAsociar.length },
										function (cbfCarpeta) {
											async.waterfall([
												function buscarCarpeta(callbackCarpetaAsociada) {
													var carpetaImportacionConstructor = global.db.models.carpeta_importacion;
													carpetaImportacionConstructor.find({ codigo: datosCarpetasAsociar[j].carpetaImportacion }, function (err, listObj) {
														if (err) {
															
															
															callbackCarpetaAsociada(500, "Error en el Servicio");
														} else {
															if (listObj.length > 0) {
																callbackCarpetaAsociada(null, listObj[0].id);
															} else {
																
																callbackCarpetaAsociada(500, 'No existe carpeta');
															}
														}
													});
												},
												function buscarElemento(idCarpetaEncontrada, callbackCarpetaAsociada) {
													var carpetaImportacionElementoConstructor = global.db.models.carpeta_importacion_elemento;
													carpetaImportacionElementoConstructor.find({ carpeta_importacion_id: idCarpetaEncontrada, nombre: body.tipo_documento }, function (err, listObj) {
														if (err) {
															
															callbackCarpetaAsociada(500, { err: "Error en el Servicio" });
														} else {
															if (listObj.length > 0) {
																callbackCarpetaAsociada(null, listObj[0].id);
															} else {
																
																callbackCarpetaAsociada(500, 'No existe elemento para esta carpeta');
															}
														}
													});
												},
												function asociarCarpetaDetalle(idElementoEncontrado, callbackCarpetaAsociada) {
													var carpetaImportacionDetalleConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
													carpetaImportacionDetalleConstructor.create({
														id_documento_detalle: idDocumentoDetalle,
														id_carpeta_importacion_elemento: idElementoEncontrado,
														monto: datosCarpetasAsociar[j].cantidad
													}, function (err, objDocumentoImportacion) {
														if (err) {
															
															callbackCarpetaAsociada(500, { message: "Existe un error en el servicio" });
														} else {
															if (objDocumentoImportacion) {
																TipoCambioController().getByMonedaFecha(tenantId, body.moneda, body.fecha, function (errTipoCambio, valorTipoCambio) {
																	if (errTipoCambio != 200) {
																		errTipoCambio(err, { message: valorTipoCambio })
																	}
																	else {
																		var carpetaElementoConstructor = global.db.models.carpeta_importacion_elemento;
																		carpetaElementoConstructor.get(idElementoEncontrado, function (err, obj) {
																			if (err) {
																				
																				callbackCarpetaAsociada(500, { err: err });
																			}
																			else {
																				if (body.moneda != "PEN") {
																					valorSuma = datosCarpetasAsociar[j].cantidad * valorTipoCambio[0].cambio
																				}
																				else {
																					valorSuma = datosCarpetasAsociar[j].cantidad
																				}
																				if (obj) {
																					obj.monto = obj.monto + Number(parseFloat(valorSuma)),
																						obj.save(function (err) {
																							if (err) {
																								
																								callbackCarpetaAsociada(500, { err: err });
																							}
																							else {
																								callbackCarpetaAsociada(null, datosCarpetasAsociar[j].cantidad);
																							}
																						});
																				}
																				else {
																					callbackCarpetaAsociada(404, 'NO EXISTE ELEMENTO');
																				}
																			}
																		});
																	}
																})
															} else {
																
																callbackCarpetaAsociada(500, "Existe un error en el Servicio");
															}
														}
													});
												}
											], function (error, results) {
												if (error == null) {
													totalDetalle = totalDetalle + Number(parseFloat(results))
													j++
													cbfCarpeta(null, totalDetalle)
												}
												else {
													j++
													
													cbfCarpeta(error, results)
												}
											});
										},
										function (err, result) {
											if (err) {
												
												callbackDetalle(500, result)
											}
											else {
												var documentoDetalleImportacionConstructor = global.db.models.carpeta_importacion_documento_detalle;
												documentoDetalleImportacionConstructor.get(idDocumentoDetalle, function (err, obj) {
													if (err) {
														callbackDetalle(500, { err: "Existe un error en el servicio" });
													}
													else {
														if (obj) {
															obj.total = parseFloat(totalDetalle.toFixed(2)),
																obj.save(function (err) {
																	if (err) {
																		callbackDetalle(500, { err: "Existe un error en el servicio" });
																	}
																	else {
																		callbackDetalle(null, totalDetalle)
																	}
																});
														}
														else {
															callbackDetalle(404, { err: 'NO EXISTE DOCUMENTO DE IMPORATCION' });
														}
													}
												});
											}
										});
								}
							], function (error, results) {
								if (error == null) {
									totalDocumento = totalDocumento + Number(parseFloat(results))
									i++
									cbf(null, results)
								}
								else {
									i++
									cbf(error, results)
								}
							});
						},
						function (err, result) {
							if (err) {
								
								callback(500, { err: "error" })
							}
							else {
								var documentoImportacionConstructor = global.db.models.carpeta_importacion_documento;
								documentoImportacionConstructor.get(idDocumento, function (err, obj) {
									if (err) {
										callback(500, { err: "Existe un error en el servicio" });
									}
									else {
										if (obj) {
											obj.monto = parseFloat(totalDocumento.toFixed(2)),
												// save the user
												obj.save(function (err) {
													if (err) {
														callback(500, { err: "Existe un error en el servicio" });
													}
													else {
														callback(null, idDocumento)
													}
												});
										}
										else {
											callback(404, { err: 'NO EXISTE DOCUMENTO DE IMPORATCION' });
										}
									}
								});
							}
						});
				}
			], function (error, results) {
				if (error == null) {
					cb(200, results)
				}
				else {
					cb(error, results)
				}
			});
		},
		eliminarDocumento: function (paramId, body, cb) {
			var documentoConstructor = global.db.models.carpeta_importacion_documento;
			//var documentoConstructor = global.db.models.tipo_cambio
			//Se objtiene el elemento a eliminar
			
			documentoConstructor.get(paramId, function (err, documento) {
				TipoCambioController().getByMonedaFecha("1", documento.moneda, documento.fecha, function (codigoTipoCambio, montoTipoCambio) {
					if (codigoTipoCambio != 200 && documento.moneda!="PEN") {
						cb(500, { message: "Existe un error en el sistema" })
					}
					else {

						if (montoTipoCambio.length > 0 || documento.moneda=="PEN") {
							if(documento.moneda!="PEN")
							{

								varlorTipoCambio = montoTipoCambio[0].cambio
							}
							else
							{
								varlorTipoCambio=1
							}

							if (documento.carpeta_importacion_elemento_id) {
								//Se tiene que eliminar el saldo correspondiente al monto en  carpeta_importacion_elemento;
								var carpetaImportacionElementoConstructor = global.db.models.carpeta_importacion_elemento;

								carpetaImportacionElementoConstructor.get(documento.carpeta_importacion_elemento_id, function (err, objElemento) {
									if (err) {

										cb(500, { err: err });
									}
									else {
										if (objElemento) {
											var montoRestar = documento.moneda != "PEN" ? (documento.monto) * varlorTipoCambio : documento.monto
											objElemento.monto = objElemento.monto - montoRestar,
												objElemento.save(function (err) {
													if (err) {
														cb(500, { err: err });
													}
													else {
														if (!documento.fecha_pase) {
															documento.remove(function (errDocumento) {
																if (errDocumento) {

																	cb(500, { message: "No se puedo eliminar el documento" });
																} else {
																	cb(200, { id: paramId });
																}
															});
														} else {
															cb(500, { message: "El documento ya tiene un traslado de costo, no se puede eliminar" });
														}
													}
												});
										} else {
											cb(404, { message: 'NO EXISTE DETALLE' });
										}
									}
								});
							}
							else {
								var documentoConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
								var documentoElementoConstructor = global.db.models.carpeta_importacion_elemento;
								documentoConstructor.get(body.id_asociado, function (err, documento) {
									if (err) {
										cb(500, "error en el sistema")
									}
									else {
										if (documento) {
											async.waterfall([
												function disminuirValorElemento(callbackDocumento) {

													documentoElementoConstructor.get(documento.id_carpeta_importacion_elemento, function (err, obj) {
														if (err) {
															callbackDocumento(500, "Existe un error en el servicio");
														}
														else {
															if (obj) {

																var montoRestar = documento.moneda != "PEN" ? (documento.monto) * varlorTipoCambio : documento.monto
																obj.monto = obj.monto - montoRestar,			// save the user
																	obj.save(function (err) {
																		if (err) {

																			callbackDocumento(500, "Existe un error en el servicio");
																		}
																		else {

																			callbackDocumento()
																		}
																	});
															}
															else {
																callbackDocumento(404, "No existe documento");
															}

														}
													});

												},
												function disminuirDocumentoDetalle(callbackDocumento) {

													var documentoDetalleConstructor = global.db.models.carpeta_importacion_documento_detalle;
													documentoDetalleConstructor.get(documento.id_documento_detalle, function (err, objDocumentoDetalle) {
														if (err) {
															callbackDocumento(500, "Existe un error en el servicio");
														}
														else {
															if (objDocumentoDetalle) {
																var montoRestar = documento.moneda != "PEN" ? (documento.monto) * varlorTipoCambio : documento.monto
																objDocumentoDetalle.total = objDocumentoDetalle.total - montoRestar,			// save the user
																	objDocumentoDetalle.save(function (err) {
																		if (err) {

																			callbackDocumento(500, "Existe un error en el servicio");
																		}
																		else {

																			callbackDocumento(null, objDocumentoDetalle.documento_id)
																		}
																	});
															}
															else {
																callbackDocumento(404, "No existe documento");
															}

														}
													});

												},
												function disminuirDocumento(documento_id, callbackDocumento) {

													var documentoInicialConstructor = global.db.models.carpeta_importacion_documento;
													documentoInicialConstructor.get(documento_id, function (err, ojdocumento) {
														if (err) {
															callbackDocumento(500, "Existe un error en el servicio");
														}
														else {
															if (ojdocumento) {
																var montoRestar = documento.moneda != "PEN" ? (documento.monto) * varlorTipoCambio : documento.monto
																ojdocumento.monto = ojdocumento.monto - montoRestar,			// save the user
																	ojdocumento.save(function (err) {
																		if (err) {

																			callbackDocumento(500, "Existe un error en el servicio");
																		}
																		else {

																			callbackDocumento()
																		}
																	});
															}
															else {
																callbackDocumento(404, "No existe documento");
															}

														}
													});

												},
												function eliminarDocumento(callbackDocumento) {
													documentoConstructor.find({ id: body.id_asociado }).remove(function (err) {
														if (err) {
															callbackDocumento(500, "Error al eliminar")
														}
														else {
															callbackDocumento(null, null)
														}
													})
												}
											], function (error, listaDocumentos) {
												if (error) {
													cb(500, { message: listaDocumentos })
												}
												else {
													cb(200, paramId)
												}
											});

										}
										else {
											cb(404, "Documento no encontrado")
										}
									}
								})


							}


						}
						else {
							cb(404, { message: "Ingrese un tipo de cambio para " + documento.fecha })
						}
					}

				})

			});

		},

		eliminardetalleDocumentoespecial: function (paramId, cb) {
			var documentoDetalleEspecialConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
			var carpetaImportacionElemento = global.db.models.carpeta_importacion_elemento
			var carpetaImportacionDocumentoDetalle = global.db.models.carpeta_importacion_documento_detalle
			var carpetaImportacionDocumento = global.db.models.carpeta_importacion_documento
			async.waterfall([
				function verificarDocumentosTrasladados(callbackDocumento) {
					global.db.driver.execQuery(
						"select cdd.monto,cdd.id from carpeta_import_doc_detalle_carpeta cdd "
						+ "inner join carpeta_importacion_documento_detalle cid on cid.id= cdd.id_documento_detalle "
						+ "where cid.documento_id= (SELECT  "
						+ "mcdd.documento_id "
						+ "FROM "
						+ "carpeta_importacion_documento_detalle mcdd "
						+ "INNER JOIN "
						+ "carpeta_import_doc_detalle_carpeta mcidd ON mcidd.id_documento_detalle = mcdd.id "
						+ "WHERE "
						+ "mcidd.id = ?) && cdd.fecha_pase <> null",
						[paramId], function (err, listaDocumentosTrasladados) {
							if (err) {
								callbackDocumento(500, 'error en el sistema')
							} else {
								if (listaDocumentosTrasladados.length > 0) {
									callbackDocumento(500, 'El documento ya tiene un traslado de costo, no se puede eliminar')
								}
								else {
									callbackDocumento()
								}
							}
						}
					)
				},
				function obtenerValoresDocumento(callbackDocumento) {
					global.db.driver.execQuery(
						"SELECT cd.*,cid.moneda,cid.fecha FROM man.carpeta_import_doc_detalle_carpeta cd "
						+ "inner join carpeta_importacion_documento_detalle cidd on cd.id_documento_detalle= cidd.id "
						+ "inner join carpeta_importacion_documento cid on cid.id=cidd.documento_id "
						+ "where cd.id=? ",
						[paramId], function (err, valorDocumentoEspecial) {
							if (err) {

								callbackDocumento(500, 'error en el servicio');
							} else {
								if (valorDocumentoEspecial) {
									
									callbackDocumento(null, valorDocumentoEspecial[0])
								}
								else {
									callbackDocumento(500, "Documento no existe")
								}

							}
						}
					)
					/*	documentoDetalleEspecialConstructor.get(paramId, function (err, valorDocumentoEspecial) {
							if (err) {
	
								callbackDocumento(500, 'error en el servicio');
							} else {
								if (valorDocumentoEspecial) {
									callbackDocumento(null, valorDocumentoEspecial)
								}
								else {
									callbackDocumento(500, "Documento no existe")
								}
	
							}
						});*/
				},
				function conseguirTipoCambio(documento, callbackDocumento) {
					
					TipoCambioController().getByMonedaFecha("1", documento.moneda, documento.fecha, function (codigoTipoCambio, montoTipoCambio) {
						if (codigoTipoCambio != 200) {
							callbackDocumento(500, "Existe un error en el sistema")
						}
						else {
							if (montoTipoCambio.length > 0) {
								documento.tipo_cambio = montoTipoCambio[0].cambio
								callbackDocumento(null, documento)
							}
							else {
								callbackDocumento(500, "No existe un tipo de cambio para la fecha necesaria")
							}
						}
					})


				},
				function restarValorElementos(documento, callbackDocumento) {

					carpetaImportacionElemento.get(documento.id_carpeta_importacion_elemento, function (err, datosElemento) {

						if (datosElemento) {
							var valorActual = datosElemento.monto
							var restarMonto = documento.moneda != "PEN" ? (documento.monto * documento.tipo_cambio) : documento.monto
							datosElemento.monto = valorActual - restarMonto
							datosElemento.save(function (err, objeto) {

								if (err) {
									callbackDocumento(500, "Error en el servicio");
								} else {
									callbackDocumento(null, documento)
								}
							});
						}
						else {
							callbackDocumento(404, "Elemento de importacion no existe");
						}

					});
				},
				function restarValorDocumentoDetalle(documento, callbackDocumento) {
					carpetaImportacionDocumentoDetalle.get(documento.id_documento_detalle, function (err, datosElemento) {

						if (datosElemento) {
							var valorActual = datosElemento.total
							//var restarMonto = documento.moneda != "PEN" ? (documento.monto * documento.tipo_cambio) : documento.monto
							datosElemento.total = valorActual - documento.monto
							datosElemento.save(function (err, objeto) {

								if (err) {
									callbackDocumento(500, "Error en el servicio");
								} else {
									carpetaImportacionDocumento.get(datosElemento.documento_id, function (err, datosElemento) {

										if (datosElemento) {
											var valorActual = datosElemento.monto
											datosElemento.monto = valorActual - documento.monto
											datosElemento.save(function (err, objeto) {

												if (err) {
													callbackDocumento(500, "Error en el servicio");
												} else {
													callbackDocumento()
												}
											});
										}
										else {
											callbackDocumento(404, "Elemento de importacion no existe");
										}

									});
								}
							});
						}
						else {
							callbackDocumento(404, "Elemento de importacion no existe");
						}

					});
				},
				function eliminarDocumento(callbackDocumento) {
					documentoDetalleEspecialConstructor.find({ id: paramId }).remove(function (err) {
						if (err) {
							callbackDocumento(500, "Error al eliminar")
						}
						else {
							callbackDocumento(null, null)
						}
					})
				}
			], function (error, listaDocumentos) {
				if (error) {
					cb(500, { message: listaDocumentos })
				}
				else {
					cb(200, paramId)
				}
			});
		},

		eliminarDocumentoEspecialPadre: function (paramId, cb) {
			// Se valida que no exista ningun pase realizado en ninguno de
			// los documentos de las carpetas de importacion asociadas
			/*var query = "SELECT CD.id, " +
							"SUM(IF(CID.fecha_pase IS NOT NULL OR CDD2.fecha_pase IS NOT NULL, 1, 0)) cont " +
						"FROM carpeta_importacion_documento_detalle CD " +
						" INNER JOIN carpeta_import_doc_detalle_carpeta CDD ON CD.id = CDD.id_documento_detalle" + 
						" INNER JOIN carpeta_importacion_elemento CI ON CDD.id_carpeta_importacion_elemento = CI.id" + 
						" INNER JOIN carpeta_importacion_elemento CI2 ON CI2.carpeta_importacion_id = CI.carpeta_importacion_id" + 
						" LEFT JOIN carpeta_importacion_documento CID ON CID.carpeta_importacion_elemento_id = CI2.id " + 
						" LEFT JOIN carpeta_import_doc_detalle_carpeta CDD2 ON CDD2.id_carpeta_importacion_elemento = CI2.id " + 
						"WHERE CD.documento_id = " + paramId + " "; 
						"GROUP BY CD.id";*/
			var query = "SELECT " +
				" linea.id ,SUM(IF(subdocumento.fecha_pase  IS NOT NULL OR padre.fecha_pase IS NOT NULL,1,0)) cont " +
				" FROM   " +
				" carpeta_import_doc_detalle_carpeta subdocumento " +
				" INNER JOIN " +
				" carpeta_importacion_documento_detalle linea on subdocumento.id_documento_detalle = linea.id " +
				" INNER JOIN   " +
				" carpeta_importacion_documento padre on linea.documento_id = padre.id " +
				" where padre.id = ? " +
				" GROUP BY linea.id ";

			global.db.driver.execQuery(query, [paramId], function (err, listaContPases) {
				if (err || listaContPases == null) {
					cb(500, { message: 'ERROR EN EL SERVICIO' });
				} else {
					var validado = true;
					var listaId = [];

					for (i = 0; i < listaContPases.length; i++) {
						if (listaContPases[i].cont && listaContPases[i].cont > 0) {
							validado = false;
							break;
						}
						listaId.push(listaContPases[i].id);
					}
					if (validado) {
						async.each(listaId, function (idDetalleDocumento, callback) {
							self().eliminarDocumentoEspecial(idDetalleDocumento, function (codigo, mensaje) {
								if (codigo == 200) {
									callback(null, '');
								} else {
									// Ocurrio un error
									callback(500, 'Error en el servicio');
								}
							})
						}, function (codigo, mensaje) {
							if (codigo) {
								cb(500, { message: mensaje });
							} else {
								// Se eliminaron todos los detalles - falta eliminar la cabecera
								// Debido a que la cabecera no maneja relacion con ninguna entidad,
								// se puede eliminar directamente
								var documentoConstructor = global.db.models.carpeta_importacion_documento;
								documentoConstructor.find({ id: paramId }).remove(function (err) {
									if (err) {
										cb(500, "Error al eliminar")
									}
									else {
										cb(200, paramId);
									}
								})
								//self().eliminarDocumento(paramId, {}, cb);
							}
						});
					} else {
						cb(500, { message: 'El documento ya tiene un traslado de costo, no se puede eliminar.' });
					}
				}
			});
		},

		eliminarDocumentoEspecial: function (paramId, cb) {
			/*
			En realidad deberia llamarse eliminarDetalleDocumentoEspecial:
			'paramId' contiene el id de un detalle de documento, es decir,
			de una fila de 'carpeta_importacion_documento_detalle'.
			*/

			var documentoEspecialConstructor = global.db.models.carpeta_importacion_documento_detalle;
			var documentoDetalleEspecialConstructor = global.db.models.carpeta_import_doc_detalle_carpeta;
			var carpetaImportacionElemento = global.db.models.carpeta_importacion_elemento
			var carpetaImportacionDocumento = global.db.models.carpeta_importacion_documento
			async.waterfall([
				function buscarDocumentoEspecial(callbackDocumentos) {
					documentoEspecialConstructor.get(paramId, function (err, documentoEspecial) {
						if (err) {
							callbackDocumentos(500, { message: 'ERROR EN EL SERVICIO' });
						} else {
							if (documentoEspecial) {
								var datosEnviar = { idDocumento: documentoEspecial.documento_id }
								callbackDocumentos(null, datosEnviar)
							}
							else {
								callbackDocumentos(500, 'El documento no existe');
							}

						}
					});
				},
				function buscarListaDocumentos(datosEnviar, callbackDocumentos) {
					var idDocumentoBuscar = datosEnviar.idDocumento
					documentoEspecialConstructor.find({ documento_id: idDocumentoBuscar }, function (err, listaDocumentoEspecial) {
						if (err) {

							callbackDocumentos(500, { message: 'ERROR EN EL SERVICIO' });
						} else {

							var datosEnviar = { idDocumento: idDocumentoBuscar, listaDocumentoEspecial: listaDocumentoEspecial }
							callbackDocumentos(null, datosEnviar)
						}
					});
				},
				function buscarDetallesDocumentos(datosEnviar, callbackDocumentos) {
					var listaDetalleDocumentos = []
					async.each(datosEnviar.listaDocumentos, function (documento, callback) {
						documentoDetalleEspecialConstructor.find({ id_documento_detalle: documento.id }, function (err, listaDocumentoDetallesEspecial) {
							if (err) {
								callback(500, 'ERROR EN EL SERVICIO');
							} else {

								for (i = 0; i < listaDocumentoDetallesEspecial.length; i++) {
									listaDetalleDocumentos.push(listaDocumentoDetallesEspecial[i])
								}

								callback()
							}
						});

					}, function (errListado, resultListado) {

						if (errListado) {
							callbackDocumentos(errSG, resultListado)
						}
						else {
							datosEnviar.listaDocumento = listaDetalleDocumentos
							callbackDocumentos(null, datosEnviar)
						}

					})
				},
				function verificarDocumentos(datosEnviar, callbackDocumentos) {

					listaDocumento = datosEnviar.listaDocumento
					var documentoAsociado = false
					for (i = 0; i < listaDocumento.length; i++) {
						if (listaDocumento[i].fecha_pase) {
							documentoAsociado = true
						}
					}

					if (documentoAsociado) {
						callbackDocumentos(500, "El documento ya tiene un traslado de costo, no se puede eliminar")
					}
					else {
						callbackDocumentos(null, datosEnviar)
					}
				},
				function restarValorElementos(datosEnviar, callbackDocumentos) {

					global.db.driver.execQuery(
						"SELECT cd.*,cid.moneda,cid.fecha,tc.cambio FROM man.carpeta_import_doc_detalle_carpeta cd " +
						"inner join carpeta_importacion_documento_detalle cidd on cd.id_documento_detalle= cidd.id " +
						"inner join carpeta_importacion_documento cid on cid.id=cidd.documento_id " +
						"inner join tipo_cambio tc on tc.moneda=cid.moneda && tc.fecha = cid.fecha " +
						"where cidd.id=?",
						[paramId], function (err, listadoDocumentos) {
							if (err) {
								callbackDocumentos(500, "Error al eliminar")
							}
							else {

								

								async.each(listadoDocumentos, function (documento, callback) {

									carpetaImportacionElemento.get(documento.id_carpeta_importacion_elemento, function (err, datosElemento) {

										if (datosElemento) {
											var valorActual = datosElemento.monto


											var restarValor = documento.moneda != "PEN" ? (documento.monto * documento.cambio) : documento.monto
											datosElemento.monto = valorActual - restarValor
											datosElemento.save(function (err, objeto) {

												if (err) {
													callback(500, "Error en el servicio");
												} else {

													callback()

												}
											});
										}
										else {
											callback(404, "Elemento de importacion no existe");
										}

									});

								}, function (errListado, resultListado) {

									if (errListado) {
										callbackDocumentos(errSG, resultListado)
									}
									else {
										datosEnviar.listadoDocumentos = listadoDocumentos
										callbackDocumentos(null, datosEnviar)
									}

								})

							}
						}
					)

					/*documentoDetalleEspecialConstructor.find({ id_documento_detalle: paramId }, function (err, listadoDocumentos) {


						if (err) {
							callbackDocumentos(500, "Error al eliminar")
						}
						else {

							async.each(listadoDocumentos, function (documento, callback) {

								carpetaImportacionElemento.get(documento.id_carpeta_importacion_elemento, function (err, datosElemento) {

									if (datosElemento) {
										var valorActual = datosElemento.monto
										datosElemento.monto = valorActual - documento.monto
										datosElemento.save(function (err, objeto) {

											if (err) {
												callback(500, "Error en el servicio");
											} else {

												callback()

											}
										});
									}
									else {
										callback(404, "Elemento de importacion no existe");
									}

								});

							}, function (errListado, resultListado) {

								if (errListado) {
									callbackDocumentos(errSG, resultListado)
								}
								else {
									datosEnviar.listadoDocumentos = listadoDocumentos
									callbackDocumentos(null, datosEnviar)
								}

							})

						}
					})*/
				},
				function actualizarDocumento(datosEnviar, callbackDocumentos) {
					var listadoDatos = datosEnviar.listadoDocumentos
					var totalRestar = 0
					for (i = 0; i < listadoDatos.lenght; i++) {

						totalRestar = totalRestar + listadoDatos[i].monto
					}


					carpetaImportacionDocumento.get(datosEnviar.idDocumento, function (err, datosDocumento) {

						if (datosDocumento) {
							var valorActual = datosDocumento.monto
							datosDocumento.monto = valorActual - totalRestar
							datosDocumento.save(function (err, objeto) {

								if (err) {
									callbackDocumentos(500, "Error en el servicio");
								} else {

									callbackDocumentos(null, datosEnviar)

								}
							});
						}
						else {
							callbackDocumentos(404, "Elemento de importacion no existe");
						}

					});

				},
				function eliminarDetalleDocumentos(datosEnviar, callbackDocumentos) {
					var listado = datosEnviar.listadoDocumentos
					var totalDescontar = 0
					for (i = 0; i < listado.length; i++) {
						totalDescontar = totalDescontar + listado[i].monto
					}
					carpetaImportacionDocumento.get(datosEnviar.idDocumento, function (err, datosImportacionDocumento) {

						if (datosImportacionDocumento) {

							datosImportacionDocumento.monto = datosImportacionDocumento.monto - totalDescontar
							datosImportacionDocumento.save(function (err, objetoDocumentoImportacion) {

								if (err) {
									callbackDocumentos(500, "Error en el servicio");
								} else {
									
									callbackDocumentos(null, datosEnviar)
								}
							});
						}
						else {
							callbackDocumentos(404, "Elemento de importacion no existe");
						}

					});
				},

				function eliminarDetalleEspecialDocumentos(datosEnviar, callbackDocumentos) {

					documentoDetalleEspecialConstructor.find({ id_documento_detalle: paramId }).remove(function (err) {
						if (err) {
							callbackDocumentos(500, "Error al eliminar")
						}
						else {
							documentoEspecialConstructor.find({ id: paramId }).remove(function (errdocumento) {
								if (errdocumento) {
									callbackDocumentos(500, "Error al eliminar")
								}
								else {
									callbackDocumentos()
								}
							})
						}
					})
				}

			], function (error, listaDocumentos) {
				if (error) {
					cb(500, { message: listaDocumentos })
				}
				else {
					cb(200, paramId)
				}
			});

		}
	}
};