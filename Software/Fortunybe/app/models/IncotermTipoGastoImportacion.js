module.exports = function (db, cb) {
  global.db.define("incoterm_x_tipo_gasto_importacion", {

  	incoterm_id: {
	    type: 'number',
	    required:true
	},

	tipo_gasto_id: {
	    type: 'number',
	    required:true
	},

	incluido: {
	    type: 'number',
	    required:true
	}

  }, {
    	cache   : false
	});
     return cb();
};

