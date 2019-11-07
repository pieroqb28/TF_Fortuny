module.exports = function (db, cb) {
    global.db.define("influencer", {
  
        username_instagram: {
            type: 'text',
            required: true
         }, 
        id_instagram: {
            type: 'number',
            required: true
        }, 
        profile_url: {
            type: 'text'
        },  
        nombre: {
            type: 'text',
            required: true
        },     
        apellido: {
            type: 'text'
         },
        nota_personal: {
            type: 'text'
      },
      email: {
            type: 'text'
      },
      telefono: {
        type: 'number'
    },
      create_by:{
         type: 'text',
      },
  
      create_date:{
          type: 'date',
      },
  
      update_by:{
           type: 'text',
        },
  
      update_date:{
          type: 'date',
      },

     }, {
          cache   : false
      });
    
     return cb();
  };
  
  