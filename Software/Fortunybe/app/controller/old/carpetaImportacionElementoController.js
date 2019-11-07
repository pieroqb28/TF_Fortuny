module.exports = function () {
	return {


		getElementoByCarpeta: function (tenantId, idCarpeta, cb) {

			var carpetaElementoConstructor = global.db.models.carpeta_importacion_elemento;
			carpetaElementoConstructor.find({ carpeta_importacion_id: idCarpeta }, function (err, grupoDatos) {
				if (err) {
					cb(500, { message: 'Ocurrió un error.' });
				} else {

					if (grupoDatos.length > 0) {

						for (var i = 0; i < grupoDatos.length; i++) {
							if (grupoDatos[i].nombre == "FB") {
								grupoDatos.splice(i, 1); // No se muestra la factura base.
								break;
							}
						}
						cb(200, grupoDatos);
					} else {
						cb(404, { message: 'No se encontraron elementos para esta carpeta de importación.' });
					}
				}
			});
		},

		getElementoById: function (tenantId, idElemento, cb) {

			var carpetaElementoConstructor = global.db.models.carpeta_importacion_elemento;
			carpetaElementoConstructor.find({ id: idElemento }, function (err, grupoDatos) {
				if (err) {
					cb(500, { message: 'Ocurrió un error.' });
				} else {

					if (grupoDatos.length > 0) {
						cb(200, grupoDatos);
					} else {
						cb(404, { message: 'No se encontraron elementos para esta carpeta de importación.' });
					}
				}
			});
		},

		actualizarMonto: function (tenantId, userId, paramId, body, cb) {

			var elementoImporatcionConstructor = global.db.models.carpeta_importacion_elemento;
			var nuevoMonto = body.monto
			console.log("body.tipo_cambio")
			console.log(body.tipo_cambio)
			if (body.moneda == "USD") {
				nuevoMonto = nuevoMonto * body.tipo_cambio
			}
			elementoImporatcionConstructor.get(paramId, function (err, obj) {
				if (err) {
					cb(500, { err: err });
				}
				else {

					if (obj) {
						obj.monto = (obj.monto + nuevoMonto),
							obj.updated_by = userId,
							obj.updated_date = new Date()
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
						cb(404, { message: 'NO EXISTE ELEMENTO' });
					}

				}
			});
		}

	}
};