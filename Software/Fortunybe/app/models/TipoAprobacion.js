module.exports = function (db, cb) {

	global.db.define("tipo_aprobacion", {

		nombre: {
		    type: 'text'
		},
		cantidad_aprobaciones:{
			type: 'number'
		},
		clase:{
			type: 'text'
		}
	}, {
    	cache   : false
	});

	return cb();
};


