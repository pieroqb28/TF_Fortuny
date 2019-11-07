//var mongoose   = require('mongoose');
var Cliente = require('../models/Cliente');
var BuquesController = require('../controller/BuquesController');
var SolicitudClienteController = require('../controller/SolicitudClienteController');


module.exports = function () {
	return {

		getById: function (tenantId, paramId, cb) {

			global.db.driver.execQuery(
				"SELECT cliente.id clienteId,cliente.nombre, cliente.numero_cliente,cliente.ruc,cliente.direccion, cliente.direccion2, cliente.pais, cliente.telefono,cliente.contacto1,cliente.email1,cliente.contacto2,cliente.email2,estado_cliente.id estadoClienteId,estado_cliente.estado, cliente.solicitud_id FROM cliente INNER JOIN estado_cliente ON cliente.estado_usuario=estado_cliente.id where cliente.id=?;",
				[paramId],
				function (err, listClientes) {

					if (err) {
						cb(500, { err: 'ERROR EN EL SERVICIO' });
					}
					else {

						if (listClientes.length > 0) {

							cb(200, listClientes);
						} else {
							cb(404, { err: 'NO EXISTEN DATOS DE CLIENTE' });
						}
					}

				});
		},


		delete: function (tenantId, paramId, cb) {

			var buquesConstructor = global.db.models.buques;
			buquesConstructor.find({ cliente_id: paramId }).remove(function (err) {
				if (err) {
					cb(500, { err: "Existe un error en el servicio" });
				} else {
					var clienteConstructor = global.db.models.cliente;

					clienteConstructor.get(paramId, function (err, objeto) {
						if (err) {
							cb(500, { err: "Existe un error en el servicio" });
						}
						else {
							if (objeto) {

								objeto.remove(function (err) {
									if (err) {
										if (err.code && err.code.indexOf('ROW_IS_REFERENCED') != -1) {
											cb(500, { message: "El cliente no puede ser eliminado, tiene informacion asociada a él." });
										} else {
											cb(500, { message: "Existe un error en el servicio" });
										}

									} else {
										cb(200);
									}
								});
							} else {
								cb(404, { err: 'NO EXISTE CLIENTE' });
							}
						}
					});
				}
			});
		},

		getAll: function (tenantId, filtro, cb) {
			var filtroCliente;
			if (!filtro && filtro != 0) {
				filtro = 2;
			}
			else if (filtro == undefined || !filtro) {
				filtro = 0;
			}
			switch (filtro) {
				case "0":
					{
						// Todos
						filtroCliente = " ";
						break;
					}
				case "1":
					{
						// Pendientes de aprobacion
						filtroCliente = " where cliente.estado_usuario=2";
						break;
					}
				case "2":
					{
						// Aprobados
						filtroCliente = " where cliente.estado_usuario=4";
						break;
					}
				case "3":
					{
						// Rechazados
						filtroCliente = " where cliente.estado_usuario=3";
						break;
					}
				default:
					{
						// Algun otro caso no contemplado visualizara solo los aprobados
						filtroCliente = " where cliente.estado_usuario=4";
						break;
					}
			}
			global.db.driver.execQuery(
				"SELECT cliente.id clienteId,cliente.nombre,cliente.numero_cliente, cliente.ruc,cliente.direccion, cliente.direccion2, cliente.pais, cliente.telefono,cliente.contacto1,cliente.email1,cliente.contacto2,cliente.email2,estado_cliente.estado FROM cliente INNER JOIN estado_cliente ON cliente.estado_usuario=estado_cliente.id" + filtroCliente + ";",
				[],
				function (err, listClientes) {

					if (err) {
						cb(500, { err: 'ERROR EN EL SERVICIO' });
					} else {
						if (listClientes) {

							cb(200, listClientes);
						} else {
							cb(404, { err: 'NO EXISTEN DATOS DE CLIENTES' });
						}
					}

				});
		},

		getByNombre: function (tenantId, nombre, cb) {

			global.db.driver.execQuery(
				"SELECT * FROM cliente where nombre LIKE ?;", ["%" + nombre + "%"],
				function (err, listClientes) {

					if (err) {
						cb(500, { err: 'ERROR EN EL SERVICIO' });
					} else {
						if (listClientes) {

							cb(200, { cliente: listClientes });
						} else {
							cb(404, { err: 'NO EXISTEN DATOS DE CLIENTES' });
						}
					}

				});

			/*var clienteConstructor = global.db.models.cliente;

			clienteConstructor.find({nombre:'%'+nombre+'%'},function(err, listaCategoriaCotizacion){
				if(err){
					cb(500,{message: err});
				}else{
					if(listaCategoriaCotizacion){
					
						cb(200,{cliente:listaCategoriaCotizacion});
					}else{
					 	cb(500,{message: 'NOT FOUND'});
					}
				}

			});*/

		},

		create: function (tenantId, userId, body, cb) {
			var clienteConstructor = global.db.models.cliente;
			clienteConstructor.create({
				nombre: body.nombre,
				numero_cliente: body.numero_cliente,
				ruc: body.ruc,
				direccion: body.direccion,
				direccion2: body.direccion2,
				pais: body.pais,
				telefono: body.telefono,
				contacto1: body.contacto1,
				email1: body.email1,
				contacto2: body.contacto2,
				email2: body.email2,
				fecha_creacion: new Date(),
				usuario_creacion: userId,
				estado_usuario: 1
			}, function (err, obj) {
				if (err) {

					if (err.code.indexOf('DATA_TOO_LONG')) {
						cb(500, { message: "Uno de los campos tiene datos muy largos.", code: '1000' });
					} else {
						cb(500, { message: "Existe un error en el servicio", code: '1000' });
					}

				} else {
					if (obj) {

						if (body.detalleBuques.length > 0) {
							for (i = 0; i < body.detalleBuques.length; i++) {
								body.detalleBuques[i].cliente_id = obj.id
							}
							/*BuquesController().create(tenantId,userId,body.detalleBuques,obj.id,function(statusCode, result){
									 cb(200,{id:obj.id });
							})*/
							BuquesController().create(tenantId, userId, body.detalleBuques, function (statusCode, result) {
								cb(200, { id: obj.id });
							})
						}
						else {
							cb(200, { id: obj.id });
						}



					} else {
						cb(500, { message: "Existe un error en el servicio", code: '1001' });
					}
				}
			});
		},

		put: function (tenantId, userId, paramId, body, cb) {

			var clienteConstructor = global.db.models.cliente;
			if (body.estado_usuario == null || body.estado_usuario == "") {
				body.estado_usuario = 1
			}
			clienteConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: "Existe un error en el servicio" });
				}
				else {
					if (obj) {
						obj.nombre = body.nombre,
							obj.numero_cliente = body.numero_cliente,
							obj.ruc = body.ruc,
							obj.direccion = body.direccion,
							obj.direccion2 = body.direccion2,
							obj.pais = body.pais,
							obj.telefono = body.telefono,
							obj.contacto1 = body.contacto1,
							obj.email1 = body.email1,
							obj.contacto2 = body.contacto2,
							obj.email2 = body.email2,
							obj.estado_usuario = body.estado_usuario,
							obj.fecha_modificacion = new Date(),
							obj.usuario_modificacion = userId,
							obj.updated_by = userId;
						obj.updated_date = new Date();

						// save the user
						obj.save(function (err) {
							if (err) {

								cb(500, { err: "Existe un error en el servicio" });
							}
							else {

								if (body.detalleBuques.length > 0) {
									for (i = 0; i < body.detalleBuques.length; i++) {
										body.detalleBuques[i].cliente_id = obj.id
									}

									BuquesController().create(tenantId, userId, body.detalleBuques, function (statusCode, result) {
										cb(200, { id: obj.id });
									})
								}
								else {
									cb(200, { id: obj.id });
								}

							}
						});
					}
					else {
						cb(404, { err: 'NO EXISTE CLIENTE' });
					}

				}
			});
		}
	}
}