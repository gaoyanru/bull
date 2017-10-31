'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the channelApp
 */
angular.module('channelApp')
    .controller('InvoiceCtrl', ['$scope', '$filter', '$uibModal', 'InvoiceService', function ($scope, $filter, $uibModal, InvoiceService) {

        var initBalance = function(){
            InvoiceService.getEffective().then(function(res){
                $scope.balance = res.data;
            })
        };
        initBalance();

        function  getEffective(){
            InvoiceService.getEffective().then(function(res){
                $scope.effective = res.data;
            })
        }
        getEffective();

        var now = (new Date()).getDate();
        if(now<10 || now>20){
            $scope.invalid =true;
        }
        //申请发票
        $scope.applyInvoice = function(item){
            var applyModal = $uibModal.open({
                templateUrl: 'views/invoiceApply.html',
                controller: 'InvoiceApplyCtrl',
                resolve: {
                    Balance: function () {
                        return {
                            balance: $scope.balance,
                            invoiceId: item && item.InvoiceId
                        };
                    }
                }
            });
            applyModal.result.then(function(result) {
                $scope.selectedTab = 1;
                $scope.pageChanged();
                initBalance();
            }, function() {

            });
        };

        /*
        * $scope.selectedTab 1:发票申请查询 2:发票开具查询
        * */
        $scope.tabSelect = function(index){
            $scope.selectedTab = index;
        };

        //发票申请展示参数
        $scope.applyViews = {
            start: '',
            end: '',
            selectedApplyType: {},
            currentPage: ''
        };

        //发票开据展示参数
        $scope.issueViews = {
            start: '',
            end: '',
            currentPage: ''
        };

        var initApplyType = function(){
            $scope.applyType = [{
                name: '全部',
                status: '0'
            },{
                name: '未审核',
                status: '1'
            },{
                name: '通过',
                status: '2'
            },{
                name: '拒审',
                status: '3'
            }];
            $scope.applyViews.selectedApplyType = $scope.applyType[0];
        };
        initApplyType();

        //datepicker配置
        $scope.datepickerConfig = {
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

        //发票申请参数
        $scope.applyParams = {
            invoiceid: '',
            start: '',
            end: '',
            status: 0,
            offset: 0,
            limit: 0
        };

        //发票开据参数
        $scope.issueParams = {
            invoiceid: '',
            invoicecode: '',
            start: '',
            end: '',
            offset: 0,
            limit: 0
        };

        var paginatorCommon = {
            perPage: 10,
            previousText: '上一页',
            nextText: '下一页',
            lastText: '最后一页',
            firstText: '首页'
        };

        //发票申请分页
        $scope.applyPaginator = angular.extend(angular.copy(paginatorCommon), {
            total: 0,
            currentPage: 1
        });

        //发票开具分页
        $scope.issuePaginator = angular.extend(angular.copy(paginatorCommon), {
            total: 0,
            currentPage: 1
        });


        $scope.applyModel = [];
        $scope.issueModel = [];

        $scope.pageChanged = function(){

            if($scope.selectedTab == 1){
                $scope.applyParams = angular.extend($scope.applyParams, {
                    start: $filter('date')($scope.applyViews.start, 'yyyy-MM-dd'),
                    end: $filter('date')($scope.applyViews.end, 'yyyy-MM-dd'),
                    limit: $scope.applyPaginator.perPage,
                    offset: ($scope.applyPaginator.currentPage - 1) * $scope.applyPaginator.perPage,
                    status: $scope.applyViews.selectedApplyType.status
                });
                InvoiceService.getApplyLists($scope.applyParams).then(function(res){
                    $scope.applyModel = res.data;
                    $scope.applyPaginator.total = res.Count;
                });
            }else{
                $scope.issueParams = angular.extend($scope.issueParams, {
                    start: $filter('date')($scope.issueViews.start, 'yyyy-MM-dd'),
                    end: $filter('date')($scope.issueViews.end, 'yyyy-MM-dd'),
                    limit: $scope.issuePaginator.perPage,
                    offset: ($scope.issuePaginator.currentPage - 1) * $scope.issuePaginator.perPage
                });
                InvoiceService.getIssueLists($scope.issueParams).then(function(res){
                    //console.error(res);
                    $scope.issueModel = res.data;
                    $scope.issuePaginator.total = res.Count;
                });
            }
        };
        $scope.delete = function(item){
          if(!confirm("确定要删除发票申请？")) return;
          InvoiceService.delete(item.InvoiceId).success(function(res){
            if(res.status){
              alert('删除成功！');
              $scope.pageChanged();
            }
          })
        }
        $scope.selectedTab = 1;
        $scope.pageChanged();
        //获取列表
        $scope.getList = function(){
            if($scope.selectedTab === 1){
                $scope.applyPaginator.currentPage = 1;
            }else{
                $scope.issuePaginator.currentPage = 1;
            }
            $scope.pageChanged();
        };

        //set current page
        $scope.setCurrentPage = function(){
            if($scope.selectedTab === 1){
                $scope.applyPaginator.currentPage = $scope.applyViews.currentPage;
            }else{
                $scope.issuePaginator.currentPage = $scope.issueViews.currentPage;
            }

            $scope.pageChanged();
        };

        //scan
        $scope.scan = function(invoice){
            var scanModal = $uibModal.open({
                templateUrl: 'views/invoiceScan.html',
                controller: 'InvoiceScanCtrl',
                resolve: {
                    SelectedInvoice: function () {
                        return {
                            id: invoice.InvoiceId
                        };
                    }
                }
            });
        };

     }]);
