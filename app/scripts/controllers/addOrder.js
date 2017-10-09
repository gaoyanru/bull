'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:AddOrderCtrl
 * @description
 * # AddOrderCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('AddOrderCtrl', ['$scope', '$http', '$filter', '$state', '$stateParams', 'FileUploader', 'user', function ($scope, $http, $filter, $state, $stateParams, FileUploader, user) {


    var promotionMap = {
        1: {
            priceFn: function (price) {
                return price;
            },
            serviceFn: function (payType) {
                var map = {
                    6: 1,
                    12: 2
                };
                return map[payType] || 0;
            },
            validPayType: [6, 12]
        },
        2: {
            priceFn: function (price) {
                return 0;
            },
            serviceFn: function (payType) {
                return 0;
            },
            validPayType: [1, 7]
        },
        3: {
            priceFn: function (price, payType) {
                return price + -(price / 6);
            },
            serviceFn: function (payType) {
                return 0;
            },
            validPayType: [6, 12]
        },
        4: {
            priceFn: function (price, payType) {
                return price;
            },
            serviceFn: function (payType) {
                return 3;
            },
            validPayType: [12]
        },
        5: {
            priceFn: function (price, payType) {
                return price;
            },
            serviceFn: function (payType) {
                return 2;
            },
            validPayType: [12]
        }

    }

    $scope.isCenter = user.get().IsCenter;
    $scope.showGift = false;

    var gifts = [];
    $scope.postData = {
        NoDeadLine: 0,
        ContractPath: []
    };

    $scope.companySelect = function ($item, $model, $label, $event) {
        $http.get('/api/orders/company?name=' + encodeURI($label)).success(function (res) {
            var data = res.data[0];
            if (data.SalesId) delete data.SalesId;
            if (data.BusnissDeadline) {
                if (data.BusnissDeadline.substr(0, 4) === '0001') {
                    data.BusnissDeadline = "";
                } else {
                    data.BusnissDeadline = new Date(data.BusnissDeadline);
                }
            } else {
                data.BusnissDeadline = "";
            }

            data.Name = data.Name.trim();
            data.AddedValue = "" + data.AddedValue;
            data.Industry = "" + data.Industry;
            if (!data.RegisterDate)
                data.RegisterDate = "";
            else
                data.RegisterDate = new Date(data.RegisterDate);


            $scope.postData = angular.extend($scope.postData, data);
        });
    }
    $scope.dateOptions = {
        formatYear: 'yyyy',
    };
    $scope.dateOptions2 = {
        formatYear: 'yyyy',
        minMode: 'month'
        //minDate: $scope.postData.ServiceStart
    }
    var orderId = $stateParams.orderId;
    if (orderId && orderId.charAt(0) === 'C') {
        var tmp = orderId.split('&');
        $scope.companySelect(null, null, tmp[0].substr(1));
        var tt = new Date(tmp[1]);
        tt.setDate(1);
        tt.setMonth(tt.getMonth() + 1);
        $scope.dateOptions2.minDate = tt;
        $scope.IsReOrder = true;
        orderId = null;
    } else {
        orderId = $stateParams.orderId || $scope.$parent.orderId || false;
    }

    $scope.IsPromotionValid = function () { //IsPromotionInValid
        var val = _.find(priceList, {
            "Id": +$scope.postData.PayType
        });
        if (!val) return false;
        if ($scope.promotion) {
            var p = promotionMap[$scope.promotion.PromoId];
            if (p.validPayType.indexOf(+val.ServiceMonths) > -1) {
                return false;
            }
        }
        $scope.postData.IsPromotion = false;
        return true;
    }
    $scope.setprice = function () {
        if ($scope.isReadOnly) {
            return $scope.postData.ContractAmount;
        }
        var val = _.find(priceList, {
            "Id": +$scope.postData.PayType
        });


        if ($scope.postData.AddedValue && gifts.length > 0) {
            $scope.showGift = true;
            filterGifts();
        }

        if ($scope.postData.CityCode && priceList && $scope.postData.AddedValue && $scope.postData.PayType) {
            $scope.postData.ContractAmount = setContractAmount();
            return $scope.postData.ContractAmount;
        }
        return '';

        function setContractAmount() {
            var val = _.find(priceList, {
                "Id": +$scope.postData.PayType
            });
            if (val) {
                if ($scope.promotion && $scope.postData.IsPromotion) {
                    var p = promotionMap[$scope.promotion.PromoId];
                    return p.priceFn(val.Price, val.ServiceMonths);
                } else if ($scope.postData.IsPromotion && $scope.postData.PromotionId) {
                    var p = promotionMap[$scope.postData.PromotionId];
                    return p.priceFn(val.Price, val.ServiceMonths);
                }
                return val.Price;
            }
            return '';
        }

    }
    $scope.setgift = function () {
        //console.log($scope.postData.gift);
    }
    $scope.category = 1;
    $scope.setCategory = function () {
        if (orderId) return;
        if ($scope.isNewCompany)
            $scope.category = 2;
        else
            $scope.category = 1;
    }
    //获取当前渠道2016-11-16以后参加活动的个数
    if (!$scope.isCenter) {
        $http.get("/api/promotion/count").success(function (res) {
            if (res.status) {
                $scope.promotion = res.data;
            }
            setIsProm();
        });
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
            if (result.NoDeadLine) {
                result.BusnissDeadline = '';
            }
            if (result.IsPromotion) {
                result.PromotionId = result.IsPromotion;
                result.IsPromotion = !!result.IsPromotion;
            }
            result.BillLevel = "" + result.BillLevel;
            if ($scope.isChange || result.IsChange == 1) {
                result.AddedValue = "1";
            } else {
                result.AddedValue = "" + result.AddedValue;
            }

            result.Industry = "" + result.Industry;
            result.ContractPath = result.ContractPath ? result.ContractPath.split(';') : [];
            $scope.postData = result;
            $scope.category = result.Category;
            if ($scope.IsReOrder) {
                $scope.postData.Status = 1
            }
            if ((result.Category == 2 && result.Status == 2) || result.Category == 3) {
                $scope.category = 3;
                $scope.showProm = false;
                if(result.Status == 2 && result.Category == 3) {
                  $scope.isReadOnly = true;
                }
            }
            if ($scope.postData.Status === 2 && $scope.category != 3) {
                $scope.isReadOnly = true;
            } else {
                if ($scope.category != 3 && !$scope.isCenter) getBanlance();
            }
            if ($scope.$parent.readonly) {
                $scope.isReadOnly = true;
            }
            if (!$scope.isReadOnly) $scope.showGift = true;
            if (result.GiftTypeId && $scope.isReadOnly) {
                result.GiftStr = result.GiftTypeName + '(￥' + result.GiftPrice + ')'
            }


            $scope.isNewCompany = result.Category > 1;
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
            if (!$scope.postData.CityCode) {
                $scope.postData.CityCode = $scope.cities[0].CityCode;
            }

            $scope.setprice(true);
            if ($scope.isReadOnly) {
              $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode + '&ischeck=1').success(function (data) {
                  priceList = data.data;
                  $scope.payTypes = data.data;
              });
            } else {
              $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode).success(function (data) {
                  priceList = data.data;
                  $scope.payTypes = data.data;
              });
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

    function setIsProm() {
        if ($scope.postData.Category == 3) {
            $scope.showProm = false;
            return;
        }
        if ($scope.postData && $scope.postData.IsPromotion && !$scope.isReadOnly && $scope.postData.Status != 2) {
            $scope.showProm = true;
            return;
        }
        if ((!$scope.promotion) || $scope.promotion.PromNum <= 0 || $scope.postData.Status == 2) {
            $scope.showProm = false;
            return false;
        } else {
            $scope.showProm = true;
        }

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
        } else if (!$scope.postData.gift) {
            $scope.postData.gift = "";
        }

        $scope.gifts = _gifts;
    }
    $scope.getCompanyName = function (val) {
        return $http.get('/api/orders/companyname?name=' + encodeURI(val)).then(function (response) {
            //if($scope.postData.CustomerId) $scope.postData.CustomerId = null;
            return response.data.data.map(function (item) {
                return {
                    Name: item.Name
                };
            });
        });
    };
    // 修改订单时候清除付款方式
    $scope.clearPaytype = function () {
      $scope.postData.PayType = ''
    }
    $scope.save = function (isSave) {
        var h = (new Date()).getHours();
        if (h < 5 || h > 21) {
            alert('该时间段不允许提单，请在5:00-22:00之间提单!');
            return;
        }
        $scope.submited = true;
        delete $scope.postData.Customer;
        if ($scope.postData.IsPromotion)
            if ($scope.promotion && !$scope.postData.PromotionId) {
                $scope.postData.IsPromotion = $scope.promotion.PromoId;
            } else {
                $scope.postData.IsPromotion = $scope.postData.PromotionId;
            }
        else {
            $scope.postData.IsPromotion = 0
            delete $scope.postData.PromotionId;
        }


        if (!$scope.postData.SalesId) {
            alert('请先选择销售人员！');
            errorStep();
            return;
        }
        if ($scope.IsReOrder) $scope.postData.IsReOrder = 1;
        if ($scope.loading) return;

        if ($scope.category == 2) {
            $scope.saveCus(isSave);
            return;
        }
        if ($scope.category == 3) {
            $scope.saveTob(isSave);
            return;
        }
        if ($scope.myForm.$invalid || !$scope.postData.BusinessLicense) {
            alert("请补充必填项！");
            errorStep();
            return;
        }
        var postData = angular.copy($scope.postData);
        if ((!postData.NoDeadLine) && !postData.BusnissDeadline) {
            alert("请填写营业期限！");
            errorStep();
            return;
        }

        postData.ContractDate = $filter('date')($scope.postData.ContractDate, 'yyyy-MM-dd');
        postData.RegisterDate = $filter('date')($scope.postData.RegisterDate, 'yyyy-MM-dd');
        postData.BusnissDeadline = $filter('date')($scope.postData.BusnissDeadline, 'yyyy-MM-dd');
        postData.ServiceStart = $filter('date')($scope.postData.ServiceStart, 'yyyy-MM-dd');
        postData.ServiceEnd = $filter('date')($scope.postData.ServiceEnd, 'yyyy-MM-dd');
        postData.ContractPath = postData.ContractPath.join(';');
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
                $scope.postData.IsPromotion = !!$scope.postData.IsPromotion;
                // alert(result.message);
            }
            $scope.loading = false;
        }).error(function () {
            $scope.loading = false;
        });
    };
    $scope.saveCus = function () {
        if ($scope.myForm.$invalid) {
            alert("请补充必填项！");
            errorStep();
            return;
        }
        var postData = angular.copy($scope.postData);
        postData.ContractDate = $filter('date')($scope.postData.ContractDate, 'yyyy-MM-dd');
        postData.ContractPath = postData.ContractPath.join(';');
        if (!postData.PersonCardPath) {
            alert('请上传法人身份证照片！');
            errorStep();
            return;
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
            url: '/api/orderszj',
            data: postData,
            method: "post"
        }

        if ($scope.postData.OrderId) {
            params.url = "api/Reorders/" + $scope.postData.OrderId;
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
                $scope.postData.IsPromotion = !!$scope.postData.IsPromotion;
                // alert(result.message);
            }
            $scope.loading = false;
        }).error(function () {
            $scope.loading = false;
        });
    };
    $scope.saveTob = function (isSave) {

        if ($scope.myForm.$invalid || !$scope.postData.BusinessLicense) {
            alert("请补充必填项！");
            errorStep();
            return;
        }
        var postData = angular.copy($scope.postData);
        if ((!postData.NoDeadLine) && !postData.BusnissDeadline) {
            alert("请填写营业期限！");
            errorStep();
            return;
        }

        postData.ContractDate = $filter('date')($scope.postData.ContractDate, 'yyyy-MM-dd');
        postData.RegisterDate = $filter('date')($scope.postData.RegisterDate, 'yyyy-MM-dd');
        postData.BusnissDeadline = $filter('date')($scope.postData.BusnissDeadline, 'yyyy-MM-dd');
        postData.ServiceStart = $filter('date')($scope.postData.ServiceStart, 'yyyy-MM-dd');
        postData.ServiceEnd = $filter('date')($scope.postData.ServiceEnd, 'yyyy-MM-dd');
        postData.ContractPath = postData.ContractPath.join(';');
        if (postData.NoDeadLine) {
            postData.BusnissDeadline = '';
            postData.NoDeadLine = 1;
        } else {
            postData.NoDeadLine = 0;
        }

        var params = {
            url: '/api/supplementaryinfo',
            data: postData,
            method: "put"
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
                $scope.postData.IsPromotion = !!$scope.postData.IsPromotion;
                // alert(result.message);
            }
            $scope.loading = false;
        }).error(function () {
            $scope.loading = false;
        });
    };

    function errorStep() {
        $scope.postData.IsPromotion = !!$scope.postData.IsPromotion;
    }

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

    var priceList;

    // FILTERS
    $scope.uploader1.filters.push({
        name: 'customFilter',
        fn: verifyImage,
    });

    $scope.uploader2 = new FileUploader({
        autoUpload: true,
        url: uploadUrl
    });
    $scope.uploader3 = new FileUploader({
        autoUpload: true,
        url: uploadUrl
    });

    $scope.uploader1.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.postData.PersonCardPath = uploadUrl + '/' + $scope._key1;
    };
    $scope.uploader2.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.postData.BusinessLicense = uploadUrl + '/' + $scope._key2;
    };
    $scope.uploader3.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.postData.ContractPath.push(uploadUrl + '/' + $scope._key3);
    };
    $scope.uploader1.onBeforeUploadItem = function (item) {
        //item.formData = [];
        var key = buildKey(1, item.file.name);
        item.formData.push({
            key: key
        });
        _.each($scope.signkey, function (value, key) {
            var temp = {};
            temp[key] = value;
            item.formData.push(temp);
        });
        $scope._key1 = key;
    };
    $scope.uploader2.onBeforeUploadItem = function (item) {
        //item.formData = [];
        var key = buildKey(2, item.file.name);
        item.formData.push({
            key: key
        });
        _.each($scope.signkey, function (value, key) {
            var temp = {};
            temp[key] = value;
            item.formData.push(temp);
        });
        $scope._key2 = key;
    };
    $scope.uploader3.onBeforeUploadItem = function (item) {
        //item.formData = [];
        var key = buildKey(3, item.file.name);
        item.formData.push({
            key: key
        });
        _.each($scope.signkey, function (value, key) {
            var temp = {};
            temp[key] = value;
            item.formData.push(temp);
        });
        $scope._key3 = key;
    };
    $scope.uploader2.onErrorItem = function () {
        alert('上传失败!')
    };
    $scope.uploader1.onErrorItem = function () {
        alert('上传失败!')
    }
    $scope.uploader3.onErrorItem = function () {
        alert('上传失败!')
    }

    $scope.uploader1.filters.push({
        name: 'customFilter',
        fn: verifyImage
    });
    // FILTERS
    $scope.uploader2.filters.push({
        name: 'customFilter',
        fn: verifyImage
    });

    // FILTERS
    $scope.uploader3.filters.push({
        name: 'customFilter',
        fn: verifyImage
    });

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
        var nowstr = $filter('date')(new Date(), 'yyyyMM');
        var g_object_name = typMap[type] + nowstr + '/' + random_string(10) + suffix;
        return g_object_name;
    }

    $scope.setEndDate = function () {

        if (!$scope.postData.ServiceStart) return;
        if (!$scope.postData.PayType) return;
        if ($scope.postData.FreChangeOrderId) return;
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
        } else if ($scope.postData.GiftTypeId) {
            addMonth = addMonth + $scope.postData.GiftTypeId;
        }
        if (($scope.promotion && $scope.postData.IsPromotion) || $scope.postData.PromotionId) {
            var promId = $scope.postData.PromotionId || ($scope.promotion ? $scope.promotion.PromoId : $scope.postData.PromotionId);
            addMonth += promotionMap[promId].serviceFn(payType.ServiceMonths);
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

}]);
