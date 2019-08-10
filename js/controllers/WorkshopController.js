app.controller('WorkshopController', function ($scope, $state, $ionicPopup, MasterService, ionicDatePicker, $ionicModal, $localStorage, VehicleService, $ionicLoading, $timeout, $cordovaGeolocation, LocationModel, config, ionicTimePicker, WorkShopService) {
    var vm = this;
    vm.shownGroup = null;
    vm.shownInsideGroup = null;
    vm.vehicleDatas = {};
    vm.allStates = {};
    vm.selectedStateDistrict = [];
    vm.myLatlng = {};
    vm.showLatLng = false;
    vm.onboardObject = {
        'otherBranchAdress': []
    };
    vm.facilities = [
        { name: 'Lifts', isSelected: false },
        { name: 'Ramps', isSelected: false },
        { name: 'Customer Lounge', isSelected: false },
    ]
    vm.services = [
        { name: 'Repair', isSelected: false },
        { name: 'Denting', isSelected: false },
        { name: 'Painting', isSelected: false },
        { name: 'Towing', isSelected: false },
    ];
    vm.vehicleCategory = [
        { name: '3 Wheeler', isSelected: false },
        { name: '4 Wheeler', isSelected: false },
    ];
    vm.toggleGroup = function (list) {
        if (vm.isGroupShown(list)) {
            vm.shownGroup = null;
        }
        else {
            vm.shownGroup = list;
        }
    };
    vm.isGroupShown = function (list) {
        return vm.shownGroup === list;
    }
    vm.toggleInsideGroup = function (list) {
        if (vm.isInsideGroupShown(list)) {
            vm.shownInsideGroup = null;
        }
        else {
            vm.shownInsideGroup = list;
        }
    };
    vm.isInsideGroupShown = function (list) {
        return vm.shownInsideGroup === list;
    }
    vm.loadInitialData = function () {
        vm.getVehicledata();
        vm.getAllState();
    }
    vm.getVehicledata = function () {
        vm.vehicleDatas = [];
        VehicleService.getVehicleMakeModel().get(function (response) {
            vm.vehicleDatas = response.data;
        }, function (error) {
            console.log(error);
        });
    };
    vm.getAllState = function () {
        MasterService.getAllStates().get(function (response) {
            vm.allStates = response.data;
        }, function (error) {
            console.log(error);
        })
    }
    vm.getDistrictOfSelectedState = function (selectedState) {
        vm.selectedStateDistrict = [];
        angular.forEach(vm.allStates, function (item) {
            if (item.stateCd == selectedState) {
                vm.selectedStateDistrict = item.districts;
            }
        });
    }
    vm.captureLocation = function () {
        vm.loadMap();
    }
    vm.loadMap = function () {
        var options = { timeout: 20000, enableHighAccuracy: true };
        vm.showLatLng = false;
        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
            vm.showLatLng = true;
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            vm.myLatlng = { lat: lat, lng: lng };
            vm.loadMapLocation(vm.myLatlng);
        }, function (error) {
            vm.showLatLng = false;
            $scope.alertPop('Warning', 'Map loading failed. Check your network ');
        });
    }
    vm.loadMapLocation = function (latLng) {
        var mapOptions = {
            streetViewControl: true,
            center: latLng,
            zoom: 13
        };
        var map = new google.maps.Map(document.getElementById('map2'), mapOptions);
        var myElements = angular.element(document.querySelector('#map2'));
        var div = angular.element("<div class='centerMarker'></div>");
        myElements.append(div);
        google.maps.event.addListener(map, 'center_changed', function () {
            window.setTimeout(function () {
                var center = map.getCenter();
                var myLatlng = { lat: center.lat(), lng: center.lng() }
                vm.getLocationName(myLatlng);
            }, 100);
        });
    }
    vm.getLocationName = function (latLng) {
        LocationModel.setCurrentLocation(latLng);
        vm.myLatlng = { lat: latLng.lat, lng: latLng.lng };
    }

    var timeObj = {
        callback: function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var selectedTime = new Date(val * 1000);
                var mins = selectedTime.getUTCMinutes().toString().length == 1 ? "0" + selectedTime.getUTCMinutes() : selectedTime.getUTCMinutes().toString();
                var hours = selectedTime.getUTCHours().toString().length == 1 ? "0" + selectedTime.getUTCHours() : selectedTime.getUTCHours().toString();
                vm.onboardObject.appointmentTime = hours + ":" + mins;
            }
        },
        inputTime: 50400,   //Optional
        format: 12,         //Optional
        step: 1,           //Optional
        setLabel: 'Set'    //Optional
    };
    vm.pickTime = function () {
        ionicTimePicker.openTimePicker(timeObj);
    }
    var dateObj = {
        callback: function (val) {  //Mandatory 
            vm.onboardObject.appointmentDate = moment(val).format('YYYY-MM-DD');
        },
        from: new Date(), //Optional 
        to: new Date(2500, 1, 1), //Optional 
        inputDate: new Date(),      //Optional 
        mondayFirst: true,          //Optional 
        closeOnSelect: false,       //Optional 
        templateType: 'popup'       //Optional 
    };
    vm.pickDate = function () {
        ionicDatePicker.openDatePicker(dateObj);
    }
    vm.pickDateDob = function () {
        var dateObjdob = {
            callback: function (val) {  //Mandatory 
                vm.onboardObject.dob = moment(val).format('YYYY-MM-DD');
            },
            from: new Date(1950,1,1), //Optional 
            to: new Date(2500, 1, 1), //Optional 
            inputDate: new Date(),      //Optional 
            mondayFirst: true,          //Optional 
            closeOnSelect: false,       //Optional 
            templateType: 'popup'       //Optional 
        };
        ionicDatePicker.openDatePicker(dateObjdob);
    }
    vm.checkMobileNumber = function() {
        WorkShopService.validateMobileNumber(vm.onboardObject.omobile).get(function (response) {
        }, function (error) {
            if(error.status === 417){
                $ionicPopup.alert({
                    title: 'Error',
                    cssClass: 'err-message',
                    template: 'Mobile number is already exist !',
                });
            }
        });
    }
    vm.initiateOnboard = function () {
        var obj = {
            "email": vm.onboardObject.oemail,
            "firstName": vm.onboardObject.fname,
            "lastName": vm.onboardObject.lname,
            "contactNbr": vm.onboardObject.omobile,
            "wName": vm.onboardObject.wname,
            "wAge": vm.onboardObject.wAge,
            "dob": vm.onboardObject.dob,
            "wVehicleBrandsRepaired": [],
            "wOtherBranchNumber": vm.onboardObject.otherBranchNumber,
            "address": [
                {
                    "houseNbr": vm.onboardObject.waddress.houseno,
                    "locality": vm.onboardObject.waddress.locality,
                    "landmark": vm.onboardObject.waddress.landmark,
                    "city": vm.onboardObject.waddress.city,
                    "district": vm.onboardObject.waddress.district,
                    "zip": vm.onboardObject.waddress.wzip,
                    "state": vm.onboardObject.waddress.state,
                }
            ],
            "wOAddress": [],
            "wAvgCarsRptDly": vm.onboardObject.avgCarsRptDly,
            "wMRevenue": vm.onboardObject.mrevenue,
            "wSMechs": vm.onboardObject.wsmechs,
            "wMechs": vm.onboardObject.wmechs,
            "wHelpers": vm.onboardObject.whelpers,
            "wWashers": vm.onboardObject.wwashers,
            "wVehicleTypesRepaired": [],
            "wServicesProvided": [],
            "wFacilities": [],
            "appointmentDate": vm.onboardObject.appointmentDate,
            "wsCreatedBy":$localStorage.loggedin_user.userId,
            "appointmentTime": vm.onboardObject.appointmentTime,
            "coordinates": [vm.myLatlng.lng, vm.myLatlng.lat]

        }
        angular.forEach(vm.vehicleDatas, function (item) {
            if (item.selected) {
                obj.wVehicleBrandsRepaired.push(item.make);
            }
        })
        angular.forEach(vm.facilities, function (item) {
            if (item.isSelected) {
                obj.wFacilities.push(item.name);
            }
        })
        angular.forEach(vm.services, function (item) {
            if (item.isSelected) {
                obj.wServicesProvided.push(item.name);
            }
        })
        angular.forEach(vm.vehicleCategory, function (item) {
            if (item.isSelected) {
                obj.wVehicleTypesRepaired.push(item.name);
            }
        })
        angular.forEach(vm.onboardObject.obaddress, function (item) {
            obj.wOAddress.push(item);
        })
        if (vm.onboardObject.vehicleRother) {
            obj.wVehicleTypesRepaired.push(vm.onboardObject.otherVehicleCategory)
        }
        if (vm.onboardObject.sothers) {
            obj.wServicesProvided.push(vm.onboardObject.otherService)
        }
        if (vm.onboardObject.fothers) {
            obj.wFacilities.push(vm.onboardObject.otherFacility)
        }
        $ionicLoading.show({
            template: 'Initiating...'
        })
        WorkShopService.initiateWorkShop().save(obj, function (response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Success',
                template: 'You have successfully onboarded',
            });
            $state.go('app.mapView');
        }, function (error) {
            $ionicLoading.hide();
        });
    }
})
