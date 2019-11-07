module.exports = function (db, cb) {
  global.db.define("proveedor", {

  	nombre: {
	      type: 'text',
	      required: true
	},

	numero_proveedor: {
	      type: 'text',
	      required: true
	},

	ruc: {
	      type: 'text',
	      required: true
	},
	direccion: {
	      type: 'text',
	    
	},

	direccion2: {
	      type: 'text',
	      
	},

	tipo_proveedor: {
	      type: 'text',
	      required: true
	},
	pais: {
	      type: 'text',
	      
	},

	telefono: {
	      type: 'text',
	},
	contacto1: {
	      type: 'text',
	      required: true
	},

	email1: {
	      type: 'text',
	      required: true
	},
	telef1: {
	      type: 'text',
	     
	},
	contacto2: {
	      type: 'text',
	},

	email2: {
	      type: 'text',
	},
	telef2: {
	      type: 'text'
	     	},
	/*estado_usuario: {
	      type: 'number',
	},*/

	usuario_creacion:{
       type: 'text',
    },

    fecha_creacion:{
        type: 'date',
    },

    usuario_modificacion:{
         type: 'text',
      },

    fecha_modificacion:{
        type: 'date',
    },
    correlativo:{
        type: 'number',
    },
/*
    solicitud_id:{
        type: 'number',
    }*/
    costo_hora:{
    	type: 'number'
    },
	terminos_pago:{
    	type: 'text'
    },
    cargo_id:{
    	type:'number'
    },

    banco:{
         type: 'text',
    },

tipo_cuenta:{
         type: 'text',
    },
nro_cuenta:{
         type: 'text',
    },
cci:{
         type: 'text',
    },
titular:{
         type: 'text',
    },
tasa:{
         type: 'text',
    },
nro_det:{
         type: 'text',
    }



 }, {
    	cache   : false
	});
  
   return cb();
};

