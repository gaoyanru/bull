'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:AddOrderCtrl
 * @description
 * # AddOrderCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('OrderSearchCtrl', ['$scope', '$http', '$filter', '$state', 'user', 'OrderSearchService', '$uibModal', function($scope, $http, $filter, $state, User, OrderSearchService, $uibModal) {
    $scope.user = User.get();
    //datepicker配置
    $scope.datepickerConfig = {
        options: {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        },
        clearText: '清空',
        currentText: '今天',
        closeText: '关闭',
        startFlag: false, //起止时间标记
        endFlag: false //截至时间标记
    };

    //显示datepicker
    $scope.showDatepicker = function(type) {
        switch (type) {
            case 'start':
                $scope.datepickerConfig.startFlag = true;
                break;
            case 'end':
                $scope.datepickerConfig.endFlag = true;
                break;
        }
    };
    $scope.reback = function(orderid){
        $http.put('/api/orderauditback?orderid=' + orderid).success(function(res){
            if(res.status){
                $scope.pageChanged();
            }
        });
    }

    $scope.guaqi = function(order){
        var modalInstance = $uibModal.open({
            templateUrl: 'views/invoiceReject.html',
            controller: ['$scope', '$http', '$filter', '$uibModalInstance', function($scope, $http, $filter, $uibModalInstance) {
                $scope.invoice = {};
                //invoice.AuditMsg
                $scope.title = "订单挂起";
                $scope.cancel = function() {
                    $uibModalInstance.dismiss('');
                };
                $scope.ok = function() {
                    if ($scope.loading) return;
                    var item = {
                        CompanyId: order.CustomerId,
                        ChannelId: order.ChannelId,
                        Description: $scope.invoice.AuditMsg
                    };
                    $http.put('/api/toagent/hangupcustomer', item).success(function(res) {
                        if(res.status){
                            alert('挂起成功!');
                            $uibModalInstance.close();
                        }
                    });
                };
            }]
        });
        modalInstance.result.then(function() {
            //refreshData();
        });

        // $http.put('/api/orderauditback?orderid=' + orderid).success(function(res){
        //     if(res.status){
        //         $scope.pageChanged();
        //     }
        // });
    }
    var initStatus = function() {
        $scope.statusModel = [{
            name: '全部',
            status: 0
        }, {
            name: '未审核',
            status: 1
        }, {
            name: '通过',
            status: 2
        }, {
            name: '拒审',
            status: 3
        }];
        $scope.selectedStatus = $scope.statusModel[0];
    };
    initStatus();

    var getAgent = function() {
        OrderSearchService.getAgent().then(function(res) {
            res.data.unshift({ ChannelName: '全部', ChannelId: '' });
            $scope.agentModel = res.data;
            $scope.selectedAgent = $scope.agentModel[0];
            $scope.pageChanged();
        });
    };

    if ($scope.user.IsCenter == 1) {
        getAgent();
    }




    /*
     * paginator
     * */
    $scope.paginator = {
        total: 0,
        currentPage: 1,
        perPage: 10,
        previousText: '上一页',
        nextText: '下一页',
        lastText: '最后一页',
        firstText: '首页'
    };

    $scope.searchParams = {
        limit: 10,
        offset: 0,
        start: '',
        end: '',
        status: 0,
        cusname: '',
        cid: ''
            //cusname --> channel
            //cid     --> center
    };

    $scope.orderModel = [];
    $scope.category = '0';
    $scope.pageChanged = function() {
        $scope.searchParams = angular.extend($scope.searchParams, {
            limit: $scope.paginator.perPage,
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            start: $filter('date')($scope.start, 'yyyy-MM-dd'),
            end: $filter('date')($scope.end, 'yyyy-MM-dd'),
            status: $scope.selectedStatus.status,
            Category: $scope.category,
            LegalPerson: $scope.LegalPerson
        });

        if ($scope.user.IsCenter == 1) {
            if($scope.channel && !$scope.channel.ChannelId){
                alert('请选择代理商!');
                return;
            }
            if($scope.channel){
                $scope.searchParams.cid = $scope.channel.ChannelId;
            }

            //delete $scope.searchParams.cusname;
        } else {
            delete $scope.searchParams.cid;
        }

        OrderSearchService.getOrder($scope.searchParams).then(function(res) {
            //console.error(res);
            $scope.orderModel = res.data;
            $scope.paginator.total = res.Count;
        });
    };

    //set current page
    $scope.setCurrentPage = function() {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };

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
    };
    $scope.modify = function(order) {
        var orderId = order.OrderId;
        if (!order.FreChangeOrderId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/addOrder.html',
                controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
                    $scope.orderId = orderId;
                    $scope.showClose = true;
                    $scope.isModal = true;
                    $scope.close = function() {
                        $uibModalInstance.dismiss('');
                    }
                    $scope.closeModal = function() {
                        $uibModalInstance.close('');
                    }
                }],
                size: "lg"
            });
            modalInstance.result.then(function() {
                $scope.pageChanged();
            });
        }else{
            var modalInstance = $uibModal.open({
                templateUrl: 'views/change.html',
                controller: 'Change',
                size: "lg",
                resolve: {
                    orderId: function() {
                        return order.OrderId;
                    },
                    isModify: function(){
                        return true;
                    }
                }
            });
        }

    };
    $scope.delete = function(orderId) {
        if (confirm('确认删除订单？')) {
            $http({
                method: 'delete',
                url: "/api/orders/" + orderId
            }).success(function(data) {
                if (data.status) {
                    alert('删除成功！');
                    $scope.pageChanged();
                } else {
                    // alert(data.message);
                }
                $scope.pageChanged();
            });
        }

    };


}]);
