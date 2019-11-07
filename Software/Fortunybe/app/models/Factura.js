module.exports = function (db, cb) {
  global.db.define("factura", {

  	num_factura: {
	      type: 'text',
	      required: true
	},

	fecha_emision: {
	      type: 'date'
	},

	fecha_recepcion: {
	      type: 'date'
	},

	cliente_id: {
	      type: 'number'
	},

	orden_compra: {
	      type: 'text'
	},
	impuesto_id: {
	      type: 'number'
	},
	impuesto_valor: {
	      type: 'number'
	},

	guia_remision_id: {
	      type: 'number'
	},

	despacho_id: {
	      type: 'number'
	},

	lote_id: {
	      type: 'number'
	},

	condicion_venta: {
	      type: 'text'
	},

	fecha_vencimiento: {
	      type: 'date'
	},

	moneda: {
	      type: 'text'
	},

	referencia: {
	      type: 'text'
	},

	sub_total: {
	      type: 'number'
	},

	igv: {
	      type: 'number'
	},

	total_factura: {
	      type: 'number'
	},

	estado_factura_id: {
	      type: 'number',
	      required: true
	},

	tipo_factura_id: {
	      type: 'number',
	      required: true
	},

	usuario_creacion:{
		type: 'number'
	},

	fecha_creacion:{
		type: 'date'
	},

	usuario_modificacion:{
		type: 'number'
	},

	fecha_modificacion:{
		type: 'date'
	},

	cuenta_detraccion:{
		type: 'text'
	},

	tipo_documento:{
		type: 'text'
	},
	serie:{
		type: 'text'
	},
	centro_costo_id:{
		type: 'number'
	},
	centro_costo:{
		type: 'text'
	}

  }, {
    	cache   : false
	});
     return cb();
};

