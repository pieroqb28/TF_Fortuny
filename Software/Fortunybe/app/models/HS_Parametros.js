
// HS_Roles.js
module.exports = function (db, cb) {
	global.db.define("hs_parametros", {


   
    nombreParam: {
      type: 'text',
      required: true
    },
    valorParam: {
      type: 'text',
      
    },
    nivel: {
      type: 'text',
      //'GLOBAL','COMPANY', 'USER'
    },
    created_by: {
      type: 'text',
      
    },
    created_date: {
      type: 'date',
      
    },
    updated_by: {
      type: 'text',
      
    },
   updated_date: {
      type: 'date',
      
    },
    
}, {
      cache   : false
  });
	return cb();
};
