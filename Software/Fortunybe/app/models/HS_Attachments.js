//HS_FUNCIONALIDADES.js

module.exports = function (db, cb) {


  global.db.define("hs_attachments", {
   
    filename: {
      type: 'text'      

    },
 internalFilename: {
      type: 'text'      

    },
     contentType: {
      type: 'text'      

    }, tipoEntidad: {
      type: 'text'      

    }, 
      ruta: {
      type: 'text'      

    }, 
      idEntidad: {
      type: 'text'      

    },

    size: {
      type: 'number'
    },
    uploadedBy: {
      type: 'number'
    },

     created_date:{
       type: 'date',
    }

    
}, {
      cache   : false
  });

   return cb();
};