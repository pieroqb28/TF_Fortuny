var ultimoDocumento = require('ultimoDocumentoEmitido');

function generarFacturasAnuladas(tipo_documento, numero_serie,usuario_id, numero, cb) {

  var numeroBD = ultimoDocumento(tipo_documento, numero_serie, function(status, result) {
    if (status != 200) {
      cb.status(status).json(result);
    } else {

      if (numero - result != 1) {
        for (var i = result; i < numero; i++) {
          var documentoAnuladoConstructor = global.db.models.documento_anulado;
          documentoAnuladoCrear = {
          	numero : i,
          	serie : numero_serie,
          	usuario_id: usuario_id,
          	causa: "",
          	tipo_documento : tipo_documento
          }
        }
      }
    }
  })

}
