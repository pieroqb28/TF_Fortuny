module.exports = function (db, cb) {
    global.db.define("inventario_documento_manual", {

        numero: {
            type: 'text'
        },
        serie: {
            type: 'text'
        },
        fecha_creacion: {
            type: 'date'
        },
        user_id: {
            type: 'number'
        }
    }, {
            cache: false
        });
    return cb();
};
