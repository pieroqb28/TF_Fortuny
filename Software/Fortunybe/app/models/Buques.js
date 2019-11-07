module.exports = function (db, cb) {
  global.db.define("buques", {

 	cliente_id: {
	      type: 'number',
	},
	nombre: {
	      type: 'text',
	},
	IMO: {
	      type: 'text',
	},
	tipo: {
	      type: 'text',
	      required: true
	}


 }, {
    	cache   : false
	});
  
   return cb();
};

