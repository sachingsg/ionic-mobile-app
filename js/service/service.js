angular.module('serviceModule', ['ngResource'])
.factory('config',function($http){
    var gApi = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
    var gApiKey = "AIzaSyCGfL8JInuwP-vVOClPpztwv4ULWvrDWdk";
    return{
        getLocationName : function(param){
            var url = gApi+param+"&key="+gApiKey;
            var response = $http.get(url);
            return response;
        }
    }
})
.factory('loginService', function ($resource,CONFIG,$http) {
    return{
        preResPwd : function(contactNbr){
            return $resource( CONFIG.HTTP_HOST_APP + '/gsg/preresetpwd/' + contactNbr , {
                save : {method : "POST"}
            })
        },
        resetPwd : function(){
            return $resource( CONFIG.HTTP_HOST_APP + '/gsg/resetpwd/' , {
                save : {method : "POST"}
            })
        },
        versionCheck : function(){
            return $resource( CONFIG.HTTP_HOST_APP + '/gsg/version/check' , {
                save : {method : "POST"}
            })
        }
    }
})
.factory('OtpService', function ($resource,CONFIG,$http) {
    return{
        resendOtp : function(contactNbr){
            return $resource( CONFIG.HTTP_HOST_APP + '/gsg/resendOtp/' + contactNbr , {
                get : {method : "GET"}
            })
        },

    }
})
.factory('registrationService', function ($resource,CONFIG) {
    return{
        preRegister: function () {
            return $resource( CONFIG.HTTP_HOST_APP +'/gsg/preregister',{
              save:{method:'POST'}
            })
        },
        register: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/register',{
                save:{method:'POST'}
            })
        },
        addUserDetails: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/user/addUserDetail',{
                save:{method:'POST'}
            })
        },
        addVehicle: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/user/addVehicle',{
                save:{method:'POST'}
            })
        },
        addInsuranceDetail:function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/user/addInsurance',{
                save:{method:'POST'}
            })
        }


    }
})
.factory('VehicleService', function ($resource,CONFIG,$http,$localStorage) {
    return{

        addVehicle: function(user_id) {
            return $resource( CONFIG.HTTP_HOST_APP +'/gsg/api/users/' + user_id + '/vehicle',{
                save:{method:'POST'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        updateVehicle: function() {
            return $resource( CONFIG.HTTP_HOST_APP +'/gsg/api/users/:id/vehicle/:position',null,{
                update: {
                    method:'PUT',
                    headers: {'Authorization':'bearer '+$localStorage.user_token}
                }
            })
        },
        getVehicle: function(user_id) {
            return $resource( CONFIG.HTTP_HOST_APP +'/gsg/api/users/' + user_id + '/vehicles',{
              query:{method:'GET'},
              header:{'Authorization':'bearer '+$localStorage.user_token},
              isArray:true
            });
        },
        deleteVehicle: function(user_id,vehicle_position) {
            return $resource( CONFIG.HTTP_HOST_APP +'/gsg/api/users/' + user_id + '/vehicle/' + vehicle_position,{
                delete:{method:'DELETE'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        getVehicleMakeModel: function() {
            return $resource( CONFIG.HTTP_HOST_APP +'/gsg/api/master/vehicles',{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        }

    }
})

.factory('UserService',function(CONFIG,$resource,$http,$localStorage){
    return{
        getUserByCntctNo: function(contact_no){
            console.log(contact_no);
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/users/contact/' +  contact_no,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token}
            })
        },
        updateUserById : function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/users/id/:id',null, {
                update: {
                    method:'PUT',
                    headers: {'Authorization':'bearer '+$localStorage.user_token}
                }

            })
        },
        changePassword : function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/users/id/:id/changePassword',null, {
                update: {
                    method:'PUT',
                    headers: {'Authorization':'bearer '+$localStorage.user_token}
                }

            })
        }

    }
})
.factory('ServicesService',function(CONFIG,$resource,$http,$localStorage){
    return{
        getAllServices: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/master/services',{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        }
    }
})
.factory('PlanService',function(CONFIG,$resource,$http,$localStorage){
    return{
        getSchemes: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/master/schemes',{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        getUserSchemes: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/users/' + $localStorage.loggedin_user.userId + '/schemes',{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        // subscribePlan: function(data){
        //     return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/users/buyScheme/' + data.user_id + '/' + data.schemeId,{
        //         get:{method:'GET'},
        //         header:{'Authorization':'bearer '+$localStorage.user_token},
        //         isArray : true
        //     })
        // }
        getReferralUser: function(refCd){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/salesusers/referral/'+refCd ,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                // isArray : true
            })
        },
        subscribePlan: function(data){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/users/buyScheme/' + data.user_id + '/' + data.schemeId,{
                save:{method:'POST'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                // isArray : true
            })
        }
    }
})
.factory('MasterService',function(CONFIG,$resource,$http,$localStorage){
    return{
        getAllStates: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/master/states',{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        }
    }
})
.factory('TicketService',function(CONFIG,$resource,$http,$localStorage){
    return{
        createTicket: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders',{
                save:{method:'POST'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        getRequestTicket: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders/user/' + $localStorage.loggedin_user.userId,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        getCardOrders: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/cart/user/' + $localStorage.loggedin_user.userId,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        removeFromCart: function(cartId){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/cart/' + $localStorage.loggedin_user.userId + '/' + cartId,{
                delete:{method:'DELETE'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        editItemFromCart: function(id,position){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/cart/' + id + '/' + position + '/remove',{
                delete:{method:'DELETE'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        mailInvoice: function(order_id){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/report/' + order_id,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        buyFromCart: function(cartId){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/cart/' + $localStorage.loggedin_user.userId + '/' + cartId,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        getAllTickets: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders/' + $localStorage.loggedin_user.userId + '/assigned',{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        getOrderByOrderId: function(orderId){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders/' + orderId,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        confirmCODPayment: function(orderDtlId){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders/confirmCODPayment/' + orderDtlId,{
                save:{method:'POST'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        newSvcAddOn: function(orderId){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders/' + orderId + '/addOn',{
                save:{method:'POST'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        pendingAddOnList: function(a,b){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders/' + a + '/addOnCart/' + b,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
         updateOrder: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/orders/:svcEngId/:orderId',null ,{
                update: {
                    method:'PUT',
                    headers: {'Authorization':'bearer '+$localStorage.user_token}
                }
            })
        }

    }
})
.factory('PaymentService',function(CONFIG,$resource,$http,$localStorage){
    return{
        codPayment: function(){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/codPayemnt',{
                save:{method:'POST'},
                // header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        checkPaymentStatus: function(reference_id){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/paymentStatus/' + reference_id,{
                get:{method:'GET'},
                // header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        },
        paymentSuccess : function(obj){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/paymentResponse',{
                save:{method:'POST'}
            })
        }
    }
})
.factory('FeedbackService',function(CONFIG,$resource,$http,$localStorage){
    return{
        rateOrder: function(order_id){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/feedback/' + order_id,{
                save:{method:'POST'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
                isArray : true
            })
        }
        
    }
})
.factory('WorkShopService',function(CONFIG,$resource,$http,$localStorage){
    return{
        initiateWorkShop: function(obj){
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/ws/register',obj, {
                save:{method:'POST'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
            })
        },
        validateMobileNumber : function(num) {
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/validateContactNbr/' + num,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
            })
        },
        getWorkShopList : function(latlng) {
            return $resource(CONFIG.HTTP_HOST_APP + '/gsg/api/users/nearestWorkShop/10000/'+latlng,{
                get:{method:'GET'},
                header:{'Authorization':'bearer '+$localStorage.user_token},
            })
        }
        
    }
});
