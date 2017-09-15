
angular.module('channelApp').directive('jsHeight', ['$http', '$compile', '$timeout', function($http, $compile, $timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs, ngmodel) {
            var parent = element.parents('.content-right');
            var eOff = element.offset();
            var pOff = parent.offset();
            var offHeight = eOff.top -pOff.top;
            var ofh = attrs.jsHeight || 0;
            element.height(parent.height() -offHeight -ofh);
        }
    };
}]);
