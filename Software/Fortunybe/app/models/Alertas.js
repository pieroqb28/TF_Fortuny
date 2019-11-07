module.exports = function (db, cb) {
  global.db.define("alertas", {

 	nombre: {
	      type: 'text',
	},
	email: {
	      type: 'text',
	}
	

 }, {
    	cache   : false
	});
  
   return cb();
};

