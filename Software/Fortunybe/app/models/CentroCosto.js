module.exports = function (db, cb) {
  global.db.define("centro_costo", {

  	codigo: {
	      type: 'text',
	      required: true
	},

	nombre: {
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

