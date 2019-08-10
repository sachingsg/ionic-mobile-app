app.controller("PlanController",function($ionicModal,$stateParams,$timeout,$state,$scope,$ionicLoading,$ionicPopup,PlanService,$localStorage){
   var vm = this;
   vm.skippedReferral = false;
   vm.myPlan = {};
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
   vm.getSchemes = function(){
       $ionicLoading.show({
           template: 'Loading...'
       })
        PlanService.getSchemes().get(function(response){
            console.log(response);
            $timeout(function(){
                $ionicLoading.hide();
                vm.shemelist = response.data;
            },400)

        },function(error){
            console.log(error);
            $ionicLoading.hide();
        })

    };
    vm.planListModal = function(scheme_detail){
        $ionicModal.fromTemplateUrl('templates/modal/planList_modal.html', {
            scope: $scope,
            animation: 'slide-in-right'
        }).then(function(subscrpModal) {
            vm.subscrpModal = subscrpModal;
            vm.subscrpModal.show();
            vm.planSrvcDtls = scheme_detail;
        });
    };
    // vm.referralArr = [
    //   {
    //     type : "Internet",
    //     data : "",
    //     isSelect:false,
    //   },
    //   {
    //     type : "Social",
    //     data : "",
    //     isSelect:false,
    //   },
    //   {
    //     type : "Friend",
    //     data : {
    //       name : "",
    //       mobileNbr:""
    //     },
    //     isSelect:false,
    //   },
    //   {
    //     type : "Employee",
    //     data : {
    //       refCode : "",
    //       info:"",
    //       showDetails:false
    //     },
    //     isSelect:false,
    //   },
    // ];
    vm.referralArr = [
        {
            "referType": "Internet",
            "mobileNbr": "",
            "referralCd": "",
            "isSelect":false
        },
        {
            "referType": "Social",
            "mobileNbr": "",
            "referralCd": "",
            "isSelect":false
        },
        {
            "referType": "Friend",
            "mobileNbr": "",
            "referralCd": "",
            "name":"",
            "isSelect":false
        },
        {
            "referType": "Employee",
            "mobileNbr": "",
            "referralCd": "",
            "name":"",
            "isSelect":false,
            "showDetails":false
        },
        
      
    ];
    vm.selectedReferral = null;
    vm.onReferral = function($index) {

      angular.forEach(vm.referralArr , function(value, key) {
        if($index == key)
        {
          value.isSelect = true;
          vm.selectedReferral = value;
        }
        else {
          value.isSelect = false;
        }
      });
    }
    vm.resetReferral = function() {
        vm.selectedReferral = {};
        angular.forEach(vm.referralArr , function(value, key) {
            value.isSelect = false;
            value.mobileNbr = "";
            value.referralCd = "";
            value.name = "";
            value.showDetails = false;
          });
    }
    vm.validateRefCode = function(referral) {
      // referral.data.info = "xxxxxxx"; // hardcoded , as service not prepared.
      PlanService.getReferralUser(referral.refCode).get(function(response){
          if(response.data && response.data.name != "") {
            referral.name = response.data.name;
            referral.showDetails = true;
          }
          else{
            $ionicPopup.alert({
             title: 'Error',
             template: 'Please enter valid ref code !',
           });
          }
      },function(error){
          console.log(error);
          $ionicPopup.alert({
           title: 'Error',
           template: error.message,
         });
      });
    }
    vm.skipReferral = function(){
        $('#referralList').addClass('animated bounceOutLeft');
        vm.selectedReferral = null;
    }
    // to validate current referral if selelcted
    vm.validateReferral = function() {
        if(!vm.selectedReferral){

            return {
                "mobileNbr": "",
                "referType": "",
                "referralCd": ""
            }; // if no referral 
        }
        if(vm.selectedReferral.referType == "Internet" || vm.selectedReferral.referType == "Social"){
            return vm.selectedReferral;
        }
        // test for the friend 
        if(vm.selectedReferral.referType == "Friend" && (vm.selectedReferral.mobileNbr == "" ) ){
            $ionicPopup.alert({
                title: 'Error',
                template: 'Please enter valid information !',
              });
              return null;
        }
        // test for the Employee 
        else if(vm.selectedReferral.referType == "Employee" && (vm.selectedReferral.name == "" ) ){
            $ionicPopup.alert({
                title: 'Error',
                template: 'Please enter Employee information !',
              });
              return null;
        }
        else{
            return vm.selectedReferral;
        }
    }
    vm.subscribePlan = function(planToSubscribe){

        // validating referral entry
        var referralObj = {};
        referralObj = vm.validateReferral();
        if(!referralObj) return;

        $ionicLoading.show({
            template:'Subscribing...'
        })
        var obj = {};
        obj.user_id = $localStorage.loggedin_user.userId;
        obj.schemeId = planToSubscribe.schemeId;
        // checking for the friend and employee sanity test
        // if( (vm.selectedReferral.type == "Friend" || vm.selectedReferral.type == "Employee") && vm.selectedReferral.data.info == "" ){
        //   // alert("Please enter valid ref code !");
        //   $ionicPopup.alert({
        //    title: 'Error',
        //    template: 'Please enter valid ref code !',
        //  });
        //   $ionicLoading.hide();
        //   return;
        // }
        // if(vm.selectedReferral) {
        //   referralObj = {
        //     referType : vm.selectedReferral.type,
        //     referralCd : vm.selectedReferral.data ? vm.selectedReferral.data.refCode : "",
        //   }

        // }

        PlanService.subscribePlan(obj).save(referralObj,function(response){
            console.log(response);
            vm.resetReferral();
            $ionicLoading.hide();
            vm.subscrpModal.remove();
            $scope.openCheckOutModal(response.data);
            // $timeout(function(){
            //     $ionicLoading.hide();
            //     $scope.successPop('Success', 'Plan Subscribed Successfully...','app.mapView');
            // },500);
        },function(error){
            console.log(error);
            vm.resetReferral();
            vm.subscrpModal.hide();
            vm.subscrpModal.remove();
            $timeout(function(){
                $ionicLoading.hide();
                $scope.alertPop('Error', error.data.message);
            },500);
        });
    };
   vm.getMyPlan = function(){
       PlanService.getUserSchemes().get(function(response){
        console.log(response);
        vm.myPlan = response.data;
        $localStorage.loggedin_user.schemes = vm.myPlan;
        angular.forEach(vm.myPlan, function(item){
            var sbscrptnDate = moment(item.subscriptionDt);
            var validtyLeft = moment().diff(sbscrptnDate, 'days');
            item.validityLeft = item.durationInDays-validtyLeft;

        });
       },function(error){
        console.log(error);
       });
   }
    vm.closePlanListModal = function() {
        vm.subscrpModal.hide();
        vm.subscrpModal.remove();
    }

});
