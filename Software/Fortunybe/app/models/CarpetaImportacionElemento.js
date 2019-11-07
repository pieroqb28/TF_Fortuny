module.exports = function (db, cb) {
  global.db.define("carpeta_importacion_elemento", {

  	carpeta_importacion_id: {
	    type: 'number',
	    required:true
	},

	nombre: {
	    type: 'text',
	    required:true
	},

	monto: {
	    type: 'number'
	},
	contable:{
		type: 'number'	
	}

  }, {
    	cache   : false
	});
     return cb();
};

