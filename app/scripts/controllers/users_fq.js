'use strict';

angular.module('channelApp').controller('Users_fq', ['$scope', '$http', '$uibModal', function($scope, $http, $uibModal) {
    $scope.addFQ = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/users_addfq.html',
            controller: 'Users_addFQ',
            size: "sm",
            backdrop: 'static'
        });

        modalInstance.result.then(function(result) {
            getFQ();
        }, function() {

        });
    };
    $scope.addQD = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/users_addQD.html',
            controller: 'Users_addQD',
            size: "lg",
            backdrop: 'static',
            resolve: {
                fqId: function() {
                    return _.find($scope.fqs, { active: true }).Id;
                },
                channels: function(){
                    return $scope.qds || [];
                }
            }
        });

        modalInstance.result.then(function(result) {
            getQD();
        }, function() {

        });
    };

    $scope.deleteFQ = function(id) {
        $http.delete('api/channelpartition/' + id).success(function(res) {
            if (res.status) {
                getFQ();
            }
        });
    };

    function activeFQ(fq) {
        var old = _.find($scope.fqs, { active: true });
        if (old) {
            old.active = false;
        }
        fq.active = true;
        getQD(fq);
    }

    $scope.activeFQ = activeFQ;

    function getFQ() {
        $http.get('/api/channelpartition').success(function(res) {
            var old = _.find($scope.fqs, { active: true });
            $scope.fqs = res.data;
            if (old) {
                var now = _.find($scope.fqs, { Id: old.Id });
                if (now) {
                    getFQ();
                } else {
                    activeFQ($scope.fqs[0]);
                }

            } else {
                activeFQ($scope.fqs[0]);
            }
        });
    }

    function getQD(fq) {
        if(!fq) fq = _.find($scope.fqs, { active: true });
        $http.get('/api/channelpartition/' + fq.Id).success(function(res) {
            $scope.qds = res.data;
        });
    }
    getFQ();
}]).controller('Users_addFQ', ['$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance) {
    $scope.ok = function() {
        var data = {
            PartitionName: $scope.name
        };
        $http.post('/api/channelpartition', data).success(function(res) {
            if (res.status) {
                alert("保存成功！");
                $uibModalInstance.close();
            }
        });
    }
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]).controller('Users_addQD', ['$scope', '$http', '$uibModalInstance','fqId','channels', function($scope, $http, $uibModalInstance,fqId,channels) {
    function refreshData() {
        var url;
        var params = {
            limit: 1000,
            offset: 0
        };
        $http.get("/api/agent?" + jQuery.param(params)).success(function(result) {
            _.each(result.data,function(item){
                if(_.find(channels,{ChannelId: item.ChannelId})){
                    item.hide = true;
                }
            });
            $scope.data = result.data;
        })
    }
    refreshData();
    $scope.ok = function() {
        var qdIds = _.map(_.filter($scope.data,{selected:true}),'ChannelId');
        $http.put('/api/channelpartition/'+ fqId, qdIds).success(function(res) {
            if (res.data) {
                alert("保存成功！");
                $uibModalInstance.close();
            }
        });
        $uibModalInstance.close();
    }
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]);;
