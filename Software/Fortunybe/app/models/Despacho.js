module.exports = function (db, cb) {
  global.db.define("despacho", {

  	codigo: {
	      type: 'text',
	      required: true
	}, 

	cotizacion_id: {
	      type: 'number',
	      required: true
	  
	},	
	cliente_id: {
	      type: 'number',
	      required: true
	  
	},
  estado_id: {
        type: 'number',
        required: true
    
  },
  centro_costo_id: {
        type: 'number',
        required: true
    
  },

    fecha_recepcion:{
        type: 'date',
    },

    fecha_creacion:{
        type: 'date',
    },

    usuario_creacion:{
         type: 'text',
      },

    fecha_modificacion:{
        type: 'date',
    },
    usuario_modificacion:{
         type: 'text',
      },

  }, {
    	cache   : false
	});
  
   return cb();
};
