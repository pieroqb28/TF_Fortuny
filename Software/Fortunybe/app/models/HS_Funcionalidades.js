//HS_FUNCIONALIDADES.js

module.exports = function (db, cb) {


  global.db.define("hs_funcionalidades", {
   
    funcionalidad: {
      type: 'text'      

    },

    modulo: {
      type: 'text',
      required: true
    },

    url: {
      type: 'text',
      required: true
    },
    visible: {
      type: 'number',
      required: true
    },
     created_by:{
       type: 'text',
    }

    
}, {
      cache   : false
  });

   return cb();
};