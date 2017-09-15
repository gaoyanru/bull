'use strict';

angular.module('channelApp').directive('buGroup', function() {
    return {
        restrict: 'A',
        scope:{
        	title:'@buGroup'
        },
        replace: true,
        transclude: true,
        link: function(scope, element, attrs, ctrls) {
            scope.toggleMsg = '隐藏';
            scope.toggle = function(){
            	scope.isHide=!scope.isHide;
            	if(scope.isHide){
            		scope.toggleMsg = '显示';
            	}else{
            		scope.toggleMsg = '隐藏';
            	}
            };
        },
        templateUrl: 'views/buGroup.html'

    };
});

angular.module('channelApp').directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});
