module.exports = function (db, cb) {

	global.db.define("tipo_articulo", {

		nombre: {
		    type: 'text'
		},
	
	}, {
    	cache   : false
	});

	return cb();
};


