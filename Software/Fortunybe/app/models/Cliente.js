module.exports = function (db, cb) {
  global.db.define("cliente", {

  	nombre: {
	      type: 'text',
	      required: true
	},

	numero_cliente: {
	      type: 'text',
	      required: true
	},

	ruc: {
	      type: 'text',
	      required: true
	},
	direccion: {
	      type: 'text',
	      required: true
	},

	direccion2: {
	      type: 'text',
	      required: true
	},

	pais: {
	      type: 'text',
	      required: true
	},

	telefono: {
	      type: 'number',
	      required: true
	},
	contacto1: {
	      type: 'text',
	      required: true
	},

	email1: {
	      type: 'text',
	      required: true
	},

	contacto2: {
	      type: 'text',
	},

	email2: {
	      type: 'text',
	},
	
	estado_usuario: {
	      type: 'number',
	},

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

    solicitud_id:{
        type: 'number',
    }

 }, {
    	cache   : false
	});
  
   return cb();
};

