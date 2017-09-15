(function() {
    angular.module('channelApp').controller('FD_settings', ['$scope', '$http', function($scope, $http) {
       var postData = $scope.postData = {};
        $scope.add = function() {
            if(!postData.LowRate){
                alert('请输入最低达成率');
                return;
            }
            if(!postData.HeighRate){
                alert('请输入最高达成率');
                return;
            }
            if(!postData.RebatesRatio){
                alert('请输入返点');
                return;
            }
            $http.post('/api/codereward',postData).success(function(res) {
                refreshData();
                postData = {};
            });
        };
        

        function refreshData() {
        
            $http.get('/api/codereward').success(function(res) {
                $scope.fds = res.data;
            });
        }
        refreshData();
        
        $scope.delete = function(item){
            if(!confirm('确认要删除？')) return;
            $http.delete('/api/codereward?id='+item.Id).success(function(res) {
                refreshData();
            });
        }
    }]);
})(angular);
