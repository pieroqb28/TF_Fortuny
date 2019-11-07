
module.exports = function () {
	return {

		getByCodigo: function (tenantId, codigo, cb) {
			var centrocostoConstructor = global.db.models.centro_costo;
			centrocostoConstructor.find({ codigo: codigo }, function (err, listObj) {
				if (err) {

					return cb(500, { err: "Error en el Servicio" });
				} else {
					if (listObj) {

						return cb(200, listObj);
					} else {
						return cb(500, { err: 'No existe Centro de Costo' });
					}
				}
			});
		},


		getById: function (tenantId, paramId, cb) {
			var centrocostoConstructor = global.db.models.centro_costo;
			centrocostoConstructor.find({ id: paramId }, function (err, listObj) {
				if (err) {

					return cb(500, { err: "Error en el Servicio" });
				} else {
					if (listObj) {

						return cb(200, listObj);
					} else {
						return cb(500, { err: 'No existe Centro de Costo' });
					}
				}
			});
		},

		delete: function (tenantId, paramId, cb) {

			var centrocostoConstructor = global.db.models.centro_costo;
			centrocostoConstructor.get(paramId, function (err, objeto) {
				if (objeto) {
					objeto.remove(function (err) {
						if (err) {
							return cb(500, { err: "Error en el Servicio" });
						} else {
							return cb(200);
						}
					});
				} else {
					return cb(404, { err: 'No se encontro Centro de Costo' });
				}
			});
		},
		getAllValid: function (tenantId, filtro, cb) {


			var objFiltro = {estado_CC: 'H'}
			if (filtro) {
				objFiltro = { nombre: new RegExp(filtro, "i"), estado_CC: 'H' }
			}
			var centrocostoConstructor = global.db.models.centro_costo;

			centrocostoConstructor.find(objFiltro, function (err, listObj) {
				if (err) {

					return cb(500, { err: "Error en el Servicio" });
				} else {
					if (listObj) {
						for (i = 0; i < listObj.length; i++) {
							listObj[i].estado_CC = listObj[i].estado_CC == "H" ? "Habilitado" : "Deshabilitado"
						}
						return cb(200, listObj);
					} else {
						return cb(500, { err: 'No existen centros de costos' });
					}
				}
			});
		},

		getAll: function (tenantId, filtro, cb) {


			var objFiltro = {}
			if (filtro) {
				objFiltro = { nombre: new RegExp(filtro, "i")  }
			}
			var centrocostoConstructor = global.db.models.centro_costo;

			centrocostoConstructor.find(objFiltro, function (err, listObj) {
				if (err) {

					return cb(500, { err: "Error en el Servicio" });
				} else {
					if (listObj) {
						for (i = 0; i < listObj.length; i++) {
							listObj[i].estado_CC = listObj[i].estado_CC == "H" ? "Habilitado" : "Deshabilitado"
						}
						return cb(200, listObj);
					} else {
						return cb(500, { err: 'No existen centros de costos' });
					}
				}
			});
		},

		create: function (tenantId, userId, body, cb) {

			var centrocostoConstructor = global.db.models.centro_costo;
			centrocostoConstructor.create({
				codigo: body.codigo,
				nombre: body.nombre,
				estado_CC: "H"
			}, function (err, obj) {
				if (err) {
					return cb(500, { err: "Error en el Servicio" });
				} else {
					if (obj) {
						return cb(200, { id: obj.id });
					} else {
						return cb(500, { err: 'No se pudo crear Cenro de Costo' });
					}
				}
			});
		},

		put: function (tenantId, userId, paramId, body, cb) {

			var centrocostoConstructor = global.db.models.centro_costo;

			centrocostoConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: "Error en el Servicio" });
				}
				else {

					if (obj) {
						obj.codigo = body.codigo,
							obj.nombre = body.nombre,
							obj.estado_CC = body.estado_CC

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
					else {
						cb(404, { err: 'No existe Centro de Costo' });
					}

				}
			});
		},
		deshabilitarCC: function (tenantId, userId, paramId, cb) {

			var centrocostoConstructor = global.db.models.centro_costo;

			centrocostoConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: "Error en el Servicio" });
				}
				else {

					if (obj) {
						obj.estado_CC = "B"

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
					else {
						cb(404, { err: 'No existe Centro de Costo' });
					}

				}
			});
		},
		getForDespacho: function (cb) {
			global.db.driver.execQuery(
				"select distinct(centros_costos.codigo),centros_costos.id from " +
				"(SELECT distinct(cc.codigo),cc.id FROM factura_proveedores fp " +
				"inner join orden_compra oc ON fp.orden_compra=oc.id " +
				"inner join centro_costo cc ON cc.id=oc.centro_costo_id " +
				"UNION " +
				"SELECT distinct(cc.codigo),cc.id FROM carpeta_importacion ci " +
				"inner join centro_costo cc ON ci.centro_costo_id = cc.id) centros_costos " +
				"inner join cotizacion ct ON ct.numero = centros_costos.codigo " +
				"where ct.estado_id =6 or ct.estado_id =7 " +
				"order by centros_costos.codigo",
				[],
				function (err, listCostCenter) {
					if (err) {
						cb(500, { message: "Error en el Servicio" });
					} else {
						cb(200, listCostCenter);
					}
				});
		},
		getByOwner: function (userOwner, cb) {
			global.db.driver.execQuery(
				"SELECT centro_costo.codigo from centro_costo" +
				"join cotizacion on centro_costo.codigo = cotizacion.numero" +
				"where cotizacion.usuario_creacion = ?; ",
				[userOwner],
				function (err, listCostCenter) {
					if (err) {
						cb(500, { err: "Error en el Servicio" });
					} else {
						cb(200, listCostCenter);
					}
				});
		},
		getOnlyService: function (cb) {
			global.db.driver.execQuery(
				"SELECT " +
				"    centro_costo.codigo " +
				"FROM " +
				"    centro_costo " +
				"        JOIN " +
				"    cotizacion ON centro_costo.codigo = cotizacion.numero " +
				"WHERE " +
				"    cotizacion.categoria_id = 2; ",
				[],
				function (err, listCostCenter) {
					if (err) {
						cb(500, { err: err });
					} else {
						cb(200, listCostCenter);
					}
				});
		},
		getByType: function (type, cb) {
			global.db.driver.execQuery(
				"SELECT centro_costo.*, cotizacion.id as cotizacion_id from " +
				"centro_costo JOIN " +
				"cotizacion on centro_costo.codigo = cotizacion.numero " +
				"WHERE cotizacion.categoria_id = ?;"
				, [type],
				function (err, listCostCenter) {
					if (err) {
						cb(500, { err: err });
					} else {
						cb(200, listCostCenter);
					}
				});
		}

	}
}