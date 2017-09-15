'use strict';

angular.module('channelApp').controller('BalanceCtrl', ['$scope', '$http','$filter', function($scope, $http,$filter) {
    //搜索参数
    $scope.searchParams = {
        startTime: '', //开始时间
        endTime: '' //结束时间
    };

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

    /*
     * paginator
     * */
    $scope.paginator = {
        total: 1,
        currentPage: 1,
        perPage: 10,
        previousText: '上一页',
        nextText: '下一页',
        lastText: '最后一页',
        firstText: '首页'
    };

    $scope.pageChanged = function() {
        //todo
       fetchData();
    };

    //set current page
    $scope.setCurrentPage = function() {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };




    $http.get('/api/finance/balance').success(function(result) {
        
        $scope.balance = result.data;
    });

    var fetchUrl,   // 明细地址
        searchItem = {}; //缓存起止日期
    $scope.showDetail = function(type) {
        if ($scope.curType === type) return;
        $scope.curType = type;
        fetchUrl = "/api/finance/agent/details?type=" + type + "&";
        pageReset();
        fetchData();
    }
    $scope.search = function(){
        pageReset();
        getDateRange();
        fetchData();
    }

    function pageReset() {
        $scope.paginator.currentPage = 1;
        $scope.paginator.perPage = 15;
    }
    function getDateRange(){
        searchItem.start = $filter('date')($scope.searchParams.startTime,'yyyy-MM-dd');
        searchItem.end = $filter('date')($scope.searchParams.endTime,'yyyy-MM-dd');
    }

    function fetchData() {
        var params = {
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            limit: $scope.paginator.perPage,
            start: searchItem.start,
            end: searchItem.end
        }
        $http.get(fetchUrl + jQuery.param(params)).success(function(result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        });
    }

    $scope.showDetail(0);
    fetchData();


    var tbOptions = [{
        header: '帐单编号',
        col: 'BillId',
    }, {
        header: '订单金额',
        col: 'Amount',
    }, {
        header: '余额',
        col: 'Balance',
    },{
        header: '类型',
        col: 'CategoryStr',
    }, {
        header: '备注',
        col: 'Description'
    }, {
        header: '订单时间',
        col: 'BillTime'
    }];
    $scope.rightAlign = [1,2];
    function getHeaders() {
        return tbOptions.map(function(item) {
            return item.header
        });
    }

    function formateData(data) {
        var CategoryList = {
            2: "充值",
            1: "支付",
            3: "撤单",
            4: "返佣"
        }
        data.forEach(function(row) {
            var cols = [];
            row.BillTime = row.BillTime.replace('T', ' ');
            row.CategoryStr = CategoryList[row.Category];
            tbOptions.forEach(function(item) {
                cols.push(row[item.col]);
            });
            row.cols = cols;
        });
        return data;
    }

    $scope.headers = getHeaders();
}]);
