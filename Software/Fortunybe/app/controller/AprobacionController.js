var async = require('async');
var notificacion = require('./NotificacionController');
module.exports = function () {

	function generarCodigoSolicitud() {
		var currentdate = new Date();
		var codigo = "" + currentdate.getYear()
			+ (currentdate.getMonth() + 1)
			+ currentdate.getDate()
			+ currentdate.getHours()
			+ currentdate.getMinutes()
			+ currentdate.getSeconds();

		return codigo;
	}

	function validarSolicitud(solicitud, userid, cb) {
		if (!solicitud) {
			cb(400, { texto: "SOLICITUD NULA" });
		} else if (!(solicitud.tipo_aprobacion_id && solicitud.grupo_aprobacion_id && solicitud.usuario_creacion && solicitud.entidad_id)) {
			cb(400, { texto: "SOLICITUD SIN DATOS BASICOS" });
		} else {
			/* VALIDA QUE EL USUARIO PERTENEZCA AL GRUPO DE APROBACION Y QUE EL GRUPO DE APROBACION TENGA EL MISMO TIPO DE APROBACION */
			cb(200, { texto: "OK - PARCIAL" });

		}
	}

	function validarAprobacion(solicitudId, usuarioId, aprobar, cb) {
		/*
		Esta validacion revisa que:
		1.- Los datos enviados tengan valores validos
		2.- La solicitud con dicho id exista
		3.- El usuario con dicho id exista
		4.- El grupo asociado a dicho Id tenga el mismo tipo que la solicitud
		5.- El usuario pertenezca a dicho grupo
		6.- La solicitud se encuentre en proceso de aprobacion ("Pendiente de aprobacion")
		
		EN EL CASO DE MySQL, LAS ULTIMAS 5 VALIDACIONES SE PUEDEN HACER CON LA MISMA QUERY
		*/
		if (!(solicitudId && usuarioId)
			&& (solicitudId > 0) && (usuarioId > 0)
			&& (aprobar === 0 || aprobar === 1)) { 	// Validacion de existencia y no nulidad de datos
			cb(400, { texto: "DATOS ERRONEOS" });
		} else {
			var query =
				"SELECT SA.id , Ap.ID AproID, GA.id GrpId"
				+ " FROM solicitud_aprobacion SA"
				+ " INNER JOIN grupo_aprobacion GA ON GA.tipo_aprobacion_id = SA.tipo_aprobacion_id"
				+ " INNER JOIN hs_usuario_x_grupo_aprobacion UG ON UG.grupo_id = GA.id AND UG.usuario_id = " + usuarioId
				+ " LEFT JOIN aprobacion AP on SA.id = AP.solicitud_id AND AP.grupoAprobacion_id = UG.grupo_id "
				+ "WHERE SA.estado_id = 1"
				+ " AND SA.id = " + solicitudId
				+ " and AP.grupoAprobacion_id is  null"
				+ " order by  GA.orden asc "
				+ " limit 0,1";
			db.driver.execQuery(query,
				[],
				function (err, result) {
					if (err) {

						cb(400, { texto: "DATOS ERRONEOS" });
					} else {
						if (result && result != "") {
							cb(200, { AproID: result[0].AproID, GrpId: result[0].GrpId });
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
			/*
			Se crea un registro en la tabla "solicitud_aprobacion".
			*/
			
			validarSolicitud(datos, userid, function (codigo, texto) {
				if (codigo != 200) {
					cb(codigo, { message: texto, code: '2000' });
				} else {
					var solicitudAprobacionConstructor = global.db.models.solicitud_aprobacion;
					var codigo = 'SA' + generarCodigoSolicitud();
					solicitudAprobacionConstructor.create({
						codigo: codigo,
						tipo_aprobacion_id: datos.tipo_aprobacion_id,
						estado_id: 1,
						//	grupo_aprobacion_id: datos.grupo_aprobacion_id,
						entidad_id: datos.entidad_id,
						usuario_creacion: userid
					}, function (err, solicitudCreada) {
						if (err) {

							cb(500, { message: err, code: '2001' });
						} else {
							cb(200, { id: solicitudCreada.id });
						}
					});
				}
			});
		},

		approve: function (solicitudId, usuarioId, aprobar, razonRechazo, cb) {
			/*
			1.- Se actualiza la aprobación con la respuesta del usuario.
			2.- Si "aprobar" = 0, se esta dando 1 rechazo individual a la solicitud. Se da por cancelada la solicitud.
			3.- Si "aprobar" = 1, se esta dando 1 aprobacion individual a la solicitud. Se debe verificar si ya son suficientes aprobaciones.
			De serlo, se da por aprobada la solicitud.
			*/

			validarAprobacion(solicitudId, usuarioId, aprobar, function (codigo, texto) {
				if (codigo != 200) {
					cb(codigo, { message: texto });
				} else {
					var aprobacionConstructor = global.db.models.aprobacion;

					var aprobacion = {
						grupoAprobacion_id: texto.GrpId,
						solicitud_id: solicitudId,
						usuario_id: usuarioId,
						aprobado: aprobar,
						fechaAprobacion: new Date()
					}

					if (razonRechazo && aprobar === 0) {
						aprobacion.razonRechazo = razonRechazo;
					}

					aprobacionConstructor.create(aprobacion, function (ErrUpd, aprCreada) {
						if (ErrUpd) {
							cb(500, { message: ErrUpd });
						} else {

							var solicitudConstructor = global.db.models.solicitud_aprobacion;
							if (aprobar === 0) {
								/* Si se dio un rechazo, se debe cancelar toda la solicitud */
								solicitudConstructor.find({ id: solicitudId }, function (err, solicitud) {
									solicitud[0].estado_id = 3;
									solicitud[0].save(function (err) {
										if (err) {
										} else {
											cb(200, { finalizado: 1 });
										}
									});
								});
							} else {
								/* Se debe validar que sean suficientes aprobaciones */
								db.driver.execQuery(
									"SELECT count(*) valor FROM aprobacion WHERE solicitud_id = ? and usuario_id is not null "
									+ " UNION ALL "
									+ "SELECT TA.cantidad_aprobaciones valor "
									+ "FROM tipo_aprobacion TA"
									+ " INNER JOIN solicitud_aprobacion SA ON TA.id = SA.tipo_aprobacion_id "
									+ "WHERE SA.id = ?;",
									[solicitudId, solicitudId],
									function (err, result) {
										if (err) {
											cb(500, { message: err });
										} else {
											if (result && result.length > 0) {
												if (result[0].valor >= result[1].valor) {
													/* Si la cantidad de aprobaciones es igual o supera al minimo necesario */
													solicitudConstructor.find({ id: solicitudId }, function (err, solicitud) {
														if (err) {
															cb(500, { message: err });
														} else {
															solicitud[0].estado_id = 2;				// La solicitud se marca como terminada
															solicitud[0].save(function (err) {
																if (err) {
																	cb(500, { message: err });
																} else {

																	cb(200, { finalizado: 1 });
																}
															});
														}
													});
												} else {
													cb(200, { finalizado: 0 });
												}
											} else {
												cb(500, { message: err });
											}
										}
									});
							}

						}
					});
				}
			});
		},
		aprobacionesPendientes: function (userId, cb) {
			
			db.driver.execQuery(
				"(SELECT " +
				'oc.id,oc.numero, "Orden Compra" documento,"/ordenCompra/detalle/" ruta ' +
				'FROM ' +
				'solicitud_aprobacion sa ' +
				'INNER JOIN ' +
				'grupo_aprobacion ga ON ga.tipo_aprobacion_id = sa.tipo_aprobacion_id ' +
				'INNER JOIN ' +
				'hs_usuario_x_grupo_aprobacion ug ON ug.grupo_id = ga.id ' +
				'INNER JOIN  ' +
				'orden_compra oc ON oc.solicitud_id = sa.id ' +
				'LEFT JOIN ' +
				'aprobacion AP ON sa.id = AP.solicitud_id ' +
				'AND AP.grupoAprobacion_id = ga.id ' +
				'AND AP.usuario_id = ' + userId + " "+
				'WHERE ' +
				'sa.estado_id = 1 AND ug.usuario_id = ' + userId + " "+
				'AND AP.grupoAprobacion_id IS NULL ' +
				'and ug.grupo_id=(SELECT GA1.id ' +
				'FROM solicitud_aprobacion SA1 ' +
				'INNER JOIN grupo_aprobacion GA1 ON GA1.tipo_aprobacion_id = SA1.tipo_aprobacion_id ' +
				'LEFT JOIN aprobacion AP1 on SA1.id = AP1.solicitud_id AND AP1.grupoAprobacion_id = GA1.id ' +
				'WHERE SA1.estado_id = 1 ' +
				'AND SA1.id = sa.id ' +
				'and AP1.grupoAprobacion_id is  null ' +
				'order by  GA1.orden asc  ' +
				'limit 0,1)) ' +
				'union ' +

				'(SELECT  ' +
				'cot.id,cot.numero, "Cotizacion" documento, if(cot.categoria_id=1,"/cotizaciones/detalle/","/cotizacionServicios/Detalle/") ruta ' +
				'FROM ' +
				'solicitud_aprobacion sa ' +
				'INNER JOIN ' +
				'grupo_aprobacion ga ON ga.tipo_aprobacion_id = sa.tipo_aprobacion_id ' +
				'INNER JOIN ' +
				'hs_usuario_x_grupo_aprobacion ug ON ug.grupo_id = ga.id ' +
				'INNER JOIN  ' +
				'cotizacion cot ON cot.solicitud_id = sa.id ' +
				'LEFT JOIN ' +
				'aprobacion AP ON sa.id = AP.solicitud_id ' +
				'AND AP.grupoAprobacion_id = ga.id ' +
				'AND AP.usuario_id = ' + userId + " "+
				'WHERE ' +
				'sa.estado_id = 1 AND ug.usuario_id = ' + userId + " "+
				'AND AP.grupoAprobacion_id IS NULL ' +
				'and ug.grupo_id=(SELECT GA1.id ' +
				'FROM solicitud_aprobacion SA1 ' +
				'INNER JOIN grupo_aprobacion GA1 ON GA1.tipo_aprobacion_id = SA1.tipo_aprobacion_id ' +
				'LEFT JOIN aprobacion AP1 on SA1.id = AP1.solicitud_id AND AP1.grupoAprobacion_id = GA1.id ' +
				'WHERE SA1.estado_id = 1 ' +
				'AND SA1.id = sa.id ' +
				'and AP1.grupoAprobacion_id is  null ' +
				'order by  GA1.orden asc  ' +
				'limit 0,1)) ' +
				'union ' +

				'(SELECT  ' +
				'cli.id,cli.nombre, "Clientes" documento, "/clientes/" ruta ' +
				'FROM ' +
				'solicitud_aprobacion sa ' +
				'INNER JOIN ' +
				'grupo_aprobacion ga ON ga.tipo_aprobacion_id = sa.tipo_aprobacion_id ' +
				'INNER JOIN ' +
				'hs_usuario_x_grupo_aprobacion ug ON ug.grupo_id = ga.id ' +
				'INNER JOIN  ' +
				'cliente cli ON cli.solicitud_id = sa.id ' +
				'LEFT JOIN ' +
				'aprobacion AP ON sa.id = AP.solicitud_id ' +
				'AND AP.grupoAprobacion_id = ga.id ' +
				'AND AP.usuario_id = ' + userId + " "+
				'WHERE ' +
				'sa.estado_id = 1 AND ug.usuario_id = ' + userId + " "+
				'AND AP.grupoAprobacion_id IS NULL ' +
				'and ug.grupo_id=(SELECT GA1.id ' +
				'FROM solicitud_aprobacion SA1 ' +
				'INNER JOIN grupo_aprobacion GA1 ON GA1.tipo_aprobacion_id = SA1.tipo_aprobacion_id ' +
				'LEFT JOIN aprobacion AP1 on SA1.id = AP1.solicitud_id AND AP1.grupoAprobacion_id = GA1.id ' +
				'WHERE SA1.estado_id = 1 ' +
				'AND SA1.id = sa.id ' +
				'and AP1.grupoAprobacion_id is  null ' +
				'order by  GA1.orden asc  ' +
				'limit 0,1)) ',
				[userId],
				function (err, listaAprobacionesPendientes) {
					if (err) {
						cb(500, { message: err });
					} else {
					
						cb(200, listaAprobacionesPendientes)
					}
				});

		}
	}
};
