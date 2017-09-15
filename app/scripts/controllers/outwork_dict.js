angular.module('channelApp').controller('Outwork_dict', ['$scope', '$http', '$state', '$uibModal', 'user', function ($scope, $http, $state, $uibModal, user) {
    $scope.user = user.get();
    $scope.searchData = {}
    $scope.open = function (item) {
        // console.log(item)
        var modalInstance = $uibModal.open({
            templateUrl: 'views/outwork_dict_view.html',
            controller: 'Outwork_dict_view',
            resolve: {
                customer: item || {Price:0}
            }
        });
        modalInstance.result.then(function (result) {
            refreshData();
        }, function () {

        });
    };
    $scope.paginator = {
        total: 0,
        currentPage: 1,
        perPage: 15,
        previousText: '上一页',
        nextText: '下一页',
        lastText: '最后一页',
        firstText: '首页'
    };
    $scope.pageChanged = function () {
        refreshData();
    }
    $scope.setCurrentPage = function () {
        $scope.currentPage = Math.abs(Math.floor($scope.currentPage)) || 1;
        $scope.paginator.currentPage = $scope.currentPage;
        refreshData();
    };
    $scope.searchItem = {
        TaskName: '',
        BusinessType: '',
        Status: '0'
    };
    $scope.search = {
        TaskName: '',
        BusinessType: '',
        Status: "0"
    };
    $scope.searchFn = function () {
        $scope.searchItem.TaskName = $scope.search.TaskName;
        $scope.searchItem.BusinessType = $scope.search.BusinessType;
        $scope.searchItem.Status = $scope.search.Status;
        refreshData();
    }
    $scope.delete = function (item) {
        if (!confirm('您确定要删除？')) return;
        $http.delete('/api/outworkers/' + item.Id).success(function (res) {
            if (res.status) refreshData();
        });
    };


    function refreshData() {
        var data = angular.extend({
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            limit: $scope.paginator.perPage
        }, $scope.searchItem);
        $http.get('/api/outertasksub?' + $.param(data)).success(function (res) {
            $scope.paginator.total = res.Count;
            $scope.outworkers = res.data;
        });
    }
    refreshData();
    $scope.stopOrnot = function (status, id) {
        if (confirm("确定更改吗？")) {
            var _status
            if (status == 1) {
                _status = 2
            } else {
                _status = 1
            }
            $http.put('/api/outertask/taskisstop?isstop=' + _status + '&id=' + id, {}).success(function (res) {
                refreshData()
            });
        } else {
            return
        }

    }

    //分页
    // $scope.pageChanged = function() {
    //     console.log(this)
    //     $http.get('/api/outertasksub?taskname=&BusinessType=&status=0&offset='+((this.bigCurrentPage-1)*10)+'&limit=10').success(function(res) {
    //         $scope.outworkers = res.data;
    //     });
    // }
    // $scope.maxSize = 10
    // $scope.numPages = 1
    // $scope.bigCurrentPage = 1

    //获取时间
    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "/";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
            " " + date.getHours() + seperator2 + date.getMinutes() +
            seperator2 + date.getSeconds();
        return currentdate;
    }
    $scope.ifuse = "启用"

}]).controller("Outwork_dict_view", ['$scope', '$http', '$uibModalInstance', 'customer', function ($scope, $http, $uibModalInstance, customer) {
    $scope.postData = _.clone(customer) || {};
    $scope.postData.ifuse = {
        use: $scope.postData.Status || 1
    }
    var pages = [];

    $scope.title = $scope.postData.TaskName || "新增任务";
    $scope.checkPrice = function () {
        $scope.postData.Price < 0 ? $scope.postData.Price = 0 : void(0);
    }
    $scope.ok = function (ev) {
        var postData = angular.copy($scope.postData);
        var _postData = {}
        if (postData.Price < 0) {
            alert('服务费用不能为负！');
            return;
        }

        _postData.TaskName = postData.TaskName ? postData.TaskName : ""
        _postData.BusinessType = postData.BusinessType ? postData.BusinessType : ""
        _postData.Price = postData.Price ? postData.Price : 0
        _postData.Status = postData.ifuse.use
        _postData.Id = customer.Id
        // console.log(customer)
        if (!customer.Id) {
            $http.post('/api/outertask', _postData).success(function (res) {
                if (res.status) {
                    alert('保存成功！');
                    $uibModalInstance.close();
                }
            });
        } else {
            _postData.CreateBy = customer.CreateBy
            _postData.CreateDate = customer.CreateDate
            // console.log(_postData)
            $http.put('/api/outertask', _postData).success(function (res) {
                if (res.status) {
                    alert('保存成功！');
                    $uibModalInstance.close();
                }
            });
        }

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    }
}]);
