module.exports = function (db, cb) {
  global.db.define("despacho_detalle", {

  	despacho_id: {
	      type: 'number',
	      required: true
	}, 

	cantidad: {
	      type: 'number',
	      required: true
	  
	},	
	articulo_id: {
	      type: 'number',
	      required: true
	  
	},

    cotizacion_detalle_id:{
        type: 'number',
    },
  

  }, {
    	cache   : false
	});
  
   return cb();
};
