module.exports = function (db, cb) {
  global.db.define("articulo", {

  	ident_nro: {
	      type: 'text',
	      //required: true
	},

  	nombre: {
	      type: 'text',
	      required: true
	},

	descripcion: {
	      type: 'text',
	      //required: true
	},

	observaciones: {
	      type: 'text',
	      //required: true
	},

	traduccion: {
	      type: 'text',
	      //required: true
	},

	material: {
	      type: 'text',
	      //required: true
	},

	peso_kg: {
	      type: 'number',
	      //required: true
	},

	medidas: {
	      type: 'number',
	      //required: true
	},

	precioCompra: {
	      type: 'number',
	      //required: true
	},

	precioVenta: {
	      type: 'number',
	      //required: true
	},

	codigo_articulo: {
	      type: 'text',
	      //required: true
	},

	unidad:{
       type: 'text',
    },

	tipo_id: {
	      type: 'number',
	      enum: [1, 2, 3],
	      defaultsTo: 1,
	      required: true
	},

	habilitado: {
	      type: 'number',
	      required: true
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

    subfamilia: {
    	type: 'number'
    },
    tipo_articulo:{
    	type: 'text'
    }

  }, {
    	cache   : false
	});
  
   return cb();
};
