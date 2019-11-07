module.exports = function (db, cb) {
    global.db.define("social", {
  
        name: {
            type: 'text',
            required: true
         }

     }, {
          cache   : false
      });
    
     return cb();
  };
  
  