app.service('LocationService', function($q){
    var autocompleteService = new google.maps.places.AutocompleteService();
    var detailsService = new google.maps.places.PlacesService(document.createElement("input"));
    return {
      searchAddress: function(input) {
        var deferred = $q.defer();
        autocompleteService.getPlacePredictions({
          input: input,
          types: ['geocode']
        }, function(result, status) {
          if(status == google.maps.places.PlacesServiceStatus.OK){
            console.log(status);
            deferred.resolve(result);
          }else{
            deferred.reject(status)
          }
        });
  
        return deferred.promise;
      },
      getDetails: function(placeId) {
        var deferred = $q.defer();
        detailsService.getDetails({placeId: placeId}, function(result) {
          console.log("ssss",result);
          deferred.resolve(result);
        });
        return deferred.promise;
      }
    };
  })
  app.directive('locationSuggestion', function($ionicModal, LocationService){
    return {
      restrict: 'A',
      scope: {
        //location: '=',
        callFunction: '&onSelect'
      },
      link: function($scope, element){
        $scope.search = {};
        $scope.search.suggestions = [];
        $scope.search.query = "";
        $ionicModal.fromTemplateUrl('templates/locationModal.html', {
          scope: $scope,
          focusFirstInput: true
        }).then(function(modal) {
          $scope.modal = modal;
        });
        element[0].addEventListener('click', function(event) {
          $scope.open();
        });
        $scope.$watch('search.query', function(newValue) {
          if (newValue) {
            LocationService.searchAddress(newValue).then(function(result) {
              $scope.search.error = null;
              $scope.search.suggestions = result;
            }, function(status){
              $scope.search.error = "There was an error :( " + status;
            });
          };
          $scope.open = function() {
            setTimeout(function(){
              $scope.modal.show(); 
            },500);
          };
          $scope.close = function() {
            $scope.modal.hide();
          };
          $scope.choosePlace = function(place) {
            LocationService.getDetails(place.place_id).then(function(location) {
              var obj  = {
                lat:location.geometry.location.lat(),
                lng:location.geometry.location.lng(),
                location:location
              }
              $scope.callFunction({latlang:obj});
             // $scope.location = location;
              $scope.close();
            });
          };
        });
      }
    }
  })