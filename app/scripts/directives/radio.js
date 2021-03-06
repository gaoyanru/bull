'use strict';

// ng-model="id" options=[{id: 1, title: 'xxx'}]
// <custom-radio ng-model="postData.payType" options="payTypes"></custom-radio>

angular.module('channelApp').directive('customRadio', function() {
    return {
      scope: {
        options: '='
      },
      restrict : 'AE',
      require: '?ngModel',
      replace : true,
      controller: function($scope){
        console.log($scope, 'xxx')
        $scope.value = '';
      },
      link: function($scope, ele, attr, ngModel){
        if(!ngModel) return;

        ngModel.$render = function(){
          $scope.disabled = ele.attr('disabled');
          $scope.value = ngModel.$viewValue;
        }

        $scope.toClick = function(item){
          if(ele.attr('disabled')) return;
          ngModel.$setViewValue(item);
          $scope.value = item
        }
      },
      template : '<div style="outline:none"><div ng-repeat="item in options" ng-class="{\'custom-check\': true, checked: value.id == item.id, \'custom-disabled\': disabled}" ng-click="toClick(item)"><i class="fa fa-check" aria-hidden="true"></i>{{item.title}}</div></div>'
    };
});
