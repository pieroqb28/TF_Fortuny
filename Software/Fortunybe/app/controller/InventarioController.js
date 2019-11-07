module.exports = function () {
	function validarData(registro, cb) {
		if (!registro) {
			console.log("data nula");
			cb(400, { message: "Data nula." });
		} else if (!(registro.fecha && registro.inventario_tipo_origen_id && registro.entidad_id && registro.articulo_id
			&& registro.inventario_tipo_operacion_id && registro.cantidad && registro.costo_unitario)) {
			console.log("Faltan datos Basicos");
			cb(400, { message: "Faltan datos básicos." });
		} else if (!registro.id) {
			// Si se va a registrar, Validar que la fecha no corresponda a un mes cerrado
			// Esto no se hace si es que se va a actualizar un registro existente (es decir,
			// si tiene id) puesto que en ese caso la fecha a validar debe ser la del registro
			var mes = (registro.fecha).getMonth() + 1;
			var anio = registro.fecha.getFullYear();
			var inventarioMesConstructor = global.db.models.inventario_mes;
			inventarioMesConstructor.find({ mes: mes, anio: anio }, function (err, listaMes) {
				if (err) {
					console.log(err)
					cb(500, { message: "Error: intente nuevamente en unos minutos." });
				} else if (listaMes) {
					var mes = listaMes[0];
					if (mes.cerrado_inventario == 1) {
						console.log("el mes especificado ya fue cerrado");
						cb(400, { message: "El mes especificado ya fue cerrado." });
					} else {
						cb(200, {});
					}
				} else {
					console.log(500, "intente nuevamente en unos minutos");
					cb(500, { message: "Error: intente nuevamente en unos minutos." });
				}
			})
		}
	}
	return {

		registroDocumentoManual: function (userid, documentoManual, cb) {
			if (!userid || !documentoManual) {
				cb(500, { message: "Faltan Datos" });
			} else {
				var regDocManConstructor = global.db.models.inventario_documento_manual;
				var objGuardar = {
					numero: documentoManual.numero,
					serie: documentoManual.serie,
					fecha_creacion: new Date(),
					user_id: userid
				}
				regDocManConstructor.create(objGuardar, function (err, savedObject) {
					if (err) {
						console.log(err);
						cb(500, { message: err });
					} else {
						cb(200, savedObject)
					}
				})
			}
		},
		/*
		Funcion usada para entradas y salidas del inventario.
		En caso de salidas, la cantidad sera expresada en negativo
		Esto hace referencia a:
		objInventario.cantidad (un valor de -5 indica que es salida de 5 articulos)
		*/
		registroInventario: function (tenandId, userid, objInventario, cb) {
			validarData(objInventario, function (code, rpta) {
				if (code != 200) {
					console.log(code,rpta);
					cb(code, rpta);
				} else {
					var inventarioConstructor = global.db.models.inventario;
					objInventario.costo_total = parseFloat((objInventario.cantidad * objInventario.costo_unitario).toFixed(2));
					if (objInventario.inventario_id && objInventario.inventario_id > 0) {
						// El traslado ya fue registrado;
						// Se debe modificar dicho registro y actualizar todos
						// los registros a partir de ese hasta la fecha actual
						console.log("inventario id",objInventario.inventario_id);
						inventarioConstructor.get(objInventario.inventario_id, function (err1, objeto) {
							if (err1) {
								console.log(500, err1);
								cb(500, { message: "Error: intente nuevamente en unos minutos." });
							} else {
								// Validar que la fecha del registro no este cerrada
								var mes = objeto.fecha.getMonth() + 1;
								var anio = objeto.fecha.getFullYear();
								var inventarioMesConstructor = global.db.models.inventario_mes;
								inventarioMesConstructor.find({ mes: mes, anio: anio }, function (err, listaMes) {
									if (err) {
										cb(500, { message: "Error: intente nuevamente en unos minutos." });
									} else if (listaMes) {
										var mes = listaMes[0];
										if (mes.cerrado_inventario == 1) {
											console.log("Entro en El mes especificado ya fue cerrado");
											//cb(400, { message: "El mes especificado ya fue cerrado." });
											//Realizar el ajuste, es decir actualizar costos sin afectar la tabla, y despues calcular la diferencia con lo real actual

											global.db.driver.execQuery(
												"SELECT id, cantidad, costo_unitario, costo_total, " +
												"final_cantidad, final_costo_unitario, final_costo_total " +
												"FROM inventario " +
												"WHERE id >= ? AND articulo_id = ? "
												, [objInventario.id, objInventario.articulo_id], function (err, listartAjustar) {
													if (err) {
														console.log(err);
														cb(500, { message: "Error: intente nuevamente en unos minutos." });
													} else {
														//objeto -> Datos del inventario
														//objInventario -> Datos nuevos
														// Se actualizan los datos del registro
														var nuevosDatos = {
															cantidad: objInventario.cantidad,
															costo_unitario: parseFloat((objInventario.costo_unitario).toFixed(2)),
															costo_total: objInventario.costo_total,
															final_cantidad: parseFloat((objeto.final_cantidad - objeto.cantidad + objInventario.cantidad).toFixed(2)),
															final_costo_total: parseFloat((objeto.final_costo_total - objeto.costo_total + objInventario.costo_total).toFixed(2)),
															usuario_modificacion: userid,
															fecha_modificacion: new Date()
														}
														nuevosDatos.final_costo_unitario = parseFloat((nuevosDatos.final_costo_total / nuevosDatos.final_cantidad).toFixed(2));
														objeto.save(nuevosDatos, function (err2) {
															if (err2) {
																cb(500, { message: "Error: intente nuevamente en unos minutos." });
															} else {
																//Se copia la informacion a la tabla temp_inventario_ajuste
																global.db.driver.execQuery(
																	"INSERT INTO temp_inventario_ajuste " +
																	"SELECT * FROM inventario WHERE id >= ? AND articulo_id = ? "
																	, [objeto.id, objeto.articulo_id], function (err, result) {
																		if (err) {
																			console.log(err);
																			cb(500, { message: "Ha ocurrido un error" })
																		} else {
																			//Se realiza el ajuste sobre la tabla temporal
																			global.db.driver.execQuery("CALL usp_actualiza_costos_ajuste(?, ?);", [objeto.id, objeto.articulo_id], function (err, ajuste) {
																				if (err) {
																					console.log(err);
																					cb(500, { message: "Ha ocurrido un error" });
																				} else {
																					//Se obtiene los datos del ultimo Registro, SE INGRESA EL AJUSTE y se procede al final a eliminar los registros
																					global.db.driver.execQuery(
																						"SELECT * FROM temp_inventario_ajuste WHERE articulo_id = ? order by id DESC LIMIT 1 ; ",
																						[objeto.articulo_id],
																						function (err, ajustado) {
																							if (err) {
																								console.log(err);
																								cb(500, { message: "Error" });
																							} else {
																								var filaInsertar = ajustado[0];
																								var insertarAjuste = global.db.models.inventario;
																								var detalleAjuste = {
																									cantidad: 0,
																									inventario_tipo_origen_id: 4,
																									entidad_id: objInventario.entidad_id,
																									fecha: new Date(),
																									inventario_tipo_documento_id: objInventario.inventario_tipo_documento_id,
																									inventario_documento_id: objInventario.inventario_documento_id,
																									articulo_id: objInventario.articulo_id,
																									inventario_tipo_operacion_id: 99,
																									costo_unitario: filaInsertar.costo_unitario,
																									costo_total: filaInsertar.costo_total,
																									final_cantidad: filaInsertar.final_cantidad,
																									final_costo_unitario: filaInsertar.final_costo_unitario,
																									final_costo_total: filaInsertar.final_costo_total,
																									fecha_creacion: new Date(),
																									usuario_creacion: objInventario.usuario_creacion,
																								}
																								insertarAjuste.create(detalleAjuste, function (err) {
																									if (err) {
																										console.log(err);
																										cb(500, { message: "error" });
																									} else {
																										global.db.driver.execQuery(
																											"DELETE FROM temp_inventario_ajuste WHERE articulo_id = ?", [objeto.articulo_id],
																											function (err, result) {
																												if (err) {
																													console.log(err)
																													cb(500, { message: "Ocurrio un error" });
																												} else {
																													cb(200, {});
																												}

																											}
																										)

																									}
																								});

																							}
																						}
																					)

																				}

																			});

																		}
																	}
																)

															}
														})
													}

												})

										} else {
											// Se actualizan los datos del registro
											var nuevosDatos = {
												cantidad: objInventario.cantidad,
												costo_unitario: parseFloat((objInventario.costo_unitario).toFixed(2)),
												costo_total: objInventario.costo_total,
												final_cantidad: parseFloat((objeto.final_cantidad - objeto.cantidad + objInventario.cantidad).toFixed(2)),
												final_costo_total: parseFloat((objeto.final_costo_total - objeto.costo_total + objInventario.costo_total).toFixed(2)),
												usuario_modificacion: userid,
												fecha_modificacion: new Date()
											}
											nuevosDatos.final_costo_unitario = parseFloat((nuevosDatos.final_costo_total / nuevosDatos.final_cantidad).toFixed(2));
											objeto.save(nuevosDatos, function (err2) {
												if (err2) {
													console.log(500, err2);
													cb(500, { message: "Error: intente nuevamente en unos minutos." });
												} else {
													// Actualizacion de los registros a partir de la fecha actual
													// El proceso se realiza en 2do plano
													global.db.driver.execQuery("CALL usp_actualiza_costos(?, ?);", [objeto.id, objeto.articulo_id]);
													cb(200, {});
												}
											})
										}
									} else {
										cb(500, { message: "Error: intente nuevamente en unos minutos." });
									}
								});
							}
						});
					} else {
						/*
						Nuevo registro
						Se obtiene el ultimo registro del articulo
						*/
						var query = "SELECT *"
							+ " FROM inventario WHERE articulo_id = " + objInventario.articulo_id
							+ " ORDER BY fecha DESC LIMIT 0,1;";
						global.db.driver.execQuery(query, [], function (err, resultados) {
							if (err) {
								cb(500, { message: "Error: intente nuevamente en unos minutos." });
							} else {
								var ultimoRegistro = null
								if (resultados && resultados.length > 0) {
									ultimoRegistro = resultados[0];
								} else {
									// Si el articulo aun no existe en el inventario
									ultimoRegistro = {
										final_cantidad: 0,
										final_costo_unitario: 0,
										final_costo_total: 0
									}
								}
								// CALCULO DE NUEVA CANTIDAD
								objInventario.final_cantidad = ultimoRegistro.final_cantidad + objInventario.cantidad;
								// CALCULO DE NUEVO COSTO TOTAL
								objInventario.final_costo_total = parseFloat((ultimoRegistro.final_costo_total + objInventario.costo_total).toFixed(2));
								/*
								if (objInventario.cantidad && (objInventario.cantidad > 0 || objInventario.cantidad < 0)){
								// Si estan ingresando o saliendo productos
								objInventario.final_costo_total = ultimoRegistro.final_costo_total + (objInventario.cantidad * objInventario.costo_unitario);
								}else{
								// Ajuste de precio (objInventario.cantidad debe ser 0)
								objInventario.final_costo_total = ultimoRegistro.final_costo_total + objInventario.costo_total;
								}
								*/
								// CALCULO DE NUEVO COSTO UNITARIO
								if (objInventario.final_cantidad > 0) {
									if (objInventario.cantidad > 0) {
										// Ingreso
										objInventario.final_costo_unitario = objInventario.final_costo_total / objInventario.final_cantidad;
									} else {
										// Egreso
										objInventario.final_costo_unitario = ultimoRegistro.final_costo_unitario;
										objInventario.costo_unitario = ultimoRegistro.final_costo_unitario;
										objInventario.costo_total = parseFloat((objInventario.cantidad * objInventario.costo_unitario).toFixed(2));
										objInventario.final_costo_total = parseFloat((ultimoRegistro.final_costo_total + objInventario.costo_total).toFixed(2));
									}
									objInventario.final_costo_unitario = parseFloat((objInventario.final_costo_unitario).toFixed(2));
								} else {
									// No hay stock
									objInventario.final_costo_unitario = 0;
								}
								// Se graba el registro
								objInventario.usuario_creacion = userid;
								objInventario.fecha_creacion = new Date();
								inventarioConstructor.create(objInventario, function (error, inventarioCreado) {
									if (error) {
										console.log(500, error);
										cb(500, { message: "Error: intente nuevamente en unos minutos." });
									} else {
										cb(200, inventarioCreado);
									}
								});
							}
						});
					}
				}
			});
		},
		reporteKardex: function (params, cb) {

			var cerrarInt = 0;
			if (params.cerrar != null && params.cerrar != "false") {
				cerrarInt = 1
			}
			if (params && params.periodo && cerrarInt != null) {
				var inventarioMesConstructor = global.db.models.inventario_mes;
				// Se debe ejecutar el procedimiento usp_reporte_kardex para obtener
				// la data de dicho mes. El procedimiento inserta automaticamente
				// esta data en la tabla y actualiza el mes a "cerrado" si no lo esta;
				var anio = params.periodo.substring(3, 7);
				var mes = parseInt(params.periodo.substring(0, 2)) - 1;
				var fecha = new Date(anio, mes, 1);
				global.db.driver.execQuery("CALL usp_reporte_kardex(?, ?);", [fecha, cerrarInt], function (err, resultado) {
					if (err) {
						console.log(err);
						cb(500, { message: "Error: intente nuevamente en unos minutos." });
					} else {
						var totalizados = { ingreso_cantidad: 0, ingreso_costo: 0, egreso_cantidad: 0, egreso_costo: 0, final_costo: 0 };
						/* Se arma la estructura de articulos */
						var idArticuloAnterior = 0;
						var articulo = {};
						var articulos = [];
						var lista = resultado[0];
						for (var i = 0; i < lista.length; i++) {
							totalizados.ingreso_cantidad += Number(lista[i].ingreso_cantidad);
							totalizados.ingreso_costo += Number(lista[i].ingreso_costo_total);
							totalizados.egreso_cantidad += Number(lista[i].egreso_cantidad);
							totalizados.egreso_costo += Number(lista[i].egreso_costo_total);

							if (lista[i].articulo_id != idArticuloAnterior) {
								/* Cambio de articulo */
								/* Se agrega el ultimo articulo*/
								if (articulo.codigo) {
									articulo.total_ingreso_cantidad = Number(articulo.total_ingreso_cantidad);
									articulo.total_ingreso_costo = Number(articulo.total_ingreso_costo);
									articulo.total_egreso_cantidad = Number(articulo.total_egreso_cantidad);
									articulo.total_egreso_costo = Number(articulo.total_egreso_costo);
									totalizados.final_costo += Number(articulo.lineas[(articulo.lineas.length - 1)].final_costo_total);
									articulos.push(articulo);

								}
								articulo = {
									codigo: lista[i].codigo_articulo,
									descripcion: lista[i].nombre,
									tipo: lista[i].tipo_articulo,
									unidad_medida: lista[i].unidad,
									total_ingreso_cantidad: 0,
									total_ingreso_costo: 0,
									total_egreso_cantidad: 0,
									total_egreso_costo: 0,
									lineas: []
								}
							} else {
								/* Se sigue en el mismo articulo */
							}
							if (lista[i].ingreso_cantidad)
								articulo.total_ingreso_cantidad = Number(articulo.total_ingreso_cantidad) + Number(lista[i].ingreso_cantidad);
							if (lista[i].ingreso_costo_total)
								articulo.total_ingreso_costo = Number(articulo.total_ingreso_costo) + Number(lista[i].ingreso_costo_total);
							if (lista[i].egreso_cantidad)
								articulo.total_egreso_cantidad = Number(articulo.total_egreso_cantidad) + Number(lista[i].egreso_cantidad);
							if (lista[i].egreso_costo_total)
								articulo.total_egreso_costo = Number(articulo.total_egreso_costo) + Number(lista[i].egreso_costo_total);

							lista[i].ingreso_costo_unitario = parseFloat(Number(lista[i].ingreso_costo_unitario)).toFixed(2);
							lista[i].ingreso_costo_total = parseFloat(Number(lista[i].ingreso_costo_total)).toFixed(2);
							lista[i].egreso_costo_unitario = parseFloat(Number(lista[i].egreso_costo_unitario)).toFixed(2);
							lista[i].egreso_costo_total = parseFloat(Number(lista[i].egreso_costo_total)).toFixed(2);
							lista[i].final_costo_unitario = parseFloat(Number(lista[i].final_costo_unitario)).toFixed(2);
							lista[i].final_costo_total = parseFloat(Number(lista[i].final_costo_total)).toFixed(2);

							articulo.lineas.push(lista[i]);
							idArticuloAnterior = lista[i].articulo_id;
						}
						/* Se agrega el ultimo articulo si tiene data*/
						if (articulo.codigo) {
							articulo.total_ingreso_cantidad = Number(articulo.total_ingreso_cantidad);
							articulo.total_ingreso_costo = Number(articulo.total_ingreso_costo);
							articulo.total_egreso_cantidad = Number(articulo.total_egreso_cantidad);
							articulo.total_egreso_costo = Number(articulo.total_egreso_costo);
							totalizados.final_costo += Number(articulo.lineas[(articulo.lineas.length - 1)].final_costo_total);
							articulos.push(articulo);
						}

						var datosArticulos = []
						datosArticulos[0] = [{ a: 1 }, { b: 2 }, { c: 3 }]
						datosArticulos[1] = [{ a: 4 }, { b: 5 }, { c: 6 }]
						var articuloActual = 0
						var primeraHoja = true

						console.log(articulos.length)
						for (var i = 0; i < articulos.length; i++) {
							var agruparArticulos = []
							var indexArticulo = i
							if (primeraHoja) {
								var maximoHoja = 2
								primeraHoja = false
							}
							else {
								var maximoHoja = 3
							}
							var totalLineas
							var totalAgregados = 0

							for (j = 0; j < maximoHoja; j++) {
								if (articulos[indexArticulo]) {
									totalLineas = articulos[indexArticulo].lineas.length
									agruparArticulos.push(articulos[indexArticulo])

								}

								if (totalLineas > 1) {
									j++
								}
								indexArticulo++
							}


							if (agruparArticulos.length > 0) {
								datosArticulos[articuloActual] = agruparArticulos
								articuloActual++
							}
							i = (indexArticulo - 1)

						}

						var monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"];
						var periodo = monthNames[fecha.getMonth()] + '-' + anio.substring(2);
						var data = {
							articulos: datosArticulos,
							periodo: periodo,
							entity: '',
							ruc: '',
							totales: totalizados
						};

						var paramConstructor = global.db.models.hs_parametros;
						paramConstructor.find({ or: [{ nombreParam: 'entity' }, { nombreParam: 'ruc' }] }, function (err, listParam) {
							if (listParam) {
								for (var p = 0; p < listParam.length; p++) {
									if (listParam[p].nombreParam == 'entity') {
										data.entity = listParam[p].valorParam;
									} else if (listParam[p].nombreParam == 'ruc') {
										data.ruc = listParam[p].valorParam;
									}
								}
							}

							cb(200, [data]);
						});
					}
				});
			} else {
				cb(400, { message: "Incorrecto formato de datos." });
			}
		},
		getAll: function (cb) {
			global.db.driver.execQuery(
				"SELECT " +
				"IF(inventario.inventario_tipo_origen_id = 1, " +
				"carpeta_importacion.codigo, " +
				"IF(inventario.inventario_tipo_origen_id = 2 " +
				"OR inventario.inventario_tipo_origen_id = 3, " +
				"CONCAT(factura.serie, " +
				"' - ', " +
				"factura.num_factura), " +
				"IF(inventario.inventario_tipo_origen_id = 20, " +
				"despacho.codigo, " +
				"0))) AS codigo, " +
				"inventario_tipo_documento.descripcion AS tipo_documento, " +
				"inventario_tipo_operacion.nombre AS tipo_operacion, " +
				"articulo.descripcion AS articulo, " +
				"articulo.codigo_articulo, " +
				"ABS(inventario.cantidad) as cantidad, " +
				"inventario.costo_unitario, " +
				"inventario.costo_total, " +
				"inventario.fecha " +
				"FROM " +
				"inventario " +
				"LEFT JOIN " +
				"inventario_tipo_origen ON inventario.inventario_tipo_origen_id = inventario_tipo_origen.id " +
				"LEFT JOIN " +
				"carpeta_importacion ON inventario.entidad_id = carpeta_importacion.id " +
				"LEFT JOIN " +
				"factura ON inventario.entidad_id = factura.id " +
				"LEFT JOIN " +
				"despacho ON inventario.entidad_id = despacho.id " +
				"LEFT JOIN " +
				"inventario_tipo_documento ON inventario.inventario_tipo_documento_id = inventario_tipo_documento.id " +
				"LEFT JOIN " +
				"inventario_tipo_operacion ON inventario.inventario_tipo_operacion_id = inventario_tipo_operacion.id " +
				"LEFT JOIN " +
				"articulo ON inventario.articulo_id = articulo.id " +
				"ORDER BY inventario.fecha  DESC "
				, []
				, function (err, listInventarios) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (listInventarios) {
							cb(200, listInventarios);
						} else {
							cb(404, { message: "NO SE HA ENCONTRADO INVENTARIOS REGISTRADOS" });
						}
					}
				}
			);
		},
		getTipoDocumento: function (cb) {
			global.db.driver.execQuery(
				"SELECT * from inventario_tipo_documento"
				, []
				, function (err, listTipoDocumentos) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (listTipoDocumentos.length > 0) {
							cb(200, listTipoDocumentos);
						} else {
							cb(404, { message: "NO SE HA ENCONTRADO TIPO DOCUMENTOS" });
						}
					}
				}
			);
		},
		getTipoOperacion: function (cb) {
			global.db.driver.execQuery(
				"SELECT * from inventario_tipo_operacion"
				, []
				, function (err, listTipoOperacion) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (listTipoOperacion.length > 0) {
							cb(200, listTipoOperacion);
						} else {
							cb(404, { message: "NO SE HA ENCONTRADO TIPO OPERACION" });
						}
					}
				}
			);
		},
		getTipoOrigen: function (cb) {
			global.db.driver.execQuery(
				"SELECT * from inventario_tipo_origen"
				, []
				, function (err, listTipoOrigen) {
					if (err) {
						cb(500, { err: err });
					} else {
						if (listTipoOrigen.length > 0) {
							cb(200, listTipoOrigen);
						} else {
							cb(404, { message: "NO SE HA ENCONTRADO TIPO ORIGEN" });
						}
					}
				}
			);
		}
	}
};