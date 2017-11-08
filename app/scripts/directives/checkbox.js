'use strict';
angular.module('channelApp').directive('customCheckBox', function($parse) {
    return {
      scope: {
        title: '@'
      },
      restrict : 'AE',
      replace : true,
      // controller: function($scope){
      //   $scope.toClick = function(){
      //     alert('click');
      //   }
      // },
      link: function($scope, ele, attr){
        console.log(ele);
        ele.click(function(){
          ele.hasClass('checked') ? ele.removeClass('checked') : ele.addClass('checked');
        })
      },
      template : '<div class="custom-check" ng-click="toClick()"><i class="fa fa-check" aria-hidden="true"></i>{{title}}</div>'
    };
});
