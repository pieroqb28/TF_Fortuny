module.exports = function (db, cb) {
  global.db.define("orden_compra", {  

	proveedor_id: {
	      type: 'number',
	      required: true
	},
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

	termino_pago: {
	      type: 'text',
	      //required: true
	},

	orden_trabajo: {
	      type: 'text',
	      //required: true
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

	igv: {
	      type: 'number',
	      //required: true
	},
	
	fecha_aprobacion: {
	      type: 'date'
	},
	
	fecha_aceptacion_proveedor: {
	      type: 'date'
	},
	your_ref: {
	      type: 'text',	  
	},
	our_ref: {
	      type: 'text',	  
	},

	razon_rechazo: {
	      type: 'text',
	      //required: true
	},
	desc_especial: {
	      type: 'number',	      
	},
	porc_desc_especial: {
	      type: 'number',	      
	},
	go_discount: {
	      type: 'number',	      
	},
	porc_go_discount:{
		type: 'number'

	},
	gastos_extras: {
	      type: 'number',	      
	},
	terminos_condiciones:{
		type: 'text',
	},
	exworks: {
	      type: 'number',	      
	},
	exonerado: {
	      type: 'number',	      
	},
	impuesto_adicional: {
	      type: 'number',	      
	},
	porcentaje_impuesto_adicional: {
	      type: 'number',	      
	},
	total: {
	      type: 'number',
	      //required: true
	},
	req_compra_id:{
		type: 'number'

	},
	cuenta_contable:{
		type: 'number'

	},
	solicitud_id:{
		type: 'number'

	},
	carpeta_importacion_id:{
		type: 'number'

	},
	impuesto_id:{
		type: 'number'

	},	
	confirmador_id:{
		type: 'number'

	},	
	impuesto_monto:{
		type: 'number'

	},
	numero_secuencia:{
		type: 'text'
	},
	clase_compra:{
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

