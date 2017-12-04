'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the channelApp
 */
angular.module('channelApp')
    .controller('FinanceCtrl', ['$scope', 'FinanceService','$uibModal', 'user', function ($scope, FinanceService, $uibModal, user) {

        $scope.user = user.get();

        //agent 列表
        var getAgent = function(){
            FinanceService.getAgent().then(function(res){
                $scope.agentModel = [{ChannelId:'',ChannelName:'全部'}].concat(res.data);
                $scope.selectedAgent =  $scope.agentModel[0];
            });
        };
        getAgent();

        //类型
        $scope.typeModel = [{
            name: '支付',
            type: 1
        },{
            name: '充值',
            type: 2
        }];
        $scope.selectedType = $scope.typeModel[0];

        //参数
        $scope.financeParams = {
            offset: 0,
            limit: 0,
            channelId: '',
            type: 1
        };

        //数据
        $scope.financeModel = [];

        //获取财务明细
        $scope.getFinanceDetail = function(){

            $scope.financeParams = angular.extend( $scope.financeParams, {
                offset: ($scope.paginator.currentPage-1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage,
                channelId: $scope.selectedAgent.ChannelId,
                type: $scope.selectedType.type
            });

            FinanceService.getFinanceDetail($scope.financeParams).then(function(res){
                $scope.financeModel = res.data;
                $scope.paginator.total = res.Count;
            });
        };

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


        $scope.pageChanged = function(){
            $scope.getFinanceDetail();
        };

        //set current page
        $scope.setCurrentPage = function(){
            $scope.paginator.currentPage = $scope.currentPage;
            $scope.pageChanged();
        };

        $scope.msgAlert = function () {
          var modalInstance = $uibModal.open({
              templateUrl: 'views/summit_modal.html',
              size: "md",
              controller: 'SummitModal',
              resolve: {
                error: function () {
                   return '该订单已退单'
                },
                sign: function() {
                  return true
                }
              }
          });
          modalInstance.result.then(function (result) {

          }, function () {

          });
        }
     }]).controller('SummitModal', ['$scope', '$http', '$uibModalInstance', 'error', 'sign', function($scope, $http, $uibModalInstance, error, sign) {
       console.log(error, 'error')
       $scope.sign = sign
       $scope.alertMsg = error
       $scope.submit = function () {
         var canSubmit = true
         $uibModalInstance.close(canSubmit);
       }
       $scope.cancel = function () {
         $uibModalInstance.dismiss('cancel');
       };
     }]);
