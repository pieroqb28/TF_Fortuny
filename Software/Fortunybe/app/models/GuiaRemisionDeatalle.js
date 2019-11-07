module.exports = function (db, cb) {
  global.db.define("guia_remision_detalle", {

  	guia_remision_id: {
	      type: 'number',
	      required: true
	},

	cantidad: {
		type: 'number'
	},

	articulo_id: {
	      type: 'number',
	      required: true
	},

	cantidad_recibida: {
	      type: 'date'
  	},
  	despacho_detalle_id: {
	      type: 'number',
	      
	},

  }, {
    	cache   : false
	});

   return cb();
};