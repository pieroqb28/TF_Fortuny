/* js/fileAppDirectives */

function dropzone(connStringSVC) {

    return function(scope, element, attrs) {
        var idEntidad   = scope.entidad.idEntidad
        var Entidad = scope.entidad.nombre;             
        var config = {
            url: connStringSVC.urlBase() +'/'+ Entidad+'/upload/?numero='+idEntidad,
            headers: { 'Authorization': "Basic " + Base64.encode(localStorage.getItem('sJWT'))},
            maxFilesize: 100,
            previewTemplate : document.getElementById('preview-template').innerHTML,
            paramName: "uploadfile",
            addRemoveLinks: true,
            dictInvalidFileType:'El archivo contiene una extensión no permitida',
            dictFileTooBig: 'El archivo es demasiado pesado. No debe superar los {{maxFilesize}} MB',
            dictResponseError: 'Hubo un error al intentar cargar el archivo',
            dictCancelUpload: 'Cancelar carga',
            dictCancelUploadConfirmation :'¿Está seguro que desea cancelar la carga del archivo?',
            dictRemoveFile:'Descartar Archivo',
            maxThumbnailFilesize: 10,
            parallelUploads: 10,
            autoProcessQueue: true
        };





        var eventHandlers = {
            'addedfile': function(file) {                
                scope.file = file;
                scope.$apply(function() {
                    scope.fileAdded = true;
                });
            },

            'success': function (file, response) {
            }
        };
        dropzone = new Dropzone(element[0], config);

        angular.forEach(eventHandlers, function(handler, event) {
            dropzone.on(event, handler);
        });

        scope.processDropzone = function() {

            dropzone.processQueue();
        };

        scope.resetDropzone = function() {
            dropzone.removeAllFiles();
        }
    }
}




HISShared.directive('dropzone',['connStringSVC', dropzone]);

