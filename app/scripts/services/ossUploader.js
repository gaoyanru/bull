'use strict';

angular.module('channelApp').factory('ossUploader', ['$http', '$filter', function($http, $filter){
  var uploadUrl = 'https://pilipa.oss-cn-beijing.aliyuncs.com';
  var typMap = {
      1: 'FileUploads/Order/CardID/',
      2: 'FileUploads/Order/BusinessLicense/',
      3: 'FileUploads/Order/Contract/',
      4: 'FileUploads/Agent/'
  }
  var signkey = {};
  $http.get('/api/signkey').success(function (res) {
      delete res.data.Filename;
      delete res.data.key;
      delete res.data.callback;
      delete res.data.expire;
      delete res.data.Host;
      signkey = res.data;
  })
  function buildKey(type, fileName) {
      var randomFilename = "";

      var get_suffix = function (filename) {
          var suffix = '';
          var pos = filename.lastIndexOf('.');

          if (pos != -1) {
              suffix = filename.substring(pos)
          }
          return suffix;
      };
      var random_string = function (len) {
          len = len || 32;
          var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
          var maxPos = chars.length;
          var pwd = '';
          for (var i = 0; i < len; i++) {
              pwd += chars.charAt(Math.floor(Math.random() * maxPos));
          }
          return pwd;
      };

      var suffix = get_suffix(fileName);
      var nowstr = $filter('date')(new Date(), 'yyyyMM');
      var g_object_name = typMap[type] + nowstr + '/' + random_string(10) + suffix;
      return g_object_name;
  }

  return function(file) {
    var formData = new FormData()
    var key = buildKey(1, file.name);
    var url = uploadUrl + '/' + key;
    formData.append('key', key);
    _.each(signkey, function (value, key) {
        formData.append(key, value);
    });
    formData.append('file', file);
    return $http({
      url: uploadUrl,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': undefined
      }
    }).then(function(res){
      res['sourceUrl'] = url;
      return res;
    })
  }
}])
