angular.module('channelApp').controller('FD_AgentList', ['$scope', '$http', '$state', '$uibModal', 'user', function($scope, $http, $state, $uibModal, user) {
    $scope.isCenter = user.get().IsCenter;

    var tbOptions = [{
        header: '省',
        col: 'ProvinceName',
    }, {
        header: '市',
        col: 'CityName',
    }, {
        header: '一级代理商',
        col: 'ChannelName1',
    }, {
        header: '二级代理商',
        col: 'ChannelName2',
    }, {
        header: '地址',
        col: 'Address'
    }, {
        header: '联系方式',
        col: 'Tel,Mobile'
    }];
    $scope.rightAlign = [6];
    var type = $state.$current.name === "main.agent" ? 1 : 2;

    tbOptions.push({
        header: '状态',
        col: 'StatusStr'
    });
    $scope.isHide = (type == 2);
    //var result = [{ CompanyName: '测试', ComanyAlias: '测试别名', OrderId: 'O123142143', hth: 'asdfadfasdfas', UserName: 'ABC' }];


    $scope.headers = getHeaders();

    $scope.setTask = function(item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/fd_tasksetting.html',
            controller: 'FD_TaskSetting',
            size: "lg",
            resolve: {
                agent: function() {
                    return item;
                }
            },
            backdrop: 'static'
        });

        modalInstance.result.then(function(result) {
            refreshData();
        }, function() {

        });
    };
    $scope.fandian = function(item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/fd_fd.html',
            controller: 'FD_FD',
            size: "lg",
            resolve: {
                agent: function() {
                    return item;
                }
            },
            backdrop: 'static'
        });

        modalInstance.result.then(function(result) {
            refreshData();
        }, function() {

        });
    }

    /*
     * paginator
     * */
    $scope.paginator = {
        total: 0,
        currentPage: 1,
        perPage: 10,
        userName: '',
        previousText: '上一页',
        nextText: '下一页',
        lastText: '最后一页',
        firstText: '首页'
    };

    $scope.pageChanged = function() {
        refreshData();
    };
    $scope.setCurrentPage = function() {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };



    function getHeaders() {
        return tbOptions.map(function(item) {
            return item.header
        });
    }

    function formateData(data) {
        var statusStr = {
            1: '通过',
            2: '审核中',
            3: '拒审'
        }
        data.forEach(function(row) {
            var cols = [];
            row.StatusStr = statusStr[row.Status];
            tbOptions.forEach(function(item) {
                if (item.col.indexOf(',') > 0) {
                    var c = item.col.split(',');
                    cols.push((row[c[0]] || '') + '<br/>' + (row[c[1]] || ''));
                } else {
                    cols.push(row[item.col]);
                }
            });
            row.cols = cols;
        });
        return data;
    }

    function refreshData() {
        var url;
        var params = {
            limit: $scope.paginator.perPage,
            offset: $scope.paginator.perPage * ($scope.paginator.currentPage - 1),
            channelname: $scope.channelname
        }
        url = "/api/agent?";

        $http.get(url + jQuery.param(params)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        })
    }
    refreshData();

}]).controller('FD_TaskSetting', ['$scope', '$http', '$uibModalInstance', 'agent', function($scope, $http, $uibModalInstance, agent) {
    var year = $scope.year = (new Date()).getFullYear();
    //var year = $scope.year = 2016;
    $scope.tasks = [];
    for (var i = 1; i < 13; i++) {
        $scope.tasks.push({
            Name: i + '月',
            ChannelId: agent.ChannelId,
            TaskMonth: [year, i, '1'].join('-'),
            TaskNumMonth: 0
        });
    }

    var params = {
        channelId: agent.ChannelId,
        currYear: year
    };
    $http.get('/api/salestask?' + $.param(params)).success(function(res) {
        if (res.data.length > 0) {
            $scope.saved = true;
        } else {
            return;
        }
        _.each(res.data, function(item) {
            item.Name = (+item.TaskMonth.split('-')[1]) + '月';
        });
        $scope.tasks = res.data;
    });
    $scope.ok = function() {
        var saveFn;
        if ($scope.saved) {
            saveFn = $http.put;
        } else {
            saveFn = $http.post;
        }
        saveFn('/api/salestask', $scope.tasks).success(function(res) {
            if (res.data) {
                alert("保存成功！");
                $uibModalInstance.close();
            }
        });
    }
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]).controller('FD_FD', ['$scope', '$http', '$uibModal', '$uibModalInstance', 'agent', function($scope, $http,$uibModal, $uibModalInstance, agent) {
    var year = new Date();
    year.setMonth(year.getMonth() - 1);
    //year.setYear(2016);
    $scope.year = year.getFullYear();
    // $scope.tasks = [];
    // for(var i=1;i<13;i++){
    //     $scope.tasks.push({
    //         Name: i+'月',
    //         ChannelId: agent.ChannelId,
    //         TaskMonth: [year,i,'1'].join('-'),
    //         TaskNumMonth:0
    //     });
    // }

    var params = {
        channelId: agent.ChannelId,
        currYear: $scope.year
    };
    $http.get('/api/salestask?' + $.param(params)).success(function(res) {
        if (res.data.length > 0) {
            $scope.saved = true;
        } else {
            return;
        }
        _.each(res.data, function(item) {
            item.Name = (+item.TaskMonth.split('-')[1]) + '月';
            if (parseInt(item.TaskMonth.split('-')[1]) > year.getMonth() + 1) {
                item.access = false;
            } else {
                item.access = true;
            }
        });
        $scope.tasks = res.data;
        fetchFD();
    });

    function fetchFD() {
        $http.get('/api/rewardnotes?' + $.param(params)).success(function(res) {
            _.each(res.data,function(item){
                var fd = _.find($scope.tasks,{TaskMonth: item.YearMonth});
                if(fd){
                    var month = +fd.TaskMonth.split('-')[1];
                    if(month % 3 > 0){
                        fd.CompleteNum = item.MonthCompleteNum;
                        fd.GoalRate = item.MonthGoalRate;
                        fd.RewardsMoney = item.RewardsMoney;
                        fd.RebatesRatio = item.MonthRebatesRatio;
                        fd.fdStatus = item.Status;
                    }else{
                        fd.CompleteNum = item.QuarterCompleteNum;
                        fd.GoalRate = item.QuarterGoalRate;
                        fd.RewardsMoney = item.RewardsMoney;
                        fd.RebatesRatio = item.QuarterRebatesRatio;
                        fd.fdStatus = item.Status;
                    }
                    fd.access = false;
                    fd.fd = item;
                }
            }); 
        });
    }

    $scope.fetch = function(data) {
        var params = {
            ChannelId: agent.ChannelId,
            YearMonth: data.TaskMonth.substr(0,7)
        };
        $http.post('/api/rewardnotes', params).success(function(res) {
            fetchFD();
        });
    };
    $scope.fandian = function(fd){
       var modalInstance = $uibModal.open({
            templateUrl: 'views/fd_fdConfirm.html',
            controller: 'FD_FDConfirm',
            size: "md",
            resolve: {
                fd: function() {
                    return fd;
                }
            },
            backdrop: 'static'
        });

        modalInstance.result.then(function(result) {
            fetchFD();
        }, function() {

        });
    }
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]).controller('FD_FDConfirm', ['$scope', '$http', '$uibModalInstance', 'fd', function($scope, $http, $uibModalInstance, fd) {
    $scope.rewardsMoney = fd.RewardsMoney;
    $scope.ok = function() {
        fd.RewardsMoney = $scope.rewardsMoney;
        $http.put('/api/confirmback', fd).success(function(res) {
            if (res.status) {
                alert("保存成功！");
                $uibModalInstance.close();
            }
        });
    }
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]);
