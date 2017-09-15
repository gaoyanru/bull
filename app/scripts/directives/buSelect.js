'use strict';

angular.module('channelApp').directive('acSelect', ['$http', '$compile', '$timeout', function($http, $compile, $timeout) {
    return {
        restrict: 'A',
        scope: {
            'settings': '=acSelect',
            'item': '=acModel'
        },
        require: 'ngModel',
        link: function(scope, element, attrs, ngmodel) {
            scope.options = scope.settings.options;
            var paramStr = "";
            if (scope.options.watchField) {
                scope.$watch('item.' + scope.options.watchField, function(newVal, oldVal) {
                    if (!newVal) return;
                    paramStr = scope.options.paramStr.replace('{val}',scope.item[scope.options.watchField]);
                    scope.item[scope.settings.realCol] = '';
                    getData();
                });
                if(scope.item && scope.item[scope.options.watchField]){
                    paramStr = scope.options.paramStr.replace('{val}',scope.item[scope.options.watchField]);
                    getData();
                }
            }else{
                getData();
            }
            

            element.change(function() {
                var settings = scope.settings;
                var options = settings.options;
                var option = scope.data.find(function(op) {
                    return scope.item[settings.realCol] == op[options.id];
                });
                if (option && settings.col != settings.realCol) scope.item[settings.col] = option[options.label];
                ngmodel.$setViewValue(option[options.id]);
            });
            function getData(){
                $http.get(scope.options.url + paramStr).success(function(result) {
                    scope.fullData = angular.copy(result.data);
                    setOptions(result.data);
                });
            }
            function setOptions(allData) {
                scope.data = allData;
                if (!allData.length) return;
                //scope.modelValue = ctrls.$modelValue;
                var tempVal;
                if (!scope.item[scope.settings.realCol]) {
                    if (scope.options.hasDefault) {
                        scope.item[scope.settings.realCol] = '' + allData[0][scope.options.id];
                        if (scope.settings.col != scope.settings.realCol) scope.item[scope.settings.col] = allData[0][scope.options.label];
                    } else {
                        scope.item[scope.settings.realCol] = 'null';
                    }

                }
                var el = angular.element('<option ng-repeat="option in data"  value="{{::option[options.id]}}"  ng-bind="option[options.label]"></option>');
                el = $compile(el)(scope);
                element.empty();
                element.append(el);
            }
        }
    };
}]);
