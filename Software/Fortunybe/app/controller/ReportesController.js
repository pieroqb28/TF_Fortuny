/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var numLetras = require('./../services/numMesLetras');
var TipoCambioController = require('./TipoCambioController');
var primerDiaHabil = require('./../services/primerDiaHabil');
var async = require('async');
var fs = require('fs');
var Excel = require('exceljs');
var LandscapeExport = require('./../services/exportPDFLandscape');
var numMoneda = require('./../services/numerosMonedas')
module.exports = function () {
	function reporteOrder(tenantId, body, reporte, color, cb) {
		buscarReporte(tenantId, body.periodo, body.cerrar, reporte, function (err, datosReporte) {
			if (err != 200) {
				cb(500, { message: "Existe un error en el servicio" })
			}
			else {
				var nombreReporte = "Order " + reporte
				var resPeriodo = body.periodo.split("-");
				var anioPeriodo = resPeriodo[1]
				var mesPeriodo = resPeriodo[0]
				var fechaIni = new Date(resPeriodo[1] + "/" + resPeriodo[0] + "/01")
				var workbook = new Excel.Workbook();
				var worksheet = workbook.addWorksheet('Hoja 1');
				// creamos las columnas
				worksheet.columns = [
					{ header: ['', 'Item'], key: 'item', width: 6 },
					{ header: [nombreReporte, 'Customer'], key: 'cliente', width: 32 },
					{ header: ['(PO reception date) ', 'Order No.'], key: 'nume_orden', width: 25 },
					{ header: ['', ''], key: 'producto', width: 32 },
					{ header: ['', 'EUR'], key: 'mont_eur', style: { numFmt: '#,##0.00' }, width: 15 },
					{ header: ['', 'PEN'], key: 'mont_pen', style: { numFmt: '#,##0.00' }, width: 15 },
					{ header: ['', 'USD'], key: 'mont_usd', style: { numFmt: '#,##0.00' }, width: 15 },
					{ header: ['', 'GBP'], key: 'mont_gbp', style: { numFmt: '#,##0.00' }, width: 15 },
					{ header: ['', 'CHF'], key: 'mont_chf', style: { numFmt: '#,##0.00' }, width: 15 },
					{ header: ['', 'Year related'], key: 'anio_periodo', width: 20 },
					{ header: ['', 'Month related'], key: 'mes_periodo', width: 20 },
					{ header: ['', 'Details'], key: 'detalles', width: 40 },
				];
				var letras = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
				for (i = 1; i <= 2; i++) {
					for (j = 0; j < letras.length; j++) {
						var celda = letras[j] + i
						estiloBaseCeldaExcel(worksheet, celda, color)
					}
				}
				worksheet.getCell("C1").font = {
					color: { argb: 'FFFF0000' },
					size: 8,
				};
				// hacemos un maerge para la columna Amount (without Tax)
				worksheet.mergeCells('E1:I1');
				worksheet.getCell('I1').value = 'Amount (without Tax)';
				worksheet.getCell('I1').alignment = { vertical: 'middle', horizontal: 'center' };
				// AGREGANDO FILAS     
				var valor_usd = ""
				var valor_eur = ""
				var valor_pen = ""
				var valor_gbp = ""
				var valor_chf = ""
				var total_usd = 0
				var total_eur = 0
				var total_pen = 0
				var total_gbp = 0
				var total_chf = 0
				var tc_usd = 1
				var tc_euro = 1
				var tc_gbp = 1
				var numeroFila = 2 // numeroFila me hace un seguimiento en fila voy y a la cual le dare formato, se inicia en dos porque las dos primeras filas son ocupadas en la creacion de las cabeceras
				for (i = 0; i < datosReporte.length; i++) {
					if (datosReporte[i].cliente != "Holinsys_resumen_reporte") {
						numeroFila++
						switch (datosReporte[i].moneda) {
							case 'USD':
								{
									valor_usd = parseFloat(datosReporte[i].valor)
									total_usd = total_usd + parseFloat(datosReporte[i].valor)
									break;
								}
							case 'EURO':
								{
									valor_eur = datosReporte[i].valor
									total_eur = total_eur + parseFloat(datosReporte[i].valor)
									break;
								}
							case 'PEN':
								{
									valor_pen = parseFloat(datosReporte[i].valor)
									total_pen = total_pen + parseFloat(datosReporte[i].valor)
									break;
								}
							case 'GBP':
								{
									valor_gbp = parseFloat(datosReporte[i].valor)
									total_gbp = total_gbp + parseFloat(datosReporte[i].valor)
									break;
								}
							case 'CHF':
								{
									valor_chf = parseFloat(datosReporte[i].valor)
									break;
								}
						}
						worksheet.addRow({ item: datosReporte[i].item, cliente: datosReporte[i].cliente, nume_orden: datosReporte[i].num_orden, producto: datosReporte[i].articulo, mont_eur: valor_eur, mont_pen: valor_pen, mont_usd: valor_usd, mont_gbp: valor_gbp, mont_chf: valor_chf, anio_periodo: datosReporte[i].year_related, mes_periodo: datosReporte[i].month_related, detalles: datosReporte[i].detalles });
					}
					else {
						switch (datosReporte[i].moneda) {
							case 'USD':
								{
									tc_usd = datosReporte[i].valor
									break;
								}
							case 'EURO':
								{
									tc_euro = datosReporte[i].valor
									break;
								}
							case 'GBP':
								{
									tc_gbp = datosReporte[i].valor
									break;
								}
						}
					}
				}
				worksheet.addRow({ mont_eur: "€ " + numMoneda(total_eur, 2, ".", ","), mont_pen: "S/. " + numMoneda(total_pen, 2, ".", ","), mont_usd: "$ " + numMoneda(total_usd, 2, ".", ","), mont_gbp: "GBP " + numMoneda(total_gbp, 2, ".", ","), mont_chf: numMoneda(total_chf, 2, ".", ",") });
				worksheet.addRow({ mont_eur: "S/. " + numMoneda((total_eur * tc_euro), 2, ".", ","), mont_pen: "S/. " + numMoneda(total_pen, 2, ".", ","), mont_usd: "S/. " + numMoneda((total_usd * tc_usd), 2, ".", ","), mont_gbp: "S/. " + numMoneda((total_gbp * tc_gbp), 2, ".", ",") });
				worksheet.addRow({});
				worksheet.addRow({ mont_eur: "S/. " + numMoneda(((total_eur * tc_euro) + total_pen + (total_usd * tc_usd) + (total_gbp * tc_gbp)), 2, ".", ",") });
				worksheet.addRow({});
				worksheet.addRow({ mont_gbp: "T/C" + total_gbp, mont_chf: primerDiaHabil(mesPeriodo, anioPeriodo) + "/" + mesPeriodo + "/" + anioPeriodo });
				worksheet.addRow({ mont_gbp: "Euro" + total_gbp, mont_chf: tc_euro });
				worksheet.addRow({ mont_gbp: "GBP" + total_gbp, mont_chf: tc_gbp });
				worksheet.addRow({ mont_gbp: "USD" + total_gbp, mont_chf: tc_usd });
				letras = ["J", "K"]
				for (j = 3; j <= (numeroFila + 1); j++) {
					for (i = 0; i < letras.length; i++) {
						var celda = letras[i] + j
						worksheet.getCell(celda).alignment = { vertical: 'middle', horizontal: 'right' };
					}
				}
				numeroFila = numeroFila + 1
				//resultado de sumas alinear a la derecha
				letras = ["E", "F", "G", "H", "I"]
				for (j = numeroFila; j <= (numeroFila + 1); j++) {
					for (i = 0; i < letras.length; i++) {
						var celda = letras[i] + j
						worksheet.getCell(celda).alignment = { vertical: 'middle', horizontal: 'right', numFmt: '#,##0.00' };
					}
				}
				numeroFila = numeroFila + 3
				//resultado de suma total en soles alinear a la derecha
				worksheet.getCell("E" + numeroFila).alignment = { vertical: 'middle', horizontal: 'right' };
				var meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
				// combinación de celdas
				worksheet.mergeCells("C" + numeroFila + ":D" + numeroFila);
				worksheet.getCell('D' + numeroFila).value = 'Total of ' + meses[Number(mesPeriodo) - 1] + " " + anioPeriodo;
				worksheet.getCell('D' + numeroFila).alignment = { vertical: 'middle', horizontal: 'center' };
				//estiloBaseCeldaExcel es una funcion que da formato de propiedades iniciales a los header
				estiloBaseCeldaExcel(worksheet, 'D' + numeroFila, color)
				estiloBaseCeldaExcel(worksheet, 'E' + numeroFila, color)
				numeroFila = numeroFila + 2 // numeroFila me hace un seguimiento en fila voy y a la cual le dare formato
				estiloBaseCeldaExcel(worksheet, 'H' + numeroFila, color)
				estiloBaseCeldaExcel(worksheet, 'I' + numeroFila, color)
				worksheet.getCell('H' + (numeroFila + 1)).border = {
					left: { style: 'thin', color: { argb: color } },
				};
				worksheet.getCell('H' + (numeroFila + 2)).border = {
					left: { style: 'thin', color: { argb: color } },
				};
				worksheet.getCell('H' + (numeroFila + 3)).border = {
					left: { style: 'thin', color: { argb: color } },
					bottom: { style: 'thin', color: { argb: color } },
				};
				worksheet.getCell('I' + (numeroFila + 1)).border = {
					right: { style: 'thin', color: { argb: color } }
				};
				worksheet.getCell('I' + (numeroFila + 2)).border = {
					right: { style: 'thin', color: { argb: color } }
				};
				worksheet.getCell('I' + (numeroFila + 3)).border = {
					right: { style: 'thin', color: { argb: color } },
					bottom: { style: 'thin', color: { argb: color } },
				};
				var nombreExportado = Date.now()// trae los milisegundos hasta el dia de hoy, un nombre unico
				var filename = "./" + nombreExportado + ".xlsx"
				workbook.xlsx.writeFile(filename)
					.then(function () {
						fs.readFile(filename, function (err, data) {
							if (!err) {
								// GUARDAMOS EL DOCUMENTO EN DATA
								fs.unlink(filename, function (errFile) {
									if (!errFile) {
										// ELIMINAMOS EL DOCUMENTO CREADO
										// ENVIAMOS AL FRONTEND
										cb(200, data)
									}
									else {
										cb(400, { message: 'Archivo no encontrado' })
									}
								})
							} else {
								cb(400, { message: 'Archivo no encontrado' })
							}
						});
					});
			}
		})
	}
	function bordesCelda(worksheet, celda) {
		worksheet.getCell(celda).border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' }
		};
	}
	function estiloBaseCeldaExcel(worksheet, celda, colorFondo) {
		worksheet.getCell(celda).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: colorFondo }
		};
		worksheet.getCell(celda).font = {
			bold: true,
			color: { argb: 'FFFFFFFF' },
		};
	}
	function buscarReporte(tenantId, periodo, cerrar, reporte, cb) {
		var resPeriodo = periodo.split("-");
		var fechaIni = new Date(resPeriodo[1] + "/" + resPeriodo[0] + "/01")
		var fechaIni = fechaIni
		var FechaFin = new Date(fechaIni.getFullYear(), (fechaIni.getMonth()) + 1, 1);
		var anio = resPeriodo[1]
		var mes = resPeriodo[0]
		var item = 0
		if (cerrar == "true") {
			var cerrarOrder = 1
		}
		else {
			var cerrarOrder = 0
		}
		switch (reporte) {
			case "Intake":
				{
					var cadenaSql = "CALL usp_reporte_order_intake(?, ?)"
					break;
				}
			case "Backlog":
				{
					var cadenaSql = "CALL usp_reporte_order_backlog(?, ?)"
					break;
				}
		}
		// el listado que muestra son los items que aun no han sido facturados
		global.db.driver.execQuery(
			cadenaSql,
			[fechaIni, cerrarOrder],
			function (err, resultOrder) {
				if (err) {
					cb(500, { message: 'ERROR EN EL SERVICIO' });
				} else {
					if (resultOrder) {
						//var total_soles=0
						/*for(i=0;i<resultOrder[0].length;i++)
						{	
						item =item + 10
						resultOrder[0][i] = JSON.parse(JSON.stringify(resultOrder[0][i]));                            											
						resultOrder[0][i]['item'] =item		
						}*/
						global.db.driver.execQuery(
							"SELECT * FROM tipo_cambio WHERE MONTH(fecha) = ? " +
							"GROUP BY moneda " +
							"ORDER BY fecha ",
							[mes],
							function (err, listado) {
								if (err) {
									cb(500, { mensaje: err });
								} else {
									for (i = 0; i < listado.length; i++) {
										var lineasResumenTipoCambio = {}
										lineasResumenTipoCambio.cliente = "Holinsys_resumen_reporte"
										lineasResumenTipoCambio.moneda = listado[i].moneda
										lineasResumenTipoCambio.valor = listado[i].cambio
										lineasResumenTipoCambio.year_relate = anio
										lineasResumenTipoCambio.month_related = mes
										resultOrder[0].push(lineasResumenTipoCambio);
									}
									cb(200, resultOrder[0]);
								}
							}
						)/*
						var fechaTipoCambio = anio + "-" + mes + "-" + primerDiaHabil(mes, anio)
						TipoCambioController().getByFecha(tenantId, fechaTipoCambio, function (errmonedas, datosMonedas) {
							for (i = 0; i < datosMonedas.length; i++) {
								var lineasResumenTipoCambio = {}
								lineasResumenTipoCambio.cliente = "Holinsys_resumen_reporte"
								lineasResumenTipoCambio.moneda = datosMonedas[i].moneda
								lineasResumenTipoCambio.valor = datosMonedas[i].cambio
								lineasResumenTipoCambio.year_relate = anio
								lineasResumenTipoCambio.month_related = mes
								resultOrder[0].push(lineasResumenTipoCambio)
							}
							cb(200, resultOrder[0]);
						})*/
					} else {
						cb(401, { message: 'No se encontraron archivos.' });
					}
				}
			});
	}
	function getRegistroVentas(periodo, cb) {
		var resperiodo = periodo.split("-");
		var mes = resperiodo[0];
		var anio = resperiodo[1];
		global.db.driver.execQuery(
			"SELECT  " +
			"factura.fecha_emision AS fecha, " +
			"factura.serie, " +
			"IF(factura.tipo_documento = 'Factura', " +
			"'01', " +
			"IF(factura.tipo_documento = 'Boleta', " +
			"'03', " +
			"IF(factura.tipo_documento = 'NotaCredito', " +
			"'07', " +
			"IF(factura.tipo_documento = 'NotaDebito', " +
			"'08', " +
			"'')))) AS dcto, " +
			"factura.num_factura AS numero, " +
			"IF(factura.estado_factura_id = 5, 'ANULADO' ,cliente.nombre) AS cliente, " +
			"IF(factura.estado_factura_id = 5, 0 , IF(factura.moneda = 'PEN', " +
			"factura.sub_total, " +
			"factura.sub_total * tipo_cambio.cambio)) AS valor, " +
			"factura.moneda, " +
			"IF(factura.estado_factura_id = 5, 0 ,factura.sub_total) as sub_total, " +
			"IF(factura.estado_factura_id = 5, 0 ,IF(factura.moneda = 'PEN', " +
			"factura.total_factura, " +
			"factura.total_factura * tipo_cambio.cambio)) AS total_factura, " +
			"IF(factura.estado_factura_id = 5, 0 ,IF(factura.moneda = 'PEN', " +
			"factura.igv, " +
			"factura.igv * tipo_cambio.cambio) )AS impuesto, " +
			"i.nombreParam AS impuesto_nombre, " +
			"i.valorParam AS impuesto_porcentaje, " +
			"IF(factura.estado_factura_id = 5, NULL ,tipo_cambio.cambio) AS tipo_cambio, " +
			"factura.centro_costo, " +
			"cc.nombreParam AS centro_costo_definicion " +
			"FROM " +
			"factura " +
			"LEFT JOIN " +
			"cliente ON factura.cliente_id = cliente.id " +
			"LEFT JOIN " +
			"tipo_cambio ON (factura.fecha_emision = tipo_cambio.fecha " +
			"AND factura.moneda = tipo_cambio.moneda) " +
			"LEFT JOIN " +
			"hs_parametros i ON factura.impuesto_id = i.id " +
			"LEFT JOIN " +
			"hs_parametros cc ON factura.centro_costo = cc.id " +
			"WHERE " +
			"(MONTH(factura.fecha_emision) = ? " +
			"AND YEAR(factura.fecha_emision) = ?) " +
			"ORDER BY dcto , factura.fecha_emision ASC "
			, [mes, anio], function (err, registroVenta) {
				if (err) {
					cb(500, { err: err });
				} else {
					global.db.driver.execQuery(
						"SELECT" +
						" if(documento_anulado.tipo_documento = 'Factura', '01', " +
						" if(documento_anulado.tipo_documento = 'Boleta', '03'," +
						" 	if(documento_anulado.tipo_documento = 'NotaCredito', '07',  " +
						" 		if(documento_anulado.tipo_documento = 'NotaDebito', '08','') " +
						" 	  ) " +
						"   ) " +
						" ) as dcto, documento_anulado.serie, documento_anulado.fecha,  documento_anulado.numero as numero FROM documento_anulado" +
						"   where (MONTH(documento_anulado.fecha) = ? AND YEAR(documento_anulado.fecha) = ? )" +
						" order by dcto, documento_anulado.fecha ASC"
						, [mes, anio], function (err, registroAnulados) {
							if (err) {
								cb(500, { err: err });
							} else {
								for (i = 0; i < registroAnulados.length; i++) {
									registroAnulados[i] = JSON.parse(JSON.stringify(registroAnulados[i]));
									registroAnulados[i]['cliente'] = "ANULADO";
									registroAnulados[i]['fecha'] = new Date(registroAnulados[i]['fecha']);
									registroAnulados[i]['valor'] = 0;
									registroAnulados[i]['sub_total'] = 0;
									registroAnulados[i]['total_factura'] = 0;
									var documento_anulado = registroAnulados[i]
									registroVenta.push(documento_anulado)
								}

								registroVenta.sort(function (obj1, obj2) {
									return (obj1.numero - obj2.numero)
								})
								global.db.driver.execQuery(
									/*"select if(MONTH(factura.fecha_emision) = ? AND YEAR(factura.fecha_emision) = ? , if(factura.sub_total is null , 0 , if(factura.moneda = 'PEN', SUM(factura.sub_total), SUM(factura.sub_total * tipo_cambio.cambio) )) ,0) as total_centro_costo," +
									" hs_parametros.valorParam as nombre_centro_costo" +
									" from hs_parametros" +
									" left outer join factura on hs_parametros.id = factura.centro_costo" +
									" left outer join tipo_cambio on factura.fecha_emision = tipo_cambio.fecha and factura.moneda = tipo_cambio.moneda" +
									" where (hs_parametros.grupoParam = 'CENTROCOSTO') " +
									" group by nombre_centro_costo"*/
									"SELECT  " +
									"SUM(tbl.total_centro_costo) total_centro_costo, " +
									"tbl.nombre_centro_costo " +
									"FROM " +
									"(SELECT  " +
									"IF(MONTH(factura.fecha_emision) = ? " +
									"AND YEAR(factura.fecha_emision) = ?, IF(factura.sub_total IS NULL, 0, IF(factura.estado_factura_id = 5, 0 , IF(factura.moneda = 'PEN', factura.sub_total, factura.sub_total * tipo_cambio.cambio))), 0) AS total_centro_costo, " +
									"hs_parametros.valorParam AS nombre_centro_costo " +
									"FROM " +
									"hs_parametros " +
									"LEFT OUTER JOIN factura ON hs_parametros.id = factura.centro_costo " +
									"LEFT OUTER JOIN tipo_cambio ON factura.fecha_emision = tipo_cambio.fecha " +
									"AND factura.moneda = tipo_cambio.moneda " +
									"WHERE " +
									"(hs_parametros.grupoParam = 'CENTROCOSTO')) tbl " +
									"GROUP BY tbl.nombre_centro_costo "
									, [mes, anio], function (err, detalleCentroCosto) {
										if (err) {
											cb(500, { err: err });
										} else {
											var exportar = {};
											exportar.registroVenta = registroVenta;
											exportar.detalleFinal = detalleCentroCosto;
											exportar.mes = mes;
											exportar.anio = anio;
											registroVenta.detalleFinal = detalleCentroCosto;
											cb(200, exportar);
										}
									});
							}
						});
				}
			});
	}
	function getRegistroCompras(periodo, cb) {
		var resperiodo = periodo.split("-");
		var mes = resperiodo[0];
		var anio = resperiodo[1];
		var resperiodo = periodo.split("-");
		var mes = resperiodo[0];
		var anio = resperiodo[1];
		global.db.driver.execQuery(
			/*	" SELECT " +
				" factura_proveedores.fecha_emision AS fechadoc, " +
				" factura_proveedores.fecha_creacion AS fechareg, " +
				" IF(factura_proveedores.tipo_documento = 'Factura','01', " +
				" IF(factura_proveedores.tipo_documento = 'Boleta','03', " +
				" IF(factura_proveedores.tipo_documento = 'NotaCredito','07', " +
				" IF(factura_proveedores.tipo_documento = 'NotaDebito','08', " +
				" IF(factura_proveedores.tipo_documento = 'GuiaRemision','09', " +
				" IF(factura_proveedores.tipo_documento = 'Ticket','12', " +
				" IF(factura_proveedores.tipo_documento = 'FinanzasySeguros','13', " +
				" IF(factura_proveedores.tipo_documento = 'ServiciosPublicos','14', " +
				" IF(factura_proveedores.tipo_documento = 'TransporteAereo','05', " +
				" IF(factura_proveedores.tipo_documento = 'BoletoViaje','16', " +
				" IF(factura_proveedores.tipo_documento = 'ComprobanteNoDomiciliado','91', " +
				" ''))))))))))) AS dcto, " +
				" factura_proveedores.num_factura AS numero, " +
				" proveedor.ruc, " +
				" proveedor.nombre AS proveedor, " +
				" IF(factura_proveedores.moneda = 'USD', " +
				" factura_proveedores.sub_total, " +
				" '') AS USD, " +
				" IF(factura_proveedores.moneda = 'USD', " +
				" factura_proveedores.sub_total * tipo_cambio.cambio, " +
				" factura_proveedores.sub_total) AS valor, " +
				" IF(factura_proveedores.impuesto_id = 5, " +
				" (IF(factura_proveedores.moneda = 'USD', " +
				" factura_proveedores.sub_total * tipo_cambio.cambio, " +
				" factura_proveedores.sub_total) * 0.18), " +
				" '') AS IGV, " +
				" IF(factura_proveedores.impuesto_id = 6, " +
				" factura_proveedores.valor_igv, " +
				" '') AS exportacion, " +
				" IF(factura_proveedores.impuesto_id = 7, " +
				" factura_proveedores.valor_igv, " +
				" '') AS exonerado, " +
				" IF(factura_proveedores.moneda = 'USD', " +
				" factura_proveedores.total_factura * tipo_cambio.cambio, " +
				" factura_proveedores.total_factura) AS total, " +
				" tipo_cambio.cambio AS TC " +
				" FROM " +
				" factura_proveedores " +
				" LEFT JOIN " +
				" proveedor ON factura_proveedores.proveedor_id = proveedor.id " +
				" LEFT JOIN " +
				" tipo_cambio ON factura_proveedores.moneda = tipo_cambio.moneda " +
				" AND factura_proveedores.fecha_emision = tipo_cambio.fecha " +
				" WHERE " +
				" (factura_proveedores.tipo_documento = 'Factura' " +
				" OR factura_proveedores.tipo_documento = 'Boleta' " +
				" OR factura_proveedores.tipo_documento = 'NotaCredito' " +
				" OR factura_proveedores.tipo_documento = 'NotaDebito' " +
				" OR factura_proveedores.tipo_documento = 'GuiaRemision' " +
				" OR factura_proveedores.tipo_documento = 'Ticket' " +
				" OR factura_proveedores.tipo_documento = 'FinanzasySeguros' " +
				" OR factura_proveedores.tipo_documento = 'ServiciosPublicos' " +
				" OR factura_proveedores.tipo_documento = 'TransporteAereo' " +
				" OR factura_proveedores.tipo_documento = 'ServiciosPublicos' " +
				" OR factura_proveedores.tipo_documento = 'ComprobanteNoDomiciliado' " +
				" OR factura_proveedores.tipo_documento = 'BoletosViaje') " +
				" AND (MONTH(factura_proveedores.fecha_creacion) = ? " +
				" AND YEAR(factura_proveedores.fecha_creacion) = ?) " +
				" ORDER BY factura_proveedores.fecha_emision ASC "*/
			" SELECT " +
			"	factura_proveedores.fecha_emision AS fechadoc, " +
			"	factura_proveedores.fecha_registro AS fechareg, " +
			"	inventario_tipo_documento.descripcion AS tipoDocumento, " +
			"	IF(factura_proveedores.tipo_documento = 'Factura','01', " +
			"	IF(factura_proveedores.tipo_documento = 'Boleta','03', " +
			"	IF(factura_proveedores.tipo_documento = 'NotaCredito','07', " +
			"	IF(factura_proveedores.tipo_documento = 'NotaDebito','08', " +
			"	IF(factura_proveedores.tipo_documento = 'GuiaRemision','09', " +
			"	IF(factura_proveedores.tipo_documento = 'Ticket','12', " +
			"	IF(factura_proveedores.tipo_documento = 'FinanzasySeguros','13', " +
			"	IF(factura_proveedores.tipo_documento = 'ServiciosPublicos','14', " +
			"	IF(factura_proveedores.tipo_documento = 'TransporteAereo','05', " +
			"	IF(factura_proveedores.tipo_documento = 'BoletoViaje','16', " +
			"	IF(factura_proveedores.tipo_documento = 'ComprobanteNoDomiciliado','91', " +
			"	''))))))))))) AS dcto, " +
			"	factura_proveedores.num_factura AS numero, " +
			"	proveedor.ruc, " +
			"	proveedor.nombre AS proveedor, " +
			"	IF(factura_proveedores.moneda = 'USD', " +
			"	factura_proveedores.sub_total, " +
			"	'') AS USD, " +
			"	IF(factura_proveedores.moneda = 'USD', " +
			"	factura_proveedores.sub_total * tipo_cambio.cambio, " +
			"	factura_proveedores.sub_total) AS valor, " +
			"	IF(factura_proveedores.impuesto_id = 5, " +
			"	(IF(factura_proveedores.moneda = 'USD', " +
			"	factura_proveedores.sub_total * tipo_cambio.cambio, " +
			"	factura_proveedores.sub_total) * 0.18), " +
			"	'') AS IGV, " +
			"	IF(factura_proveedores.impuesto_id = 6, " +
			"	factura_proveedores.valor_igv, " +
			"	'') AS exportacion, " +
			"	IF(factura_proveedores.impuesto_id = 7, " +
			"	factura_proveedores.valor_igv, " +
			"	'') AS exonerado, " +
			"	IF(factura_proveedores.moneda = 'USD', " +
			"	factura_proveedores.total_factura * tipo_cambio.cambio, " +
			"	factura_proveedores.total_factura) AS total, " +
			"	tipo_cambio.cambio AS TC " +
			"	FROM " +
			"	factura_proveedores " +
			"	LEFT JOIN " +
			"	proveedor ON factura_proveedores.proveedor_id = proveedor.id " +
			"	LEFT JOIN " +
			"	tipo_cambio ON (factura_proveedores.moneda = tipo_cambio.moneda " +
			"	AND factura_proveedores.fecha_emision = tipo_cambio.fecha) " +
			"	INNER JOIN inventario_tipo_documento on inventario_tipo_documento.codigo = (IF(factura_proveedores.tipo_documento = 'Factura','01', " +
			"	IF(factura_proveedores.tipo_documento = 'Boleta','03', " +
			"	IF(factura_proveedores.tipo_documento = 'NotaCredito','07', " +
			"	IF(factura_proveedores.tipo_documento = 'NotaDebito','08', " +
			"	IF(factura_proveedores.tipo_documento = 'GuiaRemision','09', " +
			"	IF(factura_proveedores.tipo_documento = 'Ticket','12', " +
			"	IF(factura_proveedores.tipo_documento = 'FinanzasySeguros','13', " +
			"	IF(factura_proveedores.tipo_documento = 'ServiciosPublicos','14', " +
			"	IF(factura_proveedores.tipo_documento = 'TransporteAereo','05', " +
			"	IF(factura_proveedores.tipo_documento = 'BoletoViaje','16', " +
			"	IF(factura_proveedores.tipo_documento = 'ComprobanteNoDomiciliado','91', " +
			"	'')))))))))))) " +
			"	WHERE " +
			"	(factura_proveedores.tipo_documento = 'Factura' " +
			"	OR factura_proveedores.tipo_documento = 'Boleta' " +
			"	OR factura_proveedores.tipo_documento = 'NotaCredito' " +
			"	OR factura_proveedores.tipo_documento = 'NotaDebito' " +
			"	OR factura_proveedores.tipo_documento = 'GuiaRemision' " +
			"	OR factura_proveedores.tipo_documento = 'Ticket' " +
			"	OR factura_proveedores.tipo_documento = 'FinanzasySeguros' " +
			"	OR factura_proveedores.tipo_documento = 'ServiciosPublicos' " +
			"	OR factura_proveedores.tipo_documento = 'TransporteAereo' " +
			"	OR factura_proveedores.tipo_documento = 'ServiciosPublicos' " +
			"	OR factura_proveedores.tipo_documento = 'ComprobanteNoDomiciliado' " +
			"	OR factura_proveedores.tipo_documento = 'BoletosViaje') " +
			"	AND (MONTH(factura_proveedores.fecha_registro) = ? " +
			"	AND YEAR(factura_proveedores.fecha_registro) = ?) " +
			"	ORDER BY dcto, factura_proveedores.fecha_registro DESC "
			, [mes, anio]
			, function (err, AgrupadoFacturasProveedores) {
				console.log("AgrupadoFacturasProveedores")
				console.log(AgrupadoFacturasProveedores)
				if (err) {
					cb(500, { err: err });
				} else {
					global.db.driver.execQuery(
						/*"SELECT " +
						" factura_proveedores.fecha_emision AS fechadoc, " +
						" factura_proveedores.fecha_creacion AS fechareg, " +
						"if(factura_proveedores.tipo_documento = 'Honorarios', '02', '') as dcto,  " +
						"factura_proveedores.num_factura as numero,  " +
						"proveedor.ruc,   " +
						"proveedor.nombre as proveedor,  " +
						"IF(factura_proveedores.moneda = 'USD',factura_proveedores.sub_total,'') as USD,  " +
						"IF(factura_proveedores.moneda = 'USD',factura_proveedores.sub_total * tipo_cambio.cambio, factura_proveedores.sub_total) as valor,  " +
						"IF(factura_proveedores.impuesto_id = 5, factura_proveedores.valor_igv, '') as IGV,  " +
						"IF(factura_proveedores.impuesto_id = 6, factura_proveedores.valor_igv, '') as exportacion,  " +
						"IF(factura_proveedores.impuesto_id = 7, factura_proveedores.valor_igv, '') as exonerado,  " +
						"IF(factura_proveedores.moneda = 'USD',factura_proveedores.total_factura * tipo_cambio.cambio, factura_proveedores.total_factura) as total,  " +
						"tipo_cambio.cambio as TC  " +
						"FROM factura_proveedores  " +
						"	LEFT JOIN proveedor  " +
						"		ON factura_proveedores.proveedor_id = proveedor.id  " +
						"	LEFT JOIN tipo_cambio  " +
						"		ON factura_proveedores.moneda = tipo_cambio.moneda AND factura_proveedores.fecha_emision = tipo_cambio.fecha  " +
						"	WHERE factura_proveedores.tipo_documento = 'Honorarios'  " +
						"	AND (MONTH(factura_proveedores.fecha_creacion) = ? AND YEAR(factura_proveedores.fecha_creacion) = ? )  " +
						"ORDER BY factura_proveedores.fecha_emision ASC "*/
						"	SELECT " +
						"	factura_proveedores.fecha_emision AS fechadoc, " +
						"	factura_proveedores.fecha_registro AS fechareg, " +
						"	inventario_tipo_documento.descripcion AS tipoDocumento, " +
						"	IF(factura_proveedores.tipo_documento = 'Honorarios', " +
						"	'02', " +
						"	'') AS dcto, " +
						"	factura_proveedores.num_factura AS numero, " +
						"	proveedor.ruc, " +
						"	proveedor.nombre AS proveedor, " +
						"	IF(factura_proveedores.moneda = 'USD', " +
						"	factura_proveedores.sub_total, " +
						"	'') AS USD, " +
						"	IF(factura_proveedores.moneda = 'USD', " +
						"	factura_proveedores.sub_total * tipo_cambio.cambio, " +
						"	factura_proveedores.sub_total) AS valor, " +
						"	IF(factura_proveedores.impuesto_id = 5, " +
						"	factura_proveedores.valor_igv, " +
						"	'') AS IGV, " +
						"	IF(factura_proveedores.impuesto_id = 6, " +
						"	factura_proveedores.valor_igv, " +
						"	'') AS exportacion, " +
						"	IF(factura_proveedores.impuesto_id = 7, " +
						"	factura_proveedores.valor_igv, " +
						"	'') AS exonerado, " +
						"	IF(factura_proveedores.moneda = 'USD', " +
						"	factura_proveedores.total_factura * tipo_cambio.cambio, " +
						"	factura_proveedores.total_factura) AS total, " +
						"	tipo_cambio.cambio AS TC " +
						"	FROM " +
						"	factura_proveedores " +
						"	LEFT JOIN " +
						"	proveedor ON factura_proveedores.proveedor_id = proveedor.id " +
						"	LEFT JOIN " +
						"	tipo_cambio ON (factura_proveedores.moneda = tipo_cambio.moneda " +
						"	AND factura_proveedores.fecha_emision = tipo_cambio.fecha) " +
						"	INNER JOIN " +
						"	inventario_tipo_documento on inventario_tipo_documento.codigo =IF(factura_proveedores.tipo_documento = 'Honorarios', " +
						"	'02','') " +
						"	WHERE " +
						"	factura_proveedores.tipo_documento = 'Honorarios' " +
						"	AND (MONTH(factura_proveedores.fecha_registro ) = ? " +
						"	AND YEAR(factura_proveedores.fecha_registro ) = ?) " +
						"	ORDER BY factura_proveedores.fecha_registro DESC "
						, [mes, anio]
						, function (err, AgrupadoHonorarios) {
							console.log(AgrupadoHonorarios)
							if (err) {
								cb(500, { err: err });
							} else {
								global.db.driver.execQuery(
									/*"SELECT " +
									"carpeta_importacion_documento.fecha AS fechadoc, " +
									"carpeta_importacion_documento.fecha_creacion AS fechareg, " +
									"IF(carpeta_importacion_elemento.nombre LIKE 'Factura%' OR carpeta_importacion_elemento.nombre = 'ExWork', '91','01') AS dcto, " +
									"carpeta_importacion_elemento.nombre, " +
									"carpeta_importacion_documento.codigo AS numero, " +
									"proveedor.ruc AS ruc, " +
									"proveedor.nombre AS proveedor, " +
									"IF(carpeta_importacion_documento.moneda = 'USD', carpeta_importacion_documento.monto, '') AS USD, " +
									"IF(carpeta_importacion_documento.moneda = 'USD', carpeta_importacion_documento.monto * tipo_cambio.cambio, " +
									"carpeta_importacion_documento.monto) AS valor, " +
									"IF(carpeta_importacion_documento.impuesto_id = 5,IF(carpeta_importacion_documento.moneda = 'USD', carpeta_importacion_documento.impuesto_monto * tipo_cambio.cambio,carpeta_importacion_documento.impuesto_monto), '') as IGV, " +
									"IF(carpeta_importacion_documento.impuesto_id = 6, carpeta_importacion_documento.impuesto_monto, '') AS exportacion, " +
									"IF(carpeta_importacion_documento.impuesto_id = 7, carpeta_importacion_documento.impuesto_monto, '') AS exonerado, " +
									"IF(carpeta_importacion_documento.moneda = 'USD', (carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto, 0)) * tipo_cambio.cambio, " +
									"carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto, 0)) AS total, " +
									"tipo_cambio.cambio AS TC " +
									"FROM " +
									"carpeta_importacion_documento " +
									"LEFT JOIN " +
									"carpeta_importacion_elemento ON carpeta_importacion_documento.carpeta_importacion_elemento_id = carpeta_importacion_elemento.id " +
									"LEFT JOIN " +
									"carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
									"LEFT JOIN " +
									"tipo_cambio ON carpeta_importacion_documento.moneda = tipo_cambio.moneda " +
									"AND carpeta_importacion_documento.fecha = tipo_cambio.fecha " +
									"LEFT JOIN " +
									"proveedor ON carpeta_importacion_documento.proveedor_id = proveedor.id " +
									"WHERE " +
									"NOT (carpeta_importacion_elemento.nombre = 'DUA') " +
									"AND (MONTH(carpeta_importacion_documento.fecha_creacion) = ? " +
									"AND YEAR(carpeta_importacion_documento.fecha_creacion) = ?) " +
									"ORDER BY carpeta_importacion_documento.fecha DESC "*/
									"	SELECT " +
									"	carpeta_importacion_documento.fecha AS fechadoc, " +
									"	carpeta_importacion_documento.fecha_registro AS fechareg, " +
									"	inventario_tipo_documento.descripcion AS tipoDocumento, " +
									"	IF(carpeta_importacion_elemento.nombre LIKE 'Factura%' OR carpeta_importacion_elemento.nombre = 'ExWork','91', " +
									"	'01') AS dcto, " +
									"	carpeta_importacion_elemento.nombre, " +
									"	carpeta_importacion_documento.codigo AS numero, " +
									"	proveedor.ruc AS ruc, " +
									"	proveedor.nombre AS proveedor, " +
									"	IF(carpeta_importacion_documento.moneda = 'USD', " +
									"	carpeta_importacion_documento.monto, " +
									"	'') AS USD, " +
									"	IF(carpeta_importacion_documento.moneda = 'USD', " +
									"	carpeta_importacion_documento.monto * tipo_cambio.cambio, " +
									"	carpeta_importacion_documento.monto) AS valor, " +
									"	IF(carpeta_importacion_documento.impuesto_id = 5, " +
									"	IF(carpeta_importacion_documento.moneda = 'USD', " +
									"	carpeta_importacion_documento.impuesto_monto * tipo_cambio.cambio, " +
									"	carpeta_importacion_documento.impuesto_monto), " +
									"	'') AS IGV, " +
									"	IF(carpeta_importacion_documento.impuesto_id = 6, " +
									"	carpeta_importacion_documento.impuesto_monto, " +
									"	'') AS exportacion, " +
									"	IF(carpeta_importacion_documento.impuesto_id = 7, " +
									"	carpeta_importacion_documento.impuesto_monto, " +
									"	'') AS exonerado, " +
									"	IF(carpeta_importacion_documento.moneda = 'USD', " +
									"	(carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto, " +
									"	0)) * tipo_cambio.cambio, " +
									"	carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto, " +
									"	0)) AS total, " +
									"	tipo_cambio.cambio AS TC " +
									"	FROM " +
									"	carpeta_importacion_documento " +
									"	LEFT JOIN " +
									"	carpeta_importacion_elemento ON carpeta_importacion_documento.carpeta_importacion_elemento_id = carpeta_importacion_elemento.id " +
									"	LEFT JOIN " +
									"	carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
									"	LEFT JOIN " +
									"	tipo_cambio ON (carpeta_importacion_documento.moneda = tipo_cambio.moneda " +
									"	AND carpeta_importacion_documento.fecha = tipo_cambio.fecha) " +
									"	LEFT JOIN " +
									"	proveedor ON carpeta_importacion_documento.proveedor_id = proveedor.id " +
									"	INNER JOIN " +
									"	inventario_tipo_documento on inventario_tipo_documento.codigo = IF(carpeta_importacion_elemento.nombre LIKE 'Factura%' OR carpeta_importacion_elemento.nombre = 'ExWork','91', " +
									"	'01') " +
									"	WHERE " +
									"	NOT (carpeta_importacion_elemento.nombre = 'DUA') " +
									"	AND (MONTH(carpeta_importacion_documento.fecha_registro ) = ? " +
									"	AND YEAR(carpeta_importacion_documento.fecha_registro ) = ?) " +
									"	ORDER BY dcto, carpeta_importacion_documento.fecha_registro DESC "
									, [mes, anio]
									, function (err, documentosNoDUA) {
										console.log("documentosNoDUA")
										console.log(documentosNoDUA)
										if (err) {
											cb(500, { err: err });
										} else {
											global.db.driver.execQuery(
												/*" SELECT " +
												" carpeta_importacion_documento.fecha AS fechadoc, " +
												" carpeta_importacion_documento.fecha_creacion AS fechareg, " +
												"'50' as dcto, " +
												" carpeta_importacion_elemento.nombre, " +
												" carpeta_importacion_documento.codigo as numero, " +
												" proveedor.ruc as ruc, " +
												" proveedor.nombre as proveedor, " +
												" IF(carpeta_importacion_documento.moneda = 'USD', carpeta_importacion_documento.monto, '') as USD, " +
												" IF(carpeta_importacion_documento.moneda = 'USD', carpeta_importacion_documento.monto * tipo_cambio.cambio, carpeta_importacion_documento.monto) as valor, " +
												" IF(carpeta_importacion_documento.impuesto_id = 5,IF(carpeta_importacion_documento.moneda = 'USD', carpeta_importacion_documento.impuesto_monto * tipo_cambio.cambio,carpeta_importacion_documento.impuesto_monto), '') as IGV, " +
												" IF(carpeta_importacion_documento.impuesto_id = 6, carpeta_importacion_documento.impuesto_monto, '') as exportacion, " +
												" IF(carpeta_importacion_documento.impuesto_id = 7, carpeta_importacion_documento.impuesto_monto, '') as exonerado, " +
												" IF(carpeta_importacion_documento.moneda = 'USD',(carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto,0))*tipo_cambio.cambio,carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto,0)) as total, " +
												" tipo_cambio.cambio as TC " +
												" FROM carpeta_importacion_documento " +
												" LEFT JOIN carpeta_importacion_elemento " +
												" ON carpeta_importacion_documento.carpeta_importacion_elemento_id = carpeta_importacion_elemento.id " +
												" LEFT JOIN carpeta_importacion " +
												" ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
												" LEFT JOIN tipo_cambio " +
												" ON carpeta_importacion_documento.moneda = tipo_cambio.moneda AND carpeta_importacion_documento.fecha = tipo_cambio.fecha " +
												" LEFT JOIN proveedor " +
												" ON carpeta_importacion_documento.proveedor_id = proveedor.id " +
												" WHERE carpeta_importacion_elemento.nombre = 'DUA' " +
												" AND (MONTH(carpeta_importacion_documento.fecha_creacion) = 10 AND YEAR(carpeta_importacion_documento.fecha_creacion) = 2016 ) " +
												" ORDER BY carpeta_importacion_documento.fecha DESC "*/
												" SELECT " +
												"	carpeta_importacion_documento.fecha AS fechadoc, " +
												"	carpeta_importacion_documento.fecha_registro AS fechareg, " +
												"	inventario_tipo_documento.descripcion AS tipoDocumento, " +
												"	'50' AS dcto, " +
												"	carpeta_importacion_elemento.nombre, " +
												"	carpeta_importacion_documento.codigo AS numero, " +
												"	proveedor.ruc AS ruc, " +
												"	proveedor.nombre AS proveedor, " +
												"	IF(carpeta_importacion_documento.moneda = 'USD', " +
												"	carpeta_importacion_documento.monto, " +
												"	'') AS USD, " +
												"	IF(carpeta_importacion_documento.moneda = 'USD', " +
												"	carpeta_importacion_documento.monto * tipo_cambio.cambio, " +
												"	carpeta_importacion_documento.monto) AS valor, " +
												"	IF(carpeta_importacion_documento.impuesto_id = 5, " +
												"	IF(carpeta_importacion_documento.moneda = 'USD', " +
												"	carpeta_importacion_documento.impuesto_monto * tipo_cambio.cambio, " +
												"	carpeta_importacion_documento.impuesto_monto), " +
												"	'') AS IGV, " +
												"	IF(carpeta_importacion_documento.impuesto_id = 6, " +
												"	carpeta_importacion_documento.impuesto_monto, " +
												"	'') AS exportacion, " +
												"	IF(carpeta_importacion_documento.impuesto_id = 7, " +
												"	carpeta_importacion_documento.impuesto_monto, " +
												"	'') AS exonerado, " +
												"	IF(carpeta_importacion_documento.moneda = 'USD', " +
												"	(carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto, " +
												"	0)) * tipo_cambio.cambio, " +
												"	carpeta_importacion_documento.monto + IFNULL(carpeta_importacion_documento.impuesto_monto, " +
												"	0)) AS total, " +
												"	tipo_cambio.cambio AS TC " +
												"	FROM " +
												"	carpeta_importacion_documento " +
												"	LEFT JOIN " +
												"	carpeta_importacion_elemento ON carpeta_importacion_documento.carpeta_importacion_elemento_id = carpeta_importacion_elemento.id " +
												"	LEFT JOIN " +
												"	carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
												"	LEFT JOIN " +
												"	tipo_cambio ON (carpeta_importacion_documento.moneda = tipo_cambio.moneda " +
												"	AND carpeta_importacion_documento.fecha = tipo_cambio.fecha) " +
												"	LEFT JOIN " +
												"	proveedor ON carpeta_importacion_documento.proveedor_id = proveedor.id " +
												"	INNER JOIN " +
												"	inventario_tipo_documento on inventario_tipo_documento.codigo = '50' " +
												"	WHERE " +
												"	carpeta_importacion_elemento.nombre = 'DUA' " +
												"	AND (MONTH(carpeta_importacion_documento.fecha_registro ) = ?" +
												"	AND YEAR(carpeta_importacion_documento.fecha_registro ) = ?) " +
												"	ORDER BY carpeta_importacion_documento.fecha_registro DESC "
												, [mes, anio]
												, function (err, docuementosDUA) {
													if (err) {
														cb(500, { err: err });
													} else {
														var exportar = {};
														exportar.facturasProveedores = AgrupadoFacturasProveedores;
														exportar.honorarios = AgrupadoHonorarios;
														exportar.docnoDUA = documentosNoDUA;
														exportar.docDUA = docuementosDUA;
														exportar.mes = mes;
														exportar.anio = anio;
														cb(200, exportar);
													}
												}
											);
										}
									}
								);
							}
						}
					);
				}
			}
		);
	}
	function getTimeSheet(proveedorId, cotizacionNumero, cb) {

		global.db.driver.execQuery(
			"SELECT " +
			"cliente.nombre AS cliente, " +
			"cotizacion.nombre_servicio AS descripcion, " +
			"cotizacion.barco AS embarcacion, " +
			"cotizacion.lugar_servicio AS lugar, " +
			"proveedor.nombre AS leader, " +
			"cotizacion.numero AS codigoCotizacion, " +
			"cotizacion.fecha_inicio_servicio AS inicio, " +
			"cotizacion.fecha_fin_servicio AS fin, " +
			"cargo.nombre AS cargo " +
			"FROM " +
			"cotizacion " +
			"LEFT JOIN " +
			"cotizacion_detalle ON cotizacion_detalle.cotizacion_id = cotizacion.id " +
			"LEFT JOIN " +
			"cliente ON cotizacion.cliente_id = cliente.id " +
			"LEFT JOIN " +
			"centro_costo ON cotizacion.numero = centro_costo.codigo " +
			"LEFT JOIN " +
			"orden_compra ON centro_costo.id = orden_compra.centro_costo_id " +
			"LEFT JOIN " +
			"proveedor ON orden_compra.proveedor_id = proveedor.id " +
			"LEFT JOIN " +
			"cargo ON proveedor.cargo_id = cargo.id " +
			"WHERE " +
			"proveedor.id = ? " +
			"AND cotizacion.numero = ? " +
			"LIMIT 0 , 1 "
			, [proveedorId, cotizacionNumero]
			, function (err, objCabecera) {
				if (err) {
					cb(500, { err: err });
				} else {
					global.db.driver.execQuery(
						"SELECT  " +
						"    orden_compra.fecha AS date, " +
						"    UPPER(DAYNAME(orden_compra.fecha)) AS day, " +
						"    factura_proveedores.num_factura, " +
						"    IF(articulo.nombre LIKE 'WORK-%', " +
						"        'WORK', " +
						"        IF(articulo.nombre LIKE 'WORK/W-%', " +
						"            'WORK/W', " +
						"            IF(articulo.nombre LIKE 'TVL-%', " +
						"                'TVL', " +
						"                articulo.nombre))) AS rkms, " +
						"    articulo.tipo_id, " +
						"    SUM(IF(articulo.descripcion = 'SSH/8h', " +
						"        orden_compra_detalle.cantidad, " +
						"        0)) AS 'ssh8h', " +
						"    SUM(IF(articulo.descripcion = 'N/8h', " +
						"        orden_compra_detalle.cantidad, " +
						"        0)) AS 'n8h', " +
						"    SUM(IF(articulo.descripcion = 'W/TVL', " +
						"        orden_compra_detalle.cantidad, " +
						"        0)) AS 'wtvl', " +
						"    SUM(IF(articulo.descripcion = 'OVT SSH', " +
						"        orden_compra_detalle.cantidad, " +
						"        0)) AS 'ovtssh', " +
						"    SUM(IF(articulo.descripcion = 'OVT normal', " +
						"        orden_compra_detalle.cantidad, " +
						"        0)) AS 'ovtnormal', " +
						"    SUM(IF(articulo.descripcion = 'Daily Fees', " +
						"        orden_compra_detalle.cantidad,0)) AS 'dailyfees', " +
						"    articulo.descripcion, " +
						"    orden_compra_detalle.cantidad, " +
						"    IF(factura_proveedores.moneda = 'PEN', " +
						"        orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
						"        orden_compra_detalle.precio_unitario) AS precio " +
						"FROM " +
						"    factura_proveedores " +
						"        INNER JOIN " +
						"    tipo_cambio ON (tipo_cambio.moneda = 'USD' " +
						"        AND factura_proveedores.fecha_emision = tipo_cambio.fecha) " +
						"        LEFT JOIN " +
						"    orden_compra ON factura_proveedores.orden_compra = orden_compra.id " +
						"        LEFT JOIN " +
						"    orden_compra_detalle ON orden_compra_detalle.orden_compra_id = orden_compra.id " +
						"        LEFT JOIN " +
						"    centro_costo ON orden_compra.centro_costo_id = centro_costo.id " +
						"        LEFT JOIN " +
						"    cotizacion ON centro_costo.codigo = cotizacion.numero " +
						"        LEFT JOIN " +
						"    cotizacion_detalle ON cotizacion_detalle.cotizacion_id = cotizacion.id " +
						"        INNER JOIN " +
						"    articulo ON (orden_compra_detalle.articulo_id = articulo.id " +
						"        AND articulo.tipo_id = 2) " +
						"        LEFT JOIN " +
						"    proveedor ON orden_compra.proveedor_id = proveedor.id " +
						"        LEFT JOIN " +
						"    cargo ON proveedor.cargo_id = cargo.id " +
						"WHERE " +
						"        proveedor.id = ? " +
						"        AND cotizacion.numero = ? " +
						"GROUP BY orden_compra.fecha,articulo.tipo_articulo"
						, [proveedorId, cotizacionNumero]
						, function (err, objWorkHours) {
							if (err) {
								cb(500, { err: err });
							} else {
								global.db.driver.execQuery(
									"SELECT  " +
									"    articulo.nombre, " +
									"    factura_proveedores.moneda, " +
									"    IF(factura_proveedores.moneda = 'PEN', " +
									"        orden_compra_detalle.precio_unitario, " +
									"        0) AS soles, " +
									"    tipo_cambio.cambio AS rate_exchange, " +
									"    IF(factura_proveedores.moneda = 'PEN', " +
									"        orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
									"        orden_compra_detalle.precio_unitario) AS dolares " +
									"FROM " +
									"    factura_proveedores " +
									"        INNER JOIN " +
									"    tipo_cambio ON (tipo_cambio.moneda = 'USD' AND factura_proveedores.fecha_emision = tipo_cambio.fecha) " +
									"        LEFT JOIN " +
									"    orden_compra ON factura_proveedores.orden_compra = orden_compra.id " +
									"        LEFT JOIN " +
									"    orden_compra_detalle ON orden_compra_detalle.orden_compra_id = orden_compra.id " +
									"        LEFT JOIN " +
									"    centro_costo ON orden_compra.centro_costo_id = centro_costo.id " +
									"        LEFT JOIN " +
									"    cotizacion ON centro_costo.codigo = cotizacion.numero " +
									"        LEFT JOIN " +
									"    cotizacion_detalle ON cotizacion_detalle.cotizacion_id = cotizacion.id " +
									"        INNER JOIN " +
									"    articulo ON (orden_compra_detalle.articulo_id = articulo.id AND articulo.tipo_id = 4) " +
									"        LEFT JOIN " +
									"    proveedor ON orden_compra.proveedor_id = proveedor.id " +
									"        LEFT JOIN " +
									"    cargo ON proveedor.cargo_id = cargo.id " +
									"WHERE " +
									"        proveedor.id = ? " +
									"        AND cotizacion.numero = ? "
									, [proveedorId, cotizacionNumero]
									, function (err, objMisc) {
										if (err) {
											cb(500, { err: err });
										} else {
											global.db.driver.execQuery(
												"SELECT " +
												"MAX(IF(articulo.descripcion = 'Daily Fees', " +
												"IF(factura_proveedores.moneda = 'PEN', " +
												"orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
												"orden_compra_detalle.precio_unitario), " +
												"0)) AS 'pdailyfees', " +
												"MAX(IF(articulo.descripcion = 'SSH/8h', " +
												"IF(factura_proveedores.moneda = 'PEN', " +
												"orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
												"orden_compra_detalle.precio_unitario), " +
												"0)) AS 'pssh8h', " +
												"MAX(IF(articulo.descripcion = 'N/8h', " +
												"IF(factura_proveedores.moneda = 'PEN', " +
												"orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
												"orden_compra_detalle.precio_unitario), " +
												"0)) AS 'pn8h', " +
												"MAX(IF(articulo.descripcion = 'W/TVL', " +
												"IF(factura_proveedores.moneda = 'PEN', " +
												"orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
												"orden_compra_detalle.precio_unitario), " +
												"0)) AS 'pwtvl', " +
												"MAX(IF(articulo.descripcion = 'OVT SSH', " +
												"IF(factura_proveedores.moneda = 'PEN', " +
												"orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
												"orden_compra_detalle.precio_unitario), " +
												"0)) AS 'povtssh', " +
												"MAX(IF(articulo.descripcion = 'OVT normal', " +
												"IF(factura_proveedores.moneda = 'PEN', " +
												"orden_compra_detalle.precio_unitario * tipo_cambio.cambio, " +
												"orden_compra_detalle.precio_unitario), " +
												"0)) AS 'povtnormal' " +
												"FROM " +
												"factura_proveedores " +
												"INNER JOIN " +
												"tipo_cambio ON (tipo_cambio.moneda = 'USD' " +
												"AND factura_proveedores.fecha_emision = tipo_cambio.fecha) " +
												"LEFT JOIN " +
												"orden_compra ON factura_proveedores.orden_compra = orden_compra.id " +
												"LEFT JOIN " +
												"orden_compra_detalle ON orden_compra_detalle.orden_compra_id = orden_compra.id " +
												"LEFT JOIN " +
												"centro_costo ON orden_compra.centro_costo_id = centro_costo.id " +
												"INNER JOIN " +
												"articulo ON (orden_compra_detalle.articulo_id = articulo.id " +
												"AND articulo.tipo_id = 2) " +
												"LEFT JOIN " +
												"proveedor ON orden_compra.proveedor_id = proveedor.id " +

												"WHERE " +
												"        proveedor.id = ? " +
												"        AND centro_costo.codigo = ? " +
												"GROUP BY proveedor.id "
												, [proveedorId, cotizacionNumero]
												, function (err, objPrecioWork) {
													if (err) {
														cb(500, { err: err });
													} else {
														var objExportar = {};
														objExportar.cabecera = objCabecera;
														objExportar.workHours = objWorkHours;
														objExportar.miscellaneous = objMisc;
														objExportar.priceWK = objPrecioWork;
														objExportar.numeroProyecto = cotizacionNumero;
														cb(200, objExportar);
													}
												}
											);
										}
									}
								);
							}
						});
				}
			});
	}
	function mask(data, pattern) {
		if (data == null || data.length > pattern.length) {
			return data;
		} else {
			return pattern.substring(0, (pattern.length - data.length)) + data;
		}
	}
	return {
		margenCotiPDF: function (cb) {
			db.driver.execQuery(
				"SELECT c.total_cotizacion,pf.total_factor,c.totalDetalle,pf.ad_valorm_porcent*pf.igv_aduanas porcvalor,pf.total_cargos_aduanas,c.total"
				+ " FROM cotizacion c"
				+ " INNER JOIN parametros_factor pf"
				+ " ON c.id=pf.cotizacion_id"
				+ " where c.id=199;",
				[],
				function (err, resultMargen) {
					if (err) {
						cb(500, { err: err });
					} else {
						cb(200, resultMargen)
					}
				}
			);
		},
		getReporteOrderIntakeCerrar: function (tenantId, body, cb) {
			reporteOrder(tenantId, body, 'Intake', 'FF000000', function (codigo, resultOrderIntake) {
				if (codigo != 200) {
					cb(codigo, resultOrderIntake)
				}
				else {
					cb(200, resultOrderIntake)
				}
			})
		},
		getReporteOrderIntakeLeer: function (tenantId, body, cb) {
			body.cerrar + "false"
			reporteOrder(tenantId, body, 'Intake', 'FF000000', function (codigo, resultOrderIntake) {
				if (codigo != 200) {
					cb(codigo, resultOrderIntake)
				}
				else {
					cb(200, resultOrderIntake)
				}
			})
		},
		getReporteOrderBacklogCerrar: function (tenantId, body, cb) {
			reporteOrder(tenantId, body, 'Backlog', 'FF3f3151', function (codigo, resultOrderBacklog) {
				if (codigo != 200) {
					cb(codigo, resultOrderBacklog)
				}
				else {
					cb(200, resultOrderBacklog)
				}
			})
		},
		getReporteOrderBacklogLeer: function (tenantId, body, cb) {
			body.cerrar + "false"
			reporteOrder(tenantId, body, 'Backlog', 'FF3f3151', function (codigo, resultOrderBacklog) {
				if (codigo != 200) {
					cb(codigo, resultOrderIntake)
				}
				else {
					cb(200, resultOrderIntake)
				}
			})
		},
		exportRegistroVentas: function (periodo, cb) {
			var resperiodo = periodo.split("-");
			var mes = resperiodo[0];
			var anio = resperiodo[1];
			getRegistroVentas(periodo, function (status, result) {
				if (status != 200) {
					cb(500, { message: "Existe un error en el servicio" });
				} else {
					var workbook = new Excel.Workbook();
					var worksheet = workbook.addWorksheet('Hoja 1');
					worksheet.columns = [
						{ header: ['', '', '', '', 'FECHA'], key: 'fecha', width: 9, style: { numFmt: 'dd-mm-yyy', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', 'DCTO'], key: 'dcto', width: 9, style: { font: { name: 'Arial', size: 8 } } },
						{ header: ['', periodo, '', '', 'SERIE'], key: 'serie', width: 9, style: { numFmt: '000', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', 'NUMERO'], key: 'numero', width: 9, style: { font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', 'CLIENTE'], key: 'cliente', width: 52, style: { font: { name: 'Arial', size: 8 } } },
						//	{ header: ['', '', '', 'USD'], key: 'mont_usd', width: 9.5, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						//	{ header: ['', '', '', 'PEN'], key: 'mont_pen', width: 9.5, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', 'VALOR'], key: 'valor', width: 11, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', 'IGV'], key: 'igv', width: 9.5, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', 'EXPORTACION'], key: 'exportacion', width: 11.3, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', 'EXONERADO'], key: 'exonerado', width: 10, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', ''], key: 'blank_1', width: 8.4, style: { font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', 'TOTAL'], key: 'total', width: 9.3, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', ''], key: 'blank_2', width: 8.4, style: { font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', 'TC'], key: 'tc', width: 8.4, style: { numFmt: '#0.000', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', 'CENTRO DE COSTO'], key: 'cc', width: 18.5, style: { font: { name: 'Arial', size: 8 } } }
					];
					// Bordeado 
					var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
					for (var i = 0; i < letras.length; i++) {
						worksheet.getCell(letras[i] + '3').border = {
							top: { style: 'thin', color: { argb: "#000" } }
						};
						if (i == (letras.length - 1)) {
							worksheet.getCell(letras[i] + '3').border = {
								top: { style: 'thin', color: { argb: "#000" } },
								right: { style: 'thin', color: { argb: "#000" } }
							};
							worksheet.getCell(letras[i] + '4').border = {
								right: { style: 'thin', color: { argb: "#000" } }
							};
							worksheet.getCell(letras[i] + '5').border = {
								right: { style: 'thin', color: { argb: "#000" } }
							};
						}
					}
					worksheet.mergeCells('A1:P1');
					worksheet.mergeCells('F3:G3');

					worksheet.getCell('G3').alignment = { vertical: 'middle', horizontal: 'center' };
					worksheet.getCell('G3').font = { name: 'Arial', size: 8 }
					worksheet.getCell('P1').value = 'REGISTRO DE VENTAS';
					worksheet.getCell('P1').alignment = { vertical: 'middle', horizontal: 'center' };
					worksheet.getCell('P1').font = { bold: true, underline: true, name: 'Arial', size: 8 };
					worksheet.getCell('F4').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('G4').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('C2').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('C2').numFmt = 'Mmm-YY';
					var registrosVentas = result.registroVenta;
					var finalizaSeccion = false;
					var totales = { usd: 0, pen: 0, valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					var finales = { usd: 0, pen: 0, valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					var contadorFilas = 6;
					for (var i = 0; i < registrosVentas.length; i++) {
						var objetoGuardar = {};
						objetoGuardar.fecha = registrosVentas[i].fecha;
						objetoGuardar.dcto = registrosVentas[i].dcto;
						objetoGuardar.serie = mask(registrosVentas[i].serie, "00000");
						objetoGuardar.numero = mask(registrosVentas[i].numero, "00000000");
						objetoGuardar.cliente = registrosVentas[i].cliente.toUpperCase();
						if (registrosVentas[i].moneda == 'PEN') {
							totales.pen += Math.abs(registrosVentas[i].sub_total);
							objetoGuardar.mont_pen = Math.abs(registrosVentas[i].sub_total);
						} else {
							totales.usd += Math.abs(registrosVentas[i].sub_total);
							objetoGuardar.mont_usd = Math.abs(registrosVentas[i].sub_total);
						}
						totales.valor += Math.abs(registrosVentas[i].valor);
						objetoGuardar.valor = Math.abs(registrosVentas[i].valor);
						if (registrosVentas[i].impuesto_nombre == 'igv') {
							totales.igv += registrosVentas[i].impuesto;
							if(registrosVentas[i].dcto == "07")
							{
								objetoGuardar.igv = (registrosVentas[i].impuesto)*-1;
							}
							else
							{
								objetoGuardar.igv = registrosVentas[i].impuesto;
							}
						} else if (registrosVentas[i].impuesto_nombre == 'exportacion') {
							totales.exportacion += registrosVentas[i].impuesto;
							objetoGuardar.exportacion += registrosVentas[i].impuesto;
						} else if (registrosVentas[i].impuesto_nombre == 'exonerado') {
							totales.exonerado += registrosVentas[i].impuesto;
							objetoGuardar.exonerado += registrosVentas[i].impuesto;
						}
						totales.total += Math.abs(registrosVentas[i].total_factura);
						objetoGuardar.total = Math.abs(registrosVentas[i].total_factura);
						objetoGuardar.tc = registrosVentas[i].tipo_cambio;
						objetoGuardar.cc = registrosVentas[i].centro_costo_definicion;
						worksheet.addRow(objetoGuardar);
						contadorFilas++;
						if (i + 1 in registrosVentas) {
							if (registrosVentas[i + 1].dcto != registrosVentas[i].dcto) {
								finalizaSeccion = true;
							}
						} else if (i == (registrosVentas.length - 1)) {
							finalizaSeccion = true;
						}
						if (finalizaSeccion) {
							finalizaSeccion = false;
							worksheet.addRow({});
							worksheet.addRow({});
							contadorFilas += 2;
							objetoGuardar = {};
							switch (registrosVentas[i].dcto) {
								case '01':
									objetoGuardar.cliente = "TOTAL FACTURA";
									break;
								case '03':
									objetoGuardar.cliente = "TOTAL BOLETA";
									break;
								case '07':
									objetoGuardar.cliente = "TOTAL NOTA CREDITO";
									break;
								case '08':
									objetoGuardar.cliente = "TOTAL NOTA DEBITO";
							}
							objetoGuardar.mont_usd = Math.abs(totales.usd);
							finales.usd += Math.abs(totales.usd);
							objetoGuardar.mont_pen = Math.abs(totales.pen);
							finales.pen += Math.abs(totales.pen);
							objetoGuardar.valor = Math.abs(totales.valor);
							finales.valor += Math.abs(totales.valor);
							objetoGuardar.igv = Math.abs(totales.igv);
							finales.igv += Math.abs(totales.igv);
							objetoGuardar.exportacion = totales.exportacion;
							finales.exportacion += totales.exportacion;
							objetoGuardar.exonerado = totales.exonerado;
							finales.exonerado += totales.exonerado;
							objetoGuardar.total = Math.abs(totales.total);
							finales.total += Math.abs(totales.total);
							worksheet.addRow(objetoGuardar);
							worksheet.addRow({});
							worksheet.addRow({});
							totales = { usd: 0, pen: 0, valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
							//Estilos
							worksheet.getCell('E' + contadorFilas.toString()).font = { bold: true, name: 'Arial', size: 8 };
							for (var k = 5; k < 14; k++) {
								worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
									top: { style: 'thin', color: { argb: "#000" } }
								};
							}
							contadorFilas += 3
						}
					}
					//Impresion de Totales 
					objetoGuardar = {};
					objetoGuardar.mont_usd = finales.usd;
					objetoGuardar.mont_pen = finales.pen;
					objetoGuardar.valor = finales.valor;
					objetoGuardar.igv = finales.igv;
					objetoGuardar.exportacion = finales.exportacion;
					objetoGuardar.exonerado = finales.exonerado;
					objetoGuardar.total = finales.total;
					worksheet.addRow(objetoGuardar);
					for (var k = 5; k < 14; k++) {
						worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
							top: { style: 'thin', color: { argb: "#000" } }
						};
					}
					//Impresion Centros de Costo 
					worksheet.addRow({});
					worksheet.addRow({});
					objetoGuardar = {};
					var sumfinal = 0;
					var detalleCentroCosto = result.detalleFinal;
					for (var i = 0; i < detalleCentroCosto.length; i++) {
						objetoGuardar = {};
						objetoGuardar.cliente = detalleCentroCosto[i].nombre_centro_costo.toUpperCase();
						sumfinal += detalleCentroCosto[i].total_centro_costo;
						objetoGuardar.valor = detalleCentroCosto[i].total_centro_costo;
						worksheet.addRow(objetoGuardar);
					}
					worksheet.addRow({ cliente: "PROV 2015" });
					worksheet.addRow({ cliente: "TOTAL INGRESOS " + numLetras(Number(mes)) + " " + anio, valor: sumfinal });
					contadorFilas += 8;
					estiloBaseCeldaExcel(worksheet, 'E' + contadorFilas.toString(), "#000");
					worksheet.getCell('H' + contadorFilas.toString()).border = {
						top: { style: 'thin', color: { argb: "#000" } }
					};
					var nombreExportado = Date.now()// trae los milisegundos hasta el dia de hoy, un nombre unico
					var filename = "./" + nombreExportado + ".xlsx"
					workbook.xlsx.writeFile(filename)
						.then(function () {
							fs.readFile(filename, function (err, data) {
								if (!err) {
									// GUARDAMOS EL DOCUMENTO EN DATA
									fs.unlink(filename, function (errFile) {
										if (!errFile) {
											// ELIMINAMOS EL DOCUMENTO CREADO
											// ENVIAMOS AL FRONTEND
											cb(200, data)
										}
										else {
											cb(400, { message: 'Archivo no encontrado' })
										}
									})
								} else {
									cb(400, { message: 'Archivo no encontrado' })
								}
							});
						});
					//fin
				}
			});
		}, //finexportRegistroVentas
		exportRegistroCompras: function (periodo, porcentajeIGV, cb) {
			var resperiodo = periodo.split("-");
			var mes = resperiodo[0];
			var anio = resperiodo[1];
			getRegistroCompras(periodo, function (status, result) {
				if (status != 200) {
					cb(500, { message: "Existe un error en el servicio" });
				} else {
					var workbook = new Excel.Workbook();
					var worksheet = workbook.addWorksheet('Hoja 1');
					porcentajeIGV = porcentajeIGV.replace('"', '').replace('"', '');
					porcentajeIGV = Number(porcentajeIGV) * 100;
					porcentajeIGV += "%";
					worksheet.columns = [
						//{ header: ['', '', '', '', '', 'FECHA REGISTRO'], key: 'fechareg', width: 13, style: { numFmt: 'dd-mm-yyyy', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'FECHA EMISIÓN'], key: 'fechadoc', width: 14, style: { numFmt: 'dd-mm-yyyy', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'DCTO'], key: 'dcto', width: 9, style: { font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'SERIE'], key: 'serie', width: 9, style: { numFmt: '00000', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'NUMERO'], key: 'numero', width: 10, style: { numFmt: '00000000', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'RUC'], key: 'ruc', width: 11, style: { font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'PROVEEDOR'], key: 'proveedor', width: 52, style: { font: { name: 'Arial', size: 8 } } },
						/*{ header: ['', '', '', 'USD'], key: 'usd', width: 9.5, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },*/
						{ header: ['', '', '', '', '', 'BASE IMPONIBLE'], key: 'valor', width: 14, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', porcentajeIGV, '', 'IGV'], key: 'igv', width: 9.5, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'EXPORTACION'], key: 'exportacion', width: 11.3, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'EXONERADO'], key: 'exonerado', width: 10, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'TOTAL'], key: 'total', width: 9.3, style: { numFmt: '#,##0.00', font: { name: 'Arial', size: 8 } } },
						{ header: ['', '', '', '', '', 'TC'], key: 'tc', width: 8.4, style: { numFmt: '#0.000', font: { name: 'Arial', size: 8 } } }
					];
					// Bordeado 
					var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
					for (var i = 0; i < letras.length; i++) {
						worksheet.getCell(letras[i] + '5').border = {
							top: { style: 'thin', color: { argb: "#000" } }
						};
						if (i == (letras.length - 1)) {
							worksheet.getCell(letras[i] + '5').border = {
								top: { style: 'thin', color: { argb: "#000" } },
								right: { style: 'thin', color: { argb: "#000" } }
							};
							worksheet.getCell(letras[i] + '6').border = {
								right: { style: 'thin', color: { argb: "#000" } }
							};
						}
					}
					worksheet.mergeCells('A1:C1');
					worksheet.mergeCells('G5:H5');

					worksheet.getCell('G5').alignment = { vertical: 'middle', horizontal: 'center' };
					worksheet.getCell('G5').font = { name: 'Arial', size: 8 }
					worksheet.getCell('A1').value = 'MAN DIESEL & TURBO PERU SAC';
					worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
					worksheet.getCell('A1').font = { bold: true, underline: true, name: 'Arial', size: 8 };
					worksheet.getCell('A6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('B6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('C6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('D6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('E6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('F6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('G6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('H6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('I6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('J6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('K6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('L6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('M6').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('C4').font = { bold: true, name: 'Arial', size: 8 };
					worksheet.getCell('C4').numFmt = 'Mmm-YY';
					/*exportar.facturasProveedores = AgrupadoFacturasProveedores;
					exportar.honorarios = AgrupadoHonorarios;
					exportar.docnoDUA = documentosNoDUA;
					exportar.docDUA = docuementosDUA;*/
					worksheet.mergeCells("A2" + ":L2");
					worksheet.getCell('L2').value = 'REGISTRO DE COMPRAS';
					worksheet.getCell('L2').alignment = { vertical: 'middle', horizontal: 'center' };
					worksheet.getCell('L2').font = { bold: true, name: 'Arial', size: 14 };

					worksheet.mergeCells("A3" + ":L3");
					worksheet.getCell('L3').value = "Periodo " + periodo;
					worksheet.getCell('L3').alignment = { vertical: 'middle', horizontal: 'center' };
					var tempFacturas = [];
					var indexfacturasProveedores = -1;
					var indexfacturasnoDua = -1;
					//Se juntan todas las facturas tanto de las facturas de proveedores como las que vienen de la carpeta de importacion
					for (var i = 0; i < result.facturasProveedores.length; i++) {
						if (result.facturasProveedores[i].dcto == '01') {
							tempFacturas.push(result.facturasProveedores[i]);
							indexfacturasProveedores = i;
						}
					}
					for (var i = 0; i < result.docnoDUA.length; i++) {
						if (result.docnoDUA[i].dcto == '01') {
							tempFacturas.push(result.docnoDUA[i]);
							indexfacturasnoDua = i;
						}
					}
					//Ordenamiento de facturas por fecha de documento
					tempFacturas.sort(function (a, b) {
						return new Date(a.fechadoc - b.fechadoc);
					})

					var totales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					var finales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					var contadorFilas = 7;
					// FACTURAS 
					for (var i = 0; i < tempFacturas.length; i++) {
						var objetoGuardar = {};
						var serie = "";
						var splitnumFactura = tempFacturas[i].numero.split('-');
						objetoGuardar.fechadoc = tempFacturas[i].fechadoc;
						objetoGuardar.fechareg = tempFacturas[i].fechareg;
						objetoGuardar.dcto = tempFacturas[i].dcto;
						if (splitnumFactura.length > 1) {
							objetoGuardar.numero = mask(splitnumFactura[1], "00000000");

						}
						objetoGuardar.ruc = tempFacturas[i].ruc;
						objetoGuardar.serie = mask(splitnumFactura[0], "00000");
						objetoGuardar.proveedor = tempFacturas[i].proveedor;
						//objetoGuardar.usd = tempFacturas[i].USD;
						objetoGuardar.usd = Number(tempFacturas[i].USD);
						totales.usd += Number(tempFacturas[i].USD);
						if (Number(tempFacturas[i].IGV) == 0) {
							objetoGuardar.exonerado = tempFacturas[i].valor;
							totales.exonerado += Number(tempFacturas[i].valor);
							objetoGuardar.valor = 0;
							totales.valor += 0;

							objetoGuardar.igv = Number(tempFacturas[i].IGV);
							totales.igv += Number(tempFacturas[i].IGV);

						} else {
							objetoGuardar.valor = tempFacturas[i].valor;
							totales.valor += Number(tempFacturas[i].valor);
							objetoGuardar.igv = Number(tempFacturas[i].IGV);
							totales.igv += Number(tempFacturas[i].IGV);
							objetoGuardar.exonerado = 0;
							totales.exonerado += 0;
						}
						objetoGuardar.exportacion = tempFacturas[i].exportacion || 0;
						totales.exportacion += Number(tempFacturas[i].exportacion) || 0;
						objetoGuardar.total = tempFacturas[i].total;
						totales.total += Number(tempFacturas[i].total);
						objetoGuardar.tc = tempFacturas[i].TC;
						worksheet.addRow(objetoGuardar);
						contadorFilas++;
					}
					worksheet.addRow({});
					worksheet.addRow({});
					contadorFilas += 2;
					objetoGuardar = {};
					objetoGuardar.proveedor = "TOTAL FACTURA";
					objetoGuardar.usd = Math.abs(totales.usd);
					finales.usd += Math.abs(totales.usd);
					objetoGuardar.valor = Math.abs(totales.valor);
					finales.valor += Math.abs(totales.valor);
					objetoGuardar.igv = totales.igv;
					finales.igv += totales.igv;
					objetoGuardar.exportacion = totales.exportacion;
					finales.exportacion += totales.exportacion;
					objetoGuardar.exonerado = totales.exonerado;
					finales.exonerado += totales.exonerado;
					objetoGuardar.total = Math.abs(totales.total);
					finales.total += Math.abs(totales.total);
					worksheet.addRow(objetoGuardar);

					worksheet.getCell('E' + contadorFilas.toString()).font = { bold: true, name: 'Arial', size: 8 };
					for (var k = 5; k < 14; k++) {
						worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
							top: { style: 'thin', color: { argb: "#000" } }
						};
					}
					contadorFilas++;
					worksheet.addRow({});
					worksheet.addRow({});
					contadorFilas += 2;
					//OTROS CONCEPTOS EN TABLA FACTURA PROVEEDORES
					var totales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					if (indexfacturasProveedores + 1 < result.facturasProveedores.length) {
						//Se crea un elemento con el cual comparar para diferenciar dentro de todo el arreglo cuando se comienza a listar otro grupo de documentos
						var dctoComparar = result.facturasProveedores[indexfacturasProveedores + 1].dcto;
						//se comienza a contar desde la siguiente posición que terminó con el grupo de facturas
						for (var i = (indexfacturasProveedores + 1); i < result.facturasProveedores.length; i++) {
							if (result.facturasProveedores[i].dcto == dctoComparar) {
								var objetoGuardar = {};
								var serie = "";
								var splitnumFactura = result.facturasProveedores[i].numero.split('-');
								objetoGuardar.fechadoc = result.facturasProveedores[i].fechadoc;
								objetoGuardar.fechareg = result.facturasProveedores[i].fechareg;
								objetoGuardar.dcto = result.facturasProveedores[i].dcto;
								if (splitnumFactura.length > 1) {
									objetoGuardar.numero = mask(splitnumFactura[1], "00000000");

								}
								objetoGuardar.ruc = result.facturasProveedores[i].ruc;
								objetoGuardar.serie = mask(splitnumFactura[0], "00000");
								objetoGuardar.proveedor = result.facturasProveedores[i].proveedor;
								//objetoGuardar.usd = result.facturasProveedores[i].USD;
								objetoGuardar.usd = Number(result.facturasProveedores[i].USD);
								totales.usd += Number(result.facturasProveedores[i].USD);
								if (Number(result.facturasProveedores[i].IGV) == 0) {
									objetoGuardar.exonerado = result.facturasProveedores[i].valor;
									totales.exonerado += Number(result.facturasProveedores[i].valor);
									objetoGuardar.valor = 0;
									totales.valor += 0;

									objetoGuardar.igv = Number(result.facturasProveedores[i].IGV);
									totales.igv += Number(result.facturasProveedores[i].IGV);

								} else {
									objetoGuardar.valor = result.facturasProveedores[i].valor;
									totales.valor += Number(result.facturasProveedores[i].valor);
									objetoGuardar.igv = Number(result.facturasProveedores[i].IGV);
									totales.igv += Number(result.facturasProveedores[i].IGV);
									objetoGuardar.exonerado = 0;
									totales.exonerado += 0;
								}
								objetoGuardar.exportacion = result.facturasProveedores[i].exportacion || 0;
								totales.exportacion += Number(result.facturasProveedores[i].exportacion) || 0;
								objetoGuardar.total = result.facturasProveedores[i].total;
								totales.total += Number(result.facturasProveedores[i].total);
								objetoGuardar.tc = result.facturasProveedores[i].TC;
								worksheet.addRow(objetoGuardar);
								contadorFilas++;
							}
							if (result.facturasProveedores[i].dcto != dctoComparar && i <= result.facturasProveedores.length - 1 || i == result.facturasProveedores.length - 1) {
								dctoComparar = result.facturasProveedores[i].dcto;
								worksheet.addRow({});
								worksheet.addRow({});
								contadorFilas += 2;
								objetoGuardar = {};
								objetoGuardar.proveedor = "TOTAL ";
								objetoGuardar.usd = Math.abs(totales.usd);
								finales.usd += Math.abs(totales.usd);
								objetoGuardar.valor = Math.abs(totales.valor);
								finales.valor += Math.abs(totales.valor);
								objetoGuardar.igv = totales.igv;
								finales.igv += totales.igv;
								objetoGuardar.exportacion = totales.exportacion;
								finales.exportacion += totales.exportacion;
								objetoGuardar.exonerado = totales.exonerado;
								finales.exonerado += totales.exonerado;
								objetoGuardar.total = Math.abs(totales.total);
								finales.total += Math.abs(totales.total);
								worksheet.addRow(objetoGuardar);

								worksheet.getCell('E' + contadorFilas.toString()).font = { bold: true, name: 'Arial', size: 8 };
								for (var k = 5; k < 14; k++) {
									worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
										top: { style: 'thin', color: { argb: "#000" } }
									};
								}
								contadorFilas++;
								worksheet.addRow({});
								worksheet.addRow({});
								contadorFilas += 2;
								var totales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
							}
						}
					}
					//OTROS CONCEPTOS EN TABLA NO DUA
					var totales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					if (indexfacturasnoDua + 1 < result.docnoDUA.length) {
						//Se crea un elemento con el cual comparar para diferenciar dentro de todo el arreglo cuando se comienza a listar otro grupo de documentos
						var dctoComparar = result.docnoDUA[indexfacturasnoDua + 1].dcto;
						//se comienza a contar desde la siguiente posición que terminó con el grupo de facturas
						for (var i = (indexfacturasnoDua + 1); i < result.docnoDUA.length; i++) {
							if (result.docnoDUA[i].dcto == dctoComparar) {
								var objetoGuardar = {};
								var serie = "";
								var splitnumFactura = result.docnoDUA[i].numero.split('-');
								objetoGuardar.fechadoc = result.docnoDUA[i].fechadoc;
								objetoGuardar.fechareg = result.docnoDUA[i].fechareg;
								objetoGuardar.dcto = result.docnoDUA[i].dcto;
								if (splitnumFactura.length > 1) {
									objetoGuardar.numero = mask(splitnumFactura[1], "00000000");

								}
								objetoGuardar.ruc = result.docnoDUA[i].ruc;
								objetoGuardar.serie = mask(splitnumFactura[0], "00000");
								objetoGuardar.proveedor = result.docnoDUA[i].proveedor;
								//objetoGuardar.usd = result.docnoDUA[i].USD;
								objetoGuardar.usd = Number(result.docnoDUA[i].USD);
								totales.usd += Number(result.docnoDUA[i].USD);
								if (Number(result.docnoDUA[i].IGV) == 0) {
									objetoGuardar.exonerado = result.docnoDUA[i].valor;
									totales.exonerado += Number(result.docnoDUA[i].valor);
									objetoGuardar.valor = 0;
									totales.valor += 0;

									objetoGuardar.igv = Number(result.docnoDUA[i].IGV);
									totales.igv += Number(result.docnoDUA[i].IGV);

								} else {
									objetoGuardar.valor = result.docnoDUA[i].valor;
									totales.valor += Number(result.docnoDUA[i].valor);
									objetoGuardar.igv = Number(result.docnoDUA[i].IGV);
									totales.igv += Number(result.docnoDUA[i].IGV);
									objetoGuardar.exonerado = 0;
									totales.exonerado += 0;
								}
								objetoGuardar.exportacion = result.docnoDUA[i].exportacion || 0;
								totales.exportacion += Number(result.docnoDUA[i].exportacion) || 0;
								objetoGuardar.total = result.docnoDUA[i].total;
								totales.total += Number(result.docnoDUA[i].total);
								objetoGuardar.tc = result.docnoDUA[i].TC;
								worksheet.addRow(objetoGuardar);
								contadorFilas++;
							}
							if (result.docnoDUA[i].dcto != dctoComparar && i <= result.docnoDUA.length - 1 || i == result.docnoDUA.length - 1) {
								dctoComparar = result.docnoDUA[i].dcto;
								worksheet.addRow({});
								worksheet.addRow({});
								contadorFilas += 2;
								objetoGuardar = {};
								objetoGuardar.proveedor = "TOTAL ";
								objetoGuardar.usd = Math.abs(totales.usd);
								finales.usd += Math.abs(totales.usd);
								objetoGuardar.valor = Math.abs(totales.valor);
								finales.valor += Math.abs(totales.valor);
								objetoGuardar.igv = totales.igv;
								finales.igv += totales.igv;
								objetoGuardar.exportacion = totales.exportacion;
								finales.exportacion += totales.exportacion;
								objetoGuardar.exonerado = totales.exonerado;
								finales.exonerado += totales.exonerado;
								objetoGuardar.total = Math.abs(totales.total);
								finales.total += Math.abs(totales.total);
								worksheet.addRow(objetoGuardar);

								worksheet.getCell('E' + contadorFilas.toString()).font = { bold: true, name: 'Arial', size: 8 };
								for (var k = 5; k < 14; k++) {
									worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
										top: { style: 'thin', color: { argb: "#000" } }
									};
								}
								contadorFilas++;
								worksheet.addRow({});
								worksheet.addRow({});
								contadorFilas += 2;
								var totales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
							}
						}
					}
					//RECIBOS POR HONORARIOS
					var totales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					for (var i = 0; i < result.honorarios.length; i++) {
						var objetoGuardar = {};
						var serie = "";
						var splitnumFactura = result.honorarios[i].numero.split('-');
						objetoGuardar.fechadoc = result.honorarios[i].fechadoc;
						objetoGuardar.fechareg = result.honorarios[i].fechareg;
						objetoGuardar.dcto = result.honorarios[i].dcto;
						if (splitnumFactura.length > 1) {
							objetoGuardar.numero = mask(splitnumFactura[1], "00000000");

						}
						objetoGuardar.ruc = result.honorarios[i].ruc;
						objetoGuardar.serie = mask(splitnumFactura[0], "00000");
						objetoGuardar.proveedor = result.honorarios[i].proveedor;
						objetoGuardar.usd = result.honorarios[i].USD;
						totales.usd += Number(result.honorarios[i].USD);
						objetoGuardar.valor = result.honorarios[i].valor;
						totales.valor += Number(result.honorarios[i].valor);
						objetoGuardar.igv = Number(result.honorarios[i].IGV) || 0;
						totales.igv += Number(result.honorarios[i].IGV);
						objetoGuardar.exportacion = result.honorarios[i].exportacion || 0;
						totales.exportacion += Number(result.honorarios[i].exportacion);
						objetoGuardar.exonerado = Number(result.honorarios[i].exonerado) || 0;
						totales.exonerado += Number(result.honorarios[i].exonerado);
						objetoGuardar.total = result.honorarios[i].total;
						totales.total += Number(result.honorarios[i].total);
						objetoGuardar.tc = result.honorarios[i].TC;
						worksheet.addRow(objetoGuardar);
						contadorFilas++;
					}
					worksheet.addRow({});
					worksheet.addRow({});
					contadorFilas += 2;
					objetoGuardar = {};
					objetoGuardar.proveedor = "TOTAL RECIBOS POR HONORARIOS";
					objetoGuardar.usd = Math.abs(totales.usd);
					finales.usd += Math.abs(totales.usd);
					objetoGuardar.valor = Math.abs(totales.valor);
					finales.valor += Math.abs(totales.valor);
					objetoGuardar.igv = totales.igv;
					finales.igv += totales.igv;
					objetoGuardar.exportacion = totales.exportacion;
					finales.exportacion += totales.exportacion;
					objetoGuardar.exonerado = totales.exonerado;
					finales.exonerado += totales.exonerado;
					objetoGuardar.total = Math.abs(totales.total);
					finales.total += Math.abs(totales.total);
					worksheet.addRow(objetoGuardar);
					contadorFilas++;
					worksheet.getCell('E' + contadorFilas.toString()).font = { bold: true, name: 'Arial', size: 8 };
					for (var k = 5; k < 14; k++) {
						worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
							top: { style: 'thin', color: { argb: "#000" } }
						};
					}
					worksheet.addRow({});
					worksheet.addRow({});
					//Documentos DUA
					var totales = { /*usd: 0,*/ valor: 0, igv: 0, exportacion: 0, exonerado: 0, total: 0 };
					contadorFilas += 2;
					for (var i = 0; i < result.docDUA.length; i++) {
						var objetoGuardar = {};
						var serie = "";
						var splitnumFactura = result.docDUA[i].numero.split('-');
						objetoGuardar.fechadoc = result.docDUA[i].fechadoc;
						objetoGuardar.fechareg = result.docDUA[i].fechareg;
						objetoGuardar.dcto = result.docDUA[i].dcto;
						if (splitnumFactura.length > 1) {
							objetoGuardar.numero = mask(splitnumFactura[1], "00000000");

						}
						objetoGuardar.ruc = result.docDUA[i].ruc;
						objetoGuardar.serie = mask(splitnumFactura[0], "00000");
						objetoGuardar.proveedor = result.docDUA[i].proveedor;
						objetoGuardar.usd = result.docDUA[i].USD;
						totales.usd += Number(result.docDUA[i].USD);
						objetoGuardar.valor = result.docDUA[i].valor;
						totales.valor += Number(result.docDUA[i].valor);
						objetoGuardar.igv = Number(result.docDUA[i].IGV);
						totales.igv += Number(result.docDUA[i].IGV);
						objetoGuardar.exportacion = Number(result.docDUA[i].exportacion) || 0;
						totales.exportacion += Number(result.docDUA[i].exportacion);
						objetoGuardar.exonerado = result.docDUA[i].exonerado || 0;
						totales.exonerado += Number(result.docDUA[i].exonerado);
						objetoGuardar.total = result.docDUA[i].total || 0;
						totales.total += Number(result.docDUA[i].total);
						objetoGuardar.tc = result.docDUA[i].TC;
						worksheet.addRow(objetoGuardar);
						contadorFilas++;
					}
					worksheet.addRow({});
					worksheet.addRow({});
					contadorFilas += 2;
					objetoGuardar = {};
					objetoGuardar.proveedor = "TOTAL DUA";
					objetoGuardar.usd = Math.abs(totales.usd);
					finales.usd += Math.abs(totales.usd);
					objetoGuardar.valor = Math.abs(totales.valor);
					finales.valor += Math.abs(totales.valor);
					objetoGuardar.igv = totales.igv;
					finales.igv += totales.igv;
					objetoGuardar.exportacion = totales.exportacion || 0;
					finales.exportacion += Number(totales.exportacion);
					objetoGuardar.exonerado = totales.exonerado || 0;
					finales.exonerado += Number(totales.exonerado);
					objetoGuardar.total = Math.abs(totales.total);
					finales.total += Math.abs(totales.total);
					worksheet.addRow(objetoGuardar);
					contadorFilas++;
					worksheet.getCell('E' + contadorFilas.toString()).font = { bold: true, name: 'Arial', size: 8 };
					for (var k = 5; k < 14; k++) {
						worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
							top: { style: 'thin', color: { argb: "#000" } }
						};
					}
					worksheet.addRow();
					worksheet.addRow();
					contadorFilas += 2;
					//Impresion de Totales 
					objetoGuardar = {};
					objetoGuardar.mont_usd = finales.usd;
					objetoGuardar.mont_pen = finales.pen;
					objetoGuardar.valor = finales.valor;
					objetoGuardar.igv = finales.igv;
					objetoGuardar.exportacion = finales.exportacion;
					objetoGuardar.exonerado = finales.exonerado;
					objetoGuardar.total = finales.total;
					worksheet.addRow(objetoGuardar);
					contadorFilas++;
					for (var k = 5; k < 14; k++) {
						worksheet.getCell(letras[k] + contadorFilas.toString()).border = {
							top: { style: 'double', color: { argb: "#000" } }
						};
						worksheet.getCell(letras[k] + contadorFilas.toString()).font = { bold: true, name: 'Arial', size: 8 };
					}
					var nombreExportado = Date.now()// trae los milisegundos hasta el dia de hoy, un nombre unico
					var filename = "./" + nombreExportado + ".xlsx"
					workbook.xlsx.writeFile(filename)
						.then(function () {
							fs.readFile(filename, function (err, data) {
								if (!err) {
									// GUARDAMOS EL DOCUMENTO EN DATA
									fs.unlink(filename, function (errFile) {
										if (!errFile) {
											// ELIMINAMOS EL DOCUMENTO CREADO
											// ENVIAMOS AL FRONTEND
											cb(200, data)
										}
										else {
											cb(400, { message: 'Archivo no encontrado' })
										}
									})
								} else {
									cb(400, { message: 'Archivo no encontrado' })
								}
							});
						});
					//fin
				}
			});
		}, //finexportRegistroCompras
		exportTimeSheet: function (proveedorId, numeroProyecto, numeroTimesheet, cb) {
			getTimeSheet(proveedorId, numeroProyecto, function (status, result) {
				if (status != 200) {
					cb(500, { message: result });
				} else {
					var workbook = new Excel.Workbook();
					var ws = workbook.addWorksheet('Hoja 1', { properties: { showGridlines: 'false' } });
					ws.columns = [
						{ header: [''], key: 'a', width: 10.71 },
						{ header: [''], key: 'b', width: 10.71 },
						{ header: [''], key: 'c', width: 21.71 },
						{ header: [''], key: 'd', width: 10.71 },
						{ header: [''], key: 'e', width: 10.71 },
						{ header: [''], key: 'f', width: 20.29 },
						{ header: [''], key: 'g', width: 10.71 },
						{ header: [''], key: 'h', width: 15.14 },
						{ header: [''], key: 'i', width: 14.43 },
						{ header: [''], key: 'j', width: 10.71 }
					];
					ws.views = [{ showGridlines: 'false' }];
					var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
					/*Cabecera*/
					ws.getCell('A1').value = 'MAN Diesel & Turbo Peru SAC';
					ws.getCell('A2').value = 'PrimeServ Peru';
					/*Zona de Clientes*/
					ws.mergeCells('B4:E4');
					ws.mergeCells('B5:E5');
					ws.mergeCells('B6:E6');
					ws.getCell('A4').value = "Client:"; ws.getCell('B4').value = result.cabecera[0].cliente;
					ws.getCell('A5').value = "Subject:"; ws.getCell('B5').value = result.cabecera[0].descripcion;
					ws.getCell('A6').value = "From:"; ws.getCell('B6').value = result.cabecera[0].inicio + "/" + result.cabecera[0].fin;
					ws.getCell('F4').value = "Plant:"; ws.getCell('G4').value = result.cabecera[0].embarcacion;
					ws.getCell('F5').value = "Place:"; ws.getCell('G5').value = result.cabecera[0].lugar;
					ws.getCell('F6').value = "Leader:"; ws.getCell('G6').value = result.cabecera[0].leader; ws.mergeCells('I6:J6'); ws.getCell('I6').value = result.numeroProyecto;
					ws.getCell('G7').value = "P.O:"; ws.getCell('I7').value = "Time Sheet " + numeroTimesheet;
					/*Tabla WorkSheet*/
					ws.getCell('A9').value = "Travel / Working Time Sheet Table";
					ws.mergeCells('B11:J11');
					ws.getCell('B11').value = " " + result.cabecera[0].cargo
					ws.getCell('B11').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: "0EFEFEF" }
					};
					ws.getCell('B11').font = {
						bold: true,
						color: { argb: '000' },
					};
					ws.getCell('B12').value = "Date";
					ws.getCell('B12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('C12').value = "Date";
					ws.getCell('C12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('D12').value = "Rkms";
					ws.getCell('D12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('E12').value = "Daily Fees";
					ws.getCell('E12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('F12').value = "W / TVL";
					ws.getCell('F12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('G12').value = "N / 8h";
					ws.getCell('G12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('H12').value = "OVT normal";
					ws.getCell('H12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('I12').value = "SSH / 8h";
					ws.getCell('I12').alignment = { vertical: 'middle', horizontal: 'center' };
					ws.getCell('J12').value = "OVT SSH";
					ws.getCell('J12').alignment = { vertical: 'middle', horizontal: 'center' };
					var contador = 13;
					var objSumas = { dailyfees: 0, wtvl: 0, n8h: 0, ovtnormal: 0, ssh8h: 0, ovtssh: 0 };
					for (var i = 0; i < result.workHours.length; i++) {
						ws.getCell('B' + contador).value = result.workHours[i].date;
						bordesCelda(ws, 'B' + contador)
						ws.getCell('C' + contador).value = result.workHours[i].day;
						bordesCelda(ws, 'C' + contador)
						ws.getCell('D' + contador).value = result.workHours[i].rkms;
						bordesCelda(ws, 'D' + contador)
						ws.getCell('E' + contador).value = result.workHours[i].dailyfees;
						bordesCelda(ws, 'E' + contador)
						objSumas.dailyfees += result.workHours[i].dailyfees;
						ws.getCell('F' + contador).value = result.workHours[i].wtvl;
						bordesCelda(ws, 'F' + contador)
						objSumas.wtvl += result.workHours[i].wtvl;
						ws.getCell('G' + contador).value = result.workHours[i].n8h;
						bordesCelda(ws, 'G' + contador)
						objSumas.n8h += result.workHours[i].n8h;
						ws.getCell('H' + contador).value = result.workHours[i].ovtnormal;
						bordesCelda(ws, 'H' + contador)
						objSumas.ovtnormal += result.workHours[i].ovtnormal;
						ws.getCell('I' + contador).value = result.workHours[i].ssh8h;
						bordesCelda(ws, 'I' + contador)
						objSumas.ssh8h += result.workHours[i].ssh8h;
						ws.getCell('J' + contador).value = result.workHours[i].ovtssh;
						bordesCelda(ws, 'J' + contador)
						objSumas.ovtssh += result.workHours[i].ovtssh;
						contador++;
					}
					/*Subtotales*/
					ws.getCell('E' + contador).value = objSumas.dailyfees;
					bordesCelda(ws, 'E' + contador)
					ws.getCell('F' + contador).value = objSumas.wtvl;
					bordesCelda(ws, 'F' + contador)
					ws.getCell('G' + contador).value = objSumas.n8h;
					bordesCelda(ws, 'G' + contador)
					ws.getCell('H' + contador).value = objSumas.ovtnormal;
					bordesCelda(ws, 'H' + contador)
					ws.getCell('I' + contador).value = objSumas.ssh8h;
					bordesCelda(ws, 'I' + contador)
					ws.getCell('J' + contador).value = objSumas.ovtssh;
					bordesCelda(ws, 'J' + contador)
					contador++;
					/*Precios*/
					ws.getCell('E' + contador).value = numMoneda(result.priceWK[0].pdailyfees, 2, ".", ",");
					ws.getCell('E' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'E' + contador)
					ws.getCell('F' + contador).value = numMoneda(result.priceWK[0].pwtvl, 2, ".", ",");
					ws.getCell('F' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'F' + contador)
					ws.getCell('G' + contador).value = numMoneda(result.priceWK[0].pn8h, 2, ".", ",");
					ws.getCell('G' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'G' + contador)
					ws.getCell('H' + contador).value = numMoneda(result.priceWK[0].povtnormal, 2, ".", ",");
					ws.getCell('H' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'H' + contador)
					ws.getCell('I' + contador).value = numMoneda(result.priceWK[0].pssh8h, 2, ".", ",");
					ws.getCell('I' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'I' + contador)
					ws.getCell('J' + contador).value = numMoneda(result.priceWK[0].povtssh, 2, ".", ",");
					ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'J' + contador)
					contador++
					/*Totales*/
					var total = 0;
					ws.getCell('E' + contador).value = numMoneda((objSumas.dailyfees * result.priceWK[0].pdailyfees), 2, ".", ",");
					ws.getCell('E' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'E' + contador)
					total += objSumas.dailyfees * result.priceWK[0].pdailyfees;
					ws.getCell('F' + contador).value = numMoneda((objSumas.wtvl * result.priceWK[0].pwtvl), 2, ".", ",");
					ws.getCell('F' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'F' + contador)
					total += objSumas.wtvl * result.priceWK[0].pwtvl;
					ws.getCell('G' + contador).value = numMoneda((objSumas.n8h * result.priceWK[0].pn8h), 2, ".", ",");
					ws.getCell('G' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'G' + contador)
					total += objSumas.n8h * result.priceWK[0].pn8h;
					ws.getCell('H' + contador).value = numMoneda((objSumas.ovtnormal * result.priceWK[0].povtnormal), 2, ".", ",");
					ws.getCell('H' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'H' + contador)
					total += objSumas.ovtnormal * result.priceWK[0].povtnormal;
					ws.getCell('I' + contador).value = numMoneda((objSumas.ssh8h * result.priceWK[0].pssh8h), 2, ".", ",");
					ws.getCell('I' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'I' + contador)
					total += objSumas.ssh8h * result.priceWK[0].pssh8h;
					ws.getCell('J' + contador).value = numMoneda((objSumas.ovtssh * result.priceWK[0].povtssh), 2, ".", ",");
					ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					bordesCelda(ws, 'J' + contador)
					total += objSumas.ovtssh * result.priceWK[0].povtssh;
					contador += 2;
					ws.getCell('I' + contador).value = "USD";
					ws.getCell('I' + contador).font = {
						bold: true,
						color: { argb: '000' },
					};
					ws.getCell('J' + contador).value = numMoneda(total, 2, ".", ",");

					ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };

					ws.getCell('J' + contador).font = {
						bold: true,
						color: { argb: '000' },
					};
					contador++;
					contador++;
					/*Miscelanea*/
					ws.mergeCells('A' + contador + ':J' + contador);
					ws.getCell('A' + contador).value = "Miscellaneous";
					ws.getCell('A' + contador).fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: "0EFEFEF" }
					};
					ws.getCell('A' + contador).font = {
						bold: true,
						color: { argb: '000' },
					};
					contador++;
					var totalmisc = 0;
					for (var i = 0; i < result.miscellaneous.length; i++) {
						ws.getCell('A' + contador).value = (i + 1) + ".-" + result.miscellaneous[i].nombre;
						ws.getCell('D' + contador).value = "PEN";
						ws.getCell('E' + contador).value = numMoneda(result.miscellaneous[i].soles, 2, ".", ",");
						ws.getCell('E' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
						ws.getCell('F' + contador).value = "RATE OF EXCHANGE";
						ws.getCell('G' + contador).value = numMoneda(result.miscellaneous[i].rate_exchange, 2, ".", ",");
						ws.getCell('G' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
						ws.getCell('H' + contador).value = "AMOUNT IN USD";
						ws.getCell('I' + contador).value = numMoneda(result.miscellaneous[i].dolares, 2, ".", ",");
						ws.getCell('I' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
						ws.getCell('J' + contador).value = numMoneda(result.miscellaneous[i].dolares, 2, ".", ",");
						ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
						totalmisc += result.miscellaneous[i].dolares;
						if (i == result.miscellaneous.length - 1) {
							contador++;
							ws.getCell('A' + contador).value = (i + 2) + ".-ADM Fee";
							ws.getCell('B' + contador).value = "10%";
							ws.getCell('H' + contador).value = "AMOUNT IN USD";
							ws.getCell('J' + contador).value = numMoneda((totalmisc * 0.10), 2, ".", ",");
							ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
							totalmisc += (totalmisc * 0.10);
						}
						contador++;
					}
					ws.getCell('I' + contador).value = "USD";
					ws.getCell('J' + contador).value = numMoneda(totalmisc, 2, ".", ",");
					ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					ws.getCell('J' + contador).font = {
						bold: true,
						color: { argb: '000' },
					};
					contador++;
					contador++;
					ws.mergeCells('A' + contador + ':J' + contador);
					ws.getCell('A' + contador).value = "Total";
					ws.getCell('A' + contador).fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: "0EFEFEF" }
					};
					ws.getCell('A' + contador).font = {
						bold: true,
						color: { argb: '000' },
					};
					contador++;
					ws.getCell('A' + contador).value = "ManPower";
					ws.getCell('J' + contador).value = numMoneda(total, 2, ".", ",");
					ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					contador++
					ws.getCell('A' + contador).value = "Miscellaneous";
					ws.getCell('J' + contador).value = numMoneda(totalmisc, 2, ".", ",");
					ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					contador++
					contador++
					ws.getCell('I' + contador).value = "Grand Total";
					ws.getCell('J' + contador).value = numMoneda((total + totalmisc), 2, ".", ",");
					ws.getCell('J' + contador).alignment = { vertical: 'middle', horizontal: 'right' };
					ws.getCell('J' + contador).font = {
						bold: true,
						color: { argb: '000' },
					};
					contador++
					/*Comienzo Exportado*/
					var nombreExportado = Date.now()// trae los milisegundos hasta el dia de hoy, un nombre unico
					var filename = "./" + nombreExportado + ".xlsx"
					workbook.xlsx.writeFile(filename)
						.then(function () {
							fs.readFile(filename, function (err, data) {
								if (!err) {
									// GUARDAMOS EL DOCUMENTO EN DATA
									fs.unlink(filename, function (errFile) {
										if (!errFile) {
											// ELIMINAMOS EL DOCUMENTO CREADO
											// ENVIAMOS AL FRONTEND
											cb(200, data)
										}
										else {
											cb(400, { message: 'Archivo no encontrado' })
										}
									})
								} else {
									cb(400, { message: 'Archivo no encontrado' })
								}
							});
						});
					/*Fin Exportado*/
				}
			});
		},
		exportBalanceSheet: function (tipoCambio, codigoProyecto, cb) {
			//0.Obtencion de los datos de la tabla superior
			global.db.driver.execQuery(
				"SELECT " +
				"sums.proveedor, " +
				"sums.WTVL, " +
				"sums.N8H, " +
				"sums.OVTN, " +
				"sums.SATN, " +
				"sums.SATOVT, " +
				"sums.SH, " +
				"sums.CostxHour, " +
				"sums.TotalHours, " +
				"sums.Total " +
				"FROM " +
				"(SELECT " +
				"proveedor.nombre AS proveedor, " +
				"SUM(IF(articulo.nombre = 'W/TVL', orden_compra_detalle.cantidad, 0)) AS WTVL, " +
				"SUM(IF(articulo.nombre = 'N/8H', orden_compra_detalle.cantidad, 0)) AS N8H, " +
				"SUM(IF(articulo.nombre = 'OVT/N', orden_compra_detalle.cantidad, 0)) AS OVTN, " +
				"SUM(IF(articulo.nombre = 'SAT/N', orden_compra_detalle.cantidad, 0)) AS SATN, " +
				"SUM(IF(articulo.nombre = 'SAT/OVT', orden_compra_detalle.cantidad, 0)) AS SATOVT, " +
				"SUM(IF(articulo.nombre = 'SH', orden_compra_detalle.cantidad, 0)) AS SH, " +
				"proveedor.costo_hora AS 'CostxHour', " +
				"SUM(orden_compra_detalle.cantidad) AS 'TotalHours', " +
				"SUM(orden_compra_detalle.cantidad * proveedor.costo_hora) AS 'Total' " +
				"FROM " +
				"factura_proveedores " +
				"JOIN orden_compra ON factura_proveedores.orden_compra = orden_compra.id " +
				"INNER JOIN proveedor ON orden_compra.proveedor_id = proveedor.id " +
				"INNER JOIN orden_compra_detalle ON orden_compra_detalle.orden_compra_id = orden_compra_id " +
				"INNER JOIN articulo ON orden_compra_detalle.articulo_id = articulo.id " +
				"INNER JOIN centro_costo ON orden_compra.centro_costo_id = centro_costo.id " +
				"WHERE " +
				"articulo.tipo_id = 2 " +
				"AND centro_costo.codigo = ? " +
				"GROUP BY proveedor.nombre) AS sums "
				, [codigoProyecto]
				, function (err, objTablaSuperior) {
					if (err) {
						cb(400, { error: err });
					} else {
						//1.Personnel
						global.db.driver.execQuery(
							"SELECT " +
							"	'Worked Hours' as nombre, " +
							"    SUM(orden_compra_detalle.cantidad) as 'TotalHours', " +
							"    SUM(orden_compra_detalle.cantidad * proveedor.costo_hora)  as Total " +
							"FROM factura_proveedores join orden_compra" +
							"		ON factura_proveedores.orden_compra = orden_compra.id" +
							"	INNER join proveedor" +
							"       ON orden_compra.proveedor_id = proveedor.id" +
							"   INNER join orden_compra_detalle " +
							"		ON orden_compra_detalle.orden_compra_id = orden_compra_id" +
							"   INNER join articulo" +
							"		ON orden_compra_detalle.articulo_id = articulo.id" +
							"   INNER join centro_costo" +
							"		ON orden_compra.centro_costo_id = centro_costo.id " +
							"WHERE articulo.tipo_id = 2 AND centro_costo.codigo = ? ;",
							[codigoProyecto],
							function (err, objPersonnel) {
								if (err) {
									cb(400, { error: err });
								} else {
									//2.Travelling Costs
									global.db.driver.execQuery(
										"SELECT articulo.nombre, " +
										"	SUM(IF(orden_compra.moneda='USD',orden_compra_detalle.precio_total * tipo_cambio.cambio,orden_compra_detalle.precio_total)) as Cost " +
										"	  FROM factura_proveedores LEFT JOIN orden_compra " +
										"			ON factura_proveedores.orden_compra = orden_compra.id" +
										"		LEFT JOIN tipo_cambio" +
										"			ON orden_compra.fecha = tipo_cambio.fecha and orden_compra.moneda = tipo_cambio.moneda" +
										"		LEFT JOIN orden_compra_detalle" +
										"			ON orden_compra_detalle.orden_compra_id = orden_compra.id " +
										"		LEFT JOIN articulo " +
										"			ON orden_compra_detalle.articulo_id = articulo.id " +
										"	    LEFT JOIN centro_costo" +
										"			ON orden_compra.centro_costo_id = centro_costo.id " +
										"		WHERE orden_compra.tipo_id = 5 and centro_costo.codigo = ? " +
										"GROUP BY articulo.nombre ; ",
										[codigoProyecto],
										function (err, objTravelling) {
											if (err) {
												cb(400, { error: err });
											} else {
												//3.SubContractor Service
												global.db.driver.execQuery("SELECT 'Sub Contractor Service' as nombre, 0 as Cost",
													[],
													function (err, objSubService) {
														if (err) {
															cb(400, { error: err });
														} else {
															//4.1SubContractor Spare Parts - Compras Nacionales
															global.db.driver.execQuery(
																"SELECT 'Compras Nacionales' as nombre, " +
																"SUM(IF(orden_compra.moneda='USD',orden_compra_detalle.precio_total,orden_compra_detalle.precio_total * tipo_cambio.cambio)) as Cost " +
																"	FROM factura_proveedores join orden_compra " +
																"		ON factura_proveedores.orden_compra = orden_compra.id " +
																"	LEFT JOIN tipo_cambio" +
																"		ON orden_compra.fecha = tipo_cambio.fecha and orden_compra.moneda = tipo_cambio.moneda " +
																"	JOIN orden_compra_detalle " +
																"		ON orden_compra_detalle.orden_compra_id = orden_compra.id " +
																"	JOIN articulo " +
																"		ON orden_compra_detalle.articulo_id = articulo.id " +
																"	JOIN centro_costo " +
																"		ON orden_compra.centro_costo_id = centro_costo.id " +
																"	WHERE articulo.tipo_id = 1 and orden_compra.centro_costo = 8 and centro_costo.codigo  = ?  ",
																[codigoProyecto],
																function (err, objSubSpareParts1) {
																	if (err) {
																		cb(400, { error: err });
																	} else {
																		//4.2SubContractor Spare Parts - Compras Internacionales
																		global.db.driver.execQuery(
																			"SELECT 'Compras Internacionales' as nombre, " +
																			"SUM(IF( " +
																			"		carpeta_importacion_elemento.nombre = 'ExWork'" +
																			"		OR carpeta_importacion_elemento.nombre = 'Factura FOB' " +
																			"		OR carpeta_importacion_elemento.nombre = 'Factura CIF' " +
																			"		OR carpeta_importacion_elemento.nombre = 'Factura FCA' " +
																			"		OR carpeta_importacion_elemento.nombre = 'Factura CIP' " +
																			"		,IF(carpeta_importacion.moneda='USD', carpeta_importacion_elemento.monto, carpeta_importacion_elemento.monto * tipo_cambio.cambio) , 0)) as Cost " +
																			"FROM carpeta_importacion_elemento " +
																			"   LEFT JOIN carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
																			"   LEFT JOIN orden_compra on carpeta_importacion.orden_compra_id = orden_compra.id " +
																			"   LEFT JOIN tipo_cambio" +
																			"		ON orden_compra.fecha = tipo_cambio.fecha and orden_compra.moneda = tipo_cambio.moneda " +
																			"   LEFT JOIN centro_costo ON carpeta_importacion.centro_costo_id = centro_costo.id " +
																			"   WHERE centro_costo.codigo  = ? ; ",
																			[codigoProyecto],
																			function (err, objSubSpareParts2) {
																				if (err) {
																					cb(400, { error: err });
																				} else {
																					//5.Aduana - Ahora Gastos Nacionales
																					global.db.driver.execQuery(
																						"SELECT " +
																						"'Gastos Nacionales' AS nombre, " +
																						"SUM(IF(carpeta_importacion_elemento.nombre = 'Aduana', " +
																						"IF(carpeta_importacion.moneda = 'USD', " +
																						"carpeta_importacion_elemento.monto, " +
																						"carpeta_importacion_elemento.monto * tipo_cambio.cambio), " +
																						"0)) AS aduana, " +
																						/*"SUM(IF(carpeta_importacion_elemento.nombre = 'DUA', " +
																						"IF(carpeta_importacion.moneda = 'USD', " +
																						"carpeta_importacion_elemento.monto, " +
																						"carpeta_importacion_elemento.monto * tipo_cambio.cambio), " +
																						"0)) AS dua, " +*/
																						"SUM(IF(carpeta_importacion_elemento.nombre = 'Almacen', " +
																						"IF(carpeta_importacion.moneda = 'USD', " +
																						"carpeta_importacion_elemento.monto, " +
																						"carpeta_importacion_elemento.monto * tipo_cambio.cambio), " +
																						"0)) AS almacen, " +
																						"SUM(IF(carpeta_importacion_elemento.nombre = 'Estiva/Destiva', " +
																						"IF(carpeta_importacion.moneda = 'USD', " +
																						"carpeta_importacion_elemento.monto, " +
																						"carpeta_importacion_elemento.monto * tipo_cambio.cambio), " +
																						"0)) AS estivadestiva, " +
																						"SUM(IF(carpeta_importacion_elemento.nombre = 'AdValorem', " +
																						"IF(carpeta_importacion.moneda = 'USD', " +
																						"carpeta_importacion_elemento.monto, " +
																						"carpeta_importacion_elemento.monto * tipo_cambio.cambio), " +
																						"0)) AS advalorem, " +
																						"SUM(IF(carpeta_importacion_elemento.nombre = 'Transporte', " +
																						"IF(carpeta_importacion.moneda = 'USD', " +
																						"carpeta_importacion_elemento.monto, " +
																						"carpeta_importacion_elemento.monto * tipo_cambio.cambio), " +
																						"0)) AS transporte " +
																						"FROM " +
																						"carpeta_importacion_elemento " +
																						"JOIN " +
																						"carpeta_importacion ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
																						"LEFT JOIN " +
																						"orden_compra ON carpeta_importacion.orden_compra_id = orden_compra.id " +
																						"LEFT JOIN " +
																						"tipo_cambio ON orden_compra.fecha = tipo_cambio.fecha " +
																						"AND orden_compra.moneda = tipo_cambio.moneda " +
																						"JOIN " +
																						"centro_costo ON carpeta_importacion.centro_costo_id = centro_costo.id " +
																						"WHERE " +
																						"centro_costo.codigo = ? ; ",
																						[codigoProyecto],
																						function (err, objGastosNacionales) {
																							if (err) {
																								cb(400, { error: err });
																							} else {
																								//6.Transport Costs
																								global.db.driver.execQuery(
																									"SELECT 'Flete + Seguro + Estiva/Destiva' as nombre, SUM(IF(carpeta_importacion_elemento.nombre = 'Seguro' OR carpeta_importacion_elemento.nombre = 'Flete' OR carpeta_importacion_elemento.nombre = 'Estiva/Destiva' ,IF(carpeta_importacion.moneda='USD', carpeta_importacion_elemento.monto,carpeta_importacion_elemento.monto * tipo_cambio.cambio),0)) as Cost " +
																									"FROM carpeta_importacion_elemento " +
																									"JOIN carpeta_importacion  " +
																									"	ON carpeta_importacion_elemento.carpeta_importacion_id = carpeta_importacion.id " +
																									"LEFT JOIN orden_compra  " +
																									"	ON carpeta_importacion.orden_compra_id = orden_compra.id " +
																									"LEFT JOIN tipo_cambio " +
																									"	ON orden_compra.fecha = tipo_cambio.fecha and orden_compra.moneda = tipo_cambio.moneda " +
																									"JOIN centro_costo  " +
																									"	ON carpeta_importacion.centro_costo_id = centro_costo.id " +
																									"WHERE centro_costo.codigo = ? ; ",
																									[codigoProyecto],
																									function (err, objTransportCosts) {
																										if (err) {
																											cb(400, { error: err });
																										} else {
																											//7.Consumables
																											global.db.driver.execQuery(
																												"SELECT 'Gastos' AS nombre, " +
																												"	SUM(IF(orden_compra.moneda='USD',orden_compra_detalle.precio_total,orden_compra_detalle.precio_total * tipo_cambio.cambio)) AS Cost  " +
																												"	FROM factura_proveedores LEFT JOIN orden_compra " +
																												"		ON factura_proveedores.orden_compra = orden_compra.id " +
																												"	LEFT JOIN tipo_cambio " +
																												"		ON orden_compra.fecha = tipo_cambio.fecha and orden_compra.moneda = tipo_cambio.moneda " +
																												"	LEFT JOIN orden_compra_detalle " +
																												"		ON orden_compra.id = orden_compra_detalle.orden_compra_id " +
																												"	LEFT JOIN centro_costo " +
																												"		ON orden_compra.centro_costo_id = centro_costo.id " +
																												"	WHERE orden_compra.tipo_id = 1 AND centro_costo.codigo = ? ;",
																												[codigoProyecto],
																												function (err, objConsumables) {
																													if (err) {
																														cb(400, { error: err });
																													} else {
																														//Turnover
																														global.db.driver.execQuery(
																															"SELECT 'Turnover' AS nombre, " +
																															"IF(COUNT(factura.centro_costo_id) = 0, " +
																															"'0', " +
																															"IF(NOT (ISNULL(factura.centro_costo_id)), " +
																															"SUM(IF(factura.moneda = 'PEN', " +
																															"factura.total_factura, " +
																															"factura.total_factura * tipo_cambio.cambio)), " +
																															"0)) AS suma " +
																															"FROM " +
																															"factura " +
																															"INNER JOIN " +
																															"centro_costo ON factura.centro_costo_id = centro_costo.id " +
																															"INNER JOIN " +
																															"tipo_cambio ON (tipo_cambio.fecha = factura.fecha_emision " +
																															"AND tipo_cambio.moneda = factura.moneda) " +
																															"WHERE " +
																															"centro_costo.codigo = ? "
																															, [codigoProyecto, codigoProyecto],
																															function (err, objTurnover) {
																																if (err) {
																																	cb(400, { error: err });
																																} else {
																																	global.db.driver.execQuery(
																																		"SELECT cotizacion.barco " +
																																		"from centro_costo JOIN cotizacion " +
																																		"on cotizacion.numero = centro_costo.codigo " +
																																		"where centro_costo.codigo = ? ;"
																																		, [codigoProyecto]
																																		, function (err, ObjBarco) {
																																			if (err) {
																																				cb(400, { error: err });
																																			} else {
																																				var objExportar = {};
																																				objExportar.codigoProyecto = codigoProyecto;
																																				objExportar.tipoCambio = tipoCambio;
																																				objExportar.tablaSuperior = objTablaSuperior;
																																				objExportar.personnel = objPersonnel;
																																				objExportar.HK2 = {};
																																				objExportar.HK2.Cost = 0;
																																				objExportar.HK2.dolarCost = 0;
																																				for (var i = 0; i < objExportar.personnel.length; i++) {
																																					objExportar.personnel[i].dolarCost = objExportar.personnel[i].Total;
																																					objExportar.personnel[i].Cost = objExportar.personnel[i].Total * tipoCambio;
																																					objExportar.HK2.Cost += objExportar.personnel[i].Cost;
																																				}
																																				objExportar.travellingCosts = objTravelling;
																																				for (var i = 0; i < objExportar.travellingCosts.length; i++) {
																																					objExportar.HK2.Cost += objExportar.travellingCosts[i].Cost;
																																					objExportar.travellingCosts[i].dolarCost = objExportar.travellingCosts[i].Cost / tipoCambio;
																																				}
																																				objExportar.subContractorService = objSubService;
																																				for (var i = 0; i < objExportar.subContractorService.length; i++) {
																																					objExportar.HK2.Cost += objExportar.subContractorService[i].Cost;
																																					objExportar.subContractorService[i].dolarCost = objExportar.subContractorService[i].Cost / tipoCambio;
																																				}
																																				objExportar.subContractorSparePartsNational = objSubSpareParts1;
																																				for (var i = 0; i < objExportar.subContractorSparePartsNational.length; i++) {
																																					objExportar.HK2.Cost += objExportar.subContractorSparePartsNational[i].Cost;
																																					objExportar.subContractorSparePartsNational[i].dolarCost = objExportar.subContractorSparePartsNational[i].Cost / tipoCambio;
																																				}
																																				objExportar.subContractorSparePartsInternational = objSubSpareParts2;
																																				for (var i = 0; i < objExportar.subContractorSparePartsInternational.length; i++) {
																																					objExportar.HK2.Cost += objExportar.subContractorSparePartsInternational[i].Cost;
																																					objExportar.subContractorSparePartsInternational[i].dolarCost = objExportar.subContractorSparePartsInternational[i].Cost / tipoCambio;
																																				}
																																				objExportar.gastosNacionales = objGastosNacionales;
																																				for (var i = 0; i < objExportar.gastosNacionales.length; i++) {
																																					objExportar.HK2.Cost += objExportar.gastosNacionales[i].aduana + /*objExportar.gastosNacionales[i].dua +*/ objExportar.gastosNacionales[i].almacen + objExportar.gastosNacionales[i].estivadestiva + objExportar.gastosNacionales[i].advalorem + objExportar.gastosNacionales[i].transporte;
																																					objExportar.gastosNacionales[i].dolaraduana = objExportar.gastosNacionales[i].aduana / tipoCambio;
																																					//objExportar.gastosNacionales[i].dolardua = objExportar.gastosNacionales[i].dua / tipoCambio;
																																					objExportar.gastosNacionales[i].dolaralmacen = objExportar.gastosNacionales[i].almacen / tipoCambio;
																																					objExportar.gastosNacionales[i].dolarestivadestiva = objExportar.gastosNacionales[i].estivadestiva / tipoCambio;
																																					objExportar.gastosNacionales[i].dolaradvalorem = objExportar.gastosNacionales[i].advalorem / tipoCambio;
																																					objExportar.gastosNacionales[i].dolartransporte = objExportar.gastosNacionales[i].transporte / tipoCambio;
																																				}
																																				/*
																																				objExportar.transportCosts = objTransportCosts;
																																				for( var i = 0; i < objExportar.transportCosts.length; i++){
																																				objExportar.HK2.Cost += objExportar.transportCosts[i].Cost;
																																				objExportar.transportCosts[i].dolarCost = objExportar.transportCosts[i].Cost / tipoCambio;	
																																				}*/
																																				objExportar.consumables = objConsumables;
																																				for (var i = 0; i < objExportar.consumables.length; i++) {
																																					objExportar.HK2.Cost += objExportar.consumables[i].Cost;
																																					objExportar.consumables[i].dolarCost = objExportar.consumables[i].Cost / tipoCambio;
																																				}
																																				objExportar.HK2.dolarCost += objExportar.HK2.Cost / parseFloat(tipoCambio);
																																				objTurnover[0].SumaSoles = objTurnover[0].suma;
																																				objTurnover[0].SumaDolares = objTurnover[0].suma / parseFloat(tipoCambio);
																																				objExportar.turnover = objTurnover;
																																				objExportar.CM2 = {};
																																				objExportar.CM2.dolarCost = objExportar.turnover[0].SumaDolares - objExportar.HK2.dolarCost;
																																				objExportar.CM2.Cost = objExportar.turnover[0].SumaSoles - objExportar.HK2.Cost;
																																				objExportar.CM2.dolarCostp = (objExportar.CM2.dolarCost * 100) / objExportar.turnover[0].SumaDolares;
																																				objExportar.CM2.Costp = (objExportar.CM2.Cost * 100) / objExportar.turnover[0].SumaSoles;
																																				if (ObjBarco != "") {
																																					objExportar.barco = ObjBarco[0].barco;
																																				}
																																				cb(200, objExportar);
																																			}
																																		})
																																}
																															});//fin Turnover
																													}
																												});//fin Consumables
																										}
																									});//fin Transport Costs	
																							}
																						});	//fin aduana
																				}
																			});//fin agencia Spare Parts - Compras Internacionales	
																	}
																});	//fin subcontractor Spare Parts - Compras Nacionales
														}
													});//fin subcontractor service
											}
										});//fin travelling Costs
								}
							}); //fin de Personal
					}
				}); //fin de la tabla superior
		}//fin exportBalanceSheet
	}
}