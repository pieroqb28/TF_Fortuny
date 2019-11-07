module.exports = function (db, cb) {
  global.db.define("cotizacion", {

  	descripcion: {
	      type: 'text',
	      //required: true
	},

	cliente_id: {
	      type: 'number',
	      required: true
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

	numero_oferta: {
	      type: 'text',
	},
	porcentajeCostFinan: {
	      type: 'number'
	     
	},
	transp_callao: {
	      type: 'number'
	},

	impuestoAplicado: {
	      type: 'number',
	      //required: true
	},
	totalImpuestos: {
	      type: 'number',
	      //required: true
	},

	totalAdicional: {
	      type: 'number',
	      //required: true
	},

	totalDetalle: {
	      type: 'number',
	      //required: true
	},

	total: {
	      type: 'number',
	      //required: true
	},
	factor: {
	      type: 'number',
	      //required: true
	},
	impuesto_id: {
	      type: 'number',
	      //required: true
	},
	total_cotizacion: {
	      type: 'number',
	      //required: true
	},
	fecha_requerimiento: {
	      type: 'date',
	      //required: true
	},
	fecha_vencimiento:{
	      type: 'date'	  
	},
	referencia: {
	      type: 'text',
	      //required: true
	},
	notas: {
	      type: 'text',
	      //required: true
	},
	barco: {
	      type: 'text',
	      //required: true
	},
	imo: {
	      type: 'text',
	      //required: true
	},
	comentario_oi: {
	      type: 'text',
	      //required: true
	},
	
	producto_id: {
	      type: 'text',
	      //required: true
	},
	terminos_condiciones: {
	      type: 'text',
	      //required: true
	},
	poducto_type: {
	      type: 'text',
	      //required: true
	},
	contacto: {
	      type: 'text',
	      //required: true
	},
	email_contacto: {
	      type: 'text',
	      //required: true
	},
/*
	grupo_aprobacion_id: {
	      type: 'number',
	      required: true
	},
*/	
	fechaAprobada: {
	      type: 'date'
	},

	fechaAceptacionCliente: {
	      type: 'date'
	},
	fecha_cancelacion_cliente: {
	      type: 'date'
	},


	orden_compra_cliente: {
	      type: 'text',
	},
	id_orden_compra:{
	      type: 'number',	  
	},
	estado_id: {
	      type: 'number',
	      required: true
	},
	solicitud_id:{
		type: 'number'

	},
	numero_secuencia:{
		type: 'text'
	},
	usuario_creacion:{
		type: 'number',
	},
	fecha_creacion: {
	      type: 'date'
	},
	usuario_modificacion: {
	      type: 'number',
	},
	razonRechazo: {
		type: 'text'
	},
	categoria_id:{
		type: 'number'
	},
	lugar_servicio: {
		type: 'text'
	},
	fecha_inicio_servicio: {
		type: 'date'
	},
	fecha_fin_servicio: {
		type: 'date'
	},
	oferta_valida_servicio: {
		type: 'text'
	},
	tiempo_entrega_servicio: {
		type: 'text'
	},
	nombre_servicio: {
		type: 'text'
	}

  }, {
    	cache   : false
	});
     return cb();
};

