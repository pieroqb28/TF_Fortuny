var AprobacionController = require('../controller/AprobacionController');
var GrupoController = require('../controller/GrupoAprobacionController');
var notificacion = require('./NotificacionController');
module.exports = function () {

	function validarSolicitudCliente(solicitud, cb) {
		/* SE DEBE VALIDAR QUE LA SOLICITUD TENGA LOS DATOS Y QUE EL CLIENTE ESTE EN EL ESTADO APROPIADO */

		if (!solicitud) {
			cb(400, { texto: "SOLICITUD NULA" });
		} else if (!(solicitud.tipo_aprobacion_id && solicitud.grupo_aprobacion_id && solicitud.usuario_creacion && solicitud.entidad_id)) {
			cb(400, { texto: "SOLICITUD SIN DATOS BASICOS" });
		} else {
			var clienteConstructor = global.db.models.cliente;
			clienteConstructor.find({ id: solicitud.entidad_id }, function (err, objCliente) {
				if (err) {
					cb(500, { err: err });
				} else {
					if (objCliente) {
						if (objCliente[0].estado_usuario == 1 || objCliente[0].estado_usuario == 3) {
							cb(200, { cliente: objCliente[0] });
						} else {
							cb(404, { texto: "CLIENTE NO VALIDO" });
						}
					} else {
						cb(404, { texto: "CLIENTE NO ENCONTRADO" });
					}
				}
			});
		}
	};

	function validarClienteExistente(datos, cb) {
		/* SE DEBE VALIDAR QUE EL CLIENTE EXISTA, QUE LA SOLICITUD EXISTA Y QUE ESTEN EN LOS ESTADOS APROPIADOS */
		if (!(datos.cliente_id && datos.solicitud_id && datos.usuario_id)
			&& (datos.cliente_id > 0)
			&& (datos.solicitud_id > 0)
			&& (datos.usuario_id > 0)
			&& (datos.aprobar === 0 || datos.aprobar === 1)) { 	// Validacion de existencia y no nulidad de datos
			cb(400, { texto: "DATOS ERRONEOS" });

		} else {

			db.driver.execQuery(
				/*
								"SELECT C.id "
								+ "FROM cliente C"
								+ " INNER JOIN solicitud_aprobacion S ON S.id = C.solicitud_id AND S.entidad_id = C.id"
								+ "  inner JOIN Aprobacion AP on s.id = ap.solicitud_id"
								+ " INNER JOIN hs_usuario_x_grupo_aprobacion UG  ON AP.grupoAprobacion_id = UG.grupo_id "
								+ "WHERE C.estado_usuario = 2"
								+ " AND S.estado_id = 1"
								+ " AND UG.usuario_id = ?"
								+ " AND C.id = ?"
								+ " AND S.id = ?;"*/
				"SELECT " +
				"C.id " +
				"FROM " +
				"cliente C " +
				"INNER JOIN " +
				"solicitud_aprobacion S ON ( S.id = C.solicitud_id AND S.entidad_id = C.id) " +
				"WHERE " +
				"C.estado_usuario = 2 AND S.estado_id = 1 " +
				"AND C.id = ? " +
				"AND S.id = ?; "
				,
				[datos.cliente_id, datos.solicitud_id],
				function (err, result) {
					if (err) {
						cb(400, { texto: "DATOS ERRONEOS" });
					} else {

						if (result && result != "") {

							cb(200, {});
						} else {

							cb(400, { texto: "SOLICITUD ERRONEA" });
						}
					}
				}
			);
		}
	}

	return {

		create: function (userid, datos, cb) {
			datos.usuario_creacion = userid;
			datos.tipo_aprobacion_id = 1; // Tipo: clientes
			var grupoAprobacionConstructor = global.db.models.grupo_aprobacion;
			grupoAprobacionConstructor.find({ tipo_aprobacion_id: 1 }, function (err, grupoDatos) {
				if (err) {
					cb(500, { message: err, code: '1002' });
				} else if (grupoDatos && grupoDatos[0]
					&& grupoDatos[0].tipo_aprobacion_id
					&& grupoDatos[0].tipo_aprobacion_id == 1) {
					datos.grupo_aprobacion_id = grupoDatos[0].id;
					validarSolicitudCliente(datos, function (codigo, obj) {
						if (codigo != 200) {
							cb(codigo, { message: obj.texto, code: '1003' });
						} else {
							AprobacionController().create(userid, datos, function (codigo, objeto) {
								if (codigo == 200) {

									// Se debe actualizar el estado del cliente
									var clienteConstructor = global.db.models.cliente;
									clienteConstructor.find({ id: datos.entidad_id }, function (err, objCliente) {
										if (err) {
											cb(500, { message: err, code: '1004' });
										} else if (objCliente && objCliente.length > 0) {
											objCliente[0].estado_usuario = 2;
											objCliente[0].solicitud_id = objeto.id;

											objCliente[0].save(function (err) {
												if (err) {
													cb(500, { message: err, code: '1005' });
												} else {
													//notificar
													notificacion().notificaciondeAprobacion(objeto.id, function (status, result) {
													});
													cb(200, {});
												}
											})
										} else {
											cb(500, { message: 'CLIENTE NO ENCONTRADO', code: '1006' });
										}
									});
								} else {
									cb(codigo, { message: objeto.message, code: objeto.code });
								}
							});
						}
					});
				} else {
					cb(500, { message: 'GRUPO APROBADOR NO ENCONTRADO', code: '1008' });
				}
			});


		},

		getbyId: function (req, res, cb) {

			var solicitudAprobacionConstructor = global.db.models.solicitud_aprobacion;
			solicitudAprobacionConstructor.find({ id: req.params.id }, function (err, solicitudDatos) {
				if (err) {
					cb(500, { message: 'ERROR EN EL SERVICIO' });
				} else {
					if (solicitudDatos) {
						var aprobacionConstructor = global.db.models.aprobacion;
						aprobacionConstructor.find({ solicitud_id: req.params.id }, function (err, aprobacionDatos) {
							if (err) {
								cb(500, { message: 'ERROR EN EL SERVICIO' });
							} else {
								solicitudDatos.aprobaciones = aprobacionDatos;
								cb(200, solicitudDatos);
							}
						});
					} else {
						cb(404, { message: 'NO EXISTE LA SOLICITUD' });
					}
				}
			});
		},

		// Este servicio es "Aprobar"
		update: function (userId, tenandId, paramId, toUpd, res, cb) {
			toUpd.usuario_id = userId;
			validarClienteExistente(toUpd, function (codigo, obj) {
				if (codigo != 200) {
					cb(codigo, { message: obj.texto });
				} else {
					AprobacionController().approve(toUpd.solicitud_id, toUpd.usuario_id, toUpd.aprobar, toUpd.razon_rechazo, function (codigo, objeto) {
						if (codigo != 200) {
							cb(codigo, { message: objeto.message });
						} else {
							notificacion().notificaciondeAprobacion(toUpd.solicitud_id, function (status, result) {
							});
							var estado = 0;
							if (toUpd.aprobar === 0) {
								// Si se rechazo la solicitud, se debe actualizar como rechazado al cliente
								estado = 3;
							} else if (toUpd.aprobar == 1 && objeto.finalizado == 1) {
								// Si se aprueba la solicitud y es la ultima aprobacion necesaria, se debe actualizar como aprobado al cliente
								estado = 4;
							}

							if (estado != 0) {
								// Se actualiza el estado del cliente
								//notificar
								notificacion().notificaciondeAprobacion(toUpd.solicitud_id, function (status, result) {
								});
								var clienteConstructor = global.db.models.cliente;
								clienteConstructor.find({ id: toUpd.cliente_id }, function (err, objCliente) {
									if (err) {
										cb(500, { message: err });
									} else if (objCliente && objCliente.length > 0) {

										objCliente[0].estado_usuario = estado;

										objCliente[0].save(function (err) {
											if (err) {
												cb(500, { message: err });
											} else {
												cb(200, { cambio: 1 });
											}
										})
									} else {
										cb(500, { message: 'CLIENTE NO ENCONTRADO' });
									}
								});
							} else {
								cb(200, { cambio: 0 });
							}
						}
					});
				}
			});
		}

	};

};