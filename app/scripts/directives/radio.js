'use strict';

// ng-model="id" options=[{id: 1, title: 'xxx'}]

angular.module('channelApp').directive('customRadio', function() {
    return {
      scope: {
        options: '='
      },
      restrict : 'AE',
      require: '?ngModel',
      replace : true,
      controller: function($scope){
        $scope.value = '';
      },
      link: function($scope, ele, attr, ngModel){
        if(!ngModel) return;
        ngModel.$render = function(){
          $scope.value = ngModel.$viewValue;
        }

        $scope.toClick = function(item){
          ngModel.$setViewValue(item.id);
          $scope.value = item.id
        }
      },
      template : '<div><div ng-repeat="item in options" ng-class="{\'custom-check\': true, checked: value == item.id}" ng-click="toClick(item)"><i class="fa fa-check" aria-hidden="true"></i>{{item.title}}</div></div>'
    };
});
