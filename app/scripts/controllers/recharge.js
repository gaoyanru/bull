'use strict';
angular.module('channelApp').controller('RechargeCtrl', ['$scope', '$http', '$uibModal', function($scope, $http, $uibModal) {
    var tbOptions = [{
        header: '省',
        col: 'ProvinceName',
    }, {
        header: '市',
        col: 'CityName',
    }, {
        header: '代理商',
        col: 'ChannelName1',
    }, {
        header: '二级代理商',
        col: 'ChannelName2',
    }, {
        header: '地址',
        col: 'Address',
    }, {
        header: '联系方式',
        col: 'Tel,Mobile'
    }, {
        header: '余额',
        col: 'Balance'
    }];
    $scope.rightAlign = [6];
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

    $scope.setCurrentPage = function() {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };

    $scope.pageChanged = function() {
        refreshData();
    };


    function refreshData() {
        var params = {
            offset: $scope.paginator.perPage * ($scope.paginator.currentPage - 1),
            limit: $scope.paginator.perPage
        };
        $http.get("/api/agent?" + jQuery.param(params)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        })
    }
    refreshData();

    $scope.headers = getHeaders();
    $scope.addMoney = function(item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/addMoney.html',
            controller: 'addMoneyCtrl',
            resolve: {
                channel: function() {
                    return item;
                }
            }
        });

        modalInstance.result.then(function(result) {
            refreshData();
        }, function() {

        });
    };
    //$scope.data = formateData(result);
    $scope.addMoneyDetail = function(channelId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/addMoneyDetail.html',
            controller: 'addMoneyDetailCtrl',
            size: 'lg',
            resolve: {
                channelId: function() {
                    return channelId;
                }
            }
        });

        modalInstance.result.then(function(result) {
            refreshData();
        }, function() {

        });
    }

    $scope.payDetail = function(channelId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/payDetail.html',
            controller: 'payDetailCtrl',
            size: 'lg',
            resolve: {
                channelId: function() {
                    return channelId;
                }
            }
        });

        modalInstance.result.then(function(result) {
            refreshData();
        }, function() {

        });
    };
    $scope.setDiscount = function(row) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/setDiscount.html',
            controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
                $scope.discount = row.Discount;
                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.ok = function() {
                    var discount = +$scope.discount;
                    if (!(discount > 0 && discount < 10)) {
                        alert("请输入合理的折扣值");
                        return;
                    }
                    $uibModalInstance.close($scope.discount);
                }
            }]
        });
        modalInstance.result.then(function(result) {
            $http.put('/api/agent/' + row.ChannelId + '/discount', { Discount: result }).success(function() {
                row.Discount = result;
            });
        }, function() {

        });
    };
    $scope.modify = function(row) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/agent.html',
            controller: 'agentCtrl',
            size: "lg",
            resolve: {
                agent: function() {
                    return row;
                }
            }
        });

        modalInstance.result.then(function(result) {
            refreshData();
        }, function() {

        });
    }

    $scope.remove = function(id) {

        if (confirm("确认删除?")) {
            $http.delete('/api/agent/' + id).success(function() {
                refreshData();
            })
        }
    }

    function getHeaders() {
        return tbOptions.map(function(item) {
            return item.header
        });
    }

    function formateData(data) {

        data.forEach(function(row) {
            var cols = [];
            tbOptions.forEach(function(item) {
                if (item.col.indexOf(',') > 0) {
                    var c = item.col.split(',');
                    cols.push((row[c[0]] || "") + '<br/>' + (row[c[1]] || ""));
                } else {
                    cols.push(row[item.col]);
                }
            });
            row.cols = cols;
        });
        return data;
    }

}]).controller('addMoneyCtrl', ['$scope', '$http', '$uibModalInstance', 'channel', function($scope, $http, $uibModalInstance, channel) {
    $scope.channel = channel;
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function() {
        if(!$scope.money){
            alert('请输入充值金额!');
            return;
        }
        var str = '您确认为“' + channel.ChannelName1;
        if (channel.ChannelName2) {
            str = str + ' > '
            channel.ChannelName2;
        }
        str = str + '" 充值 ' + $scope.money + ' 元？'
        if (confirm(str)) {
            $http.post('/api/finance', {
                ChannelId: channel.ChannelId,
                Amount: $scope.money
            }).success(function() {
                $uibModalInstance.close('');
            });
        }
    };
}]).controller('addMoneyDetailCtrl', ['$scope', '$http', '$uibModalInstance', 'channelId', function($scope, $http, $uibModalInstance, channelId) {
    var tbOptions = [{
        header: '账单编号',
        col: 'BillId',
    }, {
        header: '充值金额',
        col: 'Amount',
    }, {
        header: '余额',
        col: 'Balance',
    }, {
        header: '备注',
        col: 'Description'
    }, {
        header: '订单时间',
        col: 'BillTime'
    }];
    $scope.rightAlign = [1, 2];
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

    $scope.setCurrentPage = function() {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };
    $scope.pageChanged = function() {
        refreshData();
    }


    function getHeaders() {
        return tbOptions.map(function(item) {
            return item.header
        });
    }

    function formateData(data) {

        data.forEach(function(row) {
            var cols = [];
            row.BillTime = row.BillTime.replace('T', ' ');
            tbOptions.forEach(function(item) {
                cols.push(row[item.col]);
            });
            row.cols = cols;
        });
        return data;
    }
    $scope.headers = getHeaders();

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function() {
        $uibModalInstance.close('');
    };



    $scope.status = 0;
    $scope.pageChanged = function() {
        refreshData();
    }

    function refreshData() {
        var params = {
            type: 2,
            channelId: channelId,
            limit: $scope.paginator.perPage,
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
        }

        $http.get('api/finance/detail?' + jQuery.param(params)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        });
    }
    refreshData();

}]).controller('payDetailCtrl', ['$scope', '$http', '$uibModal', '$uibModalInstance', 'channelId', function($scope, $http, $uibModal, $uibModalInstance, channelId) {
    var tbOptions = [{
        header: '订单编号',
        col: 'OrderId',
    }, {
        header: '订单金额',
        col: 'Amount',
    }, {
        header: '余额',
        col: 'Balance',
    }, {
        header: '备注',
        col: 'Description'
    }, {
        header: '订单时间',
        col: 'BillTime'
    }];
    $scope.rightAlign = [1, 2];

    function getHeaders() {
        return tbOptions.map(function(item) {
            return item.header
        });
    }

    function formateData(data) {

        data.forEach(function(row) {
            var cols = [];
            row.BillTime = row.BillTime.replace('T', ' ');
            tbOptions.forEach(function(item) {
                cols.push(row[item.col]);
            });
            row.cols = cols;
        });
        return data;
    }
    $scope.headers = getHeaders();

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function() {
        $uibModalInstance.close('');
    };

    $scope.status = 0;
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

    $scope.setCurrentPage = function() {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };
    $scope.pageChanged = function() {
        refreshData();
    }
    $scope.view = function(orderId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/addOrder.html',
            controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
                $scope.readonly = true;
                $scope.orderId = orderId;
                $scope.showClose = true;
                $scope.close = function() {
                    $uibModalInstance.dismiss('');
                }
            }],
            size: "lg"
        });
    }

    function refreshData() {
        var params = {
            type: 1,
            channelId: channelId,
            limit: $scope.paginator.perPage,
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
        }


        $http.get('api/finance/detail?' + jQuery.param(params)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        });
    }
    refreshData();
}]);
