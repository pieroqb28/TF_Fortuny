module.exports = function (db, cb) {
  global.db.define("tipo_cambio", {

  
	moneda: {
	      type: 'text',
	      required: true
	},
	cambio: {
	      type: 'number',
	      required: true
	},
	
	fecha: {
	      type: 'date',
	      required: true
	},


 }, {
    	cache   : false
	});
  
   return cb();
};

