var AprobacionController = require('../controller/AprobacionController');
var GrupoController = require('../controller/GrupoAprobacionController');
var notificacion = require('./NotificacionController');
var async = require('async');
module.exports = function () {

	function validarReglasTipoAprob(ocID, cb){
			var ocConstructor = global.db.models.orden_compra;
			db.driver.execQuery(
				"SELECT  case when oc.total_detalle * case when moneda != 'PEN' then (select cambio from tipo_cambio TC where tc.fecha = OC.fecha limit 1) else 1 end <=500 then 5 else 3  end as tipoId " 
    			+ "FROM orden_compra OC "
				+ "WHERE OC.id = ?;",
				[ocID],
				function (err, result) {
					if (err) {	
						console.log(err);
						cb(400, { message: "DATOS ERRONEOS" });
					} else {

						if (result && result != "") {
							console.log(result[0].tipoId);
							cb(null, result[0].tipoId);
						} else {

							cb(400, { message: "OC ERRONEA" });
						}
					}
				}
			);
	

	}

	function validarSolicitudOC(solicitud, cb) {
		/* SE DEBE VALIDAR QUE LA SOLICITUD TENGA LOS DATOS Y QUE LA ORDEN ESTE EN EL ESTADO APROPIADO */

		if (!solicitud) {
			cb(400, { texto: "Solicitud nula." });
		} else if (!(solicitud.tipo_aprobacion_id && solicitud.grupo_aprobacion_id && solicitud.usuario_creacion && solicitud.entidad_id)) {
			cb(400, { texto: "Solicitud sin datos básicos." });
		} else {
			// PENDIENTE: validacion de los campos de la orden de compra
			var ocConstructor = global.db.models.orden_compra;
			ocConstructor.find({ id: solicitud.entidad_id }, function (err, objOC) {
				if (err) {
					cb(500, { err: err });
				} else {
					if (objOC) {
						if (objOC[0].estado_id == 2 || objOC[0].estado_id == 4) {
							cb(200, { cotizacion: objOC[0] });
						} else {
							cb(404, { texto: "Cotización no válida." });
						}
					} else {
						cb(404, { texto: "Cotización no encontrada." });
					}
				}
			});
		}
	};

	function validarOCExistente(datos, cb) {

		/* SE DEBE VALIDAR QUE LA COTIZACION EXISTA, QUE LA SOLICITUD EXISTA Y QUE ESTEN EN LOS ESTADOS APROPIADOS */
		if (!(datos.orden_compra_id && datos.solicitud_id && datos.usuario_id)

			&& (datos.orden_compra_id > 0)
			&& (datos.solicitud_id > 0)
			&& (datos.usuario_id > 0)
			&& (datos.aprobar === 0 || datos.aprobar === 1)) { 	// Validacion de existencia y no nulidad de datos
			cb(400, { texto: "DATOS ERRONEOS" });
		} else {
			db.driver.execQuery(
				"SELECT OC.id , S.estado_id , OC.estado_id  as OC_estado_id "
				+ "FROM orden_compra OC"
				+ " INNER JOIN solicitud_aprobacion S ON S.id = OC.solicitud_id AND S.entidad_id = OC.id"

				// MODIFICACION: ya no se llama al Aprobacion y hs_usuario_x_grupo_aprobacion porque no existe una pre creación  registros en aprobacion cunado se solicita dicha aprobación
				//+ " inner JOIN Aprobacion AP on s.id = ap.solicitud_id"
				//+ " INNER JOIN hs_usuario_x_grupo_aprobacion UG ON AP.grupoAprobacion_id = UG.grupo_id "
				+ " WHERE "
			
				//+ " AND UG.usuario_id = ?"
				+ "  OC.id = ?"
				+ " AND S.id = ?;",
				[datos.orden_compra_id, datos.solicitud_id],
				function (err, result) {
					if (err) {	
						console.log(err);
						cb(400, { texto: "DATOS ERRONEOS" });
					} else {

						if (result && result != "") {
							console.log(result);
							if (result[0].estado_id == 1 && result[0].OC_estado_id == 3){
								cb(200, {});	
							}else{
								if (result[0].OC_estado_id > 4){
									cb(400, { texto: "SOLICITUD YA RESPONDIDA" });
								}else{
									cb(400, { texto: "SOLICITUD ERRONEA" });	
								}
								
							}
							
						} else {

							cb(400, { texto: "SOLICITUD ERRONEA" });
						}
					}
				}
			);
		}
	}

	return {
		resendNotif: function (idOC,cb){
			//Ubicar OC en estado pendingç
			//Solicitar envio
			notificacion().reenviarnotificacion(idOC, function (status, result) {
						cb(status,result);											
				});
			
			
		},

		create: function (userid, datos, cb) {

			datos.usuario_creacion = userid;
			//datos.tipo_aprobacion_id = 3; // Tipo: orden de compra   RQ
			datos.tipo_aprobacion_id = "";
			async.series([
				 function(cbbase) { 
				 	validarReglasTipoAprob(datos.entidad_id,function(codigo,obj){
				 		
				 		if (codigo){
				 			cbbase({codigo: codigo, message: obj});	
				 		}else{

				 			
				 			datos.tipo_aprobacion_id = obj;
				 			cbbase(null,{});	
				 		}
				 	});
				 },


				function(cbbase) { 
					var grupoAprobacionConstructor = global.db.models.grupo_aprobacion;
					grupoAprobacionConstructor.find({ tipo_aprobacion_id: datos.tipo_aprobacion_id}, ["orden", "A"], function (err, grupoDatos) { //RQ
						if (err) {
							cbbase({ codigo: 500, message: err });
							//cb(500, { message: err });
						} else if (grupoDatos && grupoDatos.length > 0) {
							datos.grupo_aprobacion_id = grupoDatos[0].id;
							validarSolicitudOC(datos, function (codigo, obj) {
								if (codigo != 200) {
									//cb(codigo, { message: obj.texto });
									cbbase({codigo:codigo , message : obj.texto});
								} else {
									AprobacionController().create(datos.usuario_creacion, datos, function (codigo, objeto) {

										if (codigo == 200) {

											// Se debe actualizar el estado de la orden de compra
											var ocConstructor = global.db.models.orden_compra;
											ocConstructor.find({ id: datos.entidad_id }, function (err, objOC) {
												if (err) {
													cbbase({codigo: 500, message: err });
													//cb(500, { message: err });
												} else if (objOC && objOC.length > 0) {
													objOC[0].estado_id = 3;
													objOC[0].solicitud_id = objeto.id;
													objOC[0].razonRechazo = null;
													objOC[0].save(function (err) {
														if (err) {
															//cb(500, { message: err });
															cbbase({codigo: 500, message: err });
														} else {
															
															notificacion().notificaciondeAprobacion(objeto.id, function (status, result) {
															});
															//cb(200, {});
															cbbase(null,{});
														}
													})
												} else {
													//cb(500, { message: 'Orden de compra no encontrada' });
													cbbase({codigo: 500, message: 'Orden de compra no encontrada' });
												}
											});
										} else {
											//cb(codigo, { message: objeto.message });

											cbbase({codigo: codigo, message: objeto.message });
										}
									});
								}
							});
						} else {
							//cb(500, { message: 'Grupo aprobador no encontrado.' });
							cbbase({codigo: 500,  message: 'Grupo aprobador no encontrado.' });
						}
					});

			 }
			],
				//In case of error
				function(err, results) {
					if (err){

						cb(err.codigo,  err.message );	
					}else{
						cb(200, {});	
					}
				   
				}
			);




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
						cb(404, { message: 'NO EXISTE LA ORDEN DE COMPRA' });
					}
				}
			});
		},

		// Este servicio es "Aprobar"
		update: function (userId, tenandId, paramId, toUpd, res, cb) {

			toUpd.usuario_id = userId;

			validarOCExistente(toUpd, function (codigo, obj) {
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
							if (toUpd.aprobar === 0) {
								// Si se rechazo la solicitud, se debe actualizar como rechazada a la orden de compra
								estado = 4;
							} else if (toUpd.aprobar == 1 && objeto.finalizado == 1) {
								// Si se aprueba la solicitud y es la ultima aprobacion necesaria, se debe actualizar como aprobada a la solicitud
								estado = 5;
							}

							if (estado != 0) {
								// Se actualiza el estado de la orden de compra
								var ocConstructor = global.db.models.orden_compra;
								ocConstructor.find({ id: toUpd.orden_compra_id }, function (err, objOC) {
									if (err) {
										cb(500, { message: err });
									} else if (objOC && objOC.length > 0) {

										objOC[0].estado_id = estado;
										if (toUpd.razonRechazo) {
											objOC[0].razon_rechazo = toUpd.razonRechazo;
										}
										if (estado == 5) {
											objOC[0].fecha_aprobacion = new Date();
										}

										//objOC[0].solicitud_id = objeto.id;

										objOC[0].save(function (err) {
											if (err) {
												cb(500, { message: err });
											} else {

												cb(200, { cambio: 1 });
											}
										})
									} else {
										cb(500, { message: 'ORDEN DE COMPRA NO ENCONTRADA' });
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