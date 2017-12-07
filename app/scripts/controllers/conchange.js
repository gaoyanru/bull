(function() {
    angular.module('channelApp').controller('ConChange', ['$scope', '$uibModal', 'CustomerService', 'user', '$state', function($scope, $uibModal, server, user, $state) {
        $scope.user = user.get();
        $scope.view = function(orderId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/change2.html',
                controller: 'Change',
                size: "lg",
                windowClass: "add-order-modal-container",
                resolve: {
                    orderId: function() {
                        return orderId;
                    },
                    isModify: function() {
                        return false;
                    },
                    isConchange: function() { // 是否企业变更 要求开始账期默认选中判断与当前月的关系
                      return true
                    }
                }
            });
            modalInstance.result.then(function() {
                refreshData();
            });
        };


        $scope.paginator = {
            total: 0,
            currentPage: 1,
            perPage: 10,
            previousText: '上一页',
            nextText: '下一页',
            lastText: '最后一页',
            firstText: '首页'
        };


        $scope.pageChanged = function() {
            refreshData();
        };

        //set current page
        $scope.setCurrentPage = function() {
            $scope.paginator.currentPage = $scope.currentPage;
            refreshData();
        };
        $scope.searchItem = {
            cusname: ''
        };
        $scope.search = function() {
            $scope.paginator.currentPage = 1;
            $scope.searchItem.cusname = $scope.cusname;
            refreshData($scope.searchItem);
        }

        function refreshData() {
            var data = angular.extend({
                offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
                limit: $scope.paginator.perPage
            }, $scope.searchItem);
            server.getCustomerChange(data).success(function(res) {
                $scope.paginator.total = res.Count;
                $scope.customers = res.data;
            });
        }
        $scope.limit = "1";
        refreshData();
    }]).controller('Change', ['$scope', '$uibModal', '$http', '$uibModalInstance', 'FileUploader', 'orderId', '$filter', 'isModify', 'isConchange', function($scope, $uibModal, $http, $uibModalInstance, FileUploader, orderId, $filter, isModify, isConchange) {
        // console.log(orderId)

        $scope.orderId = orderId;
        $scope.showClose = true;
        $scope.close = function() {
          $uibModalInstance.dismiss('');
        }
        $scope.postData = {
            NoDeadLine: 0
        };

        $scope.setprice = function() {
            var priceList;
            $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode).success(function(data) {
                priceList = data.data;
                $scope.payTypes = data.data;
                if ($scope.postData.AddedValue && $scope.postData.PayType) {
                    setContractAmount();
                }
            });

            function setContractAmount() {
                var smval = 200; //小规模价格/月
                var ybval = 400; //一般纳税人价格/月
                var end = new Date($scope.postData.ServiceEnd);
                var start = $scope.postData.ServiceStart;

                var month = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;

                $scope.postData.ContractAmount = +(month * (ybval - smval)).toFixed(2);
            }

        }
        if (orderId) {
            $http.get("/api/orders/" + orderId).success(function(result) {
                result = angular.extend(result.data, result.data.Customer);
                if (result.BusnissDeadline.substr(0, 4) === '0001') {
                    result.BusnissDeadline = "";
                } else {
                    result.BusnissDeadline = new Date(result.BusnissDeadline);
                }
                if (result.ServiceStart.substr(0, 4) === '0001') {
                    result.ServiceStart = "";
                } else {
                    if (isModify) {
                        result.ServiceStart = new Date(result.ServiceStart);
                    }else{
                        var now = new Date()
                        var nowTime = now.getTime()
                        // console.log(nowTime, 'nowTime')
                        result.ServiceStart = new Date(result.ServiceStart);
                        var resultTime = result.ServiceStart.getTime()
                        // console.log(resultTime, 'result.ServiceStart')
                        if (nowTime > resultTime) {
                          result.ServiceStart = now
                        } else {
                          result.ServiceStart = result.ServiceStart
                        }
                    }

                }
                if (result.RegisterDate.substr(0, 4) === '0001') {
                    result.RegisterDate = "";
                } else {
                    result.RegisterDate = new Date(result.RegisterDate);
                }
                if (result.ServiceEnd.substr(0, 4) === '0001') {
                    result.ServiceEnd = "";
                } else {
                    result.ServiceEnd = result.ServiceEnd.substr(0, 7);
                }
                if (result.NoDeadLine) {
                    result.BusnissDeadline = '';
                }
                result.ContractPath = result.ContractPath ? result.ContractPath.split(';') : '';
                $scope.imgs = result.ContractPath
                $scope.serviceStartOptions.maxDate = new Date(result.ServiceEnd);
                // console.log(result, 'result')
                // console.log(result.ServiceStart, $scope.dateOptions2.minDate, 'minDate')
                // $scope.dateOptions2.minDate = new Date(result.ServiceStart) > $scope.dateOptions2.minDate ? new Date(result.ServiceStart) : $scope.dateOptions2.minDate;
                $scope.serviceStartOptions.minDate = new Date()
                // result.IsPromotion = !!result.IsPromotion;
                // result.BillLevel = "" + result.BillLevel;
                if (result.Status == 2 && result.FreChangeOrderId) $scope.readonly = true;
                result.AddedValue = "2";
                $scope.postData = result;
                initDict();
                getBanlance();

            });
        } else {
            initDict();
            getBanlance();
        }

        function getBanlance() {
            $scope.hasBalance = true;
            $http.get('api/agent/balance').success(function(result) {
                $scope.balance = result.data;
            })
        }

        function initDict() {
            $http.get("/api/citybychannel").success(function(data) {
                $scope.cities = data.data;
                if ($scope.cities.length === 1) {
                    $scope.postData.CityCode = $scope.cities[0].CityCode;
                    $scope.setprice(true);
                }
            });

            $http.get("/api/orders/sales").success(function(data) {
                $scope.sales = data.data;
                $scope.postData.SalesId = "" + data.data[0].UserId;
            });
        }

        $scope.save = function(isSave) {
            if ($scope.loading) return;

            if (!confirm("您确定纳税人类别变更日期为：" + $filter('date')($scope.postData.ServiceStart, 'yyyy-MM') + "?")) return;

            var postData = angular.copy($scope.postData);
            delete postData.Customer;
            delete postData.Promotion;
            // console.log(postData.ContractPath)
            postData.ContractPath = $scope.imgs ? $scope.imgs.join(';') : ''
            postData.RegisterDate = $filter('date')($scope.postData.RegisterDate, 'yyyy-MM-dd');
            postData.BusnissDeadline = $filter('date')($scope.postData.BusnissDeadline, 'yyyy-MM-dd');
            postData.ServiceStart = $filter('date')($scope.postData.ServiceStart, 'yyyy-MM-dd');
            postData.ServiceEnd = $filter('date')($scope.postData.ServiceEnd, 'yyyy-MM-dd');
            if (postData.NoDeadLine) {
                postData.BusnissDeadline = '';
                postData.NoDeadLine = 1;
            } else {
                postData.NoDeadLine = 0;
            }

            delete postData.GiftTypeId;
            delete postData.GiftTypeName;
            delete postData.GiftPrice;
            postData.IsPromotion = 0;

            var params = {
                url: '/api/orders',
                data: postData,
                method: "post"
            }
            if (isModify) {
                params.method = "put";
                params.url = '/api/Reorders/' + $scope.postData.OrderId;
            } else {
                postData.FreChangeOrderId = $scope.postData.OrderId;
                delete postData.OrderId;
                postData.Remark = (postData.Remark || "") + "纳税人类别变更;"
            }
            $scope.loading = true;
            $http(params).success(function(result) {
                if (result.status) {
                    alert('操作成功！');
                    $uibModalInstance.close();

                } else {
                    // alert(result.message);
                }
                $scope.loading = false;
            }).error(function() {
                $scope.loading = false;
            });
        };


        var now = new Date();
        now.setMonth(now.getMonth() -1);

        $scope.serviceStartOptions = {
            formatYear: 'yyyy',
            minMode: 'month',
            maxDate: new Date($scope.postData.ServiceEnd),
            minDate: now
        }
        $scope.startDateOptions = {
          formatYear: 'yyyy'
        };
        $scope.endDateOptions = {
          formatYear: 'yyyy'
        };

    }]);
})(angular);
