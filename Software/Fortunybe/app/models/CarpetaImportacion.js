module.exports = function (db, cb) {
	global.db.define("carpeta_importacion", {

		codigo: {
			type: 'text',
			required: true
		},

		orden_compra_id: {
			type: 'number',
			required: true
		},

		proveedor_id: {
			type: 'number',
			required: true
		},

		fecha: {
			type: 'date',
			required: true
		},

		pais: {
			type: 'text',
			required: true
		},
		guia_aerea: {
			type: 'text',
		},

		numero_proforma: {
			type: 'text'
		},

		moneda: {
			type: 'text',
			required: true
		},

		prorrateo: {
			type: 'text',
			required: true
		},

		incoterm_id: {
			type: 'number',
			required: true
		},

		centro_costo_id: {
			type: 'number',
			required: true
		},

		estado_id: {
			type: 'number',
			required: true
		},

		usuario_creacion: {
			type: 'number'
		},

		fecha_creacion: {
			type: 'date'
		},

		usuario_modificacion: {
			type: 'number'
		},

		fecha_modificacion: {
			type: 'date'
		},
		tipo_carpeta_importacion: {
			type: 'text'
		},
		correlativo_carpeta_importacion_parcial: {
			type: 'number'
		}
	}, {
			cache: false
		});
	return cb();
};

