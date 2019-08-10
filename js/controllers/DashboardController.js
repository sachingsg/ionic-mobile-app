app.controller('DashboardController',function($ionicModal,$window, $ionicPopup,$rootScope,$localStorage,ServicesService,config,UserModel,$stateParams,$timeout,$state,$scope,$ionicLoading,TicketService){
    var vm = this;
    vm.ticketDetails = {};
    vm.choice = {};
    $scope.ticketLists =  UserModel.getTicket();
    vm.addOntypeArr = ["SERVICE","CONSUMABLE","SPARE","LABOUR"];
    vm.gstPercentageArr = [0,5,12,18,28];
    vm.addOnSvcCapture = {
        type : "",
        desc : "",
        price : "",
        serviceList : []
    };
    vm.addOnSvcItemArr = [];
    vm.getTickets  = function(){
        $ionicLoading.show({
            template :'Loading...'
        });
        TicketService.getAllTickets().get(function(response){
            console.log(response);
            $scope.ticketLists = response.data;
            UserModel.setTicket( response.data);
            $ionicLoading.hide();
           
                vm.rejecteddTicketArr = [];
                vm.resolvedTicketArr = [];
                vm.newTicketsArr = [];
                vm.wipTicketsArr = [];
                vm.closedTicketArr = [];
                angular.forEach(response.data, function(item){
                    if(item.requestStatus == "CLOSED"){
                        vm.closedTicketArr.push(item);
                    }
                    if(item.requestStatus == "RESOLVED"){
                        vm.resolvedTicketArr.push(item);
                    }
                    if(item.requestStatus == "REJECTED"){
                        vm.rejecteddTicketArr.push(item);
                    }
                    if(item.requestStatus == "CREATED" || item.requestStatus == "EMERGENCY"){
                        vm.newTicketsArr.push(item);
                    }
                    if(item.requestStatus == "WIP"){
                        vm.wipTicketsArr.push(item);
                    }
                });
               
        },function(error){
            console.log(error);
            $ionicLoading.hide();
            $scope.alertPop("Error", "Something wrong..Can't load reqquests");
        });
        $scope.$broadcast('scroll.refreshComplete');
    }
    vm.ticketList = function(){
        $ionicLoading.show({
            template : 'Loading..'
        })
        if($stateParams.st){
            $localStorage.ticketListStateParams = $stateParams.st;
            $rootScope.ticketCategory =  $localStorage.ticketListStateParams;
        }
        console.log( $rootScope.ticketCategory);
        TicketService.getAllTickets().get(function(response){
            console.log(response);
            UserModel.setTicket( response.data);
            // 
            vm.selectedTicketArr = [];
            angular.forEach(response.data, function(item){
                if(item.requestStatus == $localStorage.ticketListStateParams){
                    vm.selectedTicketArr.push(item);
                }
                if((item.requestStatus == "CREATED" || item.requestStatus == "EMERGENCY") && $localStorage.ticketListStateParams == "NEW"){
                    vm.selectedTicketArr.push(item);
                }
            });  
            $timeout(function(){
                $ionicLoading.hide();
               
            },300)    
        },function(error){
            console.log(error);
            $ionicLoading.hide();
            $scope.alertPop("Error", error.message);
        });
        $scope.$broadcast('scroll.refreshComplete');  
    };                 
     
    vm.getOrderForTicket = function(){
        if($stateParams.ticketData){
            $localStorage.ticketDetailsData = $stateParams.ticketData;
        }
        vm.ticketDetails = $localStorage.ticketDetailsData;
        console.log("111111111111111",vm.ticketDetails);
    };
    vm.refreshTicketDetailsPage = function(){
        console.log($localStorage.ticketDetailsData.orderId);
        TicketService.getOrderByOrderId($localStorage.ticketDetailsData.orderId).get(function(response){
            console.log(response);
            vm.ticketDetails = response.data;
            vm.getPendingAddOns(vm.ticketDetails.orderId,vm.ticketDetails.userId);
        },function(error){
            console.log(error);
        });
        $scope.$broadcast('scroll.refreshComplete');
    }; 
    
    vm.openAddNewSvcModal = function(){
        vm.addOnSvcCapture = {};
        vm.addOnSvcItemArr = [];
        $ionicModal.fromTemplateUrl('templates/modal/add_new_service_modal.html',{
            scope : $scope,
            animation : 'slide-in-up',
            controller : 'DashboardController'
          }).then(function(newSvcModal) {
            vm.newSvcModal = newSvcModal;        
            vm.newSvcModal.show();
        });
    };
    vm.closeNewSvcModal = function(){
        vm.newSvcModal.hide();
        vm.newSvcModal.remove();
    };
    vm.getAllServices = function(){
        ServicesService.getAllServices().get(function(response){
            console.log(response);
            vm.ServiceArr = [];          
            vm.ServiceArr = response.data;
            vm.serviceFilterArr = response.data;
            console.log(vm.ServiceArr);
        },function(error){
            console.log(error);
        });
    };
    vm.addItemToArray = function(){
       
        if(vm.addOnSvcCapture.type == "SERVICE"){
            vm.addOnSvcCapture.serviceList = [];
            angular.forEach(vm.serviceFilterArr,function(service){
                if(service.isSelect){
                    vm.addOnSvcCapture.serviceList.push(service);
                }
            });
            if(vm.addOnSvcCapture.serviceList.length >0){
                if(vm.addOnSvcItemArr.length > 0){
                    vm.yesService = false;
                    angular.forEach(vm.addOnSvcItemArr,function(items){
                        if(items.type == vm.addOnSvcCapture.type){
                            vm.yesService = true;
                            var index =  vm.addOnSvcItemArr.indexOf(items);
                            vm.addOnSvcItemArr.splice(index , 1);
                            vm.addOnSvcItemArr.push(vm.addOnSvcCapture);
                        }
                    });
                    if(!vm.yesService ){
                        vm.addOnSvcItemArr.push(vm.addOnSvcCapture);
                    }
    
                }
                else {
                    vm.addOnSvcItemArr.push(vm.addOnSvcCapture);
                }     
            }
            else {
                $scope.alertPop("Error", "Please select atleast one services")
            }
                  
        }
        else {
            console.log(vm.addOnSvcCapture);
            if(!vm.addOnSvcCapture.desc || vm.addOnSvcCapture.price == null || vm.addOnSvcCapture.price == '' || !vm.addOnSvcCapture.gst || !vm.addOnSvcCapture.quantity ){
                $scope.alertPop("Error" , " Required fields can not be blank");
            }
            else {
                vm.addOnSvcItemArr.push(vm.addOnSvcCapture);
               
            }
        }
        vm.addOnSvcCapture = {};
        console.log(vm.addOnSvcItemArr);
    };
    vm.addNewServicesToUserCart = function(){
        $ionicLoading.show({
            template : 'Adding to user cart'
        })
        console.log(vm.addOnSvcItemArr);
        TicketService.newSvcAddOn($stateParams.order_id).save(vm.addOnSvcItemArr, function(response){
            console.log(response);
            
            vm.newSvcModal.hide();
            $timeout(function(){
                $ionicLoading.hide();
                vm.refreshTicketDetailsPage();
                $scope.successPop('Success', 'Orders added to user cart Successfully...'); 
            },500);

        },function(error){
            $ionicLoading.hide();
            console.log(error);
        });
    };
    vm.changeTicketStatus = function(status){
        var changeStatusPopup = $ionicPopup.confirm({
            title:'CONFIRM',
            template:'Are you sure ?<br> Request status will be changed'
        });
        changeStatusPopup.then(function(res){
            if(res == true){
                console.log(vm.ticketDetails);
                console.log(status);
                var obj = {};
                if(vm.ticketDetails){
                    obj.assignedQueue = vm.ticketDetails.assignedQueue;
                    obj.assignedToUserId = vm.ticketDetails.assignedToUserId;
                    obj.userId = vm.ticketDetails.userId;
                    obj.requestStatus = status;
                }
                TicketService.updateOrder().update({svcEngId : $localStorage.loggedin_user.userId ,orderId : vm.ticketDetails.orderId},obj, function(response){
                console.log(response);
                vm.ticketDetails = response.data;
                $scope.successPop('Success', 'Status changed Successfully...', 'app.dashboard');
                    vm.refreshTicketDetailsPage();
            },function(error){
                if(error.status == 417){
                    $scope.alertPop("Error", error.data.message);
                } 
                else if(error.status == 401){
                    $scope.alertPop("Error", error.data.error+" Please login again");
                }
               else {
                $scope.alertPop("Error", "some error occured");
               }
                
            });
            }
    
        });
    };
    vm.checkMinAmount = function(received){
        vm.discountExceedText = false;
        vm.discountAcceptable =(( parseFloat(vm.orderDetailGCCOD.originalAmount)-parseFloat(received))/parseFloat(vm.orderDetailGCCOD.originalAmount))*100;
       console.log(vm.discountAcceptable);
         if(  vm.discountAcceptable > 10 || received > vm.orderDetailGCCOD.originalAmount){
            vm.discountExceedText = true;
        }
        console.log( vm.discountExceedText );
    }
    vm.openConfirmCodModal = function(orderDtlId,totalPayble){
        vm.orderDetailGCCOD = {};
        $ionicModal.fromTemplateUrl('templates/modal/codConfirm_modal.html',{
            scope : $scope,
            animation : 'slide-in-up',
            controller : 'DashboardController'
          }).then(function(codConfirmModal) {

            vm.codConfirmModal = codConfirmModal; 
            vm.cod = {};      
            vm.orderDetailGCCOD.originalAmount = totalPayble;     
            vm.orderDetailGCCOD.OrderdtlId = orderDtlId;     
            vm.codConfirmModal.show();

        });
    };
    vm.closeCodConfirmModdal = function(){
        vm.codConfirmModal.hide();
        vm.codConfirmModal.remove();
        
    }
    vm.confirmCOD = function(orderDtlId){
       console.log(vm.cod);
        $ionicLoading.show({
            template : 'Please wait..'
        });
        TicketService.confirmCODPayment(orderDtlId).save(vm.cod, function(response){
            vm.codConfirmModal.hide();
            vm.codConfirmModal.remove();
            $timeout(function(){
                $ionicLoading.hide();
                vm.refreshTicketDetailsPage();
                $scope.successPop(response.message, response.data); 
            },500);
        },function(error){        
            vm.closeCodConfirmModdal();
            $ionicLoading.hide();
            if(error.status == 417){
                $scope.alertPop("Error" , error.data.message);
            }
            else{
                $scope.alertPop("Error" , "Something wrong occured");
            }
        });
    
    };
  
    // function onSuccess(result){
    //     console.log(result);
    //   }
      
    //   function onError(result) {
    //    console.log(result);
    //   }
    vm.callThisNumber = function(mobileNbr){
        // window.plugins.CallNumber.callNumber(onSuccess,onError,mobileNbr,false);
        PhoneDialer.dial(mobileNbr,function(success) {
            
        },function(err) {
            if (err == "empty") alert("Unknown phone number");
            else $scope.aletPop("Dialer Error:" + err);
        });
    };


    vm.getmap = function(location){
        var lat = location.lat;
        var lng = location.lng;
        var myLatlng = {lat: lat, lng: lng};
        console.log(myLatlng);
        var mapOptions = {
            streetViewControl: true,
            center: myLatlng,
            zoom: 13
        };
        map = new google.maps.Map(document.getElementById('reqMap'),mapOptions);
        var myElements = angular.element(document.querySelector('#reqMap'));
        vm.getLocationName(myLatlng);
        var div = angular.element("<div class='centerMarker'></div>");
        myElements.append(div);
        google.maps.event.addListener(map, 'center_changed', function() {
            window.setTimeout(function() {
              var center = map.getCenter();
              var myLatlng = {lat: center.lat(), lng: center.lng()}
              vm.getLocationName(myLatlng);
            }, 100);
          });
        
    };
    vm.getLocationName = function(latLng){
        var latlong = latLng.lat+','+latLng.lng;
      config.getLocationName(latlong).then(function(response) {
          console.log(response);
        vm.place = response.data.results[0];
        vm.location = vm.place;
        console.log(vm.location);
      },function(err) {
      });
    };
    vm.getPendingAddOns = function(a,b){
        vm.pendingAddOns= {};
        TicketService.pendingAddOnList(a,b).get(function(response){
          console.log(response);
          vm.pendingAddOns = response.data;
        },function(error){
           console.log(error);
        });
    }
   
});