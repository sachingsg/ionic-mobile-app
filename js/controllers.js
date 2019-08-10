app.controller('MainController', function ($scope, PlanService, $http, $rootScope, $window, $cordovaInAppBrowser, $localStorage, $ionicModal, $ionicLoading, PaymentService, $ionicPlatform, $timeout, $state, $ionicPopup, $cordovaNetwork, $cordovaDevice) {
  var vm = this;
  /*******************************************************************************/
  /**************************Use for alert pop up on******************************/
  /*******************************************************************************/
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    $rootScope.fromState = fromState;
    $rootScope.toState = toState;
    $rootScope.toParams = toParams;
    $rootScope.fromParams = fromParams;

  })
  //  $scope.isOnline = function(){
  //   if($cordovaNetwork.isOnline() == true){

  //   }
  //   else{
  //       $cordovaToast.show('No Internet Connection.Please connect to wifi or turn on your mobile network','3000','bottom').then(function(success) {         

  //       }, function (error) {

  //       });

  //     }
  //  }
  //  $scope.isOnline();
  $scope.backButtonAction = function () {
    document.addEventListener("deviceready", function () {
      $ionicPlatform.registerBackButtonAction(function () {
        if ($state.current.name == "app.profile" || $state.current.name == "app.dashboard" || $state.current.name == "app.vehicles" || $state.current.name == "app.tarrif-plan" || $state.current.name == "app.requests" || $state.current.name == "app.cart" || $state.current.name == "app.contactUs") {
          $state.go('app.mapView');
        }
        if ($state.current.name == "app.mapView") {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Alert',
            template: 'Do you want to exit from the App',
            okType: 'button-assertive'
          });
          confirmPopup.then(function (res) {
            if (res) {
              navigator.app.exitApp();
            } else { }
          });
        }
        if ($state.current.name == "add-vehicle") {
          $state.go('app.vehicles');
        }
        if ($state.current.name == "app.ticketList") {
          $state.go('app.dashboard');
        }
        if ($state.current.name == "app.ticketListDetails") {
          $state.go('app.ticketList');
        }
        if ($state.current.name == "register" || $state.current.name == "password-pre-reset" || $state.current.name == "reset-pwd") {
          $state.go('login');
        }


      }, 100);
    });
  }
  $scope.backButtonAction();

  $scope.ratingsObject = {
    iconOn: 'ion-android-favorite',    //Optional 
    iconOff: 'ion-android-favorite-outline',   //Optional 
    iconOnColor: '#73b717',  //Optional 
    iconOffColor: 'white',    //Optional 
    rating: 0, //Optional 
    minRating: 1,    //Optional 
    readOnly: false, //Optional 
    callback: function (rating, index) {    //Mandatory 
      $scope.ratingsCallback(rating, index);
    }
  };

  $scope.ratingsCallback = function (rating, index) {
    console.log('Selected rating is : ', rating, ' and the index is : ', index);
    $scope.$emit("ratings_available", rating);
  };
  $scope.checkSvcEngineer = function () {
    $scope.isEngineer = false;
    if ($localStorage.loggedin_user) {
      angular.forEach($localStorage.loggedin_user.roles, function (item) {
        if (item == "ROLE_ENGINEER") {
          $scope.isEngineer = true;
        }
      });
    }
    return $scope.isEngineer;
  };
  $scope.alertPop = function (title, msg, state) {
    var alertPopup = $ionicPopup.alert({
      title: title || 'Alert',
      template: msg,
      cssClass: "gsg-popup",
      buttons: [{
        text: 'Ok',
        type: 'button-full'
      }]
    })
    alertPopup.then(function (res) {
      if (state != undefined) {
        $state.go(state);
      }
    });
  }
  $scope.successPop = function (title, msg, state) {
    var successPopup = $ionicPopup.alert({
      title: title || 'success',
      template: msg,
      cssClass: "gsg-success-popup",
      buttons: [{
        text: 'Ok',
        type: 'button-positive',
        onTap: function () {
          successPopup.close();
        }
      }]
    })
    successPopup.then(function (res) {
      if (state != undefined) {
        $state.go(state);
      }
    });
  };
  $scope.getPaymentOptions = ["COD", "ONLINE PAYMENT"];

  $scope.openCheckOutModal = function (datas) {
    $ionicLoading.show({
      template: 'Loading...'
    })
    $ionicModal.fromTemplateUrl('templates/modal/check_out_modal_test.html', {
      scope: $scope,
      animation: 'slide-in-up',
      controller: 'MainController',
    }).then(function (checkoutModal) {
      $scope.checkoutModal = checkoutModal;
      $scope.checkoutModal.show();
      $scope.paymentDatas = datas;
      $scope.payments.paymentType = "";
      console.log($scope.paymentDatas);
      $timeout(function () {
        $ionicLoading.hide();

      }, 300)

    });
  };
  $scope.payments = {};

  var options = {
    description: 'Pay towards your service on GSG',
    image: 'https://i.imgur.com/3g7nmJC.png',
    currency: 'INR',
    key: 'rzp_live_pNOV70ECgCVGlL',
    amount: '',
    name: '',
    prefill: {
      email: '',
      contact: '',
      name: ''
    },
    theme: {
      color: '#73b711'
    }
  };
  var called = false
  
  var successCallback = function(payment_id) {
    var obj = {
      transactionaount: $scope.paymentDatas.payableAmount,
      referenceno:$scope.paymentDatas.referenceno,
      paymentmode:"Online",
      uniquerefnumber:payment_id,
      rezorPaymentId:payment_id,
      razorPayStatus:'success'
    }
    PaymentService.paymentSuccess().save(obj, function (response) {
      console.log(response);
      $scope.closeChekoutModal();
      called = false
      $timeout(function () {
        $scope.successPop("Success", "Payment Successful", 'app.mapView');
      },500)
    });
    
  };
  
  var cancelCallback = function(error) {
    $timeout(function () {
      $scope.alertPop("Error", error.description + ' (Error ' + error.code + ')', 'app.mapView');
      called = false
    },500)
  };

  $scope.paymentNow = function () {
    if ($scope.payments.paymentType == "" || $scope.payments.paymentType == "null") {
      $scope.alertPop("Error", "Please Choose one payment method");
    }
    else {
      if ($scope.payments.paymentType == "COD") {
        $ionicLoading.show({
          template: 'Please wait...'
        });
        PaymentService.codPayment().save($scope.paymentDatas, function (response) {
          $scope.checkoutModal.hide();
          $scope.checkoutModal.remove();
          $timeout(function () {
            $ionicLoading.hide();
            $scope.successPop('Success', 'Request Successful. Please check your My Request for more details', 'app.mapView');
          }, 400);

        }, function (error) {
          $ionicLoading.hide();
          $scope.alertPop('Error', error.data, 'app.mapView');
        });
      }
      if ($scope.payments.paymentType == "ONLINE PAYMENT") {
        // console.log($scope.paymentDatas);
        // var options = {
        //   location: 'no',
        //   clearcache: 'yes',
        //   toolbar: 'no'
        // };
        document.addEventListener("deviceready", function () {
          // $cordovaInAppBrowser.open($scope.paymentDatas.pgUrl, '_blank', options)
          //   .then(function (event) {
          //     PaymentService.checkPaymentStatus($scope.paymentDatas.referenceno).get(function (response) {
          //       console.log(response);
          //       $cordovaInAppBrowser.close();
          //       $scope.checkoutModal.hide();
          //       $scope.checkoutModal.remove();
          //       $timeout(function () {
          //         if (response.data == "SUCCESSFUL") {
          //           $scope.successPop("Success", "Payment Successful", 'app.mapView');
          //         }
          //         else {
          //           $scope.alertPop("Error", response.data, 'app.mapView');
          //         }
          //       }, 500)
          //       $timeout(function () {
          //         PlanService.getUserSchemes().get(function (response) {
          //           $localStorage.loggedin_user.schemes = response.data;
          //         }, function (error) {
          //           console.log(error);
          //         }, 2000);
          //       });

          //     }, function (error) {
          //       console.log(error);
          //       $scope.checkoutModal.hide();
          //       $scope.checkoutModal.remove();
          //       $ionicLoading.hide();

          //       $scope.alertPop('Error', error.data, 'app.mapView');
          //     });
          //   })
          //   .catch(function (event) {
          //     // error
          //   });
          var current_user = $localStorage.loggedin_user;
          var name = current_user.firstName+" "+current_user.lastName;
          options.name = name;
          options.amount = $scope.paymentDatas.payableAmount*100;
          options.prefill.email = current_user.email;
          options.prefill.contact = current_user.contactNbr;
          RazorpayCheckout.open(options, successCallback, cancelCallback);
        }, false);

      }
    }

  };
  $scope.closeChekoutModal = function () {
    $scope.checkoutModal.hide();
    $scope.checkoutModal.remove();
  };



  // $scope.isOnline = function(){
  //   if($cordovaNetwork.isOnline() == true){
  //     return true;
  //   }
  //   else{
  //     return false;
  //   }
  //   return true;
  // }
  $scope.getConstant = function () {
    //var deviceToken = $cordovaDevice.getUUID();
    var deviceToken = "83E75D61-6B1B-45CA-AC51-632F24DCD192";
    return deviceToken;
  }
  $ionicModal.fromTemplateUrl('templates/modal/change_location.html', {
    scope: $scope,
    animation: 'slide-in-right'
  }).then(function (modal) {
    vm.modal = modal;
  });
  vm.openChangeLocation = function () {
    vm.modal.show();
  }
  vm.closeModal = function () {
    vm.modal.hide();
    vm.modal.remove();
  }

});
app.controller('HomeController', function ($ionicModal, $timeout, $state) {
  var vm = this;
  $timeout(function () {
    $state.go('login');
  }, 5000);
});


app.controller('MapController', function ($cordovaGeolocation, $cordovaToast, TicketService, $cordovaAppVersion, $ionicModal, config, $scope, LocationModel, $ionicPlatform, $ionicLoading, $timeout, $state, $ionicPopup, $ionicHistory, loginService, $localStorage, WorkShopService) {
  var vm = this;
  var diagnostic;
  var locationAccuracy;
  var map;
  vm.workshopList = [];
  vm.mapInit = function () {
    $scope.location = '';
      $ionicPlatform.ready(function() {
       diagnostic = cordova.plugins.diagnostic;
       locationAccuracy = cordova.plugins.locationAccuracy;
      diagnostic.isLocationEnabled(function(available){
        if(!available){
          locationAccuracy.canRequest(function(canRequest){
            if(canRequest){
                locationAccuracy.request(function (success){
                    console.log("Successfully requested accuracy: "+success.message);
                    $timeout(function(){
                      vm.loadMap();
                    })
                }, function (error){
                  console.error("Accuracy request failed: error code="+error.code+"; error message="+error.message);
                  if(error.code !== locationAccuracy.ERROR_USER_DISAGREED){
                    if(window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")){
                      diagnostic.switchToLocationSettings();
                    }
                  }
                  else{
                    // $ionicHistory.goBack();
                    vm.mapInit();
                  }
                },locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
            }
            else{
              $cordovaToast.show('As per Android permission guideline please Allow location permission to use Google map service.Go to Settings >> apps >> GSG >>Permission >> Location','10000','center').then(function(success) {
                // success

                console.log(success);
              }, function (error) {
                // error
                console.log(success);
              });
            }
          });
        }
        else{
          $timeout(function(){
            vm.loadMap();
          })
        }
        console.log("Location is " + (available ? "available" : "not available"));
      }, function(error){
        console.error("The following error occurred: "+error);
      });
    })
    //vm.loadMap();
  }
  vm.showToast = function () {
    $cordovaToast.showLongCenter('toast success').then(function (success) {
      // success
      console.log(success);
    }, function (error) {
      // error
      console.log(success);
    });

  }
  vm.loadMap = function () {
    var options = { timeout: 20000, enableHighAccuracy: true };
    // $ionicLoading.show();
    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
      $ionicLoading.hide();
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var myLatlng = { lat: lat, lng: lng };
      LocationModel.setCurrentLocation(myLatlng);
      vm.loadMapLocation(myLatlng);
      var latLng = lat + "," + lng;
      vm.getLocationName(myLatlng);
    }, function (error) {
      $ionicLoading.hide();
      $scope.alertPop('Warning', 'Map loading failed. Check your network ');
    });
  }

  $scope.changeLocation = function (latLng) {
    var myLatlng = { lat: latLng.lat, lng: latLng.lng }
    vm.location = latLng.location;
    vm.loadMapLocation(myLatlng);
  }
  vm.loadMapLocation = function (latLng) {
    var mapOptions = {
      streetViewControl: true,
      center: latLng,
      zoom: 13
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var myElements = angular.element(document.querySelector('#map'));
    var div = angular.element("<div class='centerMarker'></div>");
    myElements.append(div);
    // marker = new google.maps.Marker({
    //     position: latLng,
    //     map: map
    // });
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
    var latlong = latLng.lat + ',' + latLng.lng;
    var latlong1 = latLng.lng + ',' + latLng.lat;
    vm.getWorkShopList(latlong1);
    config.getLocationName(latlong).then(function (response) {
      vm.place = response.data.results[0];
      vm.location = vm.place;
    }, function (err) {
    });
  }
  $scope.ratingsObject2 = {
    iconOn: 'ion-ios-star',
    iconOff: 'ion-ios-star-outline',
    iconOnColor: '#73b717',
    rating: 5,
    readOnly: true,
  }
  vm.getWorkShopList = function (latLng) {
    WorkShopService.getWorkShopList(latLng).get(function (response) {
      vm.workshopList = response.data;
      angular.forEach(vm.workshopList, function (item) {
        $scope.ratingsObject2.rating = item.defaultRating;
        item.ratingObject = $scope.ratingsObject2;
        createMarker(item.coordinates);
      })
      LocationModel.setCurrentList(vm.workshopList);
    }, function (error) {
      $ionicLoading.hide();
    });
  }
  function createMarker(coordinates) {
    var marker = new google.maps.Marker({
      map: map,
      position: { lat: coordinates[1], lng: coordinates[0] },
      icon: 'img/icon.png'
    });
    // google.maps.event.addListener(marker, 'click', function() {
    //   infowindow.setContent(place.name);
    //   infowindow.open(map, this);
    //   mapSearch = place.geometry.location;
    //   showRout(pyrmont);
    // });
  }
  vm.emergencyTicket = {};
  vm.confirmEmegReq = function () {
    console.log("coming");
    var confirmPopup = $ionicPopup.alert({
      title: 'Confirm',
      template: 'Are you sure ? An emergency ticket will be created',
      cssClass: "gsg-popup",
      buttons: [{
        text: 'Cancel',
        type: 'button',
        onTap: function () {
          confirmPopup.close();
        }
      },
      {
        text: 'Ok',
        type: 'button',
        onTap: function () {
          $ionicLoading.show({
            template: 'Requesting...'
          })
          var latlngObj = LocationModel.getCurrentLocation();
          vm.emergencyTicket.location = {
            lat: latlngObj.lat,
            lng: latlngObj.lng,

          };
          vm.emergencyTicket.userId = $localStorage.loggedin_user.userId;
          vm.emergencyTicket.serviceType = "EMERGENCY";
          console.log(vm.emergencyTicket);
          TicketService.createTicket().save(vm.emergencyTicket, function (response) {
            console.log(response);
            $ionicLoading.hide();
            $scope.successPop('Success', `Your request has been captured successfully.  Our support team will get back to you shortly.`);
          }, function (error) {
            $ionicLoading.hide();
            if (error.status == 417 || error.message) {
              $scope.alertPop("Error", error.data.message);
            }
            else {
              $scope.alertPop("Error", "Something wrong. Please try again later");
            }
            console.log(error);
          });
        }
      }
      ]
    })
    // confirmPopup.then(function(res) {
    //   var latlngObj = LocationModel.getCurrentLocation();
    //   vm.emergencyTicket.location=[latlngObj.lat,latlngObj.lng];
    //   vm.emergencyTicket.userId = $localStorage.loggedin_user.userId;
    //   vm.emergencyTicket.serviceType = "EMERGENCY"; 
    //   TicketService.createTicket().save(vm.emergencyTicket,function(response){
    //     console.log(response);
    //     $scope.successPop('Success', `Your request has been captured successfully.  Our support team will get back to you shortly.`);
    //   },function(error){
    //     console.log(error);
    //   });
    // },function(err){
    //   confirmPopup.close();
    // });
  }
  vm.myCartOrders = function () {
    console.log("coming");
    TicketService.getCardOrders().get(function (response) {
      console.log(response);
      vm.cartOrders = response.data;
    }, function (error) {

    });
  };
  vm.checkUpdateVersion = function () {
    vm.versionArray = [];
    document.addEventListener("deviceready", function () {
      $cordovaAppVersion.getVersionNumber().then(function (version) {
        console.log(version);
        var appVersion = version;
        vm.versionArray = appVersion.split(".");
        var obj = {
          'major': parseInt(vm.versionArray[0]),
          'minor': parseInt(vm.versionArray[1]),
          'patch': parseInt(vm.versionArray[2]),
        }
        loginService.versionCheck().save(obj, function (response) {
          console.log(response);
          var isIOS = ionic.Platform.isIOS();
          if (response.data == "MAJOR") {
            $ionicPlatform.registerBackButtonAction(function (e) {
              e.preventDefault();
            }, 100);
            var minorUpdatePop = $ionicPopup.alert({
              title: "Update available !!!",
              template: "A new version of application available.Kindly update to latest version for new features",
              // cssClass : "gsg-success-popup",
              buttons: [{
                text: 'Exit',
                type: 'button-assertive',
                onTap: function () {
                  // vm.backButtonAction();
                  navigator.app.exitApp();

                }
              }, {
                text: 'Update Now',
                type: 'button-positive',
                onTap: function () {
                  if (isIOS) {
                    window.location.href = 'https://itunes.apple.com/us/app/gsg-go-speedy-go/id1407695961';
                  }
                  else {
                    window.location.href = 'http://play.google.com/store/apps/details?id=gsg.com';
                  }
                }
              }]
            }).then(function (res) {

              $scope.backButtonAction();
            })
          }
          if (response.data == "MINOR" || response.data == "PATCH") {
            var minorUpdatePop = $ionicPopup.alert({
              title: "Update available !!!",
              template: "A new version of application available.Kindly update to latest version for new features",
              // cssClass : "gsg-success-popup",
              buttons: [{
                text: 'Cancel',
                type: 'button-assertive',
                onTap: function () {
                  minorUpdatePop.close();
                }
              }, {
                text: 'Update Now',
                type: 'button-positive',
                onTap: function () {
                  if (isIOS) {
                    window.location.href = 'https://itunes.apple.com/us/app/gsg-go-speedy-go/id1407695961';
                  }
                  else {
                    window.location.href = 'http://play.google.com/store/apps/details?id=gsg.com';
                  }
                }
              }]
            })
          }
        }, function (error) {
          console.log(error);
        });
      }, function (error) {
        console.log(error);
      });

    }, false);

  }

});
app.controller("HelpController", function ($scope) {
  var vm = this;
  vm.queryList = [
    {
      'question': "What type of driver's licence is required",
      'answer': "GSG Requires a valid Indian driver's licence. It's critical that licence is an original. The Licence must be for a light motor vehicle(car). Members do NOT need a specific cab licence that is associated with a yellow board plate"
    },
    {
      'question': "What type of driver's licence is required",
      'answer': "GSG Requires a valid Indian driver's licence. It's critical that licence is an original. The Licence must be for a light motor vehicle(car). Members do NOT need a specific cab licence that is associated with a yellow board plate"
    }
  ];
  console.log(vm.queryList)
  vm.toggleGroup = function (list) {
    console.log(list);
    if (vm.isGroupShown(list)) {
      vm.shownGroup = null;
    } else {
      vm.shownGroup = list;
    }
  };
  vm.isGroupShown = function (list) {
    return vm.shownGroup === list;
  };
});


