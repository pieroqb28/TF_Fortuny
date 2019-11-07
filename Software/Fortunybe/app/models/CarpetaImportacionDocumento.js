module.exports = function (db, cb) {
	global.db.define("carpeta_importacion_documento", {

		carpeta_importacion_elemento_id: {
			type: 'number'
		},

		codigo: {
			type: 'text',
			required: true
		},

		proveedor_id: {
			type: 'number'
		},

		fecha: {
			type: 'date'
		},
		moneda: {
			type: 'text'
		},
		tipo_cambio: {
			type: 'number'
		},
		monto: {
			type: 'number'
		},
		cuenta_id: {
			type: 'number'
		},
		/*centro_costo_id: {
			type: 'number'
		},*/
		impuesto_id: {
			type: 'number'
		},
		impuesto_valor: {
			type: 'number'
		},
		impuesto_monto: {
			type: 'number'
		},
		fecha_creacion: {
			type: 'date'
		},
		usuario_creacion: {
			type: 'number'
		},
		fecha_modificacion: {
			type: 'date'
		},
		usuario_modificacion: {
			type: 'number'
		},
		fecha_pase: {
			type: 'date'
		},
		fecha_registro: {
			type: 'date'
		}

	}, {
			cache: false
		});
	return cb();
};

