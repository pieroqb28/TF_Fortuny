/* js/fileAppControllers.js */
function fileCtrl ($scope,fileAppServices, connStringSVC) {
  //alert("controlsor")
  //alert($scope.entidad.nombre)
    $scope.partialDownloadLink =  connStringSVC.urlBase() +  '/download?filename=';
    $scope.filename = '';

    $scope.uploadFile = function() {
        $scope.processDropzone();
    };

    $scope.reset = function() {
        $scope.resetDropzone();
    };

     $scope.uploadFilesFunct=function()
    {
      $scope.cargarAdjuntos()
      $('#popupUploadFile').modal('show');
    }
    $scope.eliminarFile=function(dataItem){
  	
    	fileAppServices.obtenerArchivos().delete({id:dataItem.id},function(result) {	
    	
  	      		 //fileAppServices.obtenerArchivos('Cotizacion').query({id:localStorage.getItem('idCoti') },function(result) {  
  				fileAppServices.obtenerArchivos().query({entidad:$scope.entidad.nombre},function(result) {  
  						  				 $scope.regs = result;
  						  				 $scope.registrations.read();    

  								 },function (error){	     

  							  });
  	  },function (error){     

  	  });

    }


    $scope.cargarAdjuntos=function()
    {

      $scope.regs;

      $scope.filtroActual = "5";
      $scope.mostrarFiltros=false;
      $scope.registrations = new kendo.data.DataSource({
        transport: {
            read: function(options) {
                 options.success($scope.regs);
            }
        },
        schema: {
              model: {
                            fields: {
                               filename: { type: "string" ,editable: false },
                            }
              },
              
        },
        pageSize: 10,
        Paging: true,
      });


      $scope.registrationsColumns = [

      				 {field:"filename",
    	                          title:"Archivo",
    	                          template:'<a href="'  + connStringSVC.urlBase()  +'/Adjuntos/download/#=id#" target="_blank">#=filename#</a>'
    	                         
    	                          },

    	                      
    	                         
    	     {command:  [ { text: " ", template: '<kendo-button sprite-css-class="\'k-icon k-i-close\'"  ng-click="eliminarFile(dataItem)" ></kendo-button>'}]}
    	         
    	                          
                            
              ];


      $scope.gridOptions = {

      

          //height: 400,
         
             
            
      }

    	 $scope.regs = fileAppServices.obtenerArchivos().query({entidad:$scope.entidad.nombre,idEntidad:$scope.entidad.idEntidad},function(result) {  	 			
      			 	      $scope.registrations.read();     
    		 },function (error){	     

    	  });
    }



}

HISShared.controller('fileCtrl',['$scope','fileAppServices', 'connStringSVC',fileCtrl]);


function fileKendoCtrl ($scope,fileAppServices,connStringSVC ) {

$scope.uploadOptions = { saveUrl: connStringSVC.urlBase() +  '/upload/', removeUrl:   connStringSVC.urlBase() +  '/remove/rr', autoUpload: true , withCredentials : false};
 $scope.onSelect = function(e) {
                    var message = $.map(e.files, function(file) { return file.name; }).join(", ");
                }
  $scope.onUpload = function(e) {
     var xhr = e.XMLHttpRequest;

        if (xhr) {
            xhr.addEventListener("readystatechange", function (e) {
                if (xhr.readyState == 1 /* OPENED */) {
                    xhr.setRequestHeader("Authorization","Basic " + Base64.encode(localStorage.getItem('sJWT')));
                }
            });
        }
   }
}

HISShared.controller('fileKendoCtrl',['$scope','fileAppServices','connStringSVC', fileKendoCtrl ]);