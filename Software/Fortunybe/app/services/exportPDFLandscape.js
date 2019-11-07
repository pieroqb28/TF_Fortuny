var fs = require('fs');
var handlebars = require('handlebars');
var wkhtmltopdf = require('wkhtmltopdf');
var merge = require('easy-pdf-merge');
var numMoneda = require('./numerosMonedas')
module.exports = function (status, resultQuery, templatePDF, nombrePdf, cb) {
    if (status != 200) {
        cb(500, { err: err });
    } else {
        fs.readFile('./app/views/' + templatePDF + '.tmpl', function (err, data) {
            if (!err) {
                var source = data.toString();
                var template = handlebars.compile(source);
                // kMendoza esta funcion permite formatear a 2 decimales un numero que se muestra en el pdf
                // la fomarma de usarla en el template es : {{numeroFixed variable}}
                handlebars.registerHelper('numeroFixed', function (numero) {
                    numero = numMoneda(numero, 2, ".", ",");
                    return numero;
                });
                handlebars.registerHelper('numeroPagina', function (numeroPagina) {

                    return resultQuery[0].pagina[0].NumCotizacion;
                });
                handlebars.registerHelper('numeroOrdenCompra', function (numeroPagina) {

                    return resultQuery[0].pagina[0].numero;
                });
                handlebars.registerHelper('OCOAK', function (numero) {
                    var inicio = numero.substr(0, 6);
                    var numConsecutivo = numero.substr(7);
                    numero = inicio + "7" + numConsecutivo;
                    return numero;
                });
                handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
                    switch (operator) {
                        case '==':
                            return (v1 == v2) ? options.fn(this) : options.inverse(this);
                        case '===':
                            return (v1 === v2) ? options.fn(this) : options.inverse(this);
                        case '<':
                            return (v1 < v2) ? options.fn(this) : options.inverse(this);
                        case '<=':
                            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                        case '>':
                            return (v1 > v2) ? options.fn(this) : options.inverse(this);
                        case '>=':
                            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                        case '&&':
                            return (v1 && v2) ? options.fn(this) : options.inverse(this);
                        case '||':
                            return (v1 || v2) ? options.fn(this) : options.inverse(this);
                        default:
                            return options.inverse(this);
                    }
                });
                if(nombrePdf == "internalBalanceSheet"){
                    var resultArchivo = template(resultQuery);
                }else{
                var resultArchivo = template(resultQuery[0]);
                }
                wkhtmltopdf(resultArchivo, { output: nombrePdf + '.pdf', 'dpi': 72, 'margin-bottom': "0mm", 'margin-top': "0mm", "margin-right": "0mm", "orientation": "Landscape" }, function (code, signal) {
                    if (templatePDF == "cotizacionPDF") {
                        merge([nombrePdf + '.pdf', './app/views/TerminosyCondiciones.pdf'], nombrePdf + '.pdf', function (err) {
                            if (err) {
                            }
                            else {

                                fs.readFile(nombrePdf + '.pdf', function (err, data) {
                                    cb(200, data)
                                })
                            }

                        });
                    }
                    else {
                        fs.readFile(nombrePdf + '.pdf', function (err, data) {
                            cb(200, data)
                        })
                    }
                })
            } else {
                cb(500, { err: err });
            }
        })
    }
}