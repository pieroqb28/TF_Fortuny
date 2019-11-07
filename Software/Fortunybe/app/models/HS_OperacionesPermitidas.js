//HS_FUNCIONALIDADES.js

module.exports = function (db, cb) {


  global.db.define("hs_operacionespermitidas", {
   
    url: {
      type: 'text'      

    },

    verbo: {
      type: 'text',
   
    }
    
}, {
    	cache   : false
	});

   return cb();
};