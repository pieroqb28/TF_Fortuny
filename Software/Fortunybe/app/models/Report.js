module.exports = function (db, cb) {
    global.db.define("report", {
  
        name: {
            type: 'text',
            required: true
         },
         create_date:{
             type: 'date',
         },
     
         create_by:{
             type: 'number',
         },
         update_date:{
             type: 'date',
         },
     
         update_by:{
             type: 'number',
         },

     }, {
          cache   : false
      });
    
     return cb();
  };
  
  