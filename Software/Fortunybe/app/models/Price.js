module.exports = function (db, cb) {
    global.db.define("prices", {
  
        story: {
            type: 'number',
            required: true
         }, 
        photo: {
            type: 'number',
            required: true
        }, 
        carousel: {
            type: 'number',
            required: true
        },  
        video: {
            type: 'number',
            required: true
        },     
        idInfluencer: {
            type: 'number',
            required: true
         },
        create_by:{
            type: 'text',
        },
    
        create_date:{
            type: 'date',
        },
  

     }, {
          cache   : false
      });
    
     return cb();
  };
  
  