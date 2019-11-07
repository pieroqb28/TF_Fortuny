
// HS_Roles.js
module.exports = function (db, cb) {
	global.db.define("hs_roles", {


   
    rol: {
      type: 'text',
      required: true
    },
   
    
}, {
    	cache   : false
	});
	return cb();
};
