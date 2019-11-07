module.exports = function (db, cb) {
  global.db.define("aprobacion", {

  	solicitud_id: {
	      type: 'number',
	      required: true
	},
	 grupoAprobacion_id: {
	      type: 'number',
	      required: true
	},

	usuario_id: {
	      type: 'number',
	},
	aprobado: {
	      type: 'number',
	},
	fecha_creacion:{
		type: 'date'
	},
	fechaAprobacion: {
	      type: 'date',
	},
	razonRechazo: {
		type: 'text'
	}

  }, {
    	cache   : false
	});
  
   return cb();
};