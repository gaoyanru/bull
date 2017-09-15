(function() {
    angular.module('channelApp').controller('CustomerSetting', ['$scope','$uibModalInstance', 'CustomerService','channel', function($scope,$uibModalInstance, server,channel) {

        server.getSettings(channel.ChannelId).success(function(res){
            $scope.settings= res.data;
        });
        $scope.save = function(){
            //$scope.settings.ChannelId = channel.ChannelId;
            server.saveSettings($scope.settings).success(function(){
            	alert('保存成功！');
                $uibModalInstance.close();
            });
        };
        $scope.cancel = function(){
            $uibModalInstance.close();
        };
    }])
})(angular);
