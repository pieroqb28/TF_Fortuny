module.exports = function (db, cb) {
  global.db.define("solicitud_aprobacion", {

  	codigo: {
	      type: 'text',
	      required: true
	},

	tipo_aprobacion_id: {
	      type: 'number',
	      required: true
	},
	entidad_id:{
		  type: 'number',
	      required: true
	},
	estado_id: {
	      type: 'number',
	      required: true
	},
	
	fecha_aprobacion: {
	      type: 'date'
	},
	fecha_creacion: {
	      type: 'date',
	},
	usuario_creacion:{
		type: 'number'
	}

  }, {
    	cache   : false
	});
  
   return cb();
};
