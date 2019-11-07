module.exports = function (db, cb) {
  global.db.define("carpeta_importacion_detalle", {

  	carpeta_importacion_id: {
	    type: 'number',
	    required:true
	},

	articulo_id: {
	    type: 'text',
	    required:true
	},

	cantidad: {
	    type: 'number',
	    required:true
	},

	costo_base: {
	    type: 'number',
	    required:true
	},

	total_base: {
	    type: 'number',
	    required:true
	},

	fletes: {
	    type: 'number'
	},

	otros: {
	    type: 'number'
	},

	costo_final: {
	    type: 'number'
	},

	total_final: {
	    type: 'number'
	},

	cantidad_total: {
	    type: 'number'
	},

	cantidad_trasladada: {
	    type: 'number'
	},
	
	inventario_id: {
	    type: 'number'
	}

  }, {
    	cache   : false
	});
     return cb();
};

