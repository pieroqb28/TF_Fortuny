module.exports = function (db, cb) {
    global.db.define("carpeta_importacion_parcial_articulo", {

        id_carpeta_importacion: {
            type: 'number',
            required: true
        },

        id_orden_compra: {
            type: 'number',
            required: true
        },

        id_articulo: {
            type: 'number',
            required: true
        },

        cantidad: {
            type: 'number',
            required: true
        }

    }, {
            cache: false
        });
    return cb();
};
