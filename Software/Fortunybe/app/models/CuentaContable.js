module.exports = function (db, cb) {
  global.db.define("cuenta_contable", {

  	nombreCuenta: {
	      type: 'text',
	      required: true
	},

	descripcion: {
	      type: 'text',
	      required: true
	},
	numeroCuenta: {
	      type: 'text',
	      required: true
	},
	monedaCuenta: {
	      type: 'text',
	      required: true
	},
	bancoCuenta: {
	      type: 'text',
	      required: true
	},
	estado_CC: {
	      type: 'text',
	      required: true
	},


 }, {
    	cache   : false
	});
  
   return cb();
};

