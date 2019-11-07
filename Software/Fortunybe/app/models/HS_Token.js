// HS_Token.js
module.exports = function (db, cb) {


  global.db.define("hs_token", {
       idUsuario: {
      type: 'text'      

    },
    idRol:{
      type: 'text'
    },
    token: {
        type: 'text',
        size: 1000

      }, 
       tenant: {
        type: 'text',
        size: 1000

      },  
      vigente_desde: {
        type: 'date'
  
      },  
      vigente_hasta: {
          type: 'date'

      },
      valorRecuperacion: {
          type: 'number',

      }
      }, {
      cache   : false
  });


   return cb();
};

