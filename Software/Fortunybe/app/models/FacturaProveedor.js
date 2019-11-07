module.exports = function (db, cb) {
  global.db.define("factura_proveedores", {

  	num_factura: {
	      type: 'text',
	      required: true
	},

	fecha_emision: {
	      type: 'date'
	},
	

	proveedor_id: {
	      type: 'number'
	},

	orden_compra: {
	      type: 'text'
	},
	

	centro_costo: {
	      type: 'number'
	},

	moneda: {
	      type: 'text'
	},

	
	sub_total: {
	      type: 'number'
	},

	igv: {
	      type: 'number'
	},
	valor_igv:{
	      type: 'number'
	},

	total_factura: {
	      type: 'number'
	},

	usuario_creacion:{
		type: 'number'
	},

	fecha_creacion:{
		type: 'date'
	},
	impuesto_id:{
		type: 'number'
	},

	usuario_modificacion:{
		type: 'number'
	},

	fecha_modificacion:{
		type: 'date'
	},

	tipo_documento:{
		type: 'text'
	},
	fecha_registro:{
		type: 'date'
	}

  }, {
    	cache   : false
	});
     return cb();
};

