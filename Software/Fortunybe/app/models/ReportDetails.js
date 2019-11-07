module.exports = function (db, cb) {
    global.db.define("report_details", {
  
        idReport: {
            type: 'number',
            required: true
         },
         idInfluencer: {
            type: 'number',
            required: true
         },
         urlPost: {
            type: 'text',
            required: true
         }

     }, 
     {
          cache   : false
      });
    
     return cb();
  };
  
  