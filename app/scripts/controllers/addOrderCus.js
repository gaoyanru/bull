'use strict';

angular.module('channelApp').controller('AddOrderCusCtrl', ['$scope', '$http', '$filter', '$state', '$stateParams', 'FileUploader', 'user', '$filter',
    function ($scope, $http, $filter, $state, $stateParams, FileUploader, user, $filter) {

        var orderId = $stateParams.orderId || $scope.$parent.orderId || false;
        $scope.isCenter = user.get().IsCenter;
        $scope.showGift = false;
        var gifts = [];
        $scope.postData = {
            NoDeadLine: 0
        };
        $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode).success(function (data) {
            //$scope.postData.ContractAmount = data.data;
            priceList = data.data;
            if ($scope.postData.AddedValue && $scope.postData.PayType) {
                setContractAmount();
            }
        });
        $scope.setprice = function (force) {
            if ($scope.isReadOnly) {
                return;
            }

            if (($scope.postData.CityCode && force) || !priceList) {
                return;
            }
            if ($scope.postData.AddedValue && gifts.length > 0) {
                $scope.showGift = true;
                filterGifts();
            }
            if (force) return;
            if ($scope.postData.CityCode && priceList && $scope.postData.AddedValue && $scope.postData.PayType) {
                setContractAmount();
            }

            function setContractAmount() {
                var val = _.find(priceList, {
                    "Id": +$scope.postData.PayType
                });
                if (val) {
                    $scope.postData.ContractAmount = val.Price;
                }
            }

        }
        if (orderId) {
            $http.get("/api/orders/" + orderId).success(function (result) {
                result = angular.extend(result.data, result.data.Customer);
                if (result.ContractDate.substr(0, 4) === '0001') {
                    result.ContractDate = "";
                } else {
                    result.ContractDate = new Date(result.ContractDate);
                }
                if (result.BusnissDeadline.substr(0, 4) === '0001') {
                    result.BusnissDeadline = "";
                } else {
                    result.BusnissDeadline = new Date(result.BusnissDeadline);
                }
                if (result.ServiceStart.substr(0, 4) === '0001') {
                    result.ServiceStart = "";
                } else {
                    result.ServiceStart = new Date(result.ServiceStart);
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
                if ($scope.postData.NoDeadLine) {
                    postData.BusnissDeadline = '';
                }
                result.BillLevel = "" + result.BillLevel;
                result.AddedValue = "" + result.AddedValue;
                result.Industry = "" + result.Industry;
                $scope.postData = result;
                if ($scope.postData.Status === 2 || $scope.$parent.readonly) {
                    $scope.isReadOnly = true;
                } else {
                    if (!$scope.isCenter) getBanlance();
                }
                if (!$scope.isReadOnly) $scope.showGift = true;
                if (result.GiftTypeId && $scope.isReadOnly) {
                    result.GiftStr = result.GiftTypeName + '(￥' + result.GiftPrice + ')'
                }
                initDict();
            });
        } else {
            initDict();
            getBanlance();
        }

        function getBanlance() {
            $scope.hasBalance = true;
            $http.get('api/agent/balance').success(function (result) {
                $scope.balance = result.data;
            })
        }

        function initDict() {
            $http.get("/api/code/industry").success(function (data) {
                $scope.industries = data.data;
                //$scope.postData.AddedValue = '1';
            });
            $http.get("/api/citybychannel").success(function (data) {
                $scope.cities = data.data;
                if ($scope.cities.length === 1) {
                    $scope.postData.CityCode = $scope.cities[0].CityCode;
                    $scope.setprice(true);
                }
            });

            $http.get("/api/orders/sales").success(function (data) {
                $scope.sales = data.data;
                $scope.postData.SalesId = "" + data.data[0].UserId;
            });

            $http.get('/api/gift?ChannelId=').success(function (res) {
                gifts = res.data.filter(function (item) {
                    return item.Num > 0
                });
                filterGifts();
            });

        }

        function filterGifts() {
            var _gifts = [];
            if (!$scope.postData.AddedValue) return;
            angular.forEach(gifts, function (item) {
                if (item.AddedValue == $scope.postData.AddedValue) {
                    if (!_.find(_gifts, function (temp) {
                            return temp.GiftTypeId === item.GiftTypeId && temp.AddedValue === item.AddedValue && temp.Price === item.Price;
                        })) {
                        _gifts.push(item);
                    }
                }
            });
            if ($scope.postData.GiftTypeId) {
                var find = _.find(_gifts, function (item) {
                    return item.GiftTypeId === $scope.postData.GiftTypeId && item.AddedValue == $scope.postData.AddedValue && item.Price == $scope.postData.GiftPrice;
                });
                if (find) $scope.postData.gift = "" + find.Id;
            } else {
                $scope.postData.gift = "";
            }

            $scope.gifts = _gifts;
        }
        $scope.getCompanyName = function (val) {
            return $http.get('/api/orders/companyname?name=' + val).then(function (response) {
                return response.data.data.map(function (item) {
                    return {
                        Name: item.Name
                    };
                });
            });
        };
        $scope.companySelect = function ($item, $model, $label, $event) {
            $http.get('/api/orders/company?name=' + $label).success(function (res) {
                var data = res.data[0];
                delete data.SalesId;
                data.Name = data.Name.trim();
                data.AddedValue = "" + data.AddedValue;
                data.Industry = "" + data.Industry;
                if (!data.RegisterDate)
                    data.RegisterDate = "";
                else
                    data.RegisterDate = new Date(data.RegisterDate);

                if (!data.BusnissDeadline)
                    data.BusnissDeadline = "";
                else
                    data.BusnissDeadline = new Date(data.BusnissDeadline);
                $scope.postData = angular.extend($scope.postData, data);
            });
        }

        $scope.save = function (isSave) {
            $scope.submited = true;
            if (!$scope.postData.SalesId) {
                alert('请先选择销售人员！');
                return;
            }
            if ($scope.loading) return;
            if ($scope.isNewCompany) {
                $scope.saveCus(isSave);
                return;
            }
            if ($scope.myForm.$invalid || !$scope.postData.BusinessLicense) {
                alert("请补充必填项！");
                return;
            }
            var postData = angular.copy($scope.postData);
            if ((!postData.NoDeadLine) && !postData.BusnissDeadline) {
                alert("请填写营业期限！");
                return;
            }

            postData.ContractDate = $filter('date')($scope.postData.ContractDate, 'yyyy-MM-dd');
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
            if (postData.gift) {
                var gift = _.find($scope.gifts, function (item) {
                    return item.Id === +$scope.postData.gift;
                });
                postData.GiftTypeId = gift.GiftTypeId;
                postData.GiftTypeName = gift.GiftTypeName;
                postData.GiftPrice = gift.Price;
                delete postData.gift;
            } else {
                delete postData.GiftTypeId;
                delete postData.GiftTypeName;
                delete postData.GiftPrice;
            }
            var params = {
                url: '/api/orders',
                data: postData,
                method: "post"
            }

            if ($scope.postData.OrderId) {
                params.method = "put";
                params.url = params.url + '/' + $scope.postData.OrderId;
                if (isSave) {
                    params.url = "api/Reorders/" + $scope.postData.OrderId;
                }
            }
            $scope.loading = true;
            $http(params).success(function (result) {
                if (result.status) {
                    alert('操作成功！');
                    if ($scope.isModal) {
                        $scope.closeModal();
                    } else {
                        $state.go('^.orderList');
                    }
                    $scope.postData = {};
                } else {
                    // alert(result.message);
                }
                $scope.loading = false;
            }).error(function () {
                $scope.loading = false;
            });
        };
        $scope.saveCus = function () {
            var postData = angular.copy($scope.postData);
            postData.ContractDate = $filter('date')($scope.postData.ContractDate, 'yyyy-MM-dd');

            if (postData.gift) {
                var gift = _.find($scope.gifts, function (item) {
                    return item.Id === +$scope.postData.gift;
                });
                postData.GiftTypeId = gift.GiftTypeId;
                postData.GiftTypeName = gift.GiftTypeName;
                postData.GiftPrice = gift.Price;
                delete postData.gift;
            } else {
                delete postData.GiftTypeId;
                delete postData.GiftTypeName;
                delete postData.GiftPrice;
            }
            var params = {
                url: '/api/orderszj',
                data: postData,
                method: "post"
            }

            if ($scope.postData.OrderId) {
                params.method = "put";
            }
            $scope.loading = true;
            $http(params).success(function (result) {
                if (result.status) {
                    alert('操作成功！');
                    if ($scope.isModal) {
                        $scope.closeModal();
                    } else {
                        $state.go('^.orderList');
                    }
                    $scope.postData = {};
                } else {
                    // alert(result.message);
                }
                $scope.loading = false;
            }).error(function () {
                $scope.loading = false;
            });
        };

        var uploadUrl = 'https://pilipa.oss-cn-beijing.aliyuncs.com';

        $http.get('/api/signkey').success(function (res) {
            delete res.data.Filename;
            delete res.data.key;
            delete res.data.callback;
            delete res.data.expire;
            delete res.data.Host;
            $scope.signkey = res.data;
        })

        $scope.uploader1 = new FileUploader({
            url: uploadUrl,
            autoUpload: true
        });
        $scope.uploader1.onCompleteItem = function (fileItem, response, status, headers) {
            $scope.postData.PersonCardPath = uploadUrl + '/' + $scope._key1;
        };
        $scope.uploader1.onBeforeUploadItem = function (item) {
            bindFormData(item, 1, 1);
        };
        $scope.uploader1.onErrorItem = function () {
            alert('上传失败!')
        };
        var priceList;

        // FILTERS
        $scope.uploader1.filters.push({
            name: 'customFilter',
            fn: verifyImage
        });

        $scope.uploader2 = new FileUploader({
            url: uploadUrl,
            autoUpload: true
        });
        $scope.uploader2.onCompleteItem = function (fileItem, response, status, headers) {
            $scope.postData.BusinessLicense = uploadUrl + '/' + $scope._key2;
        };
        $scope.uploader2.onBeforeUploadItem = function (item) {
            bindFormData(item, 2, 2);
        };
        $scope.uploader2.onErrorItem = function () {
            alert('上传失败!')
        };


        // FILTERS
        $scope.uploader2.filters.push({
            name: 'customFilter',
            fn: verifyImage
        });

        $scope.uploader3 = new FileUploader({
            url: uploadUrl,
            autoUpload: true
        });
        $scope.uploader3.onCompleteItem = function (fileItem, response, status, headers) {
            $scope.postData.PersonCardPath = uploadUrl + '/' + $scope._key3;
        };
        $scope.uploader3.onBeforeUploadItem = function (item) {
            bindFormData(item, 3, 3);
        };

        // FILTERS
        $scope.uploader3.filters.push({
            name: 'customFilter',
            fn: verifyImage
        });

        function bindFormData(item, up, type) {
            var key = buildKey(type, item.file.name);
            item.formData.push({
                key: key
            });
            _.each($scope.signkey, function (value, key) {
                var temp = {};
                temp[key] = value;
                item.formData.push(temp);
            });
            $scope['_key' + up] = key;
        }

        function buildKey(type, fileName) {
            var randomFilename = "";

            var get_suffix = function (filename) {
                var suffix = '';
                var pos = filename.lastIndexOf('.');

                if (pos != -1) {
                    suffix = filename.substring(pos)
                }
                return suffix;
            };
            var random_string = function (len) {
                len = len || 32;
                var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
                var maxPos = chars.length;
                var pwd = '';
                for (var i = 0; i < len; i++) {
                    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
                }
                return pwd;
            };

            var suffix = get_suffix(fileName);
            var typMap = {
                1: 'FileUploads/Order/CardID/',
                2: 'FileUploads/Order/BusinessLicense/',
                3: 'FileUploads/Order/Contract/',
                4: 'FileUploads/Agent/'
            }
            var nowstr = $filter('date')(new Date(), 'yyyy-MM');
            var g_object_name = typMap[type] + nowstr + '/' + random_string(10) + suffix;
            return g_object_name;
        }

        $scope.dateOptions = {
            formatYear: 'yyyy',
        };
        $scope.dateOptions2 = {
            formatYear: 'yyyy',
            minMode: 'month'
            //minDate: $scope.postData.ServiceStart
        }
        $scope.setEndDate = function () {
            if (!$scope.postData.ServiceStart) return;
            if (!$scope.postData.PayType) return;
            var payType = _.find(priceList, {
                "Id": +$scope.postData.PayType
            });
            if (!payType) return;
            var addMonth = payType.ServiceMonths;
            if ($scope.postData.gift) {
                var gift = _.find($scope.gifts, function (item) {
                    return item.Id === +$scope.postData.gift;
                });
                addMonth = addMonth + gift.MonthNum;
            }
            if ($scope.postData.IsPromotion) {
                if (payType.ServiceMonths == 6 && payType.IsZero == 0) {
                    addMonth += 1;
                } else if (payType.ServiceMonths >= 12 && payType.IsZero == 0) {
                    addMonth += 2;
                }
            }
            var date = new Date($scope.postData.ServiceStart);
            var enddate = new Date(date.setMonth(date.getMonth() + addMonth - 1));

            $scope.postData.ServiceEnd = $filter('date')(enddate, 'yyyy-MM');
        }

        function verifyImage(item, options) {
            var reg = /^.*\.(?:png|jpg|bmp|gif|jpeg)$/;
            if (!reg.test(item.name.toLowerCase())) {
                alert('请选择图片');
                return false;
            }
            return true;
        }

    }
]);
