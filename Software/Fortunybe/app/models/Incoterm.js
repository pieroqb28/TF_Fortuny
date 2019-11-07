module.exports = function (db, cb) {
	global.db.define("incoterm", {

	  	nombre: {
		    type: 'text'
		},

	  	descripcion_breve: {
		    type: 'text'
		}

	});
	return cb();
};

