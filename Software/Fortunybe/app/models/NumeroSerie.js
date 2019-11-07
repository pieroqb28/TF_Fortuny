module.exports = function(db, cb) {
  global.db.define("numero_serie", {
    codigo: {
      type: 'text',
      required: true
    },

    numInicio: {
      type: 'text',
      
    },

    numFinal: {
      type: 'text',
      
    },
    tipo_documento: {
      type: 'text',
      required: true
    },

  }, {
    cache: false
  });

  return cb();
};
