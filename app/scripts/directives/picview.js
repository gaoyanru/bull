angular.module('channelApp').directive('picView', ['$uibModal', function($uibModal) {
    return {
        restrict: 'A',
        replace: true,
        link: function(scope, element, attrs, ctrls) {
            var src = attrs.ngSrc;
            scope.src = src;
            scope.attitional = attrs.additional || '?x-oss-process=image/resize,m_lfit,h_75,w_100';
            element.find('img').viewer({
                navbar: false,
                title:false,
                url: 'url',
                built: function() {
                    var container = $(this).next();
                    var that= this;
                    container.find('.viewer-canvas').on('click',function(e){
                        if(e.target.tagName.toUpperCase() !=="IMG")
                        $(that).viewer('hide');
                    });
                    $('body').append(container);
                }
            });
            scope.$watch(function(){
                return attrs.ngSrc;
            },function(newval,oldval){
                if(newval!==oldval){
                    scope.src = newval;
                }
            });
        },
        template: '<div class="picView img-thumbnail"><img src="{{src+attitional}}" url="{{src}}" alt=""></div>'
    };
}]).directive('picDelete', ['$parse', function($parse) {
    return {
        restrict: 'A',
        replace: true,
        link: function(scope, element, attrs, ctrls) {
            element.append('<span class="close">&times;</span>')
            element.on('click','.close',function(){
               var getter = $parse(attrs.picDelete);
               getter(scope.$parent);
               scope.$parent.$digest();
            })
        },
    };
}]);
