
// var Proveedor     = require('../models/Proveedor');

module.exports = function () {
	function ultimoCorrelativo(cb) {

		global.db.driver.execQuery(
			"SELECT correlativo FROM proveedor order by correlativo desc limit 1",
			[],
			function (err, datoUltimoCorrelativo) {

				if (err) {
					cb(500, 'ERROR EN EL SERVICIO');
				}
				else {
					
					if (datoUltimoCorrelativo.length > 0) {

						cb(200, datoUltimoCorrelativo[0].correlativo);
					} else {
						cb(404, 'NO EXISTEN DATOS DE PROVEEDOR');
					}
				}

			});
	}
	return {

		getById: function (tenantId, paramId, cb) {

			global.db.driver.execQuery(
				"SELECT p.*,c.nombre nombre_cargo FROM proveedor p left join cargo c on c.id = p.cargo_id where p.id=?;",
				[paramId],
				function (err, listProveedores) {

					if (err) {
						cb(500, { err: 'ERROR EN EL SERVICIO' });
					}
					else {

						if (listProveedores.length > 0) {

							cb(200, listProveedores);
						} else {
							cb(404, { err: 'NO EXISTEN DATOS DE PROVEEDOR' });
						}
					}

				});
		},


		delete: function (tenantId, paramId, cb) {

			var proveedorConstructor = global.db.models.proveedor;

			proveedorConstructor.get(paramId, function (err, objeto) {
				if (err) {
					cb(500, { err: "Existe un error en el servicio" });
				}
				else {
					if (objeto) {

						objeto.remove(function (err) {
							if (err) {
								cb(500, { err: "Existe un error en el servicio" });
							} else {
								cb(200);
							}
						});
					} else {
						cb(404, { err: 'NO EXISTE PROVEEDOR' });
					}
				}
			});

		},

		getAll: function (tenantId, cb) {

			global.db.driver.execQuery(
				"SELECT " +
				"proveedor.id proveedorId, " +
				"proveedor.nombre, " +
				"proveedor.numero_proveedor, " +
				"proveedor.tipo_proveedor, " +
				"proveedor.ruc, " +
				"proveedor.direccion, " +
				"proveedor.direccion2, " +
				"proveedor.pais, " +
				"proveedor.telefono, " +
				"proveedor.contacto1, " +
				"proveedor.email1, " +
				"proveedor.telef1, " +
				"proveedor.telef2, " +
				"proveedor.contacto2, " +
				"proveedor.email2 " +
				"FROM " +
				"proveedor " +
				"ORDER BY proveedor.nombre; "
				,
				[],
				function (err, listProveedores) {

					if (err) {
						cb(500, { err: 'ERROR EN EL SERVICIO' });
					} else {
						if (listProveedores) {

							cb(200, listProveedores);
						} else {
							cb(404, { err: 'NO EXISTEN DATOS DE PROVEDOR' });
						}
					}

				});
		},

		create: function (tenantId, userId, body, cb) {
			ultimoCorrelativo(function(codigo,valor){
				
				if (codigo != 200) {
					cb(codigo, { message: valor })
				}
				else {
					valor = valor + 1
					var totalNumerosCodigoProveedor=5					
					var totalCeros=""
					for(i=0;i<(totalNumerosCodigoProveedor - (valor.toString()).length);i++)
					{					
						totalCeros = totalCeros + "0"
					}					
					 var numeroProveedor= "PROV-"+ totalCeros + valor
					 
					var proveedorConstructor = global.db.models.proveedor;
					proveedorConstructor.create({
						nombre: body.nombre,
						
						numero_proveedor: numeroProveedor,
						ruc: body.ruc,
						direccion: body.direccion,
						direccion2: body.direccion2,
						pais: body.pais,
						telefono: body.telefono,
						contacto1: body.contacto1,
						email1: body.email1,
						telef1: body.telef1,
						tipo_proveedor: body.tipo_proveedor,
						costo_hora: Number(body.costo_hora),
						cargo_id: body.cargo_id,
						contacto2: body.contacto2,
						email2: body.email2,
						telef2: body.telef2,
						terminos_pago: body.terminos_pago,


						banco: body.banco,
						tipo_cuenta: body.tipo_cuenta,
						nro_cuenta: body.nro_cuenta,
						cci: body.cci,
						titular: body.titular,
						tasa: body.tasa,
						nro_det: body.nro_det,
						

						fecha_creacion: new Date(),
						usuario_creacion: userId,
						correlativo:valor,
						// estado_usuario:1
					}, function (err, obj) {
						if (err) {
							
								switch (err.code){
									case 'ER_DUP_ENTRY':
										message= 'Ya existe un proveedor con ese RUC y/o razón social';
										break;
									default:
										
										message= "Existe un error en el servicio"
										break;
								}		
							
							
							cb(500, { message: message});
						} else {
							if (obj) {
								cb(200, { id: obj.id });
							} else {

								cb(500, { message: "Existe un error en el servicio" });
							}
						}
					});
				}

			})


		},

		put: function (tenantId, userId, paramId, body, cb) {

			var proveedorConstructor = global.db.models.proveedor;
			proveedorConstructor.get(paramId, function (err, obj) {
				if (err) {
					console.log(err);
					cb(500, { err: "Existe un error en el servicio" });
				}
				else {
					if (obj) {
						obj.nombre = body.nombre,
							obj.numero_Proveedor = body.numero_proveedor,
							obj.ruc = body.ruc,
							obj.direccion = body.direccion,
							obj.direccion2 = body.direccion2,
							obj.tipo_proveedor = body.tipo_proveedor,
							obj.pais = body.pais,
							obj.telefono = body.telefono,
							obj.contacto1 = body.contacto1,
							obj.email1 = body.email1,
							obj.tipo_proveedor = body.tipo_proveedor,
							obj.costo_hora = body.costo_hora,
							obj.cargo_id = body.cargo_id,
							obj.contacto2 = body.contacto2,
							obj.email2 = body.email2,
							obj.telef1 = body.telef1,
							obj.telef2 = body.telef2,
							obj.terminos_pago = body.terminos_pago,

								obj.banco = body.banco,
						obj.tipo_cuenta = body.tipo_cuenta,
						obj.nro_cuenta = body.nro_cuenta,
						obj.cci = body.cci,
						obj.titular = body.titular,
						obj.tasa = body.tasa,
						obj.nro_det = body.nro_det,

							// obj.estado_usuario=body.estado_usuario,
							obj.fecha_modificacion = new Date(),
							obj.usuario_modificacion = userId,

							// save the user
							obj.save(function (err) {
								if (err) {
										console.log(err);
									cb(500, { message: "Existe un error en el servicio" });
								}
								else {

									cb(200, { id: obj.id });

								}
							});
					}
					else {
						cb(404, { err: 'NO EXISTE PROVEEDOR' });
					}

				}
			});
		},
		getByCentroCosto: function (centroCosto, cb) {
			global.db.driver.execQuery(
				"SELECT DISTINCT " +
				"    proveedor.nombre, " +
				"    proveedor.id " +
				"FROM " +
				"    proveedor " +
				"        JOIN " +
				"    orden_compra ON orden_compra.proveedor_id = proveedor_id " +
				"        JOIN " +
				"    centro_costo ON orden_compra.centro_costo_id " +
				"WHERE " +
				"    centro_costo.codigo = ? ;"
				, [centroCosto]
				, function (err, listProveedores) {
					if (err) {
						cb(500, { err: "Existe un error en el servicio" });
					} else {
						cb(200, listProveedores);
					}
				}
			)
		},
		getByFiltro: function (filtro, cb) {
			console.log(filtro);
			global.db.driver.execQuery(
				"SELECT  " +
				"    proveedor.nombre, " +
				"    proveedor.id " +
				"FROM " +
				"    proveedor " +
			
				"WHERE " +
				"    nombre like  ?  or ruc like ?;"
				, ["%" + filtro + "%" ,"%"+ filtro+ "%"]
				, function (err, listProveedores) {
					if (err) {
						console.log(err);
						cb(500, { err: "Existe un error en el servicio" });
					} else {
						cb(200,{nombre:listProveedores} );
					}
				}
			)
		}
	}
}

