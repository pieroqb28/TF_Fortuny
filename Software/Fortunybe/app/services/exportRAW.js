var mesLetras = require('./numMesLetras');

module.exports = function (status, resultQuery, typeTemplate, cb) {
    //Guia de encriptacion de caracteres
    /*
    CharCode(27) == -.Holincrypt-.27
    CharCode(64) == -.Holincrypt-.64
    CharCode(77) == -.Holincrypt-.77
    CharCode(48) == -.Holincrypt-.48
    CharCode(107) == -.Holincrypt-.107
    \n == -.Holincrypt-.newline
    CharCode(64) == -.Holincrypt-.64
    */
    //Configuracion valida para todos los documentos excepto guias de remision
    function configurarPagina() {
        return [
            //Resetea la configuracion a los predefinidos
            //margen izquierdo 3mm
            '-.Holincrypt-.27' + '-.Holincrypt-.64',
            //Espaciado a 12cpi 10.5 puntos
            '-.Holincrypt-.27' + '-.Holincrypt-.77',
            //Espaciado a 1/8 inch
            '-.Holincrypt-.27' + '-.Holincrypt-.48',
            //Establecer fuente Sans Serif
            '-.Holincrypt-.27' + '-.Holincrypt-.107' + '1'
        ];
    }
    function configurarCabeceraGuiaRemision() {
        return [
            //Resetea la configuracion a los predefinidos
            //margen izquierdo 3mm
            '-.Holincrypt-.27' + '-.Holincrypt-.64',
            //Espaciado a 15cpi
            '-.Holincrypt-.27' + '-.Holincrypt-.77',
            //Espaciado a 1/8 inch
            '-.Holincrypt-.27' + '-.Holincrypt-.51' + '-.Holincrypt-.14',
            //'-.Holincrypt-.27' + '-.Holincrypt-.48',
            //Establecer fuente Sans Serif
            '-.Holincrypt-.27' + '-.Holincrypt-.107' + '1'
        ];
    }
    function escribirCaracter(caracter, cantidad) {
        var result = '';
        for (var i = 0; i < cantidad; i++) {
            result += caracter;
        }
        return result;
    }
    function escribirColumna(texto, tamanioColumna, alineado, nuevaLineaEspaciado) {
        //Alineado (solo funciona cuando solo es una linea, sino toma por defecto alineado izquierdo)
        // D = Derecho
        // I = Izquierdo
        // Si no es definido el valor por defecto es Izquierdo
        texto = texto || "";
        nuevaLineaEspaciado = nuevaLineaEspaciado || 0;
        if (typeof texto == 'number') {
            texto = texto.toString();
        }
        alineado = alineado || 'I';
        var result = '';
        //Cuando el texto es menor que el tamaño de la columna
        if (texto.length <= tamanioColumna) {
            switch (alineado) {
                case 'D':
                    {
                        result = { filasAdicionales: 0, datos: escribirCaracter(' ', tamanioColumna - texto.length) + texto };
                        break;
                    }
                case 'I':
                    {
                        result = { filasAdicionales: 0, datos: texto + escribirCaracter(' ', tamanioColumna - texto.length) };
                        break;
                    }
            }
        } else {
            //el texto se tiene que partir y crear una nueva columna, disminuyendo el numero de espacios disponibles estandar
            var split = ajustarTextoAColumna(texto, tamanioColumna);
            result = {
                filasAdicionales: 1,
                datos:
                //primera linea
                split.ladoIzquierdo + escribirCaracter(' ', tamanioColumna - split.ladoIzquierdo.length),
                //segunda linea
                datoslinea2: escribirCaracter(' ', nuevaLineaEspaciado) + split.ladoDerecho + escribirCaracter(' ', tamanioColumna - split.ladoDerecho.length)
            }
        }
        return result;
    }
    function ajustarTextoAColumna(texto, totalColumna) {
        var arregloTexto = texto.split(' ');
        var resultadoIzq = "";
        var resultadoDer = "";
        var numeroMaximo = 0;
        var iterador = -1;
        while (numeroMaximo <= totalColumna && iterador < (arregloTexto.length - 2)) {
            iterador++;
            resultadoIzq += arregloTexto[iterador] + ' ';
            var longitudSiguiente = 0;
            numeroMaximo = resultadoIzq.length + arregloTexto[iterador + 1].length;
        }
        for (var i = iterador + 1; i < arregloTexto.length; i++) {
            resultadoDer += arregloTexto[i] + ' ';
        }
        return { ladoIzquierdo: resultadoIzq, ladoDerecho: resultadoDer };
    }
    //Manejando el statusCode y devolviendo el error
    if (status != 200) {
        cb(500, { err: err });
    } else {
        //Manejando la logica
        //Posibles Templates
        //1. factura
        //2. boleta
        //3. guiaRemision
        //4. notaDebito
        //5. notaCredito
        //Query obtenido de la base de datos con la información para llenar
        var queryData = resultQuery[0];
        var templateResult = new Array();
        switch (typeTemplate) {
            case '1':
                {
                    for (var property in queryData) {
                        if (queryData[property] == null) {
                            queryData[property] = ""
                        }
                    }
                    //Configuracion para la Factura
                    var totalProductos = 30;
                    templateResult = templateResult.concat(configurarPagina());
                    //espaciado inicial
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 16));
                    //Cabecera
                    templateResult.push('       ' + queryData.fechaDia + '       ' + escribirColumna(queryData.fechaMes, 12).datos + '                  ' + queryData.fechaAnio + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.nombreCliente, 52).datos + '        ' + queryData.rucCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.direccionCliente, 52).datos + '        ' + queryData.ciudadCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push(escribirCaracter(' ', 69) + queryData.telefonoCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('                 ' + escribirColumna(queryData.numGuiaRem, 17).datos + '         ' + escribirColumna(queryData.orden_compra, 15).datos + '           ' + queryData.condicion_venta);
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 6));
                    //Comienzo de la tabla de productos
                    for (var i = 0; i < queryData.detalles.length; i++) {
                        var detalleProductoInsert = escribirColumna(queryData.detalles[i].detalle, 54, 'I', 13);
                        templateResult.push('  ' + escribirColumna(queryData.detalles[i].cantidad, 8, 'D').datos + '  ' + detalleProductoInsert.datos + escribirColumna(queryData.detalles[i].precio_unitario, 11, 'D').datos + escribirColumna(queryData.detalles[i].total, 14, 'D').datos + '-.Holincrypt-.newline');
                        if (detalleProductoInsert.datoslinea2 != undefined) {
                            template.push(detalleProductoInsert.datoslinea2 + '-.Holincrypt-.newline');
                        }
                        totalProductos = totalProductos - detalleProductoInsert.filasAdicionales;
                        totalProductos--;
                    }
                    //Espaciado hasta la zona de observacion y ReferencePO -- el +2 es para dejar 2 lineas en blanco y diferenciarse de la cantidad de productos
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', totalProductos + 2));
                    //Espacio para las observaciones
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    //Our Reference PO
                    templateResult.push('             OUR REFERENCE PO IS: ' + /*queryData.referencia*/ queryData.orden_compra + '-.Holincrypt-.newline');
                    templateResult.push('             SIRVASE CANCELAR ANTES DEL DIA : ' + queryData.fecha_vencimiento);
                    //Espaciado 
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    templateResult.push(escribirCaracter(' ', 77) + escribirColumna(queryData.sub_total, 14, 'D').datos + '-.Holincrypt-.newline');
                    templateResult.push('-.Holincrypt-.newline');
                    var splitTextResult = ajustarTextoAColumna(queryData.total_factura_letras, 38);
                    templateResult.push('       ' + escribirColumna(splitTextResult.ladoIzquierdo, 40).datos + escribirCaracter(' ', 29) + escribirColumna(queryData.igv, 15, 'D').datos + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    if (splitTextResult.ladoDerecho != undefined) {
                        var numeroletrasfinal = escribirColumna(splitTextResult.ladoDerecho, 38, 'I', 7);
                        templateResult.push('       ' + numeroletrasfinal.datos + escribirCaracter(' ', 37) + escribirColumna(queryData.total_factura, 15).datos + '-.Holincrypt-.newline');
                        if (numeroletrasfinal.datoslinea2 != undefined) {
                            templateResult.push(numeroletrasfinal.datoslinea2);
                        }
                    } else {
                        templateResult.push(escribirCaracter(' ', 76) + escribirColumna(queryData.total_factura, 14, 'D').datos + '-.Holincrypt-.newline');
                    }
                    break;
                }
            case '2':
                {
                    for (var property in queryData) {
                        if (queryData[property] == null) {
                            queryData[property] = ""
                        }
                    }
                    //Configuracion para la Boleta
                    var totalProductos = 8;
                    templateResult = templateResult.concat(configurarPagina());
                    //espaciado inicial
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 16));
                    //Cabecera
                    templateResult.push('       ' + queryData.fechaDia + '       ' + escribirColumna(queryData.fechaMes, 12).datos + '                  ' + queryData.fechaAnio + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.nombreCliente, 52).datos + '        ' + queryData.rucCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.direccionCliente, 52).datos + '        ' + queryData.ciudadCliente + '-.Holincrypt-.newline-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push(escribirCaracter(' ', 69) + queryData.telefonoCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('                 ' + escribirColumna(queryData.numGuiaRem, 19).datos + '         ' + escribirColumna(queryData.orden_compra, 13).datos + '           ' + queryData.condicion_venta);
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 6));
                    //Comienzo de la tabla de productos
                    for (var i = 0; i < queryData.detalles.length; i++) {
                        var detalleProductoInsert = escribirColumna(queryData.detalles[i].detalle, 52, 'I', 13);
                        templateResult.push('  ' + escribirColumna(queryData.detalles[i].cantidad, 9, 'D').datos + '  ' + detalleProductoInsert.datos + escribirColumna(queryData.detalles[i].precio_unitario, 11, 'D').datos + escribirColumna(queryData.detalles[i].total, 14, 'D').datos + '-.Holincrypt-.newline');
                        if (detalleProductoInsert.datoslinea2 != undefined) {
                            template.push(detalleProductoInsert.datoslinea2 + '-.Holincrypt-.newline');
                        }
                        totalProductos = totalProductos - detalleProductoInsert.filasAdicionales;
                        totalProductos--;
                    }
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', totalProductos));
                    //Espaciado 
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    templateResult.push('-.Holincrypt-.newline');
                    var splitTextResult = ajustarTextoAColumna(queryData.total_factura_letras, 38);
                    templateResult.push('       ' + escribirColumna(splitTextResult.ladoIzquierdo, 38).datos + escribirCaracter(' ', 31) + escribirColumna(queryData.total_factura, 14, 'D').datos + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    if (splitTextResult.ladoDerecho != undefined) {
                        var numeroletrasfinal = escribirColumna(splitTextResult.ladoDerecho, 38, 'I', 7);
                        templateResult.push('       ' + numeroletrasfinal.datos + '-.Holincrypt-.newline');
                        if (numeroletrasfinal.datoslinea2 != undefined) {
                            templateResult.push(numeroletrasfinal.datoslinea2);
                        }
                    }
                    break;
                }
            case '3':
                {
                    var queryData = resultQuery;
                    for (var property in queryData) {
                        if (queryData[property] == null) {
                            queryData[property] = ""
                        }
                        if (typeof queryData[property] == 'object') {
                            for (var item in queryData[property]) {
                                if (queryData[property][item] == null || queryData[property][item] == undefined) {
                                    queryData[property][item] = ""
                                }
                            }
                        }
                    }

                    //Configuracion para la Guia de Remision
                    var totalProductos = 30;
                    templateResult = templateResult.concat(configurarCabeceraGuiaRemision());
                    //espaciado inicial
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 31));
                    //Cabecera
                    var timestamp = new Date();
                    var dia = timestamp.getDate() <= 9 ? "0" + timestamp.getDate() : timestamp.getDate();
                    var mes = mesLetras(parseFloat(timestamp.getMonth()) + 1);
                    templateResult.push(escribirCaracter(' ', 59) + '  ' + dia + '          ' + escribirColumna(mes, 12).datos + '    ' + timestamp.getFullYear() + ' -.Holincrypt-.newline-.Holincrypt-.newline-.Holincrypt-.newline-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('             ' + escribirColumna(queryData.cabecera.nombreCliente, 55).datos + queryData.cabecera.ruc + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('             ' + escribirColumna(queryData.cabecera.punto_partida, 55).datos + queryData.cabecera.telefono + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('             ' + escribirColumna(queryData.cabecera.punto_llegada, 55).datos + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push(escribirCaracter(' ', 68) + queryData.cabecera.transporte_rs + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push(escribirCaracter(' ', 68) + queryData.cabecera.transporte_ruc + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push(escribirCaracter(' ', 28) + escribirColumna(queryData.numero_pedido, 8).datos + '       ' + escribirColumna(queryData.cabecera.orden_compra_cliente, 13).datos);
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 10));
                    //Comienzo de la tabla de productos
                    templateResult = templateResult.concat(configurarPagina());
                    for (var i = 0; i < queryData.detalle.length; i++) {
                        templateResult.push(escribirColumna(' ', 9).datos + escribirColumna(queryData.detalle[i].cantidad, 9, 'D').datos + ' ' + escribirColumna(queryData.detalle[i].unidad, 10, 'D').datos + '  ' + escribirColumna(queryData.detalle[i].descripcion + '-' + queryData.detalle[i].codigo_articulo, 54).datos + ' ', escribirColumna(queryData.detalle[i].peso_kg, 10).datos + '-.Holincrypt-.newline');
                        totalProductos--;
                    }
                    //Espaciado hasta la zona de observacion y ReferencePO -- el +2 es para dejar 2 lineas en blanco y diferenciarse de la cantidad de productos
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', totalProductos + 5));
                    //Espacio para las observaciones
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    //Our Reference PO
                    templateResult.push('                              OUR REFERENCE PO IS ' + queryData.cabecera.referencePO + '-.Holincrypt-.newline');
                    break;
                }
            case '4':
                {
                    for (var property in queryData) {
                        if (queryData[property] == null) {
                            queryData[property] = ""
                        }
                    }
                    //Configuracion para la Nota de Debito
                    var totalProductos = 30;
                    templateResult = templateResult.concat(configurarPagina());
                    //espaciado inicial
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 16));
                    //Cabecera
                    templateResult.push('       ' + queryData.fechaDia + '       ' + escribirColumna(queryData.fechaMes, 12).datos + '                  ' + queryData.fechaAnio + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.nombreCliente, 52).datos + '        ' + queryData.rucCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.direccionCliente, 52).datos + '        ' + queryData.ciudadCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push(escribirCaracter(' ', 69) + queryData.telefonoCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('                 ' + escribirColumna(queryData.numGuiaRem, 19).datos);
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 6));
                    //Comienzo de la tabla de productos
                    for (var i = 0; i < queryData.detalles.length; i++) {
                        var detalleProductoInsert = escribirColumna(queryData.detalles[i].detalle, 52, 'I', 13);
                        templateResult.push('  ' + escribirColumna(queryData.detalles[i].cantidad, 9, 'D').datos + '  ' + detalleProductoInsert.datos + escribirColumna(queryData.detalles[i].precio_unitario, 11, 'D').datos + escribirColumna(queryData.detalles[i].total, 14, 'D').datos + '-.Holincrypt-.newline');
                        if (detalleProductoInsert.datoslinea2 != undefined) {
                            template.push(detalleProductoInsert.datoslinea2 + '-.Holincrypt-.newline');
                        }
                        totalProductos = totalProductos - detalleProductoInsert.filasAdicionales;
                        totalProductos--;
                    }
                    //Espaciado hasta la zona de observacion y ReferencePO -- el +2 es para dejar 2 lineas en blanco y diferenciarse de la cantidad de productos
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', totalProductos + 2));
                    //Espacio para las observaciones
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    //Our Reference PO
                    templateResult.push('              OUR REFERENCE PO IS ' + queryData.centro_costo_id + '-.Holincrypt-.newline');
                    templateResult.push('              SIRVASE CANCELAR ANTES DEL DIA : ' + queryData.fecha_vencimiento);
                    //Espaciado 
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    templateResult.push(escribirCaracter(' ', 76) + escribirColumna(queryData.sub_total, 14, 'D').datos + '-.Holincrypt-.newline');
                    templateResult.push('-.Holincrypt-.newline');
                    var splitTextResult = ajustarTextoAColumna(queryData.total_factura_letras, 38);
                    templateResult.push('       ' + escribirColumna(splitTextResult.ladoIzquierdo, 38).datos + escribirCaracter(' ', 31) + escribirColumna(queryData.igv, 14, 'D').datos + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    if (splitTextResult.ladoDerecho != undefined) {
                        var numeroletrasfinal = escribirColumna(splitTextResult.ladoDerecho, 38, 'I', 7);
                        templateResult.push('       ' + numeroletrasfinal.datos + escribirCaracter(' ', 31) + escribirColumna(queryData.total_factura, 14, 'D').datos + '-.Holincrypt-.newline');
                        if (numeroletrasfinal.datoslinea2 != undefined) {
                            templateResult.push(numeroletrasfinal.datoslinea2);
                        }
                    } else {
                        templateResult.push(escribirCaracter(' ', 76) + escribirColumna(queryData.total_factura, 14, 'D').datos + '-.Holincrypt-.newline');
                    }
                    break;
                }
            case '5':
                {
                    //Configuracion para la Nota de Credito
                    var totalProductos = 30;
                    templateResult = templateResult.concat(configurarPagina());
                    //espaciado inicial
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 16));
                    //Cabecera
                    templateResult.push('       ' + queryData.fechaDia + '       ' + escribirColumna(queryData.fechaMes, 12).datos + '                  ' + queryData.fechaAnio + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.nombreCliente, 52).datos + '        ' + queryData.rucCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('         ' + escribirColumna(queryData.direccionCliente, 52).datos + '        ' + queryData.ciudadCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push(escribirCaracter(' ', 69) + queryData.telefonoCliente + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    templateResult.push('                 ' + escribirColumna(queryData.numGuiaRem, 19).datos);
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 6));
                    //Comienzo de la tabla de productos
                    for (var i = 0; i < queryData.detalles.length; i++) {
                        var detalleProductoInsert = escribirColumna(queryData.detalles[i].detalle, 52, 'I', 13);
                        templateResult.push('  ' + escribirColumna(queryData.detalles[i].cantidad, 9, 'D').datos + '  ' + detalleProductoInsert.datos + escribirColumna(queryData.detalles[i].precio_unitario, 11, 'D').datos + escribirColumna(queryData.detalles[i].total, 14, 'D').datos + '-.Holincrypt-.newline');
                        if (detalleProductoInsert.datoslinea2 != undefined) {
                            template.push(detalleProductoInsert.datoslinea2 + '-.Holincrypt-.newline');
                        }
                        totalProductos = totalProductos - detalleProductoInsert.filasAdicionales;
                        totalProductos--;
                    }
                    //Espaciado hasta la zona de observacion y ReferencePO -- el +2 es para dejar 2 lineas en blanco y diferenciarse de la cantidad de productos
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', totalProductos + 2));
                    //Espacio para las observaciones
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    //Our Reference PO
                    templateResult.push('              OUR REFERENCE PO IS ' + queryData.centro_costo_id + '-.Holincrypt-.newline');
                    templateResult.push('              SIRVASE CANCELAR ANTES DEL DIA : ' + queryData.fecha_vencimiento);
                    //Espaciado 
                    templateResult.push(escribirCaracter('-.Holincrypt-.newline', 3));
                    templateResult.push(escribirCaracter(' ', 76) + escribirColumna(queryData.sub_total, 14, 'D').datos + '-.Holincrypt-.newline');
                    templateResult.push('-.Holincrypt-.newline');
                    var splitTextResult = ajustarTextoAColumna(queryData.total_factura_letras, 38);
                    templateResult.push('       ' + escribirColumna(splitTextResult.ladoIzquierdo, 38).datos + escribirCaracter(' ', 31) + escribirColumna(queryData.igv, 14, 'D').datos + '-.Holincrypt-.newline-.Holincrypt-.newline');
                    if (splitTextResult.ladoDerecho != undefined) {
                        var numeroletrasfinal = escribirColumna(splitTextResult.ladoDerecho, 38, 'I', 7);
                        templateResult.push('       ' + numeroletrasfinal.datos + escribirCaracter(' ', 31) + escribirColumna(queryData.total_factura, 14, 'D').datos + '-.Holincrypt-.newline');
                        if (numeroletrasfinal.datoslinea2 != undefined) {
                            templateResult.push(numeroletrasfinal.datoslinea2);
                        }
                    } else {
                        templateResult.push(escribirCaracter(' ', 76) + escribirColumna(queryData.total_factura, 14, 'D').datos + '-.Holincrypt-.newline');
                    }
                    break;
                }
        }
        cb(200, templateResult);
    }
}