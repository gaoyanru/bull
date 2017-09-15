'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:AddOrderCtrl
 * @description
 * # AddOrderCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('InvoiceSearchCtrl', ['$scope', '$http', '$filter', '$state', 'user', 'OrderSearchService', '$uibModal',
    function($scope, $http, $filter, $state, User, OrderSearchService, $uibModal) {
        $scope.user = User.get();
        //datepicker配置
        var datepickerConfig = {
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
        $scope.datepickerConfig = datepickerConfig;
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


        var getAgent = function() {
            OrderSearchService.getAgent().then(function(res) {
                $scope.agentModel = res.data;
                $scope.agentModel.unshift({
                    ChannelId: '',
                    ChannelName: '全部'
                });
                $scope.selectedAgent = $scope.agentModel[0];
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
            limit: $scope.paginator.perPage,
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            status: 1,
            cid: ''
        };

        $scope.orderModel = [];

        $scope.pageChanged = function() {
            $scope.searchParams = angular.extend($scope.searchParams, {
                limit: $scope.paginator.perPage,
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage
            });

            refreshData();

        };

        //set current page
        $scope.setCurrentPage = function() {
            $scope.paginator.currentPage = $scope.currentPage;
            $scope.pageChanged();
        };


        function refreshData() {
            $http.get('/api/invoice/agent/issue?' + jQuery.param($scope.searchParams)).success(function(result) {
                $scope.paginator.total = result.Count;
                $scope.invoices = result.data;
            });
        }

        $scope.search = function() {
            $scope.paginator.currentPage = 1;
            $scope.searchParams = angular.extend($scope.searchParams, {
                limit: $scope.paginator.perPage,
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
                start: $filter('date')($scope.start, 'yyyy-MM-dd'),
                end: $filter('date')($scope.end, 'yyyy-MM-dd'),
                status: 1,
                cid: $scope.selectedAgent.ChannelId,
                invoicecode: $scope.invoiceCode
            });
            refreshData();
        }
        refreshData();
        $scope.scan = function(invoice) {
            var scanModal = $uibModal.open({
                templateUrl: 'views/invoiceScan.html',
                controller: 'InvoiceScanCtrl',
                resolve: {
                    SelectedInvoice: function() {
                        return {
                            id: invoice.InvoiceId
                        };
                    }
                }
            });
        };

    }
]);
