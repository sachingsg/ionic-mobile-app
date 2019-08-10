app.controller("ProfileController",function($scope,$rootScope,$jrCrop,$ionicPlatform,ionicDatePicker,$state,$ionicModal,$cordovaCamera,$localStorage,$ionicActionSheet,$ionicLoading,$cordovaImagePicker,UserModel,UserService,MasterService,$timeout){
    var vm = this;
    vm.userUpdate = {};
    vm.districtList = [];
    vm.profile_image = ($localStorage.profile) ? $localStorage.profile : "img/placeholder.jpg"
    vm.currentDate = new Date();
    $scope.minDate = new Date(1905, 6, 1);
    $scope.maxDate = new Date();
    if( $localStorage.loggedin_user){
    vm.userUpdate.dob  = $localStorage.loggedin_user.dob;
    vm.userUpdate.anniversaryDate = $localStorage.loggedin_user.anniversaryDate;
    }
    var ipObj1 = {
        callback: function (val) {  //Mandatory 
            if(vm.setType == "dob") {
                vm.userUpdate.dob = moment(val).format('YYYY-MM-DD');
            }
            else{
                vm.userUpdate.anniversaryDate = moment(val).format('YYYY-MM-DD');
            }
        },
        from: new Date(1905, 1, 1), //Optional 
        to: new Date(), //Optional 
        inputDate: new Date(),      //Optional 
        mondayFirst: true,          //Optional 
        closeOnSelect: false,       //Optional 
        templateType: 'popup'       //Optional 
    };
    vm.openDob = function(){
        vm.setType = "dob";
        ionicDatePicker.openDatePicker(ipObj1);
    }
    vm.openAnni = function(){
        vm.setType = "anniver";
        ionicDatePicker.openDatePicker(ipObj1);
    }
    // $scope.dobPickerCallback = function (val) {
    //     if (!val) {	
    //         console.log('Date not selected');
    //     } else {
    //         vm.userUpdate.dob = moment(val).format('DD-MM-YYYY');
    //         console.log('Selected date is : ', vm.userUpdate.dob);
    //     }
    // };
    $scope.anniversaryPickerCallback = function (val) {
        if (!val) {	
      
        } else {
            vm.userUpdate.anniversaryDate = moment(val).format('DD-MM-YYYY');
        }
    };

    vm.changePass = {};
    vm.changePassword = function(){
        $ionicModal.fromTemplateUrl('templates/modal/change_password_modal.html',{
            scope : $scope,
            animation:'slide-in-right'
        }).then(function(changePassModal){
            vm.changePassModal = changePassModal;
            changePassModal.show();
        });
    }
    vm.changePassModalClose = function(){
        vm.changePassModal.hide();
        vm.changePassModal.remove();
    }
    vm.closeModal = function() {
        vm.modal.hide();
        vm.modal.remove();
    }
    
    vm.checkPassword = function(before,after){
        vm.showPasswordMisMatch = false;
        if(before !== after){
        vm.showPasswordMisMatch = true;
        }
        return vm.showPasswordMisMatch;
    };
    vm.changePwd = function(){
        $ionicLoading.show({
            template : 'Changing password...'
        });
        UserService.changePassword().update({ id:$localStorage.loggedin_user.userId},vm.changePass,function(response){
            vm.changePassModal.hide();
            vm.changePassModal.remove();
            $timeout(function(){
                delete  $localStorage.loggedin_user;
                 $localStorage.loggedin_user = response.data;
                $ionicLoading.hide();              
                $scope.successPop('Success', 'Password changed successfully...'); 
            },500);
        },function(error){
            $ionicLoading.hide();
            if(error.status == 401){
                $scope.alertPop('Error', error.data.error); 
            }
            if(error.status == 406 || error.status == 417){
                $scope.alertPop('Error', error.data.message); 
            }
        });

    };
    // /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
   
    /*******************************************************************************/
  /************************get image from camera**********************************/
  /*******************************************************************************/
  vm.showOptions = function(){
    var optionSheet = $ionicActionSheet.show({
        buttons:[
            {text:'<b>Camera</b'},
            {text:'<b>Gallery</b>'}
        ],
        titleText:'Select a way to upload',
        cancelText:'cancel',
        cancel: function(){
        },
        buttonClicked: function(index){
            if(index == 0){
                vm.openCamera();
            }
            if(index == 1){
                vm.openGallery();
            }
            return true;
        }

    })

  }
  vm.openCamera = function(){
    var options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 300,
      targetHeight: 300,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
    $cordovaCamera.getPicture(options).then(function(imageData) {
        vm.profile_image = "data:image/png;base64," + imageData;
        delete $localStorage.profile;
        $localStorage.profile = vm.profile_image;
    }, function(err) {});
  };
  vm.selectImage = function(){
    var option = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80,
        allowEdit: true
    }; 
    $cordovaImagePicker.getPictures(option).then(function(results) {
        for (var i = 0; i < results.length; i++) {
            // vm.profile_image = results[i];
            // $localStorage.profile = vm.profile_image;
            $scope.crop(results[i]);
        }
      }, function(error) {
        $ionicLoading.hide();
    });
  }
  /*******************************************************************************/
  /************************get image from gallery**********************************/
  /*******************************************************************************/
    vm.openGallery = function() {
               var isIOS = ionic.Platform.isIOS();
        $ionicPlatform.ready(function() {
                             if(isIOS){
                              vm.selectImage();
                             }
                             else{
                             diagnostic = cordova.plugins.diagnostic;
                             cordova.plugins.diagnostic.getExternalStorageAuthorizationStatus(function(status){
                              if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
                              vm.selectImage();
                              }
                              else{
                              cordova.plugins.diagnostic.requestExternalStorageAuthorization(function(status){
                                     vm.selectImage();
                                     }, function(error){
                                     console.error(error);
                                     vm.openGallery();
                                     });
                              }
                              }, function(error){
                              console.error("The following error occurred: "+error);
                              });
                             }
            
                             });
    };
    $scope.crop = function(url) {
        $jrCrop.crop({
            url: url,
            width: 200,
            height: 200
        }).then(function(canvas) {
            var image = canvas.toDataURL();
            vm.profile_image = image;
            $localStorage.profile = vm.profile_image;
        }, function() {
            // User canceled or couldn't load image.
        });
    }
    $rootScope.$on("LOGIN_SUCCESS",function(events,data){
        vm.getLoginUserDetails();
    })
             /*******************************************************************************/
    /************************This function is used to get user details**********************************/
            /*******************************************************************************/
    vm.getLoginUserDetails = function(){
        vm.userUpdate = angular.copy($localStorage.loggedin_user);
        console.log(vm.userUpdate);
        vm.districtList.push(vm.userUpdate.address[0].district);
        
    };
             /*******************************************************************************/
    /************************This function is used to update user details**********************************/
            /*******************************************************************************/
    vm.updateProfile = function(){
        $ionicLoading.show({
            template: 'Updating User...'
        })
        if(vm.userUpdate.maritalStatus == 0){
            vm.userUpdate.anniversaryDate = null;
        }
        UserService.updateUserById().update({ id:vm.userUpdate.userId},vm.userUpdate,function(response){
            $timeout(function(){
                delete  $localStorage.loggedin_user;
                $localStorage.loggedin_user = response.data;
                vm.userUpdate = angular.copy($localStorage.loggedin_user);
                $ionicLoading.hide();
                $scope.successPop('Success', 'Profile updated successfully...'); 
            },700);
           
        },function(error){
            $ionicLoading.hide();
            if(error.status == 401){
                $scope.alertPop('Error', 'Token expired Login again.'); 
            }
        });
    };
    vm.getAllStates = function(){
        vm.stateList = [];
        MasterService.getAllStates().get(function(response){
            vm.stateList = response.data;
        },function(error){
        });
    };
    vm.getDistrict = function(state){
        vm.districtList = [];
        angular.forEach( vm.stateList,function(item){
            if(item.stateCd == state){
                vm.districtList = item.districts;
                // vm.type = item.type;
            }
        });
    }
});