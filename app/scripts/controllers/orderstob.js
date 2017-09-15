'use strict';

angular.module('channelApp').controller('OrdersTob', ['$scope', '$http', '$filter', '$state', function($scope, $http, $filter, $state) {
    $scope.title = "需要补充注册材料的订单";
    var tbOptions = [{
        header: '合同号',
        col: 'ContractNO',
    }, {
        header: '联系人',
        col: 'Contacts',
    }, {
        header: '电话',
        col: 'Mobile',
    }, {
        header: '法人',
        col: 'LegalPerson',
    }, {
        header: '合同金额',
        col: 'ContractAmount',
    }, {
        header: '订单日期',
        col: 'CreateDate',
        formate: function(val) {
            return val.substr(0, 10);
        }
    }];
    $scope.rightAlign = [2];

    $scope.headers = getHeaders()

    $scope.isZB = true;

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
    $scope.status=0;

    $scope.setCurrentPage = function(){
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };
    $scope.pageChanged = function() {
        refreshData($scope.searchItem);
    }

    $scope.searchItem = getSearchItem();

    $scope.searchFn = function() {
        $scope.searchItem = getSearchItem();
        refreshData($scope.searchItem);
    }

    $scope.sdateOptions = {
        formatYear: 'yyyy'
    };
    $scope.edateOptions = {
        formatYear: 'yyyy'
    };
    $scope.setMinDate = function() {
        $scope.edateOptions.minDate = $scope.startdate;
    }
    $scope.reset = function() {
        $scope.cusname = "";
        $scope.startdate = "";
        $scope.enddate = "";
        $scope.status = 0;
    }

    $scope.searchFn();
    $scope.modify = function(order) {
        $state.go('^.addOrder', { orderId: order.OrderId });
    };
    $scope.delete = function(orderId) {
        if (confirm('确认删除订单？')) {
            $http({
                method: 'delete',
                url: "/api/orders/" + orderId
            }).success(function(data) {
                if(data.status){
                    alert('删除成功！');
                 }
                 else{
                      // alert(data.message);
                 }
                refreshData();
            });
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
                    var cv0 = (item.formate ? item.formate(row[c[0]]) : row[c[0]]) || "无";
                    var cv1 = (item.formate ? item.formate(row[c[1]]) : row[c[1]]) || "无";
                    cols.push(cv0 + '<br/>' + cv1);
                } else {
                    var cv = (item.formate ? item.formate(row[item.col]) : row[item.col]) || "无";
                    cols.push(cv);
                }
            });
            row.cols = cols;
        });
        return data;
    }

    function getSearchItem() {
        var searchItem = {
            cusname: $scope.cusname,
            start: $filter('date')($scope.startdate, 'yyyy-MM-dd'),
            end: $filter('date')($scope.enddate, 'yyyy-MM-dd'),
            status: $scope.status,
            LegalPerson: $scope.LegalPerson
        }

        return searchItem;
    }

    function refreshData(data) {

        var data = angular.extend({
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            limit: $scope.paginator.perPage
        }, $scope.searchItem, data);
        $http.get('/api/orderszj/my?' + jQuery.param(data)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        });
    }

}]);
