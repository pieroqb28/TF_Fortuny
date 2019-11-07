module.exports = function (db, cb) {
	global.db.define("carpeta_import_doc_detalle_carpeta", {

		id_documento_detalle: {
			type: 'text',
		},
		id_carpeta_importacion_elemento: {
			type: 'number',
		},
		monto: {
			type: 'number',
		},
		fecha_pase: {
			type: 'date'
		}

	}, {
			cache: false
		});

	return cb();
};

