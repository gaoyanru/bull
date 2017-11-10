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
      
      if (!ngModel) {
        throw new Error('not set the model');
        return;
      };
      ele.find('input[type=file]').on('change', function(){
        var file = ele.find('input[type=file]')[0].files[0];
        if(!file) return;

        if(file.size > 1024*1024){
          alert('图片大小超过1M!');
          retun;
        }
        if(/^(?!image)./.test(file.type)){
          alert('上传格式不正确！')
          return;
        }
        ele.find('.upload-area').append('<div class="upload-shadow"></div><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>');
        // 获取本地文件src地址
        var src = window.URL.createObjectURL(file);

        // XHR 请求
        setTimeout(function(){
          ele.find('.upload-area .upload-shadow, .upload-area i').remove();
          appendImg(src);
          ngModel.$setViewValue(src);
        }, 1000);
      })

      ngModel.$render = function(){
        if(ngModel.$viewValue){
          appendImg(ngModel.$viewValue);
          // ele.find('.upload-area').css({'background': 'url(' + ngModel.$viewValue + ') 0 0 / 100% 100% no-repeat'});
        }else{
          ele.find('.upload-area span').hide()
        }
      }

      ele.find('.upload-area').click(function(e){
        if(ngModel && ngModel.$viewValue){
          if(e.target.tagName.toUpperCase() == 'SPAN'){
            ele.find('input[type=file]').trigger('click');
          }
        }else{
          ele.find('input[type=file]').trigger('click');
        }
      });


      ele.hover(function(){
        if(ngModel.$viewValue){
          ele.find('.upload-area span').show()
          ele.find('.upload-area span').removeClass().addClass('enter');
        }else{
          ele.find('.upload-area').append('<div class="upload-shadow"></div><i class="fa fa-cloud-upload" aria-hidden="true"></i>');
        }
      }, function(){
        ele.find('.upload-area i, .upload-area .upload-shadow').remove();
        if(ngModel.$viewValue){
          ele.find('.upload-area span').removeClass().addClass('leave');
        }
      });

      // 添加图片
      var appendImg = function(src){
        ele.find('.upload-area img')[0] ? ele.find('.upload-area img').prop('src', src) : ele.find('.upload-area').append('<img src="' + src + '"  />');
        ele.find('.upload-area img').viewer({
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
      }
    },
    replace: true,
    template: '<div class="img-upload-container"><input type="file" style="display: none;"/><div class="upload-area"><span>重新上传</span></div><p><span class="required"></span>{{title}}</p></div>'
  }
})