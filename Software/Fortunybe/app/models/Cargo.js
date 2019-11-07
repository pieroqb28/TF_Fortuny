module.exports = function (db, cb) {
  global.db.define("cargo", {

  	nombre: {
	      type: 'text',
	      required: true
	}

 }, {
    	cache   : false
	});
  
   return cb();
};

