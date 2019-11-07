var Cotizacion = require('../models/Cotizacion');
var ParametrosFactorController = require('./ParametrosFactorController');
var CentroCostoController = require('./CentroCostoController');
var async = require('async');
var clienteController = require('./ClienteController');
var maskDate = 'DD/MM/YY';
var async = require('async');
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
	function verificarAsociacionProyecto(cotizacionProyecto, callback) {
		var centroCostoConstructor = global.db.models.centro_costo;
		centroCostoConstructor.find({ codigo: cotizacionProyecto }, function (err, datosCentroCosto) {
			if (err) {
				callback(500, { message: "Error al buscar la cotización" });
			} else {
				if (datosCentroCosto.length > 0) {
					var ordenCompraConstructor = global.db.models.orden_compra;
					ordenCompraConstructor.find({ centro_costo_id: datosCentroCosto[0].id }, function (err, datosOrdenCompra) {
						if (err) {
							callback(500, { message: "Error al buscar la cotización" });
						} else {
							if (datosOrdenCompra.length > 0) {
								callback(500, { message: "Cotizacion Asociada a una Orden de Compra" })
							}
							else {
								callback(200, {})
							}
						}
					})
				}
				else {
					callback(200, {})
				}
			}
		})
	}
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
					if (parseFloat(detalle.cantidad) * parseFloat(detalle.precio_unitario_factor) != parseFloat(detalle.sub_total_factor)) {
						error = true;
					} else {
						total = parseFloat(total) + parseFloat(detalle.sub_total_factor);
					}
					if (error) break;
				}

				if ((parseFloat(total.toFixed(2)) > (cotizacion.totalDetalle - 0.05)) || (parseFloat(total.toFixed(2)) < (cotizacion.totalDetalle + 0.05))) {
					error = false;
				}
				else {
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
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.find({ id: paramId }, function (err, datosCotizacion) {
				if (err) {
					cb(500, { message: "Error al buscar la cotización" });
				} else {
					if (datosCotizacion.length > 0) {
						verificarAsociacionProyecto(datosCotizacion[0].numero, function (resultCC) {
							if (resultCC == 200) {
								var cotizacionCodigo = datosCotizacion[0].numero
								var cotizacionDetailConstructor = global.db.models.cotizacion_detalle;
								cotizacionDetailConstructor.find({ cotizacion_id: paramId }).remove(function (err) {
									if (err) {
										cb(500, { message: "Existe un error en el Servicio" });
									} else {
										async.waterfall([
											function eliminarCotizacion(callback) {
												var cotizacionConstructor = global.db.models.cotizacion;
												cotizacionConstructor.find({ id: paramId }).remove(function (err) {
													if (err) {
														callback(500, { message: "No se pudo eliminar la cotización" });
													} else {
														callback();
													}
												})
											},
											function eliminarCentrosCosto(callback) {
												var centroCostoConstructor = global.db.models.centro_costo;
												centroCostoConstructor.find({ codigo: cotizacionCodigo }).remove(function (err) {
													if (err) {
														callback(500, { message: "No se pudo eliminar la cotización" });
													} else {
														callback();
													}
												})
											},
											function eliminarCostosImportacion(callback) {
												var parametroFactorConstructor = global.db.models.parametros_factor;
												parametroFactorConstructor.find({ cotizacion_id: paramId }).remove(function (err) {
													if (err) {
														callback(500, { message: "No se pudo eliminar la cotización" });
													} else {
														callback();
													}
												})
											}
										], function (error, results) {
											if (error == null) {
												cb(200, {})
											}
											else {
												cb(error, results)
											}
										});
									}
								});
							}
							else {
								cb(500, { message: "No puede eliminar esta cotización, esta asociada a una Orden de Compra" })
							}
						})
					}
					else {
						cb(500, { message: "No existe cotización" });
					}
				}
			})
		},
		clienteRechaza: function (userId, rolId, tenandId, paramId, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			var detalleCotizacionConstructor = global.db.models.cotizacion_detalle;
			cotizacionConstructor.get(paramId, function (err, objeto) {
				if (err) {
					cb(500, { message: "Existe un error en el Servicio" });
				} else if (objeto) {
					if (objeto.usuario_creacion != userId && rolId != 9) {
						cb(401, { message: "No tiene permiso para realizar esta acción" })
					}
					else {
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

								detalleCotizacionConstructor.find({cotizacion_id:paramId }, function (err, objDetalleCotizacion) {

									if (err) {
										cb(500, { message: err });
									}
									else {
																				
										async.each(objDetalleCotizacion, function (item, callback) {
											
											detalleCotizacionConstructor.get(item.id, function (err, obj) {
												if (err) {
													callback(500, { err: err });
												}
												else {
													if (obj) {
														
														obj.bloqueado = 1

														obj.save(function (err) {

															if (err) {
																
																callback(500, { err: err });
															}
															else {
																
																callback();

															}
														});
													}
													else {
														callback(404, { err: 'NO EXISTE DETALLE COTIZACION' });
													}

												}
											});



										}, function (errSG) {
											if (errSG) {
												cb(500, { message: "error en el servicio" })
											}
											else {
												cb(200, {})
											}
										})



									}
								})



								//cb(200, {});
							}
						});
					}
				} else {
					cb(404, { message: 'No existe la cotización' });
				}
			});
		},
		clienteAcepta: function (tenandId, userId, rolId, paramId, toUpd, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.find({ orden_compra_cliente: toUpd.orden_compra_cliente, cliente_id: toUpd.cliente_id }, function (err, objetoOrdenCompra) {
				if (err) {
					cb(500, { message: "Existe un error en el Servicio" })
				}
				else {
					var existeOrdenCompra = false
					if (objetoOrdenCompra.length > 0) {
						existeOrdenCompra = true
					}
					cotizacionConstructor.get(paramId, function (err, objeto) {
						if (err) {
							cb(500, { message: "Existe un error en el Servicio" });
						} else if (objeto) {
							if (objeto.usuario_creacion != userId && rolId != 9) {
								cb(401, { message: "No tiene permiso para realizar esta acción" })
							}
							else {
								if (objeto.estado_id == 4) {
									var fechaValida = true
									if (existeOrdenCompra) {
										var fechaCliente = toUpd.fechaAceptacionCliente;
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
									}
									else {
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
								}
								else {
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
						cb(401, { message: "Usted no creo esta cotización, no puede modificarla" })
					}
					else {
						// Se valida que la cotizacion este en el estado apropiado
						if (cotizacion.estado_id == 6) {
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
										clienteController().getById(tenandId, cotizacion.cliente_id, function (status, cliente) {
											var nombreContactoCliente
											var emailContactoCliente
											if (status == 200) {
												// Se actualiza el estado de la cotizacion
												if (cliente.length > 0) {
													if (cliente[0].contacto1 && cliente[0].contacto1 != "") {
														nombreContactoCliente = cliente[0].contacto1
													}
													if (cliente[0].email1 && cliente[0].email1 != "") {
														emailContactoCliente = cliente[0].email1
													}
												}
											}
											var datosGrabar = {
												estado_id: 7,
												contacto: nombreContactoCliente,
												email_contacto: emailContactoCliente
											}
											cotizacion.save(datosGrabar, function (error3) {
												if (error3) {
													cb(500, { message: "Ocurrió un error. Intente nuevamente en unos momentos." });
												} else {
													cb(200, {});
												}
											});
										})
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
		update: function (userId, rolId, tenandId, paramId, toUpd, cb) {
			var verificacion = {
				codigo: 200
			};
			console.log("sidhsjkhdjkhsdkjhsjkshdj")
			console.log(rolId)
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
						if (objeto.usuario_creacion != userId && rolId != 9) {
							// solo la persona que creo puede editar la cotización
							cb(401, { message: "No tiene permiso para realizar esta acción" })
						}
						else {
							var numeroCotizacion = objeto.numero
							var terminosycondiciones = (toUpd.terminos_condiciones).split("\\%").join("\%");
							var datosGrabar = {
								descripcion: toUpd.descripcion,
								cliente_id: toUpd.cliente_id,
								numero: toUpd.numero,
								//  fecha: toUpd.fecha,
								numero_oferta: toUpd.numero_oferta,
								impuestoAplicado: toUpd.impuestoAplicado,
								totalImpuestos: toUpd.totalImpuestos,
								totalAdicional: toUpd.totalAdicional,
								totalDetalle: toUpd.totalDetalle,
								moneda: toUpd.moneda,
								total: toUpd.total,
								factor: toUpd.factor,
								producto_id: toUpd.producto_id,
								terminos_condiciones: terminosycondiciones,
								poducto_type: toUpd.poducto_type,
								total_cotizacion: toUpd.total_cotizacion,
								fecha_requerimiento: toUpd.fecha_requerimiento,
								referencia: toUpd.referencia,
								impuesto_id: toUpd.impuesto_id,
								notas: toUpd.notas,
								barco: toUpd.barco,
								imo: toUpd.imo,
								porcentajeCostFinan: toUpd.porcentajeCostFinan,
								transp_callao: toUpd.transp_callao,
								comentario_oi: toUpd.comentario_oi,
								//grupo_aprobacion_id: toUpd.grupo_aprobacion_id,
								usuario_modificacion: userId,
								fecha_modificacion: new Date()
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
								datosGrabar.estado_id = 6;
								datosGrabar.fechaAceptacionCliente = toUpd.fechaAceptacionCliente;
								datosGrabar.orden_compra_cliente = toUpd.orden_compra_cliente;
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
									cotizacionDetailConstructor.find({ cotizacion_id: paramId }).remove(function (err) {
										if (err) {
											cb(500, { message: "Existe un error en el servicio" });
										} else {
											var detalleCrear = [];
											for (i = 0; i < toUpd.detalles.length; i++) {
												var detalle = toUpd.detalles[i];
												detalleCrear.push({
													cotizacion_id: paramId,
													//Agregado Aceptacion Cotizacion
													//estado_aceptacion: detalle.estado_aceptacion,
													//fecha_entrega: detalle.fecha_entrega,
													posicion: detalle.posicion,
													articulo_id: detalle.articulo_id,
													cantidad: detalle.cantidad,
													precio_unitario: detalle.precio_unitario,
													sub_total: detalle.sub_total,
													precio_unitario_factor: detalle.precio_unitario_factor,
													sub_total_factor: detalle.sub_total_factor,
													bloqueado:detalle.bloqueado
												});
											}
											cotizacionDetailConstructor.create(detalleCrear, function (err, obj) {
												if (err) {
													cb(500, { message: "Existe un error en el Servicio" });
												} else {
													ParametrosFactorController().put(tenandId, userId, toUpd.parametrosFactor, function (statusCode, result) {
														if (statusCode == 500 && result.err.message == 'Not found') {
															ParametrosFactorController().create(tenandId, userId, toUpd.parametrosFactor, function (statusCode, result) {
																cb(200, {});
															})
														} else {
															cb(200, {});
														}
													})
												}
											});
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
				"SELECT c.*,est.nombre estado_cotizacion," +
				" concat(u.nombres , ' ' , u.apellidos ) as nombre_usuario_creacion,cl.nombre nombre_cliente" +
				" FROM cotizacion c" +
				" INNER JOIN estado_cotizacion est ON c.estado_id = est.id" +
				" Inner Join cliente cl ON cl.id=  c.cliente_id" +
				" LEFT JOIN hs_usuario u ON c.usuario_creacion = u.id" +
				" WHERE c.id =?;",
				[req.params.id],
				function (err, listObj) {
					if (err) {
						cb(500, { message: "Existe un error en el servicio" });
					} else {
						if (listObj.length > 0) {
							db.driver.execQuery(
								"SELECT cd.id,cd.bloqueado, cd.cotizacion_id, cd.posicion, cd.articulo_id, cd.cantidad, cd.precio_unitario, cd.sub_total, a.codigo_articulo, a.nombre articulo, cd.estado_aceptacion, cd.precio_unitario_factor, cd.sub_total_factor,cd.fecha_entrega "
								+ "FROM cotizacion_detalle cd"
								+ " INNER JOIN articulo a ON cd.articulo_id = a.id"
								+ " WHERE cd.cotizacion_id =?;",
								[req.params.id],
								function (err, listObjDetails) {
									if (err) {
									} else {
										if (listObjDetails && listObjDetails != "") {
											listObj[0].detalles = listObjDetails
										}
										// verificar permisos de modificacion
										var permisoModificarCotizacion
										if (listObj[0].usuario_creacion != req.userId && req.rolId != 9) { // el 9 es el id del rol del master
											permisoModificarCotizacion = false
										}
										else {
											permisoModificarCotizacion = true
										}
										listObj[0].permisoModificarCoti = permisoModificarCotizacion
									}
									cb(200, listObj);
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
				"SELECT"
				+ " c.numero NumCotizacion,"
				+ " c.orden_compra_cliente,"
				+ " cli.nombre ClienteNombre,"
				+ " cli.direccion ClienteDirec1,"
				+ " cli.direccion2  ClienteDirec2,"
				+ " cli.pais ClientePais,"
				+ " cli.contacto1 contactoCliente,"
				+ " cli.email1 contactoEmail,"
				+ " DATE_FORMAT(c.fecha, '%d-%m-%Y')  FechaCotizacion,"
				+ " c.numero_oferta NumOferta,"
				+ " c.contacto contacto_coti,"
				+ " c.email_contacto email_contacto_coti,"
				+ " cli.numero_cliente ClienteNumero,"
				+ " cli.ruc ClienteRUC,"
				+ " DATE_FORMAT(c.fecha_requerimiento , '%d-%m-%Y')  FechaRequerimiento,"
				+ " c.referencia Referencia,"
				+ " CONCAT(u.nombres,' ',u.apellidos)  NombreContacto,"
				+ " u.telefono TelefonoContacto,"
				+ " u.celular CelularContacto,"
				+ " u.correo CorreoContacto,"
				+ " c.descripcion Descripcion,"
				+ " c.notas Notas,"
				+ " c.barco Barco,"
				+ " c.imo IMO,"
				+ " c.producto_id,"
				+ " c.poducto_type,"
				+ " c.moneda Moneda,"
				+ " c.totalDetalle SubTotal,"
				+ " c.totalAdicional MontoImportacion,"
				+ " c.totalDetalle - c.totalAdicional MontoExWork,"
				+ " concat(c.impuestoAplicado*100,'%') Impuesto,"
				+ " c.totalImpuestos MontoImpuesto,"
				+ " c.total_cotizacion MontoTotal,"
				+ " c.terminos_condiciones textoParametro,"
				+ " sa.id solicitud_id,"
				/*+" 'Carlos Lobos General' NombreAprobador1,"
				+" 'Alvaro Quispe' NombreAprobador2,"*/
				//+" 'Sales Support' CargoAprobador1,"
				//+" 'General Manager ' CargoAprobador2,"
				+ " CONCAT(u.nombres,' ',u.apellidos) usuarios"
				+ " FROM cotizacion c LEFT JOIN estado_cotizacion est"
				+ " ON c.estado_id = est.id LEFT JOIN cliente cli"
				+ " ON c.cliente_id = cli.id LEFT JOIN solicitud_aprobacion sa"
				+ " ON c.id = sa.entidad_id LEFT JOIN aprobacion a"
				+ " ON sa.id = a.solicitud_id LEFT JOIN hs_usuario u"
				+ " ON a.usuario_id = u.id LEFT JOIN texto_cotizacion param"
				+ " ON c.categoria_id= param.categoria_id"
				+ " WHERE c.id = ? AND (sa.estado_id=2 OR sa.estado_id = 1 ) AND est.id IN (2,3,4,5,6, 7) LIMIT 1;;",
				[paramsId],
				function (err, listObj) {
					if (err) {
						cb(500, { message: "Existe un error en el Servicio" });
					} else {
						if (listObj.length > 0) {
							listObj[0].showExWork = showExWork;
							var indexes = [], i = -1;
							while ((i = listObj[0].textoParametro.indexOf("\\n", i + 1)) != -1) {
								indexes.push(i);
							}
							if (listObj[0].contacto_coti && listObj[0].email_contacto_coti) {
								listObj[0] = JSON.parse(JSON.stringify(listObj[0]))
								listObj[0]['contactoCliente'] = listObj[0].contacto_coti
								listObj[0]['contactoEmail'] = listObj[0].email_contacto_coti
							}
							listObj[0].parametros = []
							var iniIndex = 0
							for (i = 0; i <= indexes.length; i++) {
								var valorParametro = {}
								var finIndex = i == indexes.length ? finIndex = listObj[0].length : indexes[i]
								var parametroTexto = listObj[0].textoParametro.substring(iniIndex, finIndex)
								var indexPuntos = parametroTexto.indexOf(":")
								valorParametro.texto = parametroTexto.substring(0, indexPuntos)
								valorParametro.descripcion = parametroTexto.substring(indexPuntos)
								listObj[0].parametros.push(valorParametro)
								iniIndex = indexes[i] + 2
							}
							global.db.driver.execQuery(
								"SELECT u.* FROM aprobacion ap inner join hs_usuario u on u.id=ap.usuario_id where ap.solicitud_id=?"
								, [listObj[0].solicitud_id]
								, function (err, listaUsuariosAprobacion) {
									if (err) {
										cb(500, { err: err });
									} else {
										if (listaUsuariosAprobacion.length > 0) {

											if (listaUsuariosAprobacion.length >= 1) {
												listObj[0].NombreAprobador1 = listaUsuariosAprobacion[0].nombres + " " + listaUsuariosAprobacion[0].apellidos
												listObj[0].CargoAprobador1 = listaUsuariosAprobacion[0].cargo
												listObj[0].idAprovador1 = listaUsuariosAprobacion[0].id
											}
											if (listaUsuariosAprobacion.length == 2) {
												listObj[0].NombreAprobador2 = listaUsuariosAprobacion[1].nombres + " " + listaUsuariosAprobacion[1].apellidos
												listObj[0].CargoAprobador2 = listaUsuariosAprobacion[1].cargo
												listObj[0].idAprovador2 = listaUsuariosAprobacion[1].id
											}
											listObj[0].ExisteAprobador = 1;
										} else {
											listObj[0].ExisteAprobador = 0;
										}
										db.driver.execQuery(
											"  SELECT"
											+ "  cd.posicion num,"
											+ "  a.descripcion articulo,"
											+ "  a.codigo_articulo codigo,"
											+ "  cd.cantidad cantidad,"
											+ "  a.unidad unidad,"
											+ "  cd.precio_unitario,"
											+ "  cd.precio_unitario_Factor pventa,"
											+ "  cd.precio_unitario,"
											+ "  cd.sub_total_factor sub_total_Factor,"
											+ "  cd.sub_total,"
											+ "  cd.fecha_entrega "
											+ "  FROM cotizacion_detalle cd LEFT JOIN articulo a "
											+ "  ON cd.articulo_id = a.id LEFT JOIN cotizacion c"
											+ "  ON cd.cotizacion_id=c.id"
											+ " WHERE cd.cotizacion_id = ?;",
											[paramsId],
											function (err, listObjDetails) {
												if (err) {
													cb(500, { message: "Existe un error en el Servicio" });
												} else {
													if (listObjDetails.length > 0) {
														for (i = 0; i < listObjDetails.length; i++) {
															if (listObjDetails[i].fecha_entrega) {

																var fecha_entrega_dia = listObjDetails[i].fecha_entrega.getDate() > 9 ? listObjDetails[i].fecha_entrega.getDate() : "0" + listObjDetails[i].fecha_entrega.getDate();
																var fecha_entrega_mes = (listObjDetails[i].fecha_entrega.getMonth() + 1) > 9 ? (listObjDetails[i].fecha_entrega.getMonth() + 1) : "0" + (listObjDetails[i].fecha_entrega.getMonth() + 1);
																listObjDetails[i].fecha_entrega = fecha_entrega_dia + "/" + fecha_entrega_mes + "/" + listObjDetails[i].fecha_entrega.getFullYear();
															}
															listObjDetails[i] = JSON.parse(JSON.stringify(listObjDetails[i]));
															listObjDetails[i]['num'] = (listObjDetails[i].num + 1) * 10
															listObjDetails[i]['showExWork'] = showExWork
														}
														var cantMaxDetalle = 38
														var cantOtrasPaginas = 61
														var termino = false
														var mostrarCabecera = true
														if (Math.ceil(listObjDetails.length / cantMaxDetalle) > 1) {
															var maximoParaFirmas = 55
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
															if (valorFinDetalle <= listObjDetails.length) {
																for (i = valorIniDetalle; i < valorFinDetalle; i++) {
																	if (listObjDetails[i].fecha_entrega != null) {
																		var fechaEntrega = new Date(listObjDetails[i].fecha_entrega)
																		var diaDetalle = fechaEntrega.getDate() > 9 ? fechaEntrega.getDate() : "0" + fechaEntrega.getDate()
																		var mesDetalle = fechaEntrega.getMonth() > 9 ? fechaEntrega.getMonth() + 1 : "0" + (fechaEntrega.getMonth() + 1)
																		fechaEntrega = diaDetalle + "-" + mesDetalle + "-" + fechaEntrega.getFullYear()
																	}
																	detallesPagina.push(listObjDetails[i])
																}
																if (detallesPagina.length == 0) {
																	mostrarCabecera = false
																}
															}
															else {
																ultimaPagina = false
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
																ultimaPagina = true
																if (valorFinDetalle > maximoParaFirmas) {
																	listObj[0].cantPaginas = listObj[0].cantPaginas + 1
																	datoenEnviar[0].pagina[0].cantPaginas = listObj[0].cantPaginas
																	termino = true
																}
															}
															else {
																valorFinDetalle = valorFinDetalle + cantOtrasPaginas
															}
														}
														cb(200, datoenEnviar);
													}
													else {
														cb(500, { message: "Detalle de Cotización no encontrado" });
													}
												}
											}
										);

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
				"SELECT c.total_cotizacion,c.numero,c.barco,c.imo,c.porcentajeCostFinan,c.transp_callao,pf.total_factor,c.totalDetalle,round(pf.ad_valorm_porcent*pf.igv_aduanas,2) porcvalor,pf.total_cargos_aduanas,c.total"
				+ " FROM cotizacion c"
				+ " INNER JOIN parametros_factor pf"
				+ " ON c.id=pf.cotizacion_id"
				+ " where c.id=?;",
				[paramsId],
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
				"select C.*, EC.nombre estado_cotizacion, CL.nombre cliente_nombre, "
				+ " concat(U.nombres , ' ' , U.apellidos ) as nombre_usuario_creacion"
				+ " FROM cotizacion C"
				+ " INNER JOIN estado_cotizacion EC ON C.estado_id = EC.id"
				+ " INNER JOIN cliente CL ON C.cliente_id= CL.id"
				+ " LEFT JOIN hs_usuario U ON C.usuario_creacion = U.id"
				+ " ORDER BY C.fecha DESC",
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
		},
		getAllNotClosed: function (paramsId, cb) {
			db.driver.execQuery(
				"select C.*, EC.nombre estado_cotizacion, CL.nombre cliente_nombre, "
				+ " concat(U.nombres , ' ' , U.apellidos ) as nombre_usuario_creacion"
				+ " FROM cotizacion C"
				+ " INNER JOIN estado_cotizacion EC ON C.estado_id = EC.id"
				+ " INNER JOIN cliente CL ON C.cliente_id= CL.id"
				+ " LEFT JOIN hs_usuario U ON C.usuario_creacion = U.id"
				+ " WHERE ( C.estado_id != 7  AND  C.estado_id != 8) AND (C.usuario_creacion = ? )",
				[paramsId],
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
				"SELECT *, cotizacion.numero codigo, cotizacion.id cotizacion_id  FROM cotizacion where estado_id=?",
				[estadoCotizacion.estado],
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
				cb(verificacion.codigo, { message: verificacion.texto });
			} else {
				var terminosycondiciones = (body.terminos_condiciones).split("\\%").join("\%");
				var cotizacionConstructor = global.db.models.cotizacion;
				var cotizacionACrear = {
					descripcion: body.descripcion,
					cliente_id: body.cliente_id,
					numero: body.numero,
					fecha: new Date(),
					categoria_id: 1,
					estado_id: body.estado_id,
					numero_oferta: body.numero_oferta,
					impuestoAplicado: body.impuestoAplicado,
					totalImpuestos: body.totalImpuestos,
					totalAdicional: body.totalAdicional,
					totalDetalle: body.totalDetalle,
					terminos_condiciones: terminosycondiciones,
					moneda: body.moneda,
					total: body.total,
					factor: body.factor,
					producto_id: body.producto_id,
					poducto_type: body.poducto_type,
					total_cotizacion: body.total_cotizacion,
					fecha_requerimiento: body.fecha_requerimiento,
					referencia: body.referencia,
					impuesto_id: body.impuesto_id,
					notas: body.notas,
					barco: body.barco,
					imo: body.imo,
					comentario_oi: body.comentario_oi,
					porcentajeCostFinan: body.porcentajeCostFinan,
					transp_callao: body.transp_callao,
					numero_secuencia: body.numero_secuencia,
					usuario_creacion: userId,
					fecha_creacion: new Date()
					//,grupo_aprobacion_id: body.grupo_aprobacion_id
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
							for (i = 0; i < body.detalles.length; i++) {
								var detalle = body.detalles[i];
								if (detalle.codigo_articulo && detalle.codigo_articulo != "") {
									cotizacionDetalleConstructor.create({
										cotizacion_id: cotizacionId,
										posicion: detalle.posicion,
										articulo_id: detalle.articulo_id,
										cantidad: detalle.cantidad,
										precio_unitario: detalle.precio_unitario_factor,
										sub_total: detalle.sub_total_factor,
										precio_unitario_factor: detalle.precio_unitario_factor,
										sub_total_factor: detalle.sub_total_factor
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
								// Se debe eliminar la cotizacion creada y los detalles que llegaron a ser creados
								for (detalle in detallesCreadosId) {
									// Eliminacion de los detalles creados
									cotizacionDetalleConstructor.findOneAndRemove({ id: detalle.id, tenant: tenandId }, function (err) { });
								}
								cb(500, { message: "Existe un error en el Servicio" });
							} else {
								// Creacion correcta
								body.parametrosFactor.cotizacion_id = cotizacionId
								ParametrosFactorController().create(tenantId, userId, body.parametrosFactor, function (statusCode, result) {
									cb(200, objCotizacion);
								})
							}
						} else {
							cb(500, { message: "Existe un error en el Servicio" });
						}
					}
				});
			}
		},
		// cronjob lo ejecuta para las cotizaciones vencidas
		BloquearCotizacion: function (cb) {
			db.driver.execQuery(
				"select * "
				+ " from cotizacion"
				+ " where fecha_vencimiento<now()",
				[],
				function (err, listObj) {
					if (err) {
						cb(500, { message: "Existe un error en el Servicio" });
					} else {
						if (listObj.length > 0) {
							for (i = 0; i < listObj.length; i++) {
								db.driver.execQuery(
									"UPDATE cotizacion SET estado_id=8 WHERE id=?;",
									[listObj[i].id],
									function (err, listCotiBloqueo) {
										if (err) {
											cb(500, { message: "Existe un error en el Servicio" });
										} else {
											if (listCotiBloqueo.length > 0) {
												cb(200, {});
											} else {
												cb(500, { message: 'La cotizacion no pudo ser bloqueada' });
											}
										}
									}
								);
							}
							//   cb(200,{});
						} else {
							cb(500, { message: 'No existen cotizaciones Vencidas' });
						}
					}
				}
			);
		},
		CancelarCotizacion: function (tenantId, userId, rolId, paramId, cb) {
			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: "Error en el Servicio" });
				}
				else {
					if (obj) {
						if (obj.usuario_creacion != userId && rolId != 9) {
							cb(401, { message: "No tiene permiso para realizar esta acción" })
						}
						else {
							if (obj.estado_id == 7 || obj.estado_id == 6) {
								obj.fecha_cancelacion_cliente = new Date()
							}
							obj.estado_id = 8,
								obj.usuario_modificacion = userId,
								obj.fecha_modificacion = new Date()
							// save the user
							obj.save(function (err) {
								if (err) {
									cb(500, { err: "Error en el Servicio" });
								}
								else {
									cb(200, { id: obj.id });
								}
							});
						}
					}
					else {
						cb(404, { err: 'No existe Cuenta Contable' });
					}
				}
			});
		},
	}
}