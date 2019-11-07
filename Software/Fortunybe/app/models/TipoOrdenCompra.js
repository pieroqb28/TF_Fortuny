module.exports = function (db, cb) {

	global.db.define("tipo_orden_compra", {

		nombre: {
		    type: 'text'
		},
		/*minimoAdjuntos: {
		    type: 'number'
		},*/
	}, {
    	cache   : false
	});

	return cb();
};


