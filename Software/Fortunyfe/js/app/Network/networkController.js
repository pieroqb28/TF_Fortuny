//HISShared.controller('menuController', ['$scope', '$filter', '$rootScope', 'menuService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC','fpshotkeys', function ($scope, $filter, $rootScope, menuService, ProfileService, $cookieStore, sharedFormateoUsaSVC, Hotkeys) {
   
HISNetwork.controller('networkController', ['$scope', '$filter', '$http','$rootScope','networkService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC' ,function ($scope, $filter,$http, $rootScope,  networkService, ProfileService, $cookieStore, sharedFormateoUsaSVC) {
       
         $scope.ini = function () {
            var id_instagram=0;
            var username_instagram="";
            var cantidadListas=0;
            var profile_url="";
            var nombre="";
            var something = document.getElementById('pointer');


            networkService.list().get(function(result) {
                //all list
                $scope.lista=result;
                $scope.lastList=result.slice(0,4);
              
                function compareStrings(a, b) {
                    // Assuming you want case-insensitive comparison
                    a = a.toLowerCase();
                    b = b.toLowerCase();
                  
                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                  }
                $scope.listas = $scope.lista.sort(function (a, b){
                    return compareStrings(a.nombre  , b.nombre)
                })
                $scope.cantidadListas = result.length;
              
            })
            networkService.listPhotos().get(function(result) {
                //all list
                $scope.aux =[]
                $scope.photo=[]
                console.log("all list")
               console.log(result)
                for(i =0; i<result.length;i++)
                { $scope.aux =[]
                    for(j=i;j<result.length;j++)
                    {   
                        if(result[i].id==result[j].id)
                        {  
                            
                            $scope.aux.push({nombreInfluencer: result[j].nombreInflu,
                                            profile_url:result[j].profile_url })
                             i=j;   
                        }
                        
                    } 
                    $scope.photo.push({  id : result[i].id,
                                    nombre : result[i].nombre,
                                    descripcion : result[i].descripcion,
                                    influencers : $scope.aux
                                 })
                            
                }
              $scope.photos= $scope.photo.slice(0,4)
                console.log($scope.photos)
               // $scope.lastList=result.slice(0,4);
                           
            })
           

            networkService.influencer().get(function(resultInfluencer) {
               
                $scope.cantidadInfluencers = resultInfluencer.length;
                $scope.influencerIntern=resultInfluencer;
                $scope.url = resultInfluencer[0].url;
                $scope.nombres = resultInfluencer.slice(0,7)
                
                function compareStrings(a, b) {
                    // Assuming you want case-insensitive comparison
                    a = a.toLowerCase();
                    b = b.toLowerCase();
                  
                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                  }
                  
                $scope.allInfluencers = resultInfluencer.sort(function (a, b){
                    return compareStrings(a.nombre  , b.nombre)
                })
                console.log($scope.allInfluencers)
                //document.getElementById("imagen").src= $scope.nombres.profile_url;
                

              //  $(".modal-body #imagen").attr("src",  $scope.url);
              
            })
            
        }
       
       
        $scope.ini();
       

        $scope.nuevaLista = function () {
          
            $('#popupNuevaLista').modal('show');
        }
        $scope.nuevoInfluencer = function(){

            $('#popupNuevoInfluencer').modal('show');

        }
        $scope.addLink = function(){

            $('#popupLink').modal('show');

        }

        
        $scope.listView = function(id)
          {
              window.location = "#/network/list/"+id;
          }
          $scope.pointer = function(data)
          {
              console.log("use ng-click" + data)
              window.location = "#/network/influencer/"+data;
          }
        $scope.nuevo=function(user)
        {
            var data;
                if(user.nombre.startsWith("https://www.instagram.com/"))
                {
                    data= user.nombre+"?__a=1";
                }else
                {
                    data= 'https://www.instagram.com/'+user.nombre+"/?__a=1";
                }


      /*  var req = new XMLHttpRequest();
        req.open('GET', data, true);
        req.withCredentials=true;
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
       
        req.onreadystatechange = function (aEvt) {
        if (req.readyState == 4) {
            if(req.status == 200){ 
            data = JSON.parse(req.responseText.split("window._sharedData = ")[1].split(";</script>")[0]).entry_data.ProfilePage[0].graphql;
*/           $http({
                    
                method: 'GET',
                url: data,
                eventHandlers :{},
                beforeSend: function (xhr) {
                    xhr.setRequestHeader ("*");
                },
                eventHandlers:{"Access-Control-Allow-Origin":"*"}
                ,
                headers: {"Content-type": "application/x-www-form-urlencoded"
                             }
            })
            .then(function(response)
            { 
                console.log(response)
             data = response.data.graphql;

            if(data.user.id!=0)
            {
                document.getElementById("hideThis").style.display="none";
                document.getElementById("popupLink").style.display="none";
                username_instagram = data.user.username;
                id_instagram = data.user.id;
                profile_url=data.user.profile_pic_url;
                
            }
            
           
            for(i =0; i<$scope.influencerIntern.length;i++)
            {
                id = $scope.influencerIntern[i].id_instagram;
                if(id_instagram == id)
                {   console.log(data.user)
                    document.getElementById("profile").style.display="flex";
                }
            }
        
        }, function errorCallback(response) {
            alert("no url")
        })        
    }
    $scope.filterPage = function()
    {
        console.log("filter Page")
    }
    $scope.allPage = function()
    {
        window.location= "#/network/influencer";
    }

     /*
         qraphlController.graph(user);


         runQuery(query);
         
            function runQuery (query) {
                console.log()
                query().then(
                    res => {
                        $output.innerHTML = `<pre><code>${JSON.stringify(res, null, 2)}</code></pre>`;
                    },
                    err => {
                        $output.innerHTML = `Error: <pre><code>${JSON.stringify(err, null, 2)}</code></pre>`;
                    }
                )
            }*/
         
    /*     $scope.root = function (user) {
           // return fetch('https://www.instagram.com/'+  user.nombre+'/?__a=1')
            
                /*var response = await fetch('https://www.instagram.com/'+  user.nombre+'/?__a=1');
                console.log(await response.text());*/
               
     /*   var data = fetch('https://www.instagram.com/'+  user.name+'/?__a=1')
        var data2 = data.text();
       console.log(data2);
             
            /*.then(response => response.text())
            .then(text => {
            console.log(text);
            }).catch(err => {
            console.error('fetch failed', err);
        });*/
       //      };
       $scope.createInfluencer = function(formGrabarInfluencer, isValid)
       {
           formGrabarInfluencer.username_instagram=username_instagram
           formGrabarInfluencer.id_instagram=id_instagram
           formGrabarInfluencer.profile_url = profile_url;
           formGrabarInfluencer.idSocial = 1;

           console.log(formGrabarInfluencer);
           $scope.submitted = true;
            if (isValid){
				networkService.influencer().save(formGrabarInfluencer,function(result) {
                    window.location.reload();
           
                       $scope.ini();
									
				});
				
				
			}



       }
        $scope.crearLista=function(formGrabarLista,isValid){
            console.log(formGrabarLista);
            console.log(isValid);
			$scope.submitted = true;
            if (isValid){
				networkService.list().save(formGrabarLista,function(result) {
                    console.log("entra aca");
                    window.location= "#/network";
                    $('#popupNuevaLista').modal('hide');
                     
                      
                       $( "#reload" ).load(window.location.href + " #reload" );
                       $scope.ini();
									
				});
				
				
			}
			
			
		
        }
        $scope.inList = function(res)
        {
            console.log(res)
            window.location = "#/network/list/"+res.id;
        }
        $scope.cerrarSesion = function () {
            $cookieStore.remove('tokenActual');
            localStorage.removeItem('sJWT');
             localStorage.removeItem('funcionalidades');
                window.location = "/#/";
    
          /*  ProfileService.Perfil().delete({}, function () {
                localStorage.removeItem('sJWT');
                window.location = "/#/";
            }, function (error) {
                localStorage.removeItem('sJWT');
                localStorage.removeItem('funcionalidades');
                window.location = "/#/";
                erroresServices.controlError(error.status);
            });*/
        };
        $scope.mostrarPopUpReportes = function (valorTipoReporte) {
            $scope.tipoReporte = valorTipoReporte;
            $scope.$broadcast('eventPopupReportes', { tipoReporte: valorTipoReporte }); // se conecta con el controlador anidado reportesController en la carpeta js/app/Reportes
        }
        $scope.tipoCambioActualizar = function () {
            $scope.actualizarTC_fecha = {}
            $scope.actualizarTC_fecha.moneda = "USD"
            $scope.actualizarTC_fecha.valor_tipo_cambio = 0
            var fechaHoy = new Date()
            $scope.actualizarTC_fecha.fecha = $filter('date')(new Date(), 'dd/MM/yyyy');
            $scope.traerTipoCambio()
            $('#popupactualizarTipoCambio').modal('show');
        }
        $scope.grabarTipoCambio = function () {
            if (!$scope.actualizarTC_fecha.idExistente) {
                var grabarTipoCambio = {
                    cambio: $scope.actualizarTC_fecha.valor_tipo_cambio,
                    moneda: $scope.actualizarTC_fecha.moneda,
                    fecha: sharedFormateoUsaSVC.fechaUsa($scope.actualizarTC_fecha.fecha)
                }
    
                menuService.tipoCambio().save(grabarTipoCambio, function () {
                    $scope.mostrarMensajeAviso = true
                    setTimeout(function () {
                        $scope.mostrarMensajeAviso = false;
    
                        $scope.$apply();
    
                    }, 1000);
                })
            }
            else {
                menuService.tipoCambio().update({ id: $scope.actualizarTC_fecha.idExistente }, { cambio: $scope.actualizarTC_fecha.valor_tipo_cambio }, function () {
                    $scope.mostrarMensajeAviso = true
                    setTimeout(function () {
                        $scope.mostrarMensajeAviso = false;
    
                        $scope.$apply();
    
                    }, 1000);
                })
            }
        }
        $scope.traerTipoCambio = function () {
            menuService.tipoCambio().query({ fecha: $scope.actualizarTC_fecha.fecha, moneda: $scope.actualizarTC_fecha.moneda }, function (resultTipoCambio) {
    
                if (resultTipoCambio.length > 0) {
                    $scope.actualizarTC_fecha.valor_tipo_cambio = resultTipoCambio[0].cambio
                    $scope.actualizarTC_fecha.idExistente = resultTipoCambio[0].id
                }
                else {
                    $scope.actualizarTC_fecha.idExistente = null
                    $scope.actualizarTC_fecha.valor_tipo_cambio = 0
                }
    
    
            })
        }
    }])
   

HISNetwork.controller('networkDetailsController', ['$scope', '$filter','$http', '$rootScope','$routeParams','networkService', 'ProfileService', '$cookieStore', 'sharedFormateoUsaSVC' ,function ($scope, $filter,$http, $rootScope, $routeParams, networkService, ProfileService, $cookieStore, sharedFormateoUsaSVC) {
   
       var username_instagram="";
       $scope.hastagh = []
       $scope.mentions = []
       var idSql;
       var id;
       var next="";
       $scope.ini = function () {
     networkService.influencer().get({id: $routeParams.username},function(resultInfluencer) {
          
                username_instagram = resultInfluencer[0].username_instagram;

                 var data= 'https://www.instagram.com/'+  username_instagram;
                 var pats=
                 $scope.part=[]
                 $scope.mention=[]
                 $scope.divide=[]
                 $scope.retorno;
                 $scope.retorno2;
                   
                    $http({
                    
                        method: 'GET',
                        url: 'https://www.instagram.com/'+  username_instagram+'/?__a=1',
                        eventHandlers :{},
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader ("*");
                        },
                        headers: {"Content-type": "application/x-www-form-urlencoded" }
                    })
                    .then(function(response)
                    {   console.log(response)
                        var totalComments =0 , likes=0 ,existCaption =0;
                        var totalLikes=0, coments=0 , videos=0, countvideos=0;
                        var isVideo=false;
                        var hast , mention;
                        $scope.influencer = resultInfluencer[0];
                        $scope.influencer.profile_url=response.data.graphql.user.profile_pic_url;
                        idSql =resultInfluencer[0].id;
                        var fow = response.data.graphql.user.edge_followed_by.count //followers sin formato numberwithcommas
                        $scope.influencer.followers= $scope.numberWithCommas(response.data.graphql.user.edge_followed_by.count);
                        console.log(response.data.graphql.user.edge_owner_to_timeline_media)
                            for(i=0; i<12 ;i++)
                            {
                               likes = response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_liked_by.count;
                               coments = response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_media_to_comment.count;
                               existCaption = response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_media_to_caption.edges.length;
                               if(existCaption>0)
                               {
                                var comment = response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_media_to_caption.edges[0].node.text;   
                                
                               }
                               isVideo = response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.is_video;

                               if(isVideo)
                               {
                                videos = videos + response.data.graphql.user.edge_owner_to_timeline_media.edges[i].node.video_view_count;
                                countvideos=countvideos+1;

                               }

                                $scope.divide = $scope.exe(comment) 
                                

                                totalLikes = totalLikes + likes;
                                totalComments =  totalComments +coments;
                            }
                            $scope.retorno = $scope.divide[0];
                            console.log($scope.retorno)
                            $scope.retorno2 = $scope.divide[1]; // retorna las menciones
                            console.log($scope.retorno2)
                            var count=0;
                            var i =0;

                         while($scope.retorno.length!=0) // contador de los hastagh mas usado
                               {  
                                   for(j=0;j<$scope.retorno.length ;j++)
                                   {   
                                        if($scope.retorno[0]==$scope.retorno[j])
                                       {
                                            count++;
                                       }
                                   } 
                                   $scope.hastagh.push({name : $scope.retorno[0] , count:count}) 
                                  
                                   for(  z = 0; z < $scope.retorno.length; z++)
                                   { 
                                     if ( $scope.retorno[z] ==  $scope.hastagh[i].name) {
                                       
                                        $scope.retorno.splice(z, 1);
                                        }
                                   }
                                        i++;
                                      count=0;
                               }
                               i=0;
                               count=0;
                               while($scope.retorno2.length!=0) // contador de los hastagh mas usado
                               {  
                                  for(j=0;j<$scope.retorno2.length ;j++)
                                   {  
                                        if($scope.retorno2[0]==$scope.retorno2[j])
                                       {
                                            count++;
                                       }
                                   } 
                                   $scope.mentions.push({name : $scope.retorno2[0] , count:count}) 
                                  
                                   for(  z = 0; z < $scope.retorno2.length; z++){ 
                                    if ( $scope.retorno2[z] ==  $scope.mentions[i].name) {
                                       
                                        $scope.retorno2.splice(z, 1);
                                    }
                                }
                               i++;
                               count=0;
                              }
                            $scope.hast =$scope.hastagh.sort(function (a, b){
                                return (b.count - a.count)
                            })
                            $scope.mention =$scope.mentions.sort(function (a, b){
                                return (b.count - a.count)
                            })
                            likesAndComments = totalLikes+totalComments+videos;
                        //$scope.influencer.hastagh= hast
                        console.log((likesAndComments/10).toFixed(2))
                        $scope.influencer.interaction =  ((likesAndComments/10)/1000).toFixed(2).concat("k")
                        $scope.influencer.engagement  = $scope.numberWithCommas(((((likesAndComments/10).toFixed(2))/fow)*100).toFixed(2)).concat("%");
                        id=response.data.graphql.user.id;
                        console.log("view", videos)
                        $scope.getFollowers(totalLikes, totalComments, videos/countvideos);
                        $scope.viewSocial();
                       
                        
                    }, function(error)
                    {
                    });             
                      
                    
                    $scope.exe= function(comment)
                    {
                          var aux = comment.split(' ')
                            for(i=0;i<aux.length; i++)
                            {   x = aux[i].startsWith("#");
                                y = aux[i].startsWith("@");
                                if(x)
                                {   
                                    $scope.part.push(aux[i])
                                }if(y)
                                {
                                    $scope.mention.push(aux[i])
                                }else{}
                            }
                            var count=0
                               
                           
                           return [$scope.part , $scope.mention]
                    }
           
            })
         }
        $scope.ini();
        $scope.numberWithCommas = function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        $scope.withoutCommas = function(x) {
            return x.replace(/,/g, '');;
        }
         $scope.savePrice = function(price, isValid){

            price.idInfluencer = idSql;
            console.log(price)
            console.log(isValid)

            
				networkService.price().save(price,function(result) {
                  console.log(result)
									
				});
				
			
         }
         $scope.viewSocial = function(){

            networkService.price().get({id: idSql},function(result) {
             
              $scope.prices = result;
              $scope.prices.create_date = result.create_date ;
              console.log($scope.prices)          
              document.getElementById("namePrice").style.color="gray";
              document.getElementById("nameSocial").style.color="black";
              document.getElementById("social").style.display="flex";
              document.getElementById("pricePanel").style.display="none";
            });
    
 }
         $scope.viewPrice = function(){

                    networkService.price().get({id: idSql},function(result) {
                     
                      $scope.prices = result;
                      if(result>0){ 
                      for(i =0;i<result.length;i++)
                      { 
                        $scope.prices[i].create_date = sharedFormateoUsaSVC.fechaUsa(result[i].create_date) ;

                      }
                    }
                      console.log($scope.prices)          
                      document.getElementById("namePrice").style.color="black";
                      document.getElementById("nameSocial").style.color="gray";
                      document.getElementById("social").style.display="none";
                      document.getElementById("pricePanel").style.display="initial";
                    });
			
         }
         $scope.actualizar=function()
         {
             console.log($scope.influencer)
			var enviarDatos = $scope.influencer
			networkService.influencer().update({ id: $scope.influencer.id },
				{
					nombre: enviarDatos.nombre,
					apellido: enviarDatos.apellido,
					nota_personal: enviarDatos.nota_personal,
					email: enviarDatos.email,
					telefono: enviarDatos.telefono
					
				}, function (result) {
					window.location.reload();
				});
         }
         $scope.getFollowers = function(likes, comments, view){
            console.log(view)
            var ctx = document.getElementById('chartjs-4');
            var likesLabel =(likes/10000).toFixed(2) + "k Likes"
            var commentsLabel =comments/10 + " Comments"
            var viewVideo =(view/1000).toFixed(2) + "k Video view"

            var myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels:  [likesLabel,  viewVideo,commentsLabel],
                    legendText: "{label}",
                    datasets: [{
                        data: [likes/10, view,comments/10],
                        backgroundColor: [
                            'rgb(219, 46, 124)',
                            'rgb(49, 133, 156)',
                            'rgb(247,229,52)'
                        ]/*,
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],*/,
                        borderAlign :'inner',
                        borderWidth: 1,
                        hoverBorderColor: ['rgb(219, 46, 124)', 'rgb(90, 86, 202)','rgb(247,229,52)'],
                        hoverBorderWidth: 5
                    }]
                    
                },
                options:{
                    responsive: true,
		            maintainAspectRatio: false,
                    cutoutPercentage: 88,
                    legend: {
                        display: false,
                    }
                }
                
            });
            document.getElementById('js-legend').innerHTML = myChart.generateLegend();
            //qualityyy
            var quality = ($scope.influencer.interaction.slice(0,-1))*1000;
            var follow = parseInt($scope.withoutCommas($scope.influencer.followers));
            var doubFollow= ((quality/follow)*1000).toFixed(2);
            console.log("hi",quality,follow,doubFollow)
            if(doubFollow>100)
            {
                doubFollow = 100-(quality/1000)
                if(doubFollow>89)
                {
                    doubFollow=89-3.3
                    console.log("yep")
                }else{
                    doubFollow=89-(quality/10000)
                    console.log("yep2", doubFollow)

                }
            }if(90>doubFollow && doubFollow>80){
                doubFollow=doubFollow-75.5;
            }
            if(80>doubFollow && doubFollow>70)
            {
                doubFollow=doubFollow-62.5;
                console.log("aquiii")

            }else if(70>doubFollow && doubFollow>60)
            {
                doubFollow=doubFollow-57.5;

            }else if(60>doubFollow && doubFollow>50)
            {
                doubFollow=doubFollow-45.5;

            }else if(50>doubFollow && doubFollow>40)
            {
                doubFollow=doubFollow-32.5;

            }else if(40>doubFollow && doubFollow>30)
            {
                doubFollow=doubFollow-28.5;

            }else if(30>doubFollow && doubFollow>20)
            {
                doubFollow=doubFollow-13.5;

            }else if(20>doubFollow)
            {
                doubFollow=doubFollow-4.9;

            }
            
              console.log(doubFollow)
              var niceFollow = (100 - doubFollow).toFixed(2);

            var ctx2 = document.getElementById('quality');
            var myChart2 = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: [(((niceFollow/100)*follow)/1000).toFixed(2) +'k ('+ (niceFollow) + '%) \n Nice Followers',
                    (((doubFollow/100)*follow)/1000).toFixed(2) +'k ('+ (doubFollow) + '%)  Doubtful Followers'],
                    datasets: [{
                        data: [ niceFollow, doubFollow],
                        backgroundColor: [
                            'rgb(219, 46, 124)',
                            'rgb(49, 133, 156)',
                        ]/*,
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],*/,borderAlign :'inner',
                        borderWidth: 1,
                        hoverBorderColor: ['rgb(219, 46, 124)', 'rgb(90, 86, 202)'],
                        borderWidth: 1,
                        hoverBorderWidth: 7
                        
                    }]
                },  options:{
                    responsive: true,
		            maintainAspectRatio: false,
                    cutoutPercentage: 89,
                    legend: {
                        display: false,
                    }
                }
                     
                
            });
            document.getElementById('js-legend2').innerHTML = myChart2.generateLegend();
            var first = ((niceFollow-30)-20).toFixed(2)
            var second = (100-first -20-19).toFixed(2);
            var third = (100-second-first-10).toFixed(2);
            var ctx = document.getElementById('age');
            var myChart3 = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels:  ['13-17', '18-24','25-34','35-44','45-64','65+'],
                    datasets: [{
                       
                        data: [second, first, third,10,7,3],
                        borderWidth: 2,
                        hoverBorderWidth: 9,
                        backgroundColor: [
                            'rgb(219, 46, 124)',
                            'rgb(219, 46, 124)',
                            'rgb(219, 46, 124)',
                            'rgb(219, 46, 124)',
                            'rgb(219, 46, 124)',
                            'rgb(219, 46, 124)'

                        ]/*,
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],*/,
                        borderWidth: 1
                    }]
                },
                options:{
                    responsive: true,
                    scales: {
                        xAxes: [{
                            barPercentage: 0.2,
                            margin: 0,
                            labelMaxWidth: 50,
                            labelMaxWidth:100,

                            ticks:{
                                minRotation:0,
                                maxRotation:0,
                                padding:0
                            }

                        }],
                        yAxes: [{
                            
                            ticks: {
                                beginAtZero: true,
                                min: 0,
                                max: 60,
                                stepSize: 15,
                                reverse: false,
                              }
                        }]
                    },
                    legend:{
                        display:false
                    }

                }
            });
            var y = Math.round(Math.random() * (100- 10) + 10)/100;

            var x = Math.round(Math.random() * (60 - 50) + 50)+y;
            var ctx = document.getElementById('sex');
            var myChart4 = new Chart(ctx, {
                type: 'doughnut',
                data: {
                   labels: [100-x+'% Men   ', x+'% Women'],
                    datasets: [{
                        data: [100-x, x],
                        backgroundColor: [
                            'rgb(49, 133, 156)',
                            'rgb(219, 46, 124)'
                        ]/*,
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],*/
                        ,borderAlign :'inner',
                        borderWidth: 1,
                        hoverBorderColor: ['rgb(49, 133, 156)','rgb(219, 46, 124)'],
                        borderWidth: 1,
                        hoverBorderWidth: 7
                        
                    }]
                },  
                options:{
                    responsive: true,
		            maintainAspectRatio: false,
                    cutoutPercentage: 89,
                    legend: {
                        display: false,
                    }
                }
            });  
            document.getElementById('js-legend3').innerHTML = myChart4.generateLegend();
   
    
    }
   
   
    }])