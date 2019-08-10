app.controller('VehicleController',function($scope,$state,$ionicPopup,ionicDatePicker,$ionicModal,$localStorage,VehicleService,$ionicLoading,$timeout){
var vm = this;
vm.vehicle = {};
vm.vehicleList = {};
var ipObj1 = {
    callback: function (val) {  //Mandatory 
        if(vm.setType == "update"){
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            vm.updateVehicleData.expiryDate = moment(val).format('YYYY-MM-DD');
        }
        else {
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            vm.vehicle.expiryDate = moment(val).format('YYYY-MM-DD');
        }
        
    },
    from: new Date(), //Optional 
    to: new Date(2025,1,1), //Optional 
    inputDate: new Date(),      //Optional 
    mondayFirst: true,          //Optional 
    closeOnSelect: false,       //Optional 
    templateType: 'popup'       //Optional 
};
vm.setExpiry = function(){
    vm.setType = "set";
    ionicDatePicker.openDatePicker(ipObj1);
}
vm.updateExpiry = function(){
    vm.setType = "update";
    ionicDatePicker.openDatePicker(ipObj1);
}
if($localStorage.loggedin_user){
    vm.loggedin_user_id = $localStorage.loggedin_user.userId;
}
vm.toggleGroup = function(list){
    if(vm.isGroupShown(list)){
        vm.shownGroup = null;
    }
    else{
        vm.shownGroup = list;
    }
};
vm.isGroupShown = function(list){
    return vm.shownGroup === list;
}
vm.deleteVehicle = function(vehicleId){
    var vehicleDeletePopup = $ionicPopup.confirm({
        title:'Delete Vehicle',
        template:'Are you sure to delete the vehicle from your list'
    });
    vehicleDeletePopup.then(function(res){
        if(res == true){
        VehicleService.deleteVehicle(vm.loggedin_user_id,vehicleId).delete(function(response){
            console.log(response);
            $localStorage.loggedin_user = response.data;
            $timeout(function(){
                vm.vehicleList = $localStorage.loggedin_user.userVehicles;
                $ionicLoading.hide();
                $scope.successPop('Success', 'Vehicle deleted Successfully...'); 
            },500);
        },function(error){
            console.log(error);
        });
        }

    });
};
vm.updateVehicleData = {};
vm.insuranceArr = [true,false];    
vm.insuranceTypeArr =["Comprehensive","Zero Depreciation","Third party only"];
vm.updateVehicle = function(vehicle,position){
   var updateVehiclemodal = $ionicModal.fromTemplateUrl('templates/modal/update_vehicle_modal.html',{
        scope: $scope,
        controller: 'VehicleController',
        animation:'slide-in-up'
    });
    updateVehiclemodal.then(function(vehicleUpdateModal){
        vm.vehicleUpdateModal = vehicleUpdateModal;
        vm.vehicleUpdateModal.show();
        vm.updateVehicleData = vehicle;
        vm.updateVehicleData.vehiclePosition = position;
       
        vm.vehicleModelList = [vehicle.vehicle.models];
    });
}
vm.getVehicledata = function(){
    VehicleService.getVehicleMakeModel().get(function(response){
        console.log(response);
        vm.vehicleDatas = response.data;
        vm.makes = [];
        angular.forEach(response.data,function(item){
            vm.makes.push(item.make);
        })
        console.log(vm.makes);
    },function(error){
        console.log(error);
    });
    
};
vm.closeVehicleUpdateModal = function(){
    vm.vehicleUpdateModal.hide();
    vm.vehicleUpdateModal.remove();
}
vm.updateVehicleDetails = function(){
    $ionicLoading.show({
        template : 'Updating...'
    });
    console.log(vm.updateVehicleData);
    VehicleService.updateVehicle().update({ id:$localStorage.loggedin_user.userId,position:vm.updateVehicleData.vehiclePosition}, vm.updateVehicleData, function(response){
        console.log(response);
        vm.vehicleUpdateModal.hide();
        vm.vehicleUpdateModal.remove();
        $timeout(function(){
            $localStorage.loggedin_user = response.data;
            $ionicLoading.hide();
            $scope.successPop('Success', 'Vehicle updated Successfully...','app.mapView'); 
        },500);
    },function(error){
       
        $ionicLoading.hide();
        vm.vehicleUpdateModal.hide();
        vm.vehicleUpdateModal.remove();
        if(error.data.error == "invalid_token"){                     
            $scope.alertPop('Error', 'Token expired. Login again'); 
        
        }
        console.log(error);
    });
};
vm.getVehicleList = function(){
    $ionicLoading.show({
        template: 'Loading...'
    })
    vm.vehicleList = $localStorage.loggedin_user.userVehicles;
    console.log(vm.vehicleList);
    $timeout(function(){
        $ionicLoading.hide();
    },600);
};

vm.getModel = function(selectedModel){
    console.log("coming");
    console.log(selectedModel);
    
    console.log(vm.vehicleDatas);
    angular.forEach(vm.vehicleDatas,function(item){
        if(item.make == selectedModel){
            vm.vehiclesLists = item.vehicles;
            vm.vehicleModelList = [];
            angular.forEach(item.vehicles,function(vehicle){
                vm.vehicleModelList.push(vehicle.models);
            })
        }
    });
    console.log(vm.vehicleModelList);
    

};
vm.getVehicleType = function(model){
    console.log(model);
    console.log(vm.vehiclesLists);
    angular.forEach( vm.vehiclesLists,function(item){
        if(item.models == model){
            vm.type = item.type;
            vm.subType = item.subType;
            vm.wheels = item.wheels;
        }
    });
};
vm.getMfgYear = function(){
    vm.currentYear = 2018;
    vm.mfgYearArr = [];
    for(i = 0;i< 30; i++ ){
        vm.mfgYearArr.push(vm.currentYear--);
    }
    console.log(vm.mfgYearArr);
}
vm.addVehicle = function(){
    $ionicLoading.show({
        template : 'Adding Vehicle Details...'
    });

    vm.vehicle.vehicle = {
        make : vm.vehicle.make,
        models : vm.vehicle.model,
        subType : vm.subType,
        type :  vm.type,
        wheels : vm.wheels
    }
    console.log(vm.vehicle);
     VehicleService.addVehicle(vm.loggedin_user_id).save(vm.vehicle,function(response){
         $localStorage.loggedin_user = response.data;
         $timeout(function(){
             $ionicLoading.hide();
             $scope.successPop('Success', 'Vehicle Added Successfully...','app.vehicles'); 
         },500);
     },function(error){
         $ionicLoading.hide();
         $scope.alertPop('Error', 'Something went wrong'); 
         console.log(error);
     });
     
 }
});