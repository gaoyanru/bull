'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:AddOrderCtrl
 * @description
 * # AddOrderCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('AddOrderCtrl', ['$scope', '$http', '$filter', '$state', '$stateParams', 'FileUploader', 'user', function ($scope, $http, $filter, $state, $stateParams, FileUploader, user) {

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

    $scope.IsPromotionValid = function () { //活动复选框可选否
        var val = _.find(priceList, {
            "Id": +$scope.postData.PayType
        });
        if (!val) return true; // 没选择付款方式不能点
        // console.log($scope.promotion) // 返回活动
        // console.log($scope.postData.PayType, '付款方式选择的是不是活动')
        if ($scope.promotion) {
            // 有活动的时候 判断付款方式是不是活动内的
            // console.log(val.ServiceMonths, '付款方式对应的服务月份')
            var p = $scope.promotion.PromotionDetailsEntityList
            for (var i = 0; i < p.length; i++) {
              // console.log(p[i].ServiceMonths)
              // p[i].ServiceMonths = p[i].ServiceMonths + ''
              // console.log(p[i].ServiceMonths.indexOf(+val.ServiceMonths))
              if (val.IsZero == 0 && p[i].ServiceMonths != 0 && $scope.promotion.Num !=0) {
               if (p[i].ServiceMonths == val.ServiceMonths) {
                 return false;
               }
              } else if (val.IsZero == 1 && p[i].ServiceMonths == 0 && $scope.promotion.Num !=0) {
                return false;
              }
            }
        }
        $scope.postData.IsPromotion = false;
        return true;
    }
    $scope.setprice = function () { // 计算合同金额
        if ($scope.isReadOnly) {
            return $scope.postData.ContractAmount;
        }
        var val = _.find(priceList, { // 根据付款方式找到对应合同价格ID
            "Id": +$scope.postData.PayType
        });


        if ($scope.postData.AddedValue && gifts.length > 0) { // 选择礼包时候的合同金额
            $scope.showGift = true;
            filterGifts();
            // var giftval = _.find(gifts, {
            //  "Id": +$scope.postData.giftId
            // })
            // // // console.log(giftval, 'giftval,')
            // $scope.postData.ContractAmount = val.Price + giftval.Price
            // return $scope.postData.ContractAmount
        }

        if ($scope.postData.CityCode && priceList && $scope.postData.AddedValue && $scope.postData.PayType) { // 选择了城市付款方式时候
            $scope.postData.ContractAmount = setContractAmount(); // 查看时候确定合同金额
            return $scope.postData.ContractAmount;
        }
        return '';
    }
    function setContractAmount() {
        var val = _.find(priceList, {
            "Id": +$scope.postData.PayType
        });
        if (val) { // 如果获取到支付方式 再根据活动筛选出对应的价格
          // // // console.log(val, '筛选付款方式')
            if (!$scope.postData.IsPromotion) { // 没有选择活动 根据选择付款方式返回价格
              // // // console.log(val.Price, '价格只根据付款方式确认')
              return val.Price
            } else if ($scope.promotion && $scope.postData.IsPromotion) { // 如果有活动而且选择了 根据付款方式及活动方式确认价格
              if ($scope.promotion.PromotionType == 1) { // 只增加服务时长
                // // // console.log('只增加服务时长')
                return val.Price
              } else if ($scope.promotion.PromotionType == 2) { // 活动导致价格减少
                // // // console.log('活动导致价格减少')
                // 判断付款方式是不是可以选择当前活动, 如果选择了判断减几个月价格(需要判断小规模还是一般纳税人)
                var p = $scope.promotion.PromotionDetailsEntityList
                $scope.price = ''
                for (var i = 0; i < p.length; i++) {
                  // // // console.log(p[i].ServiceMonths == val.ServiceMonths, 'true')
                  console.log(val.Price, 'Price')
                  console.log(val.ServiceMonths, 'val.ServiceMonths')
                  if (val.IsZero == 1 && p[i].ServiceMonths == 0) {
                    var serveMoney = val.Price/6
                  } else if (val.IsZero != 1 && p[i].ServiceMonths == val.ServiceMonths){
                    // serveMoney = $scope.postData.AddedValue == 1 ? 200 : 400
                    serveMoney = val.Price/val.ServiceMonths
                  }
                  // // // console.log(serveMoney, 'serveMoney')
                  if (!serveMoney) {
                    continue
                  }
                  $scope.price = val.Price - serveMoney * p[i].PromotionMonths
                  if (($scope.price + '').indexOf(".") > -1) {
                    $scope.price = $scope.price.toFixed(2)
                  }
                  break
                }
                return $scope.price
              }
            }
        }
        return '';
    }

    $scope.category = 1;
    $scope.setCategory = function () {
        if (orderId) return;
        if ($scope.isNewCompany)
            $scope.category = 2;
        else
            $scope.category = 1;
    }
    // 代理商提单时候可以享受的最新活动 但是在新增和修改的时候默认代理商显示的活动时已经参加了的活动
    $scope.channelUsePromotion = function() {
      $http.get('/api/newpromotion/getchannelpromotionbyorder').success(function (res) {
        // // // console.log(res, '代理商活动')
        // console.log(orderId, 'orderId')
        if (res.status) {
          $scope.promotion = res.data
          setIsProm()
        }
      })
    }
    $scope.channelUsePromotion()
     // 一开始执行 根据选择所在城市 获得不同城市的价格
    if (orderId) { // 修改
        $http.get("/api/orders/" + orderId).success(function (result) {
            $scope.result = angular.extend(result.data, result.data.Customer); // 修改默认是一年的付款方式活动默认选中
            result = angular.extend(result.data, result.data.Customer);
            if (result.IsPromotion) {
              $scope.promotion = result.Promotion
            } else {
              $scope.channelUsePromotion()
            }
            console.log($scope.promotion, '$scope.promotion')
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
              // result.PromotionId = result.IsPromotion;
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
            // Category 1新增修改正常订单 2预提单 3预提单转正式提单
            if ($scope.category == 1 && result.Status != 2) {
              $scope.showProm = true; // 新增修改时候编辑框可点
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
            $scope.filterGifts1()
            console.log($scope.isReadOnly, '$scope.isReadOnly')
            setIsProm()
            $scope.isNewCompany = result.Category > 1;
            initDict();
        });
    } else { // 新增
        initDict();
        getBanlance();
    }

    function getBanlance() { // 获得账户余额
        $scope.hasBalance = true;
        $http.get('api/agent/balance').success(function (result) {
            $scope.balance = result.data;
        })
    }

    function initDict() {
        $http.get("/api/code/industry").success(function (data) { // 行业
            $scope.industries = data.data;
            //$scope.postData.AddedValue = '1';
        });
        $http.get("/api/citybychannel").success(function (data) { // 根据所在城市请求价格
            $scope.cities = data.data;
            if (!$scope.postData.CityCode) {
                $scope.postData.CityCode = $scope.cities[0].CityCode; // 默认选择第一个城市
            }

            $scope.setprice(true);
            if ($scope.isReadOnly) { // 查看和新增时请求的价格有区别 所以分开请求
              $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode + '&ischeck=1').success(function (data) {
                  priceList = data.data;
                  $scope.payTypes = data.data;
              });
            } else { // 新增
              $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode).success(function (data) {
                  priceList = data.data;
                  $scope.payTypes = data.data;
                  if (orderId) {
                    // console.log(priceList, 'priceList')
                    var val = _.find(priceList, {
                        "Id": +$scope.result.PayType
                    });
                    // console.log(val, 'val修改')
                    if (val.ServiceMonths == 12) {
                      $scope.result.IsPromotion = true
                    }
                  }
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
            // // console.log(gifts, 'gifts')
            filterGifts();
            $scope.filterGifts1()
        });

    }

    function setIsProm() { // 判断只读还是可选--查看 记账准备Category == 3 返回$scope.promotion没有活动时候 审核通过  不显示选框
        if ($scope.postData.Category == 3) {
            $scope.showProm = false;
            return;
        }
        if ($scope.postData && $scope.postData.IsPromotion && !$scope.isReadOnly && $scope.postData.Status != 2) {
            $scope.showProm = true;
            return;
        }
        // console.log($scope.promotion)
        // console.log($scope.postData, '$scope.postData')
        console.log($scope.isReadOnly)
        if ((!$scope.promotion) || $scope.postData.Status == 2 && $scope.postData.OrderId) {
        // console.log($scope.postData, '$scope.postData.PromotionName')
        // if ((!$scope.postData.PromotionName) || $scope.postData.Status == 2) {
            $scope.showProm = false;
            return false;
        } else {
            if ($scope.promotion && $scope.isReadOnly) {
              $scope.showProm = false;
            } else {
              $scope.showProm = true;
            }
        }
        // console.log($scope.showProm)
    }
    function filterGifts() {
        var _gifts = [];
        if (!$scope.postData.AddedValue) return;
        // AddedValue公司性质1小规模 2一般纳税人
        angular.forEach(gifts, function (item) {
            if (item.AddedValue == $scope.postData.AddedValue) {
                if (!_.find(_gifts, function (temp) {
                        return temp.GiftTypeId === item.GiftTypeId && temp.AddedValue === item.AddedValue && temp.Price === item.Price;
                    })) {
                    _gifts.push(item);
                }
            }
        });
        // if ($scope.postData.GiftTypeId) {
        //     var find = _.find(_gifts, function (item) {
        //         return item.GiftTypeId === $scope.postData.GiftTypeId && item.AddedValue == $scope.postData.AddedValue && item.Price == $scope.postData.GiftPrice;
        //     });
        //     if (find) $scope.postData.gift = "" + find.Id;
        //     // // console.log($scope.postData.gift, typeof($scope.postData.gift))
        // } else if (!$scope.postData.gift) {
        //     $scope.postData.gift = "";
        // }

        $scope.gifts = _gifts;
    }
    $scope.filterGifts1 = function() {
        var _gifts = [];
        if (!$scope.postData.AddedValue) return;
        // AddedValue公司性质1小规模 2一般纳税人
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
            // // console.log($scope.postData.gift)
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
      $scope.postData.IsPromotion = 0
    }
    $scope.getPayType = function() {
      // console.log($scope.postData.PayType, 'PayType')
      var val = _.find(priceList, {
          "Id": +$scope.postData.PayType
      });
      // console.log(val, 'val')
      if (val.ServiceMonths == 12 && $scope.promotion) { // 有活动时且是一年且是新增 && 修改之前选择了活动
        $scope.postData.IsPromotion = true
      }
    }
    $scope.save = function (isSave) {
     // // console.log($scope.postData, '$scope.postData')
        var h = (new Date()).getHours();
        var date = ((new Date()).getTime()) + 24*60*60*1000
        // console.log(h, date, '日期')
        var m = (new Date(date)).getDate()
        if (m == 1 && h > 21) {
          alert('月末22:00之后不允许提单！')
          return
        }
        $scope.submited = true;
        delete $scope.postData.Customer;

        if (!$scope.postData.SalesId) {
            alert('请先选择销售人员！');
            errorStep();
            return;
        }
        if ($scope.IsReOrder) $scope.postData.IsReOrder = 1;
        if ($scope.loading) return;
        var postData = angular.copy($scope.postData);
        // console.log(postData, '最后提交的信息')
        if (postData.IsPromotion && postData.OrderId && postData.Promotion.PromotionDetailsEntityList.length) {
          // $scope.postData.IsPromotion = $scope.postData.Promotion.Id
          postData.IsPromotion = postData.Promotion.Id
        } else if (postData.IsPromotion && $scope.promotion.Id) {
          // $scope.postData.IsPromotion = $scope.promotion.Id
          postData.IsPromotion = $scope.promotion.Id
        } else {
          // $scope.postData.IsPromotion = 0
          postData.IsPromotion = 0
        }
        // console.log(postData, 'postData')
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
        // var postData = angular.copy($scope.postData);
        // // // console.log(postData, '最后提交的信息')
        // if ($scope.postData.IsPromotion && $scope.postData.Promotion) {
        //   // $scope.postData.IsPromotion = $scope.postData.Promotion.Id
        //   postData.IsPromotion = postData.Promotion.Id
        // } else if ($scope.postData.IsPromotion && $scope.promotion.Id) {
        //   // $scope.postData.IsPromotion = $scope.promotion.Id
        //   postData.IsPromotion = $scope.promotion.Id
        // } else {
        //   // $scope.postData.IsPromotion = 0
        //   postData.IsPromotion = 0
        // }
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

        if ($scope.postData.OrderId) { // 修改
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
        if (postData.IsPromotion && postData.Promotion) {
          // $scope.postData.IsPromotion = $scope.postData.Promotion.Id
          postData.IsPromotion = postData.Promotion.Id
        } else if (postData.IsPromotion && $scope.promotion.Id) {
          // $scope.postData.IsPromotion = $scope.promotion.Id
          postData.IsPromotion = $scope.promotion.Id
        } else {
          // $scope.postData.IsPromotion = 0
          postData.IsPromotion = 0
        }
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
        if (postData.IsPromotion && postData.Promotion) {
          // $scope.postData.IsPromotion = $scope.postData.Promotion.Id
          postData.IsPromotion = postData.Promotion.Id
        } else if (postData.IsPromotion && $scope.promotion.Id) {
          // $scope.postData.IsPromotion = $scope.promotion.Id
          postData.IsPromotion = $scope.promotion.Id
        } else {
          // $scope.postData.IsPromotion = 0
          postData.IsPromotion = 0
        }
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
        // console.log($scope.postData.gift, '$scope.postData.gift')
        if (!$scope.postData.ServiceStart) return;
        if (!$scope.postData.PayType) return;
        if ($scope.postData.FreChangeOrderId) return;
        var payType = _.find(priceList, {
            "Id": +$scope.postData.PayType
        });
        if (!payType) return;
        // console.log(payType, 'payType')
        var addMonth = payType.ServiceMonths; // 正常合同的服务月份
        var giftAndPromotionMonth = 0
        // console.log($scope.postData, '$scope.postData')
        if ($scope.postData.gift) {
            var gift = _.find($scope.gifts, function (item) {
                return item.Id === +$scope.postData.gift;
            });
            // console.log(gift.MonthNum, 'gift.MonthNum')
            // addMonth = addMonth + gift.MonthNum;
            giftAndPromotionMonth = giftAndPromotionMonth +  gift.MonthNum
        }
        //  else if ($scope.postData.GiftTypeId) {
        //     addMonth = addMonth + $scope.postData.GiftTypeId;
        // }
        // 活动影响服务结束时间
        // if (($scope.promotion && $scope.postData.IsPromotion) || $scope.postData.PromotionId) {
        //     var promId = $scope.postData.PromotionId || ($scope.promotion ? $scope.promotion.PromoId : $scope.postData.PromotionId);
        //     addMonth += promotionMap[promId].serviceFn(payType.ServiceMonths);
        // }
        // 如果有可选择的活动 而且选择了 判断服务期限加优惠月份
        //  console.log($scope.postData.IsPromotion, '是否选择活动且是增加服务时间的活动')
        // =console.log($scope.promotion && $scope.postData.IsPromotion && $scope.promotion.PromotionType == 1)
        if ($scope.promotion && $scope.postData.IsPromotion && $scope.promotion.PromotionType == 1) {
          // 根据选择的付款方式就是addMonth 判断活动送几个月
          var p = $scope.promotion.PromotionDetailsEntityList
          for (var i = 0; i < p.length; i++) {
            // // console.log(p[i].ServiceMonths, 'p[i].ServiceMonths')
            if (p[i].ServiceMonths == 0 && payType.IsZero == 1) {
              giftAndPromotionMonth += p[i].PromotionMonths
            }
            if (p[i].ServiceMonths == addMonth && payType.IsZero != 1) {
              // addMonth += p[i].PromotionMonths
              giftAndPromotionMonth += p[i].PromotionMonths
            }
          }
        }
        // // console.log(giftAndPromotionMonth, 'giftAndPromotionMonth')
        addMonth += giftAndPromotionMonth
        // // console.log(addMonth, 'addMonth')
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
