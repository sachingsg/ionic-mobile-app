app.controller('ServiceController',function($scope,$cordovaToast,$state,$http,$stateParams,$ionicModal,ionicDatePicker,PaymentService,ServicesService,$localStorage,TicketService,$ionicLoading,$timeout,LocationModel){
    var vm = this;
    vm.reqTktDataObj = {};
    var ipObj1 = {
        callback: function (val) {  //Mandatory
            vm.reqTktDataObj.serviceDate = moment(val).format('YYYY-MM-DD');
        },
        from: new Date(), //Optional 
        to: new Date(2025,1,1), //Optional 
        inputDate: new Date(),      //Optional 
        mondayFirst: true,          //Optional 
        closeOnSelect: false,       //Optional 
        templateType: 'popup'       //Optional 
    };
   vm.setServiceDate = function(){
    ionicDatePicker.openDatePicker(ipObj1);
   }
    vm.toggleGroup = function(scheme){
        if(vm.isGroupShown(scheme)){
            vm.shownGroup = null;
        }
        else{
            vm.shownGroup = scheme;
        }
    };
    vm.isGroupShown = function(scheme){
        return vm.shownGroup === scheme;
    };
    vm.getUserScheme = function(schemeType){
        vm.userScheme = {};
        angular.forEach($localStorage.loggedin_user.schemes,function(item){
            if(item.schemeType == schemeType){
                vm.userScheme = item;
                console.log(vm.reqTktDataObj.usrVehicle);
                console.log(vm.userScheme);
                vm.schemeId = item.schemeId;
            }
        });
    };
    vm.getVehicleList = function(){
        vm.vehicleList = $localStorage.loggedin_user.userVehicles;
    };
    vm.servicesLeft = function(serviceType){
        $ionicLoading.show({
            template : 'Loading...'
        })
        $ionicModal.fromTemplateUrl('templates/modal/service_left_modal.html',{
          scope : $scope,
          animation : 'slide-in-up',
          controller : 'ServiceController'
        }).then(function(modal) {
          vm.modal = modal;        
          vm.modal.show();
          vm.serviceType = serviceType;  
           vm.myDesiredService(vm.serviceType);    
          $timeout(function(){           
            $ionicLoading.hide();
          },500)
      });
    };
    vm.workshopList = function(){
        $ionicModal.fromTemplateUrl('templates/modal/workshop_list_modal.html',{
          scope : $scope,
          animation : 'slide-in-up',
          controller : 'MapController',
          controllerAs:'mapCtrl'
        }).then(function(modal) {
          vm.modal = modal;        
          vm.modal.show();
      });
    };
    vm.myDesiredService = function(serviceType){
        ServicesService.getAllServices().get(function(response){
            vm.ServiceArr = [];
            if(serviceType == "all"){
                vm.ServiceArr = response.data;
                vm.serviceFilterArr = response.data;
            }
            else{
                angular.forEach(response.data,function(item){
                    if(item.category == serviceType){
                        vm.ServiceArr.push(item);
                    }
                });
            }
            console.log(vm.ServiceArr);
        },function(error){
            
        });
    }
    vm.serviceSearch = function(serviceType){
        $ionicLoading.show({
            template : 'Loading...'
        })       
      $ionicModal.fromTemplateUrl('templates/modal/service_search_modal.html',{
        scope : $scope,
        animation : 'slide-in-up',
        controller : 'ServiceController'
      }).then(function(modal){        
        vm.modal = modal;
        vm.modal.show();
        vm.serviceType = serviceType;  
        vm.myDesiredService(vm.serviceType);
        $timeout(function(){                   
            $ionicLoading.hide();
          },700)
        
      });
    };
    vm.searchService = function(searchQuery){
        vm.serviceFilterArr = vm.ServiceArr.filter(function(service){
            if(service.subCategory.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ){
                return true;
            }
        })
    };
    vm.selectedServices = function(from) {
        vm.selectedServicesArr = [];
        if(from){
            angular.forEach(vm.serviceFilterArr,function(service){
                if(service.isSelect){
                    vm.selectedServicesArr.push(service);
                }
            });

        }
        else{
            angular.forEach(vm.ServiceArr,function(service){
                if(service.isSelect){
                    vm.selectedServicesArr.push(service);
                }
            });
        }
        delete vm.confirmModal;
        $ionicModal.fromTemplateUrl('templates/modal/confirm_service_request_modal.html',{
            scope : $scope,
            cache:false,
            animation : 'slide-in-right',
            controller : 'ServiceController'
          }).then(function(confirmModal){
            vm.reqTktDataObj = {};
            var latlngObj = LocationModel.getCurrentLocation();
            vm.reqTktDataObj.location={
                lat : latlngObj.lat,
                lng : latlngObj.lng,
              };
            vm.confirmModal = confirmModal;
            vm.confirmModal.show();
            
          });
    };
    vm.requestTicket = function(){
       $ionicLoading.show({
           template:'Creating Ticket...'
       })
        vm.reqTktDataObj.userId = $localStorage.loggedin_user.userId;
        vm.reqTktDataObj.schemeId = vm.schemeId;
        // if(vm.reqTktDataObj.useUserScheme == true || vm.reqTktDataObj.useUserScheme == "true"){
        //     vm.reqTktDataObj.schemeId = vm.schemeId;
        // }
        var latlngObj = LocationModel.getCurrentLocation();
        vm.reqTktDataObj.location={
            lat : latlngObj.lat,
            lng : latlngObj.lng,
          };
        vm.reqTktDataObj.serviceType = "SERVICE"; 
        vm.reqTktDataObj.services = [];
        angular.forEach(vm.selectedServicesArr,function(service){
            if(service.isSelect){
                vm.reqTktDataObj.services.push(service);
            }
        });
        // console.log(vm.reqTktDataObj);
        
         if(vm.reqTktDataObj.services.length > 0 && vm.reqTktDataObj.usrVehicle ){
                TicketService.createTicket().save(vm.reqTktDataObj,function(response){               
                vm.confirmModal.hide();
                vm.confirmModal.remove();
                vm.modal.hide();
                vm.modal.remove();
                $ionicLoading.hide();
                console.log(response);
                if(response.data.isPayable =="YES"){
                    $scope.openCheckOutModal(response.data);
                }
                else if(response.data.isPayable == "NO"){
                    $timeout(function(){
                        $ionicLoading.hide();
                        $scope.successPop('Success', 'Request generated Successfully... Our Coustomer support will get back to you soon'); 
                    },500);
                }
            },function(error){
                $ionicLoading.hide();
                if(error.status == 417){
                    $scope.alertPop("Error" , error.data.message);
                }
                else{
                    $scope.alertPop("Error" , "Something wrong occured");
                }
                
                console.log(error);
            });
        }
        else{
            $ionicLoading.hide();
            $scope.alertPop('Error', 'Please Choose Atleast One Service and Vehicle To Request'); 
            $cordovaToast.show('Please click on the vehicle name for which you want get service. If the vehicle is not the list just add the same vehicle from Menu >> My Vehicles >> Add New Vehicle','4000','bottom').then(function(success) {
                // success
          
                console.log(success);
              }, function (error) {
                // error
                console.log(success);
              });
        }
    };
    
    vm.closeModal = function() {
      vm.modal.hide();
      vm.modal.remove();
    };
    vm.closeConfirmModal = function(){
        vm.confirmModal.hide();
        vm.confirmModal.remove();
    };
   
  
})