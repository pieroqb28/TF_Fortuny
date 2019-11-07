var Cotizacion = require('../models/Cotizacion');
var ParametrosFactorController = require('../controller/ParametrosFactorController');
var CentroCostoController = require('../controller/CentroCostoController');
var async = require('async');
var maskDate = 'DD/MM/YY';
//var Decimal = require('decimal');
module.exports = function () {
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
	function crearCentroCosto(tenantId, userId, clienteId, numeroCoti) {
		var clienteConstructor = global.db.models.cliente;
		clienteConstructor.find({ id: clienteId }, function (err, Cliente) {
			var body = {
				codigo: numeroCoti,
				nombre: Cliente[0].nombre
			}
			CentroCostoController().create(tenantId, userId, body, function (err, result) {
			})
		});
	};
	function verificarCotizacionGrabar(cotizacion) {
		// Verificacion de campos
		if (!cotizacion) {
			return { codigo: 400, texto: "Datos de cotización nulos." };
		} else if (!cotizacion.cliente_id && cotizacion.cliente_id != "") {
			return { codigo: 400, texto: "Debe ingresar el cliente de la cotización." };
		} else {
			return { codigo: 200, texto: "OK - PARCIAL" };
		}
	}
	function verificarCotizacion(cotizacion) {
		// Verificacion de campos
		if (!cotizacion) {
			return { codigo: 400, texto: "Cotización nula." };
		} else if (!(cotizacion.detalles && cotizacion.detalles instanceof Array && cotizacion.detalles.length > 0)) {
			return { codigo: 400, texto: "La cotización no posee líneas de detalle" };
		} else {
			// Evaluacion de montos
			var error = false;
			if (cotizacion.total_cotizacion == (cotizacion.total + (parseFloat((cotizacion.totalAdicional + cotizacion.totalImpuestos).toFixed(2))))) {
				var total = 0;
				var detalle = {};
				for (i = 0; i < cotizacion.detalles.length; i++) {
					detalle = cotizacion.detalles[i];
					if (detalle.cantidad * detalle.precio_unitario_factor != detalle.sub_total_factor) {
						error = true;
					} else {
						total = total + detalle.sub_total_factor;
					}
					if (error) break;
				}
				if ((parseFloat(total.toFixed(2)) > (cotizacion.totalDetalle - 0.05)) || (parseFloat(total.toFixed(2)) < (cotizacion.totalDetalle + 0.05))) {
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
			var cotizacionDetailConstructor = global.db.models.cotizacion_detalle;
			cotizacionDetailConstructor.find({ cotizacion_id: paramId }).remove(function (err) {
				if (err) {
					return cb(500, { message: "Existe un error en el Servicio" });
				} else {
					var cotizacionConstructor = global.db.models.cotizacion;
					cotizacionConstructor.find({ id: paramId }).remove(function (err) {
						if (err) {
							return cb(500, { message: "No se pudo eliminar la cotización" });
						} else {
							return cb(200, {});
						}
					})
				}
			});
		},
		clienteRechaza: function (userId, tenandId, paramId, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.get(paramId, function (err, objeto) {
				if (err) {
					cb(500, { message: "Existe un error en el Servicio" });
				} else if (objeto) {
					if (objeto.usuario_creacion != userId) {
						cb(401, { message: "No tiene permiso para realizar esta acción" })
					} else {
						var numeroCotizacion = objeto.numero
						var posicionIniBusqueda = numeroCotizacion.lastIndexOf('-')
						var numeroSiguiente = numeroCotizacion.substring(0, posicionIniBusqueda)
							+ "-" + (parseInt(numeroCotizacion.substring(posicionIniBusqueda + 1)) + 1)
						var datosGrabar = {
							estado_id: 5,
							numero: numeroSiguiente
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
		clienteAcepta: function (tenandId, userId, paramId, toUpd, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.find({ orden_compra_cliente: toUpd.orden_compra_cliente, cliente_id: toUpd.cliente_id }, function (err, objetoOrdenCompra) {
				if (err) {
					cb(500, { message: "Existe un error en el Servicio" })
				} else {
					var existeOrdenCompra = false
					if (objetoOrdenCompra.length > 0) {
						existeOrdenCompra = true
					}
					cotizacionConstructor.get(paramId, function (err, objeto) {
						if (err) {
							cb(500, { message: "Existe un error en el Servicio" });
						} else if (objeto) {
							if (objeto.usuario_creacion != userId) {
								cb(401, { message: "No tiene permiso para realizar esta acción" })
							} else {
								if (objeto.estado_id == 4) {
									var fechaValida = true
									if (existeOrdenCompra) {
										var fechaCliente = toUpd.fechaAceptacionCliente
										for (i = 0; i < objetoOrdenCompra.length; i++) {
											var fechaOrdenCompra = objetoOrdenCompra[i].fechaAceptacionCliente
											var fechaDiaOrdenCompra = fechaOrdenCompra.getDate() < 10 ? '0' + fechaOrdenCompra.getDate() : fechaOrdenCompra.getDate()
											var fechaMesOrdenCompra = (fechaOrdenCompra.getMonth() + 1) < 10 ? '0' + (fechaOrdenCompra.getMonth() + 1) : (fechaOrdenCompra.getMonth() + 1)
											var fechaAnioOrdenCompra = fechaOrdenCompra.getFullYear()
											fechaOrdenCompra = fechaAnioOrdenCompra + "-" + fechaMesOrdenCompra + "-" + fechaDiaOrdenCompra
											if (fechaCliente != fechaOrdenCompra) {
												fechaValida = false
												fechaOrdenCompraExistente = fechaDiaOrdenCompra + "-" + fechaMesOrdenCompra + "-" + fechaAnioOrdenCompra
											}
										}
									}
									if (!fechaValida) {
										cb(500, { message: "El número de orden de compra ya fue asociada para otra cotizacion, por favor mantenga dicha fecha  " + fechaOrdenCompraExistente })
									} else {
										var datosGrabar = {
											estado_id: 6,
											fechaAceptacionCliente: toUpd.fechaAceptacionCliente,
											orden_compra_cliente: toUpd.orden_compra_cliente,
										}
										objeto.save(datosGrabar, function (err) {
											if (err) {
												cb(500, { message: "Existe un error en el Servicio" });
											} else {
												crearCentroCosto(tenandId, userId, toUpd.cliente_id, toUpd.numero)
												cb(200, { id: paramId });
											}
										});
									}
								} else {
									cb(500, { message: "La cotización aun no ha sido aprobada" });
								}
							}
						} else {
							cb(404, { message: 'No existe la cotización' });
						}
					});
				}
			});
		},
		confirmacionOrden: function (userId, tenandId, paramId, toUpd, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			var cotizacionDetailConstructor = global.db.models.cotizacion_detalle;
			var filasCot = toUpd.items;
			cotizacionConstructor.get(paramId, function (err, cotizacion) {
				if (cotizacion) {
					if (cotizacion.usuario_creacion != userId) {
						cb(401, "No tiene autorización para realizar esta acción")
					} else {
						// Se valida que la cotizacion este en el estado apropiado

						if (cotizacion.estado_id == 6 || cotizacion.estado_id == 10) {
							// Se buscan las lineas de detalle
							async.each(filasCot, function (itemParam, callback) {
								// Para cada linea de detalle se actualiza su estado y la fecha de entrega
								cotizacionDetailConstructor.get(itemParam.id, function (error1, detalleCot) {
									if (error1) {
										callback(new Error(error1));
									} else if (detalleCot && detalleCot.cotizacion_id == paramId) {
										detalleCot.save({
											fecha_entrega: itemParam.fecha_entrega,
											estado_aceptacion: itemParam.estado_aceptacion
										}, function (error2) {
											if (error2) {
												callback(new Error(error2));
											} else {
												callback();
											}
										});
									} else {
										callback(new Error());
									}
								});
							}, function (errSG) {
								if (errSG) {
									cb(500, { message: errSG, code: '2003' });
								} else {
									if (toUpd.cerrar == 1) {
										// Se actualiza el estado de la cotizacion
										var datosGrabar = {
											estado_id: 7
										}
										cotizacion.save(datosGrabar, function (error3) {
											if (error3) {
												cb(500, { message: "Ocurrió un error. Intente nuevamente en unos momentos." });
											} else {
												cb(200, {});
											}
										});
									} else {
										cb(200, {});
									}
								}
							});
						} else {
							cb(400, { message: "La cotización debe haber sido aceptada por el cliente." });
						}
					}
				} else {
					cb(500, { message: "Ocurrió un error. Intente nuevamente en unos momentos." });
				}
			});
		},
		asignarOrderCompra: function (userId, tenandId, paramId, upd, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.get(paramId, function (err, objeto) {
				if (err) {
					cb(500, { message: "Existe un error en el Servicio" });
				} else if (objeto) {
					var datosGrabar = {
						id_orden_compra: upd.idOrdenCompra
					}
					objeto.save(datosGrabar, function (err) {
						if (err) {
							cb(500, { message: "Existe un error en el Servicio" });
						} else {
							cb(200, {});
						}
					});
				} else {
					cb(404, { message: 'No existe la cotización' });
				}
			});
		},
		update: function (userId, tenandId, paramId, toUpd, cb) {
			console.log(toUpd);
			var verificacion = {
				codigo: 200
			};
			if (toUpd.estado_id == 9) {
				verificacion = verificarCotizacionGrabar(toUpd);
			} else {
				verificacion = verificarCotizacion(toUpd);
			}
			if (verificacion.codigo != 200) {
				cb(verificacion.codigo, { message: verificacion.texto });
			} else {
				var cotizacionConstructor = global.db.models.cotizacion;
				cotizacionConstructor.get(paramId, function (err, objeto) {
					if (err) {
						cb(500, { message: "Existe un error en el servicio" });
					} else if (objeto) {
						if (objeto.usuario_creacion != userId) {
							// solo la persona que creo puede editar la cotización
							cb(401, { message: "No tiene permiso para realizar esta acción" })
						} else {
							var numeroCotizacion = objeto.numero
							var datosGrabar = {
								descripcion: toUpd.descripcion,
								cliente_id: toUpd.cliente_id,
								numero: toUpd.numero,
								numero_oferta: toUpd.numero_oferta,
								impuestoAplicado: toUpd.impuestoAplicado,
								totalImpuestos: toUpd.totalImpuestos,
								totalAdicional: toUpd.totalAdicional,
								totalDetalle: toUpd.totalDetalle,
								moneda: toUpd.moneda,
								total: toUpd.total,
								factor: toUpd.factor,
								impuesto_id: toUpd.impuesto_id,
								total_cotizacion: toUpd.total_cotizacion,
								fecha_requerimiento: toUpd.fecha_requerimiento,
								referencia: toUpd.referencia,
								notas: toUpd.notas,
								terminos_condiciones: toUpd.terminos_condiciones,
								barco: toUpd.barco,
								imo: toUpd.imo,
								porcentajeCostFinan: toUpd.porcentajeCostFinan,
								comentario_oi: toUpd.comentario_oi,
								usuario_modificacion: userId,
								fecha_modificacion: new Date(),
								lugar_servicio: toUpd.lugar_servicio,
								fecha_inicio_servicio: toUpd.fecha_inicio_servicio,
								fecha_fin_servicio: toUpd.fecha_fin_servicio,
								oferta_valida_servicio: toUpd.oferta_valida_servicio,
								tiempo_entrega_servicio: toUpd.tiempo_entrega_servicio,
								nombre_servicio: toUpd.nombre_servicio
							};
							if (toUpd.estado_id == 1) {
								datosGrabar.estado_id = 1;
							}
							//if (toUpd.fechaAceptacionCliente != "" && toUpd.fechaAceptacionCliente !=null && (toUpd.cantDetalleSelecc>0)){
							if (toUpd.fechaAceptacionCliente != "" && toUpd.fechaAceptacionCliente != null) {
								// Nota: si el servicio pasa por esta area de codigo, deberia ser la ultima vez que la 
								// cotizacion sera modificada: se esta registrando la aceptacion del cliente y lo unico
								// posterior a eso es registrar las fechas de entrega del cliente, que solo afectan al
								// detalle y al estado.
								if (toUpd.estado_id == 10) {
									datosGrabar.estado_id = 10;
								} else {
									datosGrabar.estado_id = 6;
								}
								datosGrabar.fechaAceptacionCliente = toUpd.fechaAceptacionCliente;
								//datosGrabar.orden_compra_cliente = toUpd.orden_compra_cliente;
							}
							objeto.save(datosGrabar, function (err) {
								if (err) {
									cb(500, { message: "Existe un error en el Servicio" });
								} else {
									/* ELIMINACION Y POSTERIOR CREACION DE LAS FILAS DEL DETALLE */
									//if (toUpd.fechaAceptacionCliente != "" && toUpd.fechaAceptacionCliente !=null && (toUpd.cantDetalleSelecc>0)){
									if (toUpd.fechaAceptacionCliente != "" && toUpd.fechaAceptacionCliente != null) {
										// Nota: si el servicio pasa por esta area de codigo, deberia ser la ultima vez que la 
										// cotizacion sera modificada: se esta registrando la aceptacion del cliente y lo unico
										// posterior a eso es registrar las fechas de entrega del cliente, que solo afectan al
										// detalle y al estado.
										crearCentroCosto(tenandId, userId, toUpd.cliente_id, numeroCotizacion)
									}
									var cotizacionDetailConstructor = global.db.models.cotizacion_detalle;
									cotizacionDetailConstructor.find({ cotizacion_id: paramId }, function (err, objetoListaDetalles) {
										if (err) {
											cb(500, { message: "Existe un error en el servicio" });
										} else {

											cotizacionDetailConstructor.find({ cotizacion_id: paramId }).remove(function (err) {
												if (err) {
													cb(500, { err: err });
												} else {
													var cotizacionId = paramId;
													var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
													var correcto = true;
													var detallesCreadosId = [];
													//Guardado de cada linea de detalle
													async.each(toUpd.detalles, function (detalle, detalleCallback) {
														cotizacionDetalleConstructor.create({
															cotizacion_id: cotizacionId,
															posicion: detalle.posicion,
															descripcion_servicio: detalle.descripcion_servicio,
															sub_total: detalle.sub_total,
															lugar_servicio: detalle.lugar_servicio
														}, function (err, objDetalle) {
															if (err) {
																correcto = false;
																detalleCallback({ flag: true });
															} else {
																//si esta bien creada, se crea el guardado del personal tecnico
																detallesCreadosId.push(objDetalle.id);
																detalleCallback();
															}//fin del else
														}); //fin de la creacion del detalle
													}, function (error) { //funcion de completado del async de detalle
														if (!correcto) {
															// Creacion incorrecta
															// Se debe eliminar la cotizacion creada y los detalles que llegaron a ser creados
															for (detalle in detallesCreadosId) {
																// Eliminacion de los detalles creados
																cotizacionDetalleConstructor.findOneAndRemove({ id: detalle.id, tenant: tenandId }, function (err) { });
															}
															cb(500, { message: "Existe un error en el Servicio" });
														}
														else {
															cb(200, objeto)
														}
													});
												}
											})


										}
									});
								}
							});
						}
					} else {
						cb(404, { message: 'La cotización no existe.' });
					}
				});
			}
		},
		getbyId: function (req, res, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
			db.driver.execQuery(
				"SELECT c.*, est.nombre estado_cotizacion," +
				" concat(u.nombres , ' ' , u.apellidos ) as nombre_usuario_creacion,cl.nombre nombre_cliente" +
				" FROM cotizacion c" + " INNER JOIN estado_cotizacion est ON c.estado_id = est.id" +
				" Inner Join cliente cl ON cl.id=  c.cliente_id" +
				" LEFT JOIN hs_usuario u ON c.usuario_creacion = u.id" + " WHERE c.id =?;", [req.params.id],
				function (err, listObj) {
					if (err) {
						cb(500, { message: "Existe un error en el servicio" });
					} else {
						if (listObj.length > 0) {
							db.driver.execQuery(
								"SELECT  cd.id, descripcion_servicio, sub_total" +
								" FROM cotizacion_detalle cd" +
								" WHERE cd.cotizacion_id =?;", [req.params.id],
								function (err, listObjDetails) {
									if (err) { } else {
										if (listObjDetails && listObjDetails != "") {
											listObj[0].detalles = listObjDetails
										}
										// verificar permisos de modificacion
										var permisoModificarCotizacion
										if (listObj[0].usuario_creacion != req.userId) {
											permisoModificarCotizacion = false
										} else {
											permisoModificarCotizacion = true
										}
										listObj[0].permisoModificarCoti = permisoModificarCotizacion
										cb(200, listObj);
									}
								}
							);
						} else {
							cb(500, { message: 'La cotización no existe.' });
						}
					}
				}
			);
		},
		getPrint: function (paramsId, showExWork, cb) {
			showExWork = showExWork == "false" ? false : true
			var cotizacionConstructor = global.db.models.cotizacion;
			var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
			db.driver.execQuery(
				"SELECT" +
				" c.numero NumCotizacion," +
				" cli.nombre ClienteNombre," +
				" cli.direccion ClienteDirec1," +
				" cli.direccion2  ClienteDirec2," +
				" cli.pais ClientePais," +
				" cli.contacto1 contactoCliente," +
				" cli.email1 contactoEmail," +
				" DATE_FORMAT(c.fecha, '%d-%m-%Y')  FechaCotizacion," +
				" c.numero_oferta NumOferta," +
				" c.contacto contacto_coti," +
				" c.email_contacto email_contacto_coti," +
				" c.terminos_condiciones," +
				" cli.numero_cliente ClienteNumero," +
				" cli.ruc ClienteRUC," +
				" DATE_FORMAT(c.fecha_requerimiento , '%d-%m-%Y')  FechaRequerimiento," +
				" c.referencia Referencia," +
				" CONCAT(u.nombres,' ',u.apellidos)  NombreContacto," +
				" u.telefono TelefonoContacto," +
				" u.celular CelularContacto," +
				" u.correo CorreoContacto," +
				" c.descripcion Descripcion," +
				" c.notas Notas," +
				" c.barco Barco," +
				" c.imo IMO," +
				" c.moneda Moneda," +
				" c.tiempo_entrega_servicio, " +
				" c.nombre_servicio, " +
				" DATE_FORMAT(c.fecha_inicio_servicio, '%d-%m-%Y') fecha_inicio_servicio, " +
				" DATE_FORMAT(c.fecha_fin_servicio, '%d-%m-%Y') fecha_fin_servicio, " +
				" c.lugar_servicio, " +
				" c.totalDetalle SubTotal," +
				" c.totalAdicional MontoImportacion," +
				" c.totalDetalle - c.totalAdicional MontoExWork," +
				" concat(c.impuestoAplicado*100,'%') Impuesto," +
				" c.totalImpuestos MontoImpuesto," +
				" c.total_cotizacion MontoTotal," +
				" param.texto textoParametro," +
				" sa.id solicitud_id," +
				//" 'Roberto Quispe' NombreAprobador1," +
				//" 'Alvaro Quispe' NombreAprobador2," +
				//" 'Mechanical Engineer' CargoAprobador1," +
				//" 'General Manager ' CargoAprobador2,"
				" CONCAT(u.nombres,' ',u.apellidos) usuarios" +
				" FROM cotizacion c LEFT JOIN estado_cotizacion est" +
				" ON c.estado_id = est.id LEFT JOIN cliente cli" +
				" ON c.cliente_id = cli.id LEFT JOIN solicitud_aprobacion sa" +
				" ON c.id = sa.entidad_id LEFT JOIN aprobacion a" +
				" ON sa.id = a.solicitud_id LEFT JOIN hs_usuario u" +
				" ON a.usuario_id = u.id LEFT JOIN texto_cotizacion param" +
				" ON c.categoria_id= param.categoria_id" +
				" WHERE c.id = ? AND est.id IN (3,4,5,6, 7);", [paramsId],
				function (err, listObj) {
					if (err) {
						cb(500, { message: "Existe un error en el Servicio" });
					} else {
						if (listObj.length > 0) {
							listObj[0].showExWork = showExWork;
							var indexes = [],
								i = -1;
							while ((i = listObj[0].textoParametro.indexOf("\\n", i + 1)) != -1) {
								indexes.push(i);
							}


							global.db.driver.execQuery(
								"SELECT u.* FROM aprobacion ap inner join hs_usuario u on u.id=ap.usuario_id where ap.solicitud_id=?"
								, [listObj[0].solicitud_id]
								, function (err, listaUsuariosAprobacion) {
									if (err) {
										cb(500, { err: err });
									} else {
										if (listaUsuariosAprobacion.length > 0) {


											if (listObj[0].contacto_coti && listObj[0].email_contacto_coti) {


												listObj[0] = JSON.parse(JSON.stringify(listObj[0]))
												listObj[0]['contactoCliente'] = listObj[0].contacto_coti
												listObj[0]['contactoEmail'] = listObj[0].email_contacto_coti
											}

											listObj[0].NombreAprobador1 = listaUsuariosAprobacion[0].nombres + " " + listaUsuariosAprobacion[0].apellidos
											listObj[0].NombreAprobador2 = listaUsuariosAprobacion[1].nombres + " " + listaUsuariosAprobacion[1].apellidos
											listObj[0].CargoAprobador1 = listaUsuariosAprobacion[0].cargo
											listObj[0].CargoAprobador2 = listaUsuariosAprobacion[1].cargo
											listObj[0].idAprovador1 = listaUsuariosAprobacion[0].id
											listObj[0].idAprovador2 = listaUsuariosAprobacion[1].id

											db.driver.execQuery(
												" select cotizacion_detalle.posicion," +
												" cotizacion_detalle.id, " +
												" cotizacion_detalle.descripcion_servicio, " +
												" cotizacion_detalle.sub_total " +
												" from cotizacion_detalle " +
												" where cotizacion_id =  ?;",
												[paramsId],
												function (err, listObjDetails) {
													if (err) {
														cb(500, { message: "Existe un error en el Servicio" });
													} else {
														if (listObjDetails.length > 0) {
															var correlativo = 10
															for (i = 0; i < listObjDetails.length; i++) {
																listObjDetails[0] = JSON.parse(JSON.stringify(listObjDetails[0]))
																listObjDetails[0]['num'] = correlativo
																correlativo = correlativo + 10
															}

															var cantMaxDetalle = 40
															var cantOtrasPaginas = 70

															var termino = false
															var mostrarCabecera = true

															if (Math.ceil(listObjDetails.length / cantMaxDetalle) > 1) {
																var maximoParaFirmas = 40
																listObj[0].cantPaginas = (Math.ceil((listObjDetails.length - cantMaxDetalle) / cantOtrasPaginas)) + 1
																var ultimaPagina = false
															}
															else {
																var maximoParaFirmas = 15
																if (listObjDetails.length <= 16) {
																	listObj[0].detalleAbsoluto = true

																}
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
																for (i = valorIniDetalle; i < valorFinDetalle; i++) {
																	if (listObjDetails[i].fecha_entrega != null) {
																		var diaDetalle = listObjDetails[i].fecha_entrega.getDate() > 9 ? listObjDetails[i].fecha_entrega.getDate() : "0" + listObjDetails[i].fecha_entrega.getDate()
																		var mesDetalle = listObjDetails[i].fecha_entrega.getMonth() > 9 ? listObjDetails[i].fecha_entrega.getMonth() + 1 : "0" + (listObjDetails[i].fecha_entrega.getMonth() + 1)
																		listObjDetails[i].fecha_entrega = diaDetalle + "-" + mesDetalle + "-" + listObjDetails[i].fecha_entrega.getFullYear()
																	}
																	detallesPagina.push(listObjDetails[i])
																}

																datoenEnviar[0].pagina.push(objetoLista[0])
																datoenEnviar[0].pagina[m].detalles = detallesPagina;
																datoenEnviar[0].pagina[m].ultimaPagina = ultimaPagina
																datoenEnviar[0].pagina[m].paginaActual = m + 1;
																valorIniDetalle = valorFinDetalle;

																if ((valorFinDetalle + cantOtrasPaginas) > listObjDetails.length) {
																	valorFinDetalle = listObjDetails.length
																}
																else {
																	valorFinDetalle = valorFinDetalle + cantOtrasPaginas
																}
															}
															//datos 
															db.driver.execQuery(
																"SELECT * FROM hs_parametros" +
																" where nombreParam='telefono' or nombreParam='correo' or nombreParam='dispatch_address'",
																[],
																function (err, listObjParams) {
																	if (err) {
																		cb(500, { message: "Existe un error en el Servicio" });
																	} else {
																		for (m = 0; m < listObj[0].cantPaginas; m++) {
																			for (i = 0; i < listObjParams.length; i++) {
																				if (listObjParams[i].nombreParam == "dispatch_address") {
																					var resPeriodo = listObjParams[i].valorParam.split(",");
																					datoenEnviar[0].pagina[m].direccionEmpresa = resPeriodo[0]
																					datoenEnviar[0].pagina[m].distritoEmpresa = resPeriodo[1]
																				}
																				if (listObjParams[i].nombreParam == "telefono") {
																					datoenEnviar[0].pagina[m].telefonoEmpresa = listObjParams[i].valorParam
																				}
																				if (listObjParams[i].nombreParam == "correo") {
																					datoenEnviar[0].pagina[m].correoEmpresa = listObjParams[i].valorParam
																				}
																			}
																		}
																		cb(200, datoenEnviar);
																	}
																})
															//fin datos

														} else {
															cb(500, { message: "Detalle de Cotización no encontrado" });
														}
													}
												}
											);

										} else {
											cb(404, { message: "NO SE HA ENCONTRADO aprobadores" });
										}
									}
								}
							);

						} else {
							cb(500, { message: 'Cotización no encontrada' });
						}
					}
				}
			);
		},
		getMarginPrint: function (paramsId, cb) {
			var transp_callao_igv = 0.00
			var transp_callao_sin_igv = 0.00
			var transp_callao_real = 0.00
			var desc_fabrica = 1.12
			var Flete_insurance_real = 1.18
			var porcentajeCostFinan = 12
			var cotizacionConstructor = global.db.models.cotizacion;
			var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
			db.driver.execQuery(
				"SELECT c.total_cotizacion,c.numero,c.barco,c.imo,c.porcentajeCostFinan,c.transp_callao,pf.total_factor,c.totalDetalle,round(pf.ad_valorm_porcent*pf.igv_aduanas,2) porcvalor,pf.total_cargos_aduanas,c.total" + " FROM cotizacion c" + " INNER JOIN parametros_factor pf" + " ON c.id=pf.cotizacion_id" + " where c.id=?;", [paramsId],
				function (err, resultMargen) {
					if (err) {
						cb(500, { message: "Existe un error en el Servicio" });
					} else {
						resultMargen[0].desc_fabrica = desc_fabrica.toFixed(2)
						resultMargen[0].Flete_insurance_real = Flete_insurance_real.toFixed(2)
						resultMargen[0].real_fabrica = (resultMargen[0].total / desc_fabrica).toFixed(2)
						resultMargen[0].cot_fabri_igv = (resultMargen[0].real_fabrica * Flete_insurance_real).toFixed(2)
						resultMargen[0].costo_fin_igv = ((resultMargen[0].porcentajeCostFinan / 100) * resultMargen[0].total_factor).toFixed(2)
						resultMargen[0].costo_fin_sin_igv = (resultMargen[0].porcvalor * (resultMargen[0].porcentajeCostFinan / 100)).toFixed(2)
						resultMargen[0].costo_fin_real = (resultMargen[0].porcvalor * (resultMargen[0].porcentajeCostFinan / 100)).toFixed(2)
						resultMargen[0].margen_igv = (resultMargen[0].total_cotizacion - resultMargen[0].total_factor - resultMargen[0].cot_fabri_igv - resultMargen[0].transp_callao - resultMargen[0].costo_fin_igv).toFixed(2)
						resultMargen[0].marg_sin_igv = (resultMargen[0].totalDetalle - resultMargen[0].porcvalor - resultMargen[0].cot_fabri_igv - resultMargen[0].costo_fin_sin_igv).toFixed(2)
						resultMargen[0].marg_real = (resultMargen[0].total_cotizacion - resultMargen[0].porcvalor - resultMargen[0].total_cargos_aduanas - resultMargen[0].transp_callao - resultMargen[0].costo_fin_real).toFixed(2)
						resultMargen[0].por_margen_igv = ((resultMargen[0].margen_igv / resultMargen[0].total_cotizacion) * 100).toFixed(2) + "%"
						resultMargen[0].por_margen_sin_igv = ((resultMargen[0].marg_sin_igv / resultMargen[0].totalDetalle) * 100).toFixed(2) + "%"
						resultMargen[0].por_margen_real = ((resultMargen[0].marg_real / resultMargen[0].total_cotizacion) * 100).toFixed(2) + "%"
						cb(200, resultMargen)
					}
				}
			);
		},
		getAll: function (tenantId, cb) {
			db.driver.execQuery(
				"select C.*, EC.nombre estado_cotizacion, CL.nombre cliente_nombre, " +
				" concat(U.nombres , ' ' , U.apellidos ) as nombre_usuario_creacion" +
				" FROM cotizacion C" + " INNER JOIN estado_cotizacion EC ON C.estado_id = EC.id" +
				" INNER JOIN cliente CL ON C.cliente_id= CL.id" +
				" LEFT JOIN hs_usuario U ON C.usuario_creacion = U.id" +
				" WHERE C.categoria_id = 2" +
				" ORDER BY C.fecha DESC", [],
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
		},
		getAllNotClosed: function (paramsId, cb) {
			db.driver.execQuery(
				"select C.*, EC.nombre estado_cotizacion, CL.nombre cliente_nombre, " + " concat(U.nombres , ' ' , U.apellidos ) as nombre_usuario_creacion" + " FROM cotizacion C" + " INNER JOIN estado_cotizacion EC ON C.estado_id = EC.id" + " INNER JOIN cliente CL ON C.cliente_id= CL.id" + " LEFT JOIN hs_usuario U ON C.usuario_creacion = U.id" + " WHERE ( C.estado_id != 7  AND  C.estado_id != 8) AND (C.usuario_creacion = ? )", [paramsId],
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
		},
		getByEstado: function (estadoCotizacion, cb) {
			db.driver.execQuery(
				"SELECT * FROM cotizacion where estado_id=? and id_orden_compra is null", [estadoCotizacion.estado],
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
		},
		create: function (userId, tenantId, body, res, cb) {
			var verificacion = {
				codigo: 200
			};
			if (body.estado_id == 9) {
				verificacion = verificarCotizacionGrabar(body);
			} else {
				verificacion = verificarCotizacion(body);
			}
			if (verificacion.codigo != 200) {
				return cb(verificacion.codigo, { message: verificacion.texto });
			} else {
				var cotizacionConstructor = global.db.models.cotizacion;
				var cotizacionACrear = {
					descripcion: body.descripcion,
					cliente_id: body.cliente_id,
					numero: body.numero,
					fecha: new Date(),
					categoria_id: 2,
					estado_id: body.estado_id,
					numero_oferta: body.numero_oferta,
					impuestoAplicado: body.impuestoAplicado,
					totalImpuestos: body.totalImpuestos,
					totalAdicional: body.totalAdicional,
					totalDetalle: body.totalDetalle,
					impuesto_id: body.impuesto_id,
					moneda: body.moneda,
					total: body.total,
					factor: body.factor,
					total_cotizacion: body.total_cotizacion,
					fecha_requerimiento: body.fecha_requerimiento,
					referencia: body.referencia,
					notas: body.notas,
					barco: body.barco,
					terminos_condiciones: body.terminos_condiciones,
					imo: body.imo,
					comentario_oi: body.comentario_oi,
					porcentajeCostFinan: body.porcentajeCostFinan,
					usuario_creacion: userId,
					fecha_creacion: new Date(),
					lugar_servicio: body.lugar_servicio,
					numero_secuencia: body.numero_secuencia,
					fecha_inicio_servicio: body.fecha_inicio_servicio,
					fecha_fin_servicio: body.fecha_fin_servicio,
					oferta_valida_servicio: body.oferta_valida_servicio,
					tiempo_entrega_servicio: body.tiempo_entrega_servicio,
					nombre_servicio: body.nombre_servicio
				};
				cotizacionConstructor.create(cotizacionACrear, function (err, objCotizacion) {
					if (err) {
						cb(500, { message: "Existe un error en el servicio" });
					} else {
						if (objCotizacion) {
							var cotizacionId = objCotizacion.id;
							var cotizacionDetalleConstructor = global.db.models.cotizacion_detalle;
							var correcto = true;
							var detallesCreadosId = [];
							//Guardado de cada linea de detalle
							async.each(body.detalles, function (detalle, detalleCallback) {
								cotizacionDetalleConstructor.create({
									cotizacion_id: cotizacionId,
									posicion: detalle.posicion,
									descripcion_servicio: detalle.descripcion_servicio,
									cantidad: detalle.cantidad,
									sub_total: detalle.sub_total,
								}, function (err, objDetalle) {
									if (err) {
										correcto = false;
										detalleCallback({ flag: true });
									} else {
										//si esta bien creada, se crea el guardado del personal tecnico
										detallesCreadosId.push(objDetalle.id);
										detalleCallback();
									}//fin del else
								}); //fin de la creacion del detalle
							}, function (error) { //funcion de completado del async de detalle
								if (!correcto) {
									// Creacion incorrecta
									// Se debe eliminar la cotizacion creada y los detalles que llegaron a ser creados
									for (detalle in detallesCreadosId) {
										// Eliminacion de los detalles creados
										cotizacionDetalleConstructor.findOneAndRemove({ id: detalle.id, tenant: tenandId }, function (err) { });
									}
									cb(500, { message: "Existe un error en el Servicio" });
								}
								else {
									cb(200, objCotizacion)
								}
							});
						} else {

							cb(500, { message: "Existe un error en el Servicio" });
						}
					}
				});
			}
		},
		pasarLiquidacion: function (userId, paramId, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.get(
				paramId, function (err, obj) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (obj.usuario_creacion != userId) {
							cb(401, { message: "No tiene permisos para realizar esta acción" });
						} else {
							obj.estado_id = 10;
							obj.usuario_modificacion = userId;
							obj.fecha_modificacion = new Date();
							obj.save(function (err) {
								if (err) {
									cb(500, { err: err });
								} else {
									cb(200, { id: obj.id });
								}
							})
						}
					}
				}
			)
		},
		CancelarCotizacion: function (tenantId, userId, paramId, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: "Error en el Servicio" });
				} else {
					if (obj) {
						if (obj.usuario_creacion != userId) {
							cb(401, { message: "No tiene permiso para realizar esta acción" })
						} else {
							obj.estado_id = 8,
								obj.usuario_modificacion = userId,
								obj.fecha_modificacion = new Date()
							// save the user
							obj.save(function (err) {
								if (err) {
									cb(500, { err: "Error en el Servicio" });
								} else {
									cb(200, { id: obj.id });
								}
							});
						}
					} else {
						cb(404, { err: 'No existe Cuenta Contable' });
					}
				}
			});
		},
	}
}