HISAnalitycs.controller('analitycsController', ['$scope', '$filter','$http', '$rootScope','$routeParams','analitycsService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC' ,function ($scope, $filter,$http, $rootScope, $routeParams, analitycsService, ProfileService, $cookieStore, sharedFormateoUsaSVC) {

    $scope.ini = function () {
	

        $scope.registrations = new kendo.data.DataSource({
			transport: {
				read: function (options) {
					
					options.success($scope.regs);
			
				}
			},
			
			schema: {
				model: {
					fields: {
						name: { type: "string", editable: false },
						//cliente_id: { type: "number" ,editable: false},
						influencers: { type: "number", editable: false },
					//	networks: { type: "string", editable: false },
						post: { type: "number", editable: false },
						start: { type: "date", editable: false },
						end: { type: "date", editable: false },
						/*moneda: { type: "string", editable: false },
						flujo: { type: "string", editable: false },

						total: { type: "number", editable: false }*/
					}
				}
			},
			pageSize: 20,
			Paging: true,
		
			//  Filtering: true,
			//serverSorting: true
        });
        $scope.registrationsColumns = [
			{
				field: "name",
				title: "NAME",
				template: '<a href="\\#/analitycs/#= id #" style="color: black;text-decoration: none;">#= name #</a>'
			},
			{//field:"cliente_id",
				field: "influencers",
				title: "INFLUENCERS"
			},
			/*{
				field: "networks",
				title: "NETWORKS"
			},*/
			{
				field: "post",
				title: "POSTS"
			}/*,
			{
				field: "earned",
				title: "EARNED",
			},
			{
				field: "engagement",
				title: "ENGAGEMENT",
				format: "{0:n2}"
			}*/,
			{
				field: "start",
				title: "START DATE",
		
				type: "date",
				format: "{0:dd/MM/yyyy}",
			},
			{
				field: "end",
				title: "END DATE",
		
				type: "date",
				format: "{0:dd/MM/yyyy}",
			},
			{
				command: [{ text: " ", template: '<kendo-button sprite-css-class="\'k-icon k-i-pencil\'" ng-click="mostrarOrdenCompra(dataItem)" data-toggle="tooltip" title="Modificar" id="botonMostrarOrdenCompra"></kendo-button>' }]
			}
		]; 
		
		$scope.gridOptions = {
			excel: {
				fileName: "Articulos.xlsx",
				allPages: true,
				filterable: true,
			},
			height: "70vh",
			filterable: {
				mode: "row",
				operators: {
					date: {
						eq: "Igual a",
						neq: "Diferente a",
						gte: "Mayor o igual a",
						gt: "Mayor a",
						lte: "Menor o igual a",
						lt: "Menor a"
					},
					number: {
						eq: "Igual a",
						neq: "Diferente a",
						gte: "Mayor o igual a",
						gt: "Mayor a",
						lte: "Menor o igual a",
						lt: "Menor a"
					},
					string: {
						startswith: "Inicia con",
						endswith: "Termina con",
						eq: "Es igual a",
						neq: "Es diferente a",
						contains: "Contiene",
						doesnotcontain: "No Contiene"
					}
				},
				messages: {
					and: "Y",
					or: "O",
					filter: "Filtrar",
					clear: "Limpiar",
					info: "Mostrar los valores que sean"
				}
			},
		
			sortable: true,
			reorderable: true,
			resizable: true,
			editable: true,
			selectable: "multiple, row",
			columnMenu: {
				messages: {
					sortAscending: "Ordenar Ascendentemente",
					sortDescending: "Ordenar Descendentemente",
					columns: "Columnas",
					filter: "Filtro Especial",
				}
			},
			pageable: {
				messages: {
					display: "{0} - {1} de {2} Registros",
					empty: "No existen datos",
					page: "Página",
					of: "de {0}",
					itemsPerPage: "Páginas",
					first: "Primero",
					previous: "Anterior",
					next: "Siguiente",
					last: "Último",
					refresh: "Refrescar"
				}
			},
			dataBound: function (e) {
				$("#loading").fadeOut(200);
			}
		},	$scope.cargarReportes();
		
		

	}
	
		$scope.reports = []
	$scope.cargarReportes = function () {
		

		$scope.regs = analitycsService.report().get(function (result) {
			$scope.reports = result;
			
			$("#gridArticulos .k-filter-row").hide();
			$scope.registrations.read();
			
			console.log(result)
		}, function (error) {
		});
	}
	$scope.ini();

	$scope.reportView=function()
	{
		document.getElementById("report").style.display="flex";
		document.getElementById("table").style.display="none";
	}

	$scope.crearReporte=function(report)
        {
			console.log(report)
			

         var data= report.url+"?__a=1";
    $http({
                    
                method: 'GET',
                url: data,
                eventHandlers :{},
                beforeSend: function (xhr) {
                    xhr.setRequestHeader ("*");
                },
                headers: {"Content-type": "application/x-www-form-urlencoded" }
            })
            .then(function(response)
            { 
                console.log(response.data.graphql.shortcode_media)
				report.idInfluencer=response.data.graphql.shortcode_media.owner.id;
				if (report.idInfluencer){
					analitycsService.report().save(report,function(result) {
						console.log("entra aca");
						window.location= "#/network";
			   
						   $scope.ini();
										
					});
				}
        
        	})        
    }



 }])
 HISAnalitycs.controller('analitycsDetailsController', ['$scope', '$filter','$http', '$rootScope','$routeParams','analitycsService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC' ,function ($scope, $filter,$http, $rootScope, $routeParams, analitycsService, ProfileService, $cookieStore, sharedFormateoUsaSVC) {

    $scope.ini = function () {
			$scope.reports = []
			$scope.report = []
			$scope.likes=0;
			$scope.comments = 0,  $scope.interactions=0;
			analitycsService.report().get({id: $routeParams.id},function (result) {
				$scope.report = result;
				for(i=0;i<$scope.report.length ; i++)
				{
					var data= $scope.report[i].urlPost+"?__a=1";

				$http({
                    
					method: 'GET',
					url: data,
					eventHandlers :{},
					beforeSend: function (xhr) {
						xhr.setRequestHeader ("*");
					},
					headers: {"Content-type": "application/x-www-form-urlencoded" }
				})
				.then(function(response)
				{ console.log("hi")
					console.log(response)
					$scope.comments = $scope.comments + response.data.graphql.shortcode_media.edge_media_preview_comment.count;
					 $scope.likes = $scope.likes+ response.data.graphql.shortcode_media.edge_media_preview_like.count;
					 urlOwner=  response.data.graphql.shortcode_media.owner.profile_pic_url;
					 owner=response.data.graphql.shortcode_media.owner.username;
					 full_name=response.data.graphql.shortcode_media.owner.full_name;
					 urlPost=response.data.graphql.shortcode_media.display_url;
					 $scope.interactions = $scope.comments+$scope.likes;

					$scope.reports.push({name : $scope.report[0].name, post:$scope.report.length, urlOwner:urlOwner, owner:owner,
						full_name:full_name,urlPost:urlPost  });
						console.log($scope.reports)
				})   

				}
				
			}, function (error) {
			});
			 analitycsService.report().get(function (result) {
				$scope.reportsColumn = result;
				
				console.log($scope.reportsColumn)
			}, function (error) {
			});
			console.log($scope.reports)

	}
	$scope.ini();

	$scope.reportView=function()
	{
		document.getElementById("report").style.display="flex";
		document.getElementById("table").style.display="none";
	}

	$scope.crearReporte=function(report)
        {
			console.log(report)
			

       
	}
	$scope.summary=function()
	{
		document.getElementById("report").style.display="flex"
		document.getElementById("performance").style.display="none"
		document.getElementById("influencers").style.display="none"
		document.getElementById("post").style.display="none"
	}
	$scope.performance=function()
	{ var ele;
		document.getElementById("report").style.display="none"
		document.getElementById("performance").style.display="flex"
		document.getElementById("influencers").style.display="none"
		document.getElementById("post").style.display="none"
		ele = document.getElementById("performance");
		ele.classList.add("activeMenu");
	}
	$scope.influencers=function()
	{
		document.getElementById("report").style.display="none"
		document.getElementById("performance").style.display="none"
		document.getElementById("influencers").style.display="flex"
		document.getElementById("post").style.display="none"
	}
	$scope.post=function()
	{	console.log("holi")
		document.getElementById("report").style.display="none"
		document.getElementById("performance").style.display="none"
		document.getElementById("influencers").style.display="none"
		document.getElementById("post").style.display="flex"
	}



 }])