/*
(function(undefined){'use strict';if(typeof XLSX==='undefined'){console.log('xlsx.js is required. Get it from https://github.com/SheetJS/js-xlsx');return;}
if(typeof _==='undefined'){console.log('Lodash.js is required. Get it from http://lodash.com/');return;}
var root=this;var previousXLSXReader=root.XLSXReader;var XLSXReader=function(file,readCells,toJSON,handler){var obj={};XLSXReader.utils.intializeFromFile(obj,file,readCells,toJSON,handler);return obj;}
if(typeof exports!=='undefined'){if(typeof module!=='undefined'&&module.exports){exports=module.exports=XLSXReader;}
exports.XLSXReader=XLSXReader;}else{root.XLSXReader=XLSXReader;}
XLSXReader.VERSION='0.0.1';XLSXReader.utils={'intializeFromFile':function(obj,file,readCells,toJSON,handler){var reader=new FileReader();reader.onload=function(e){var data=e.target.result;var workbook=XLSX.read(data,{type:'binary'});obj.sheets=XLSXReader.utils.parseWorkbook(workbook,readCells,toJSON);handler(obj);}
reader.readAsBinaryString(file);},'parseWorkbook':function(workbook,readCells,toJSON){if(toJSON===true){return XLSXReader.utils.to_json(workbook);}
var sheets={};_.forEachRight(workbook.SheetNames,function(sheetName){var sheet=workbook.Sheets[sheetName];sheets[sheetName]=XLSXReader.utils.parseSheet(sheet,readCells);});return sheets;},'parseSheet':function(sheet,readCells){var range=XLSX.utils.decode_range(sheet['!ref']);var sheetData=[];if(readCells===true){_.forEachRight(_.range(range.s.r,range.e.r+ 1),function(row){var rowData=[];_.forEachRight(_.range(range.s.c,range.e.c+ 1),function(column){var cellIndex=XLSX.utils.encode_cell({'c':column,'r':row});var cell=sheet[cellIndex];rowData[column]=cell?cell.v:undefined;});sheetData[row]=rowData;});}
return{'data':sheetData,'name':sheet.name,'col_size':range.e.c+ 1,'row_size':range.e.r+ 1}},to_json:function(workbook){var result={};workbook.SheetNames.forEach(function(sheetName){var roa=XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);if(roa.length>0){result[sheetName]=roa;}});return result;}}}).call(this);
*/
(function(undefined) {
    'use strict';
    if (typeof XLSX === 'undefined') {
        console.log('xlsx.js is required. Get it from https://github.com/SheetJS/js-xlsx');
        return;
    }
    if (typeof _ === 'undefined') {
        console.log('Lodash.js is required. Get it from http://lodash.com/');
        return;
    }
    var root = this;
    var previousXLSXReader = root.XLSXReader;
    var XLSXReader = function(file, readCells, toJSON, handler) {
        var obj = {};
        XLSXReader.utils.intializeFromFile(obj, file, readCells, toJSON, handler);
        return obj;
    }
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = XLSXReader;
        }
        exports.XLSXReader = XLSXReader;
    } else {
        root.XLSXReader = XLSXReader;
    }
    XLSXReader.VERSION = '0.0.1';
    XLSXReader.utils = {
        'intializeFromFile': function(obj, file, readCells, toJSON, handler) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {
                    type: 'binary'
                });
                obj.sheets = XLSXReader.utils.parseWorkbook(workbook, readCells, toJSON);
                handler(obj);
            }
            reader.readAsBinaryString(file);
        },
        'parseWorkbook': function(workbook, readCells, toJSON) {
            if (toJSON === true) {
                return XLSXReader.utils.to_json(workbook);
            }
            var sheets = {};
            _.forEachRight(workbook.SheetNames, function(sheetName) {
                var sheet = workbook.Sheets[sheetName];
                sheets[sheetName] = XLSXReader.utils.parseSheet(sheet, readCells);
            });
            return sheets;
        },
        'parseSheet': function(sheet, readCells) {
            var range = XLSX.utils.decode_range(sheet['!ref']);
            var sheetData = [];
            if (readCells === true) {
                _.forEachRight(_.range(range.s.r, range.e.r + 1), function(row) {
                    var rowData = [];
                    _.forEachRight(_.range(range.s.c, range.e.c + 1), function(column) {
                        var cellIndex = XLSX.utils.encode_cell({
                            'c': column,
                            'r': row
                        });
                        var cell = sheet[cellIndex];
                        rowData[column] = cell ? cell.v : undefined;
                    });
                    sheetData[row] = rowData;
                });
            }
            return {
                'data': sheetData,
                'name': sheet.name,
                'col_size': range.e.c + 1,
                'row_size': range.e.r + 1
            }
        },
        to_json: function(workbook) {
            var result = {};
            workbook.SheetNames.forEach(function(sheetName) {
                var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (roa.length > 0) {
                    result[sheetName] = roa;
                }
            });
            return result;
        }
    }
}).call(this);