module.exports = function (db, cb) {

	global.db.define("hs_usuario_x_grupo_aprobacion", {

	  	usuario_id: {
		    type: 'number',
		    key: true,
		    required: true
		},

		grupo_id: {
		    type: 'number',
		    key: true,
		    required: true
		},

		fecha_inicio:{
			type: 'date',
	    },

	    fecha_fin:{
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
	        type: 'number',
	    }

	}, {
    	cache   : false
	});

	return cb();

};

