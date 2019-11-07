module.exports = function (db, cb) {
    global.db.define("list", {
  
        nombre: {
            type: 'text',
            required: true
      },
      descripcion: {
            type: 'text',
            required: true
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
  
  