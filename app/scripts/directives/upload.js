'use strict';
angular.module('channelApp').directive('customFileUploader', function(){
  return {
    restrict: 'AE',
    scope: {
      title: '@'
    },
    require: '?ngModel',
    controller: function(){
    },
    link: function(scope, ele, attrs, ngModel){

      ele.find('input[type=file]').on('change', function(){
        var file = ele.find('input[type=file]')[0].files[0];
        // 获取本地文件src地址
        var img = new Image();
        var src = window.URL.createObjectURL(file);
        ele.find('.upload-area').css({'background': 'url(' + src + ') 0 0 / 100% 100% no-repeat'});
        ngModel.$setViewValue(src);
        // scope.title = src;
      })
      ele.find('.upload-area').click(function(){
        ele.find('input[type=file]').trigger('click');
      });
      ele.hover(function(){
        ele.find('.upload-area span').removeClass().addClass('enter');
      }, function(){
        ele.find('.upload-area span').removeClass().addClass('leave');
      });
    },
    replace: true,
    template: '<div class="img-upload-container"><input type="file" style="display: none;"/><div class="upload-area"><span>重新上传</span></div><p><span class="required"></span>{{title}}</p></div>'
  }
})
