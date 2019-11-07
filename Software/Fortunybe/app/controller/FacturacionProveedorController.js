

module.exports = function () {

	function validarFactura(idFactura, valor, usuario, cb) {


		global.db.driver.execQuery(
			"SELECT oc.id,fp.moneda,fp.usuario_creacion,oc.total total_detalle, oc.gastos_extras,sum(oc.total + oc.gastos_extras -( " +
			"if((select sum(fp.total_factura) from factura_proveedores fp where fp.orden_compra=oc.id and fp.id <> " + idFactura + ") IS NULL,0,(select sum(fp.total_factura) from factura_proveedores fp where fp.orden_compra=oc.id and fp.id <> " + idFactura + ")) " +
			")) total FROM factura_proveedores fp  " +
			"inner join orden_compra oc on fp.orden_compra=oc.id  " +
			"where fp.id=" + idFactura, [],
			function (err, valorFactura) {

				if (err) {

					cb(500, { message: "error" })
				}
				else {

					if (valorFactura.length > 0) {

						if (valorFactura[0].usuario_creacion == usuario) {

							if (valor <= valorFactura[0].total) {

								cb(200, {})
							}
							else {

								cb(500, { message: "El máximo monto que puede ingresar es de " + (valorFactura[0].total).toFixed(2) })
							}
						}
						else {
							cb(500, { message: "Usted no creo esta factura, no puede modificarla" })
						}

					}
					else {
						cb(500, { message: "No existe factura" })
					}

				}
			});
	}
	return {

		getByOrdenCompra: function (tenantId, paramId, cb) {

			var facturasProveedorConstructor = global.db.models.factura_proveedores;
			facturasProveedorConstructor.find({ orden_compra: paramId }, function (err, ordenCompraValores) {
				if (err) {
					cb(500, { message: 'ERROR EN EL SERVICIO' });
				}
				else {
					cb(200, ordenCompraValores);
				}

			});
		},
		getDetalle: function (tenantId, paramId, cb) {

			global.db.driver.execQuery(
				"SELECT fp.*,p.nombre,oc.numero orden_compra,cc.codigo proyecto FROM factura_proveedores fp inner join proveedor p on fp.proveedor_id=p.id inner join orden_compra oc on oc.id=fp.orden_compra inner join centro_costo cc on  cc.id=fp.centro_costo where fp.id=?", [paramId],
				function (err, detalleFactura) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						if (detalleFactura.length > 0) {
							cb(200, detalleFactura[0])
						}
						else {
							cb(500, { message: "No existe factura" })
						}

					}
				});
		},
		getAll: function (cb) {
			global.db.driver.execQuery(
				"SELECT fp.*,p.nombre FROM factura_proveedores fp inner join proveedor p on fp.proveedor_id=p.id order by fp.fecha_emision desc", [],
				function (err, listaFacturas) {
					if (err) {
						cb(500, { message: 'ERROR EN EL SERVICIO' });
					} else {
						cb(200, listaFacturas)
					}
				});


		},

		create: function (userId, tenantId, body, cb) {

			if (body.total_factura <= body.maxTotalDocumento) {
				var facturasProveedorConstructor = global.db.models.factura_proveedores;
				facturasProveedorConstructor.create({
					num_factura: body.numero_documento,
					fecha_emision: body.fecha_emision_documento,
					proveedor_id: body.proveedor_id,
					orden_compra: body.orden_compra,
					centro_costo: body.centro_costo_id,
					fecha_registro: body.fecha_registro,
					moneda: body.moneda,
					sub_total: ((body.total_factura) / (1 + body.igv)),
					igv: body.igv,
					valor_igv: body.total_factura - ((body.total_factura) / (1 + body.igv)),
					impuesto_id: body.impuesto_id,
					total_factura: body.total_factura,
					tipo_documento: body.tipo_documento,
					usuario_creacion: userId,
					fecha_creacion: new Date(),

				}, function (err, objFacturaProveedor) {
					if (err) {
						console.log(err);
						cb(500, { message: err });
					} else {
						if (objFacturaProveedor) {
							cb(200, objFacturaProveedor);
						} else {
							cb(500, { message: "Existe un error en el Servicio" });
						}
					}
				});
			}
			else {
				cb(500, { message: "No puede asociar un monto mayor a " + body.maxTotalDocumento })
			}




		},
		put: function (tenantId, userId, paramId, body, cb) {



			validarFactura(paramId, body.total_factura, userId, function (err, result) {
				if (err != 200) {
					cb(err, result)
				}
				else {
					var facturaProveedorConstructor = global.db.models.factura_proveedores;
					facturaProveedorConstructor.get(paramId, function (err, obj) {
						if (err) {
							cb(500, { err: "Error en el Servicio" });
						}
						else {

							if (obj) {
								obj.num_factura = body.num_factura,
									obj.fecha_emision = body.fecha_emision,
									fecha_registro = body.fecha_registro,
									obj.moneda = body.moneda,
									obj.sub_total = body.sub_total,
									obj.igv = body.igv,
									obj.valor_igv = body.valor_igv,
									obj.total_factura = body.total_factura,
									obj.impuesto_id = body.impuesto_id,
									obj.tipo_documento = body.tipo_documento,
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
							else {
								cb(404, { err: 'No existe Centro de Costo' });
							}

						}
					});
				}

			})


		},

	}
}