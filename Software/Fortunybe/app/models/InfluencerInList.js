module.exports = function (db, cb) {
    global.db.define("influencer_x_list", {
  
        idList: {
            type: 'number',
            required: true
      },
      idInfluencer: {
            type: 'number',
            required: true
      },


     }, {
          cache   : false
      });
    
     return cb();
  };
  
  