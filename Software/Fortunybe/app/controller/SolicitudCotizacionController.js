var AprobacionController = require('../controller/AprobacionController');
var GrupoController = require('../controller/GrupoAprobacionController');
var notificacion = require('./NotificacionController');

module.exports = function () {

	function validarSolicitudCotizacion(solicitud, cb) {
		/* SE DEBE VALIDAR QUE LA SOLICITUD TENGA LOS DATOS Y QUE LA COTIZACION ESTE EN EL ESTADO APROPIADO */

		if (!solicitud) {
			cb(400, { texto: "SOLICITUD NULA" });
		} else if (!(solicitud.tipo_aprobacion_id && solicitud.grupo_aprobacion_id && solicitud.usuario_creacion && solicitud.entidad_id)) {
			cb(400, { texto: "SOLICITUD SIN DATOS BASICOS" });
		} else {

			var cotizacionConstructor = global.db.models.cotizacion;
			cotizacionConstructor.find({ id: solicitud.entidad_id }, function (err, objCotizacion) {
				if (err) {
					cb(500, { err: err });
				} else {
					if (objCotizacion) {
						if (objCotizacion[0].estado_id == 1 || objCotizacion[0].estado_id == 3 || objCotizacion[0].estado_id == 5) {
							cb(200, { cotizacion: objCotizacion[0] });
						} else {
							cb(404, { texto: "COTIZACION NO VALIDA" });
						}
					} else {
						cb(404, { texto: "COTIZACION NO ENCONTRADA" });
					}
				}
			});
		}
	};

	function validarCotizacionExistente(datos, cb) {


		/* SE DEBE VALIDAR QUE LA COTIZACION EXISTA, QUE LA SOLICITUD EXISTA Y QUE ESTEN EN LOS ESTADOS APROPIADOS */
		if (!(datos.cotizacion_id && datos.solicitud_id && datos.usuario_id)
			&& (datos.cotizacion_id > 0)
			&& (datos.solicitud_id > 0)
			&& (datos.usuario_id > 0)
			&& (datos.aprobar === 0 || datos.aprobar === 1)) { 	// Validacion de existencia y no nulidad de datos
			cb(400, { texto: "DATOS ERRONEOS" });
		} else {
			/*
			var query = 
				"SELECT C.id "
				+ "FROM cotizacion C"
				+ " INNER JOIN solicitud_aprobacion S ON S.id = C.solicitud_id AND S.entidad_id = C.id"
				+ " inner JOIN Aprobacion AP on s.id = ap.solicitud_id"
				+ " INNER JOIN hs_usuario_x_grupo_aprobacion UG ON AP.grupoAprobacion_id = UG.grupo_id "
				+ "WHERE C.estado_id = 2"
				+ " AND S.estado_id = 1"
				+ " AND UG.usuario_id = " + datos.usuario_id
				+ " AND C.id = " + datos.cotizacion_id
				+ " AND S.id = " + datos.solicitud_id + ";";
				*/
			var query =
				"SELECT C.id "
				+ "FROM cotizacion C"
				+ " INNER JOIN solicitud_aprobacion S ON S.id = C.solicitud_id AND S.entidad_id = C.id "
				+ "WHERE C.estado_id = 2"
				+ " AND S.estado_id = 1"
				+ " AND C.id = " + datos.cotizacion_id
				+ " AND S.id = " + datos.solicitud_id + ";";
			db.driver.execQuery(query,
				[],
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
			switch (datos.tipo_cotizacion) {
				case 1:// cotizacion de productos
					{
						datos.tipo_aprobacion_id = 2; // Tipo: cotizaciones de productos
						var tipo_orden_compra = 2
						break;
					}

				case 2:// cotizacion de servicios
					{
						datos.tipo_aprobacion_id = 4; // Tipo: cotizaciones de productos
						var tipo_orden_compra = 4
						break;
					}

			}


			var grupoAprobacionConstructor = global.db.models.grupo_aprobacion;
			grupoAprobacionConstructor.find({ tipo_aprobacion_id: tipo_orden_compra }, ["orden", "A"], function (err, grupoDatos) {
				if (err) {
					cb(500, { message: err });
				} else if (grupoDatos && grupoDatos.length > 0) {
					datos.grupo_aprobacion_id = grupoDatos[0].id;
					validarSolicitudCotizacion(datos, function (codigo, obj) {
						if (codigo != 200) {
							cb(codigo, { message: obj.texto });
						} else {
							AprobacionController().create(datos.usuario_creacion, datos, function (codigo, objeto) {

								if (codigo == 200) {

									// Se debe actualizar el estado de la cotizacion
									var cotizacionConstructor = global.db.models.cotizacion;
									cotizacionConstructor.find({ id: datos.entidad_id }, function (err, objCotizacion) {
										if (err) {

											cb(500, { message: err });
										} else if (objCotizacion && objCotizacion.length > 0) {
											objCotizacion[0].estado_id = 2;
											objCotizacion[0].solicitud_id = objeto.id;
											objCotizacion[0].razonRechazo = null;
											objCotizacion[0].save(function (err) {
												if (err) {
													cb(500, { message: err });
												} else {
													notificacion().notificaciondeAprobacion(objeto.id, function (status, result) {
													});
													cb(200, {});
												}
											})
										} else {
											cb(500, { message: 'COTIZACION NO ENCONTRADA' });
										}
									});
								} else {
									cb(codigo, { message: objeto.message });
								}
							});
						}
					});
				} else {
					cb(500, { message: 'GRUPO APROBADOR NO ENCONTRADO' });
				}
			});


		},

		// Servicio para saber si un usuario puede aprobar una solicitud.
		// Puede ser usado en el proceso de aprobacion de clientes u otros
		// procesos de aprobacion a partir del parametro 'solicitud_id'.
		getPermission: function (userId, solicitud_id, cb) {
			// id de la solicitud: req.params.id
			// id del usuario

			if (userId && solicitud_id) {

				global.db.driver.execQuery(

					"SELECT GA.id GrpId" +
					" FROM solicitud_aprobacion SA" +
					" INNER JOIN grupo_aprobacion GA ON GA.tipo_aprobacion_id = SA.tipo_aprobacion_id" +
					" LEFT JOIN aprobacion AP on SA.id = AP.solicitud_id AND AP.grupoAprobacion_id = GA.id" +
					" WHERE SA.estado_id = 1" +
					" AND SA.id =" + solicitud_id +
					" and AP.grupoAprobacion_id is  null" +
					" order by  GA.orden asc " +
					" limit 0,1;",
					[],
					function (err, grupoValidar) {
						if (err) {
							cb(500, { message: 'ERROR EN EL SERVICIO' });
						} else {
							if (grupoValidar.length > 0) {

								var query =
									"SELECT S.id, UG.usuario_id "
									+ "FROM solicitud_aprobacion S"
									+ " INNER join grupo_aprobacion GA on ga.tipo_aprobacion_id = S.tipo_aprobacion_id "
									+ " INNER JOIN hs_usuario_x_grupo_aprobacion UG ON UG.grupo_id = GA.id "
									+ " LEFT JOIN aprobacion AP ON S.id = AP.solicitud_id AND AP.grupoAprobacion_id = UG.grupo_id "
									+ "WHERE S.id = " + solicitud_id
									+ " and AP.grupoAprobacion_id is null"
									+ " AND S.estado_id = 1"
									+ " AND UG.usuario_id = " + userId
									+ " and GA.id=" + grupoValidar[0].GrpId
									+ " order by  ga.orden asc"
									+ " limit 0,1 ;";
								db.driver.execQuery(query, [],
									function (err, result) {
										if (err) {
											cb(200, { codigo: 0 });
										} else {
											if (result && result != "") {
												// Si hay data y no tiene aprobacion
												if (result[0] && !(result[0].usuario_id)) {
													cb(200, { codigo: 0 });
												} else {
													cb(200, { codigo: 1 });
												}
											} else {
												cb(200, { codigo: 0 });
											}
										}
									}
								);


							} else {
								cb(404, { message: 'NECESITA TENER OTRO GRUPO DE APROBACIÓN' });
							}
						}

					});

			} else {
				cb(200, { codigo: 0 });
			}
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

			console.log("toUpd revisarrrr")
			console.log(toUpd)
			toUpd.usuario_id = userId;
			validarCotizacionExistente(toUpd, function (codigo, obj) {
				if (codigo != 200) {
					cb(codigo, { message: obj.texto });
				} else {
					AprobacionController().approve(toUpd.solicitud_id, toUpd.usuario_id, toUpd.aprobar, toUpd.razonRechazo, function (codigo, objeto) {
						if (codigo != 200) {
							cb(codigo, { message: objeto.message });
						} else {
							notificacion().notificaciondeAprobacion(toUpd.solicitud_id, function (status, result) {

							});
							var estado = 0;
							console.log(toUpd.aprobar === 0)
							if (toUpd.aprobar === 0) {
								console.log("rechazarrrr")
								// Si se rechazo la solicitud, se debe actualizar como rechazada a la cotizacion
								estado = 3;
							} else if (toUpd.aprobar == 1 && objeto.finalizado == 1) {
								// Si se aprueba la solicitud y es la ultima aprobacion necesaria, se debe actualizar como aprobada a la solicitud
								estado = 4;
							}

							if (estado != 0) {
								// Se actualiza el estado de la cotizacion
								var cotizacionConstructor = global.db.models.cotizacion;
								cotizacionConstructor.find({ id: toUpd.cotizacion_id }, function (err, objCotizacion) {
									if (err) {
										cb(500, { message: err });
									} else if (objCotizacion && objCotizacion.length > 0) {

										objCotizacion[0].estado_id = estado;
										if (toUpd.razonRechazo) {
											objCotizacion[0].razonRechazo = toUpd.razonRechazo;
										}
										objCotizacion[0].fechaAprobada = new Date();
										//objCotizacion[0].solicitud_id = objeto.id;

										objCotizacion[0].save(function (err) {
											if (err) {
												cb(500, { message: err });
											} else {

												cb(200, { cambio: 1 });
											}
										})
									} else {
										cb(500, { message: 'COTIZACION NO ENCONTRADA' });
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