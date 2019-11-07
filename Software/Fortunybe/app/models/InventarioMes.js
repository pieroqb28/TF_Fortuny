module.exports = function (db, cb) {
  global.db.define("inventario_mes", {

  	mes: {
	    type: 'number'
	},
	anio: {
	    type: 'number'
	},
	cerrado_inventario: {
	    type: 'number'
	},
	cerrado_kardex: {
		type: 'number'	
	},
	cerrado_order_intake:{
		type: 'number'	
	}
	
  }, {
    	cache   : false
	});
  
   return cb();
};