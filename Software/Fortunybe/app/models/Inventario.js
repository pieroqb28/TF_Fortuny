module.exports = function (db, cb) {
  global.db.define("inventario", {

  	fecha: {
	      type: 'date',
	},
	inventario_tipo_documento_id:{
	    type: 'number',
	    required: true
	},
	inventario_documento_id:{
	    type: 'number',
	    required: true
	},
	inventario_tipo_origen_id: {
	    type: 'number',
	    required: true
	},
	entidad_id: {
	    type: 'number',
	    required: true
	},
	articulo_id: {
	    type: 'number',
	    required: true
	},
	inventario_tipo_operacion_id: {
	    type: 'number',
	    required: true
	},
	cantidad: {
	    type: 'number',
	    required: true
	},
	costo_unitario: {
	    type: 'number',
	    required: true
	},
	costo_total: {
	    type: 'number',
	    required: true
	},
	final_cantidad: {
	    type: 'number'
	},
	final_costo_unitario: {
	    type: 'number'
	},
	final_costo_total: {
	    type: 'number'
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

  }, {
    	cache   : false
	});
  
   return cb();
};