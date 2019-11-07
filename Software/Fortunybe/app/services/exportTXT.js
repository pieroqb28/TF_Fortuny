var convertTXT = require('html-to-text');
var fs = require('fs');
var handlebars = require('handlebars');
module.exports = function (status, resultQuery, templatePDF, nombrePdf, cb) {
	 if (status != 200) {

		cb(500, { err: err });

	} else {

		fs.readFile('./app/views/' + template + '.tmpl', 'utf-8', function (err, data) {
			if (err) {
				cb(500, { err: err });
			} else {

				var source = data.toString();
				var template = handlebars.compile(source);
				var result = template(resultQuery[0]);
				var docx = HtmlDocx.asBlob(result);


				fs.readFile(nombreWord + '.docx', function (err, data) {
					cb(200, docx)
				})
			}

		});
	}
}