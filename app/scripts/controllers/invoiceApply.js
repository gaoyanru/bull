'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the channelApp
 */
angular.module('channelApp')
    .controller('InvoiceApplyCtrl', ['$scope', '$filter', '$uibModalInstance', '$uibModal', 'Balance', 'InvoiceService', function ($scope, $filter, $uibModalInstance, $uibModal, Balance, InvoiceService) {

        var initProperty = function () {
            $scope.propertyModel = [{
                name: '公司',
                property: 1
            }, {
                name: '个人',
                property: 2
            }];
            $scope.selectedProp = $scope.propertyModel[0];
        };

        var initCategory = function () {
            $scope.categoryModel = [{
                name: '专票',
                category: 1
            }, {
                name: '普票',
                category: 2
            }];
            $scope.selectedCate = $scope.categoryModel[0];
        };

        var initProject = function () {
            InvoiceService.getProject().then(function (res) {
                $scope.projectModel = res;
                if ($scope.applyParams.Project) {
                    $scope.selectedProject = _.find($scope.projectModel, {
                        Key: $scope.applyParams.Project
                    });
                } else {
                    $scope.selectedProject = $scope.projectModel.length > 0 ? $scope.projectModel[0] : {};
                }

            });
        };

        var initAddress = function () {
            InvoiceService.getAddress().then(function (res) {
                $scope.addressModel = res.data;
                if ($scope.applyParams.AddressId) {
                    $scope.selectedAddress = _.find($scope.addressModel, {
                        Id: $scope.applyParams.AddressId
                    });
                } else {
                    $scope.selectedAddress = $scope.addressModel && $scope.addressModel.length > 0 ? $scope.addressModel[0] : {};
                }

            });
        };

        var initType = function () {
            InvoiceService.getInvoiceType().then(function (res) {
                $scope.typeModel = res;
                if ($scope.applyParams.ApplyType) {
                    $scope.selectedType = _.find($scope.typeModel, {
                        Key: $scope.applyParams.ApplyType
                    });
                } else {
                    $scope.selectedType = $scope.typeModel && $scope.typeModel.length > 0 ? $scope.typeModel[0] : {};
                }

            });
        };


        var initApply = function () {
            initProperty();
            initCategory();
            initProject();
            initAddress();
            initType();
        };

        initApply();

        $scope.applyParams = {
            Title: '',
            Property: 1,
            Category: 1,
            Project: 1,
            Amount: 0,
            AddressId: '',
            ApplyType: '',
            InvoiceNumber: ''
        };

        $scope.apply = function () {
            $scope.applyParams = angular.extend($scope.applyParams, {
                Property: $scope.selectedProp.property,
                Category: $scope.selectedCate.category,
                Project: $scope.selectedProject.Key,
                AddressId: $scope.selectedAddress.Id,
                ApplyType: $scope.selectedType.Key
            });
            if ($scope.applyParams.Amount == 0) {
                alert('请选择未开发票订单！');
                return;
            }

            InvoiceService.applyInvoice($scope.applyParams).then(function (res) {
                if (res.status) {
                    alert('申请成功');
                    $uibModalInstance.close();
                }
            })
        };

        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        }
        $scope.addAddress = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/cmFormModal.html',
                size: "lg",
                controller: 'AddressModalCtrl',
                resolve: {
                    item: function () {
                        return {};
                    }
                }
            });

            modalInstance.result.then(function (result) {
                initAddress();
            }, function () {

            });
        }
        $scope.selectOrder = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/invoiceSelectOrder.html',
                controller: 'InvoiceSelectOrder',
                size: 'lg',
                resolve: {
                    InvoiceItem: function () {
                        return {
                            balance: Balance.balance,
                            orderIds: $scope.applyParams.orderids,
                            invoiceId: Balance.invoiceId
                        };
                    }
                }
            });

            modalInstance.result.then(function (result) {
                $scope.applyParams.Amount = result.amount;
                $scope.applyParams.orderids = result.orderIds;
            }, function () {

            });
        }
        if (Balance.invoiceId) {
            InvoiceService.getDetail({
                id: Balance.invoiceId
            }).then(function (res) {
                $scope.applyParams = _.pick(res.data, "InvoiceId", "Title", "Property", "Category", "Project", "Amount", "AddressId", "ApplyType", "InvoiceNumber", "DepositBank", "BankNo", "orderids");
                $scope.selectedCate = _.find($scope.categoryModel, {
                    category: res.data.Category
                });
                $scope.selectedProp = _.find($scope.propertyModel, {
                    property: res.data.Property
                });
                if ($scope.projectModel) {
                    _.find($scope.projectModel, {
                        Key: res.data.Project
                    });
                }
                if ($scope.addressModel) {
                    $scope.selectedAddress = _.find($scope.addressModel, {
                        Id: res.data.AddressId
                    });
                }
                if ($scope.typeModel) {
                    $scope.selectedType = _.find($scope.typeModel, {
                        Key: res.data.ApplyType
                    });
                }
            })
        }

    }]).controller('InvoiceSelectOrder', ['$scope', '$filter', '$uibModalInstance', '$http', 'InvoiceItem', function ($scope, $filter, $uibModalInstance, $http, InvoiceItem) {
        $scope.searchParams = {
            invoiceId: InvoiceItem.invoiceId
        };
        //datepicker配置
        $scope.datepickerConfig = {
            clearText: '清空',
            currentText: '今天',
            closeText: '关闭',
            startFlag: false, //起止时间标记
            endFlag: false //截至时间标记
        };
        $scope.isCheckAll = false;
        $scope.isChecked = function () {
            return !_.find($scope.orders, {
                selected: false
            });
        }
        $scope.checkAll = function () {
            if ($scope.isCheckAll) {
                _.each($scope.orders, function (item) {
                    item.selected = true;
                });
            } else {
                _.each($scope.orders, function (item) {
                    item.selected = false;
                });
            }
        }

        //显示datepicker
        $scope.showDatepicker = function (type) {
            switch (type) {
            case 'start':
                $scope.datepickerConfig.startFlag = true;
                break;
            case 'end':
                $scope.datepickerConfig.endFlag = true;
                break;
            }
        };

        $scope.ok = function () {
            var selected = _.filter($scope.orders, {
                selected: true
            });
            if (selected.length === 0) {
                alert('请选择未开发票订单！')
                return;
            }
            var amount = _.reduce(selected, function (r, t) {
                r = r + t.BLAmount;
                return r;
            }, 0);
            if (amount > InvoiceItem.balace) {
                alert('发票金额不允许超出' + InvoiceItem.balace + '！');
                return;
            }
            $uibModalInstance.close({
                amount: amount,
                orderIds: _.map(selected, function (t) {
                    return "'" + t.OrderId + "'"
                }).join(',')
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        }
        $scope.search = function () {
            $http.get('/api/invoice/getneworders?' + $.param($scope.searchParams)).success(function (res) {
                $scope.orders = res.data;
                var orderids = InvoiceItem.orderIds && InvoiceItem.orderIds.split(',');
                _.each(res.data, function (item) {
                    item.selected = orderids ? orderids.indexOf("'" + item.OrderId + "'") > -1 : item.InvoiceId == InvoiceItem.invoiceId;
                });
            })
        }
        $scope.search();

    }]);
