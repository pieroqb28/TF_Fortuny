module.exports = function (db, cb) {
  global.db.define("factura_detalle", {

  	factura_id: {
	      type: 'number',
	      required: true
	},

	cantidad: {
	      type: 'number',
	      required: true
	},

	detalle: {
	      type: 'text',
	      required: true
	},

	articulo_id: {
	      type: 'number'
	},

	precio_unitario: {
	      type: 'number',
	      required: true
	},

	total: {
	      type: 'number',
	      required: true
	}

  }, {
    	cache   : false
	});
     return cb();
};

