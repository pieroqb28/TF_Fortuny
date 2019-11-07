
var async = require('async');

module.exports = function () {
	return {
		getByDespacho: function (tenantId, despachoId, cb) {
			var guiaRemisionConstructor = global.db.models.guia_remision;
			guiaRemisionConstructor.find({ despacho_id: despachoId }, function (err, listGuiasRemision) {
				if (err) {
					cb(500, { message: 'ERROR EN EL SERVICIO' });
				}
				else {
					if (listGuiasRemision) {

						cb(200, listGuiasRemision);
					} else {
						cb(404, { message: 'No existen guias de remisión' });
					}
				}
			});
		},
		getByCodigo: function (tenantId, codigoGuia, cb) {
			var guiaRemisionConstructor = global.db.models.guia_remision;
			guiaRemisionConstructor.find({ codigo: codigoGuia }, function (err, listGuiasRemision) {
				if (err) {
					cb(500, { message: 'ERROR EN EL SERVICIO' });
				}
				else {
					if (listGuiasRemision.length > 0) {
						cb(200, listGuiasRemision);
					} else {
						cb(404, { message: 'No existe la guia de remisión' });
					}
				}
			});
		},
		actualizarCabecera: function (idGuiaRemision, body, cb) {
			var guiaRemisionConstructor = global.db.models.guia_remision;
			guiaRemisionConstructor.get(idGuiaRemision, function (err, obj) {
				if (err) {
					cb(500, { err: err });
				}
				else {
					if (obj) {
						obj.numero_pedido = body.numero_pedido,
							obj.punto_partida = body.punto_partida,
							obj.punto_llegada = body.punto_llegada,
							obj.transporte_rs = body.transporte_rs,
							obj.transporte_ruc = body.transporte_ruc,
							obj.save(function (err) {
								if (err) {
									cb(500, { err: err });
								}
								else {

									cb(200, { id: obj.id });
								}
							});
					}
					else {
						cb(404, { message: 'No existe guia de remisión' });
					}

				}
			});

		},
		GuiaRemisionPrint: function (idGuiaRemision, cb) {
			global.db.driver.execQuery(
				"SELECT " + 
					"cliente.nombre AS nombreCliente, " +
					"guia_remision.punto_partida, " +
					"guia_remision.punto_llegada, " +
					"guia_remision.numero_pedido, " +
					"cotizacion.orden_compra_cliente, " +
					"cliente.ruc, " +
					"cliente.telefono, " +
					"guia_remision.transporte_rs, " +
					"guia_remision.transporte_ruc, " +
					"guia_remision.cotizacion_id, " +
					"cotizacion.numero as referencePO " +
				"FROM " +
					"guia_remision " +
						"LEFT JOIN " +
					"cotizacion ON guia_remision.cotizacion_id = cotizacion.id " +
						"LEFT JOIN " +
					"cliente ON cotizacion.cliente_id = cliente.id " +
				"WHERE " +
					"guia_remision.id = ?; " 
				, [idGuiaRemision]
				, function (err, guiaData) {
					if (err) {
						cb(500, { err: err });
					} else {
						global.db.driver.execQuery(
							"SELECT " +
							"articulo.codigo_articulo, " +
							"guia_remision_detalle.cantidad, " +
							"articulo.unidad, " +
							"articulo.descripcion, " +
							"articulo.peso_kg " +
							"FROM " +
							"guia_remision_detalle " +
							"LEFT JOIN " +
							"articulo ON guia_remision_detalle.articulo_id = articulo.id " +
							"WHERE " +
							"guia_remision_detalle.guia_remision_id = ?; "
							, [idGuiaRemision]
							, function (err, guiaDetalle) {
								if (err) {
									cb(500, { err: err });
								} else {
									objExportar = {};
									objExportar.cabecera = guiaData[0];
									objExportar.detalle = guiaDetalle;
									cb(200, objExportar);
								}
							}
						);
					}
				}
			);
		}
	}
}