
// HS_Roles.js
module.exports = function (db, cb) {
	global.db.define("grupo_aprobacion", {

		nombre: {
		    type: 'text',
		    required: true
		},

		tipo_aprobacion_id: {
		    type: 'number',
		    required: true
		},
		orden: {
		    type: 'number',
		    required: true
		},
		permitir_notificaciones:{
			type : 'number',
			required: true,
		},
		fecha_creacion:{
			type: 'date',
	    },

		usuario_creacion:{
			type: 'number',
	    },

	    fecha_modificacion:{
	        type: 'date',
		},

	    usuario_modificacion:{
	        type: 'number',
	    }

   
    
}, {
    	cache   : false
	});
	return cb();
};


