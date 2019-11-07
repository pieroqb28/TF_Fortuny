module.exports = function (db, cb) {
  global.db.define("req_compra", {  

	centro_costo: {
	      type: 'number',
	      
	},
	moneda: {
	      type: 'text',
	      //required: true
	},
	numero: {
	      type: 'text',
	      //required: true
	},
	fecha: {
	      type: 'date',
	      //required: true
	},
	fecha_entrega: {
	      type: 'date',
	      //required: true
	},
	notas: {
	      type: 'text',
	      //required: true
	},

	centro_costo_id: {
	      type: 'number',
	      
	},



	tipo_id: {
	      type: 'number',
	      //required: true
	},
	estado_id: {
	      type: 'number',
	      //required: true
	},
	total_detalle: {
	      type: 'number',
	      //required: true
	},

	
	
	fecha_aprobacion: {
	      type: 'date'
	},
	
	
	razon_rechazo: {
	      type: 'text',
	      //required: true
	},
	
	total: {
	      type: 'number',
	      //required: true
	},
	orden_compra_id:{
		type: 'number'

	},


	proveedor_id0:{
		type: 'number'

	},

	proveedor_id1:{
		type: 'number'

	},
	proveedor_id2:{
		type: 'number'

	},
	proveedor_id3:{
		type: 'number'

	},	
	solicitud_id:{
		type: 'number'

	},
	
	numero_secuencia:{
		type: 'text'
	},

	presupuestado:{
		type: 'text'
	},

	fecha_creacion: {
	      type: 'date'
	},
	usuario_creacion: {
	      type: 'number',
	},
	fecha_modificacion: {
	      type: 'date'
	},
	usuario_modificacion: {
	      type: 'number',
	},	

  }, {
    	cache   : false
	});
     return cb();
};

