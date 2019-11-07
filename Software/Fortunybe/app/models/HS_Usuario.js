// HS_Usuario.js
module.exports = function (db, cb) {


  global.db.define("hs_usuario", {

  	codigo: {
      type: 'text',
      size: 100

    },  
    password: {
      type: 'text',
      size: 100

    },
    salt: {
      type: 'text',
      size: 100

    },    
    nombres: {
      type: 'text',
      size: 100,
      required: true
    },  
    apellidos: {
      type: 'text',
      size: 100,
      required: true

    },  
    correo: {
      type: 'text',
      size: 100,
      required: true

    },  
    telefono: {
      type: 'text',
      size: 20

    },  

    celular: {
      type: 'text',
      size: 20

    },

    dni: {
      type: 'text',
      size: 20

    },
    estado  : {
      type: 'text',
      defaultValue:'H'

    },
    numIntentos : {
      type : 'number',
      integer: true,
      defaultValue: 0
    },
    fechaFinBloqueo : {
      type: 'date'

    },  
    externalId  : {
      type: 'text',
      size:45

    },  
    tipo_usuario: {
      type: 'text',
       enum: ['GOOGLE', 'FACEBOOK', 'LOCAL']

    },
    
    cantidad_min_bloqueado:{
      type: 'number'
    },
    hora_bloqueo:{
      type: 'date'
    },
    rol:{
      type:'text'
    },
    tenant: {
      type: 'text'

    },
     created_by:{
       type: 'text',
    },

    created_date:{
        type: 'date',
    },

    updated_by:{
         type: 'text',
      },


    updated_date:{
        type: 'date',
    },
}, {
      cache   : false
  });

  
   return cb();
};



