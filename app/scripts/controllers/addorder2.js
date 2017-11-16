'use strict';
angular.module('channelApp').controller('AddOrderCtrl2', ['$scope', '$http', '$filter', '$state', '$stateParams', '$uibModal', 'FileUploader', 'user', 'ossUploader', 'promisesHandle', function ($scope, $http, $filter, $state, $stateParams, $uibModal, FileUploader, user, ossUploader, promisesHandle) {

  // 获取代理商账户余额
  function getBanlance() {
    $http.get('api/agent/balance').success(function (result) {
      $scope.balance = result.data;
    })
  }

  // 表单提交数据
  $scope.postData = {
    AddedValue: 1,
    Name: '',
    PersonCardPath: '',
  }
  $scope.payTypes = [];
  $scope.companyList = [];
  $scope.searchType = 1;   // 1 本地搜索 , 2 检索搜出要查询的公司 3 快速录入公司信息
  $scope.searchError = "";
  $scope.isReadOnly = false // 是否只读
  $scope.isCompanyReadonly = false // 检索出来的公司信息不能修改
  $scope.nameReadonly = false // 本地数据库查询出的公司信息 查询出后公司名称不能再修改
  $scope.gifts = []
  $scope.submited = false // 是否验证必填
  $scope.priceList = [] // 存储套餐类型返回值

  $scope.fastCheck = function() { // 快速录入
    var modalInstance = $uibModal.open({
        templateUrl: 'views/addorder_company_modal.html',
        size: "md",
        controller: 'AddorderCompanyModal',
        resolve: {
        }
    });
    modalInstance.result.then(function (result) {
        // console.log(result, 'result')
        if (result.CompanyName) {
          // console.log('aa')
          $scope.searchType = 3 // 标记是快速录入获取到的信息
          $scope.isCompanyReadonly = true // 检索出的信息只读
          $scope.searchCompanyInfo = result // 检索出的信息赋值到其他 来确定公司名称在提交之前是否修改 修改则检索出的信息清空
          $scope.nameReadonly = false // 检索出后公司名称可以修改
          $scope.postData.Address = result.Address
          $scope.postData.BusinessScope = result.BusinessScope
          $scope.postData.BusnissDeadline = new Date(result.BusnissDeadline)
          $scope.postData.Name = result.CompanyName
          if ($scope.postData.LegalPerson && $scope.postData.LegalPerson != result.LegalPerson) { // 先上传身份证再检索出的公司法人姓名和身份证不一致时候
            $scope.postData.LegalPerson = result.LegalPerson
            $scope.postData.PersonCardID = ''
          } else {
            $scope.postData.LegalPerson = result.LegalPerson
          }
          $scope.postData.LegalPerson = result.LegalPerson
          $scope.postData.RegNO = result.RegNO
          $scope.postData.RegisterDate = new Date(result.RegisterDate)
          $scope.postData.RegisteredCapital = result.RegisteredCapital
          // console.log($scope.searchType)
        } else {
          alert('抱歉，没有检索到企业信息，请重试或手动录入！')
        }
    }, function () {

    });
  }
  // 检索出的信息当修改公司名称时候 工商信息清空
  $scope.clearCompanyInfo = function() {
    // // console.log($scope.searchType, $scope.postData.Name, $scope.postData.Name.trim() == $scope.searchCompanyInfo.CompanyName, 'keydown')
    if ($scope.searchType == 3 && $scope.postData.Name.trim() != $scope.searchCompanyInfo.CompanyName) {
       $scope.postData.Address = ''
        $scope.postData.BusinessScope = ''
        $scope.postData.BusnissDeadline = ''
        $scope.postData.LegalPerson = ''
        $scope.postData.RegNO = ''
        $scope.postData.RegisterDate = ''
        $scope.postData.RegisteredCapital = ''
        $scope.searchType = 1
    }
  }

  $scope.toCheck = function(){
    $scope.searchError = '';
    $scope.searchType = 2;
    if($scope.postData.Name.length < 3){
      $scope.searchError = "请输入准确完整的公司名称！";
      return;
    }
    $scope.getMoreCompanyName($scope.postData.Name, function(){
      $scope.searchError = $scope.companyList.length ? "" : "抱歉，没有检索到公司信息！";
      if($scope.postData.Name == '' || $scope.postData.Name.length < 3 || $scope.companyList.length === 0){
        $('.dropdown-company-list').parent().removeClass('open');
      }else{
        $('.dropdown-company-list').parent().addClass('open');
      }
    })
  }

  $scope.$watch('postData.Name', function(){
    // $scope.searchType = 1;
    if($scope.postData.Name.length == ''){
      $('.dropdown-company-list').parent().removeClass('open');
      $scope.searchError = '';
      return;
    }
    if($scope.postData.Name.length < 3){
      $('.dropdown-company-list').parent().removeClass('open');
      return;
    }

    $scope.searchError = ''

    if($scope.companySelected){
      $('.dropdown-company-list').parent().removeClass('open');
      return;
    }

    $scope.getCompanyName($scope.postData.Name, function(){
      if($scope.postData.Name == '' || $scope.postData.Name.length < 3 || $scope.companyList.length === 0){
        $('.dropdown-company-list').parent().removeClass('open');
      }else{
        $('.dropdown-company-list').parent().addClass('open');
      }
    });
  })

  $scope.$watch('postData.payType', function() {
    console.log($scope.postData.payType)
    if ($scope.postData.payType && $scope.postData.payType.Id) {
      var val = $scope.postData.payType
      if (val.ServiceMonths == 12 && $scope.promotion) { // 有活动时且是一年且是新增 && 修改之前选择了活动
        $scope.postData.IsPromotion = true
      } else {
        $scope.postData.IsPromotion = false
      }
    }
  })

  $scope.$watch('postData.AddedValue',function() { // 公司新址改变则合同价格清空
    $scope.postData.ContractAmount = ''
    $scope.postData.payType = ''
    $scope.postData.ServiceStart = ''
    $scope.postData.ServiceEnd = ''
    $scope.postData.gift = ''
  })

  // 本地数据库存在客户模糊检索
  $scope.getCompanyName = function getCompanyName (val, cb) {
    // console.log(val)
    return $http.get('/api/orders/companyname?name=' + encodeURI(val)).then(function (response) {
      var data = response.data;
      if(data.status){
        $scope.companyList = data.data;
        cb && cb();
      }
    })
  }

  // 检索
  $scope.getMoreCompanyName = function getMoreCompanyName (val, cb) {
    $http.get('/api/order/getcustomerlistbyty?size=10&word=' + encodeURI(val)).then(function (response) {
      var data = response.data;
      // console.log(data)
      if(data.status){
        for(var i in data.data){
          data.data[i]['Name'] = data.data[i].name;
        }
        $scope.companyList = data.data;
        cb && cb();
      }
    })
  }
  // 本地数据库选择公司带出本地工商信息
  $scope.companySelect = function (name, id) {
    $scope.companySelected = true;
    $scope.isCompanyReadonly = false // 不是检索出的信息可以修改
    // // console.log($scope.searchType, '$scope.searchType')
    if($scope.searchType == 1){
      $http.get('/api/orders/company?name=' + encodeURI(name)).success(function (res) {
        var data = res.data[0]
        // console.log(data);
        $scope.nameReadonly = true // 当本地数据库选择公司的时候 带出信息后公司名称不能在修改
        if (data.SalesId) delete data.SalesId
        if (data.BusnissDeadline) {
          if (data.BusnissDeadline.substr(0, 4) === '0001') {
            data.BusnissDeadline = ""
          } else {
            data.BusnissDeadline = new Date(data.BusnissDeadline)
          }
        } else {
          data.BusnissDeadline = ""
        }

        data.Name = data.Name.trim();
        data.AddedValue = "" + data.AddedValue
        if (!data.RegisterDate) {
          data.RegisterDate = ""
        } else {
          data.RegisterDate = new Date(data.RegisterDate)
        }
        $scope.postData = angular.extend($scope.postData, data);
        setTimeout(function(){
          $scope.companySelected = false;
        }, 0)
      })
    } else {
      $http.get('/api/order/getcustomerbyty?code=' + id).success(function (res) {
        var data = res.data
        // console.log(data, '$scope.postData')
        if (data.BusnissDeadline) {
          if (data.BusnissDeadline.substr(0, 4) === '0001') {
            data.BusnissDeadline = ""
          } else {
            data.BusnissDeadline = new Date(data.BusnissDeadline)
          }
        } else {
          data.BusnissDeadline = ""
        }
        data.Name = data.CompanyName.trim();
        if (!data.RegisterDate) {
          data.RegisterDate = ""
        } else {
          data.RegisterDate = new Date(data.RegisterDate)
        }
        $scope.postData = angular.extend($scope.postData, data);
        setTimeout(function(){
          $scope.companySelected = false;
        }, 0)
      })
    }
  }


  // 初始化页面加载数据 销售
  function initDict(cb) {
    // 获取销售员信息
    $http.get("/api/orders/sales").success(function (data) {
      $scope.sales = data.data;
    })

    // 获取代理商所在城市信息  及根据所在城市获取服务费
    $http.get('/api/citybychannel').success(function (data) {
      $scope.cities = data.data;
      if (!$scope.postData.CityCode) { // 默认选择第一个城市
        $scope.postData.CityCode = $scope.cities[0].CityCode;
      }
      // 根据所在城市 获取服务费--查看跟修改获取的服务费参数不同需要分开
      if ($scope.isReadOnly) {
        $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode + '&ischeck=1').success(function (data) {
          $scope.priceList = data.data
          cb && cb(1)
          for(var i in data.data){
            if(!$scope.payTypes[data.data[i].AddedValue]){
              $scope.payTypes[data.data[i].AddedValue] = []
            }
            data.data[i]['id'] = data.data[i].Id;
            data.data[i]['title'] = data.data[i].PriceName
            $scope.payTypes[data.data[i].AddedValue].push(data.data[i])
          }
        });
      } else {
        $http.get("api/cityprice?cityCode=" + $scope.postData.CityCode).success(function (data) {
          $scope.priceList = data.data // 用于选择套餐后价格及服务时间判断所用数据
          cb && cb(1)
          for(var i in data.data){
            if(!$scope.payTypes[data.data[i].AddedValue]){
              $scope.payTypes[data.data[i].AddedValue] = []
            }
            data.data[i]['id'] = data.data[i].Id;
            data.data[i]['title'] = data.data[i].PriceName
            $scope.payTypes[data.data[i].AddedValue].push(data.data[i])
          }
        })
      }
    })
    // 礼包
    $http.get('/api/gift?ChannelId=').success(function (res) {
      if (res.status) {
        $scope.giftList = res.data // 用于选择礼包后计算结束账期所用数据
        cb && cb(2)
        for (var i  in res.data) {
          res.data[i].GiftTypeName = res.data[i].GiftTypeName + '￥' + res.data[i].Price
          if (!$scope.gifts[res.data[i].AddedValue]) {
            $scope.gifts[res.data[i].AddedValue] = []
          }
          $scope.gifts[res.data[i].AddedValue].push(res.data[i])
        }
        // // console.log($scope.gifts)
      }
    })
    channelUsePromotion()
  }
  // 活动(新增时) 修改需要调已经选择了的活动
  function channelUsePromotion() {
    $http.get('/api/newpromotion/getchannelpromotionbyorder').success(function (res) {
      if (res.status) {
        $scope.promotion = res.data
        // setIsProm()
      }
    })
  }

  // 判断活动可不可选择
  $scope.IsPromotionValid = function () {
    // console.log($scope.postData.payType)
    if (!$scope.postData.payType) {
      // $scope.postData.IsPromotion = false
      return true
    }
    var val = _.find($scope.priceList, {
        "Id": +$scope.postData.payType.Id
    });
    // console.log(val, 'val')
    if (!val) return true;
    // 选择套餐类型 且活动存在
    if ($scope.promotion) {
      var p = $scope.promotion.PromotionDetailsEntityList
      for (var i = 0; i < p.length; i++) {
        if (val.IsZero == 0 && p[i].ServiceMonths != 0 && $scope.promotion.Num !=0) {
         if (p[i].ServiceMonths == val.ServiceMonths) {
           return false;
         }
        } else if (val.IsZero == 1 && p[i].ServiceMonths == 0 && $scope.promotion.Num !=0) {
          return false;
        }
      }
    }
    // $scope.postData.IsPromotion = false;
    return true;
  }

  // 计算服务结束日期
  $scope.setEndDate = function () {
    if (!$scope.postData.ServiceStart) return;
    // console.log($scope.postData.payType)
    if (!$scope.postData.payType) return;
    if ($scope.postData.FreChangeOrderId) return;
    var payType = _.find($scope.priceList, {
        "Id": +$scope.postData.payType.Id
    });
    // console.log(payType, 'payType')
    if (!payType) return
    var addMonth = payType.ServiceMonths; // 正常合同的服务月份
    var giftAndPromotionMonth = 0
    // console.log($scope.postData.gift)
    if ($scope.postData.gift) {
      var gift = _.find($scope.giftList, function (item) {
          return item.Id === +$scope.postData.gift;
      });
      // console.log(gift, 'gift')
      giftAndPromotionMonth = giftAndPromotionMonth +  gift.MonthNum
    }
    if ($scope.promotion && $scope.postData.IsPromotion && $scope.promotion.PromotionType == 1) {
      // 根据选择的付款方式就是addMonth 判断活动送几个月
      var p = $scope.promotion.PromotionDetailsEntityList
      for (var i = 0; i < p.length; i++) {
        // // // console.log(p[i].ServiceMonths, 'p[i].ServiceMonths')
        if (p[i].ServiceMonths == 0 && payType.IsZero == 1) {
          giftAndPromotionMonth += p[i].PromotionMonths
        }
        if (p[i].ServiceMonths == addMonth && payType.IsZero != 1) {
          // addMonth += p[i].PromotionMonths
          giftAndPromotionMonth += p[i].PromotionMonths
        }
      }
    }
    addMonth += giftAndPromotionMonth
    // console.log(addMonth, 'addMonth')
    var date = new Date($scope.postData.ServiceStart);
    var enddate = new Date(date.setMonth(date.getMonth() + addMonth - 1));

    $scope.postData.ServiceEnd = $filter('date')(enddate, 'yyyy-MM');
  }

  // 计算合同金额
  $scope.setprice = function () {
    if ($scope.isReadOnly) {
      return $scope.postData.ContractAmount;
    }
    if (orderId) { // 修改时候套餐类型
      var val = _.find($scope.priceList, {
          "Id": +$scope.postData.PayType
      });
    } else {
      var val = _.find($scope.priceList, {
          "Id": +$scope.postData.payType.Id
      });
    }
    // console.log(val, '计算价格val')
    // 有活动时候的付款方式
    if (orderId) { // 修改时候套餐类型-->活动金额
      if ($scope.postData.PayType) {
        $scope.postData.ContractAmount = setContractAmount();
        return $scope.postData.ContractAmount;
      }
    } else {
      if ($scope.postData.payType.Id) {
          $scope.postData.ContractAmount = setContractAmount();
          return $scope.postData.ContractAmount;
      }
    }
    return '';
  }
  // 处理选择活动后的价格
  function setContractAmount() {
    if (orderId) { // 修改时候套餐类型
      var val = _.find($scope.priceList, {
          "Id": +$scope.postData.PayType
      });
    } else {
      var val = _.find($scope.priceList, {
          "Id": +$scope.postData.payType.Id
      });
    }
    // console.log(val, 'val')
    if (val) {
      if (!$scope.postData.IsPromotion) { // 没有选择活动 根据选择付款方式返回价格
        return val.Price
      } else if ($scope.promotion && $scope.postData.IsPromotion) { // 如果有活动而且选择了 根据付款方式及活动方式确认价格
        if ($scope.promotion.PromotionType == 1) { // 只增加服务时长
          return val.Price
        } else if ($scope.promotion.PromotionType == 2) { // 活动导致价格减少
          // 判断付款方式是不是可以选择当前活动, 如果选择了判断减几个月价格(需要判断小规模还是一般纳税人)
          var p = $scope.promotion.PromotionDetailsEntityList
          $scope.price = ''
          for (var i = 0; i < p.length; i++) {
            if (val.IsZero == 1 && p[i].ServiceMonths == 0) { // 零税半年
              var serveMoney = val.Price/6
            } else if (val.IsZero != 1 && p[i].ServiceMonths == val.ServiceMonths){ // 其他
              serveMoney = val.Price/val.ServiceMonths
            }
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
    return ''
  }

  // 控制是否预提单 category==1新增 category==2预提单
  $scope.category = 1
  $scope.setCategory = function () {
    if ($scope.postData.OrderId) return
    if ($scope.isNewCompany) {
      $scope.category = 2
    } else {
      $scope.category = 1
    }
  }

  //身份证上传
  $scope.ImgUploader = function(file){
    return ossUploader(file).then(function(res){
      // 此处处理身份证识别
      // console.log(res, 'img')
      $http.get('/api/order/getpersoncardbypath?path=' + res.sourceUrl).success(function (data) {
        // console.log(data, 'data')
        if (data.status && data.data.LegalPerson) {
          if ($scope.searchType == 3 && $scope.postData.LegalPerson && $scope.postData.LegalPerson == data.data.LegalPerson) {
            $scope.postData.LegalPerson = data.data.LegalPerson
            $scope.postData.PersonCardID = data.data.PersonCardID
          } else if ($scope.searchType == 3 && $scope.postData.LegalPerson && $scope.postData.LegalPerson != data.data.LegalPerso) {
            alert('身份证上的法人姓名与营业执照上的法人不符')
            $scope.postData.LegalPerson = $scope.postData.LegalPerson
            $scope.postData.PersonCardID = ''
          } else {
            $scope.postData.LegalPerson = data.data.LegalPerson
            $scope.postData.PersonCardID = data.data.PersonCardID
          }
        } else if (data.status && !data.data) {
          alert('请上传清晰的身份证人像面')
        }
      })
      return res;
    })
  }
  $scope.ImgUploader1 = function(file){
    return ossUploader(file)
  }
  $scope.startDateOptions = {
    formatYear: 'yyyy'
  };
  $scope.endDateOptions = {
    formatYear: 'yyyy'
  };
  $scope.serviceStartOptions = {
    formatYear: 'yyyy',
    minMode: 'month'
  }

  var orderId = $stateParams.orderId;
  $scope.orderId = $stateParams.orderId;
  console.log($scope.orderId, '$scope.orderId')
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
  // 修改(预提单未审核前或者修改 和正式提单未审核 或者拒审修改)


  if (orderId) {

    $http.get("/api/orders/" + orderId).success(function (result) {
      // 加载初始需要的数据

      initDict(function(type){
        switch(type){
          case 1:
            var val = _.filter($scope.priceList, {
              "Id": + result.PayType
            });
            $scope.postData.payType = val[0]
            break;
          case 2:
            var res = _.filter($scope.giftList, {
              "Price": result.GiftPrice,
              "GiftTypeId": result.GiftTypeId
            });
            if(res && res[0]){
              $scope.postData.gift = res[0].Id.toString() || '';
              console.log($scope.postData.gift)
            }
            break;
          defalut:
            break;
        }

      }, );
      getBanlance();


      $scope.result = angular.extend(result.data, result.data.Customer) // 修改默认是一年的付款方式活动默认选中?？
      result = angular.extend(result.data, result.data.Customer)
      // 如果之前选择了活动 就默认显示之前已经选择了的活动 而不是现在能享受的最新活动 否则就显示现在最新能享受的活动
      if (result.IsPromotion) {
        $scope.promotion = result.Promotion
      } else {
        channelUsePromotion()
      }
      // 处理当时检索出的信息时候 工商信息不能修改
      if (result.IsSync) {
        $scope.isCompanyReadonly = true
      } else {
        $scope.isCompanyReadonly = false
      }
      // 处理返回的时间
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
      // 处理活动是不是默认选中
      result.IsPromotion = !!result.IsPromotion;

      // 处理合同照片
      result.ContractPath = result.ContractPath ? result.ContractPath.split(';') : [];
      $scope.imgs = result.ContractPath
      // 处理套餐类型 根据返回的PayType 找到整条数据赋值给postData.payType

      $scope.postData = result
      console.log($scope.postData.IsPromotion, 'data');
      // 判断正式订单1 还是 预提单2
      $scope.category = result.Category;
      // 判断是否是续费订单
      // 处理套餐类型

      // 处理礼包
      // $scope.giftList
    })
  } else {
    initDict();
    getBanlance();
  }





  $scope.save = function(isSave){
    // console.log($scope.postData)
    // console.log($scope.imgs, 'imgs')
    var h = (new Date()).getHours();
    var date = ((new Date()).getTime()) + 24*60*60*1000
    var m = (new Date(date)).getDate()
    if (m == 1 && h > 21) {
      alert('月末22:00之后不允许提单！')
      return
    }
    $scope.submited = true
    if (!$scope.postData.SalesId) {
        alert('请先选择销售人员！');
        return;
    }
    // if ($scope.IsReOrder) $scope.postData.IsReOrder = 1; // 再次提交订单时
    // if ($scope.loading) return;
    var postData = angular.copy($scope.postData);
    var imgs = angular.copy($scope.imgs)
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

    if ($scope.category == 2) {
        $scope.saveCus(isSave);
        return;
    }
    // console.log($scope.myForm)
    if ($scope.myForm.$invalid || !$scope.postData.BusinessLicense || !$scope.postData.PersonCardPath || !postData.payType.Id) {
        alert("请补充必填项！");
        return;
    }
    if ((!postData.NoDeadLine) && !postData.BusnissDeadline) {
        alert("请填写营业期限！");
        return;
    }
    postData.RegisterDate = $filter('date')($scope.postData.RegisterDate, 'yyyy-MM-dd');
    postData.BusnissDeadline = $filter('date')($scope.postData.BusnissDeadline, 'yyyy-MM-dd');
    postData.ServiceStart = $filter('date')($scope.postData.ServiceStart, 'yyyy-MM-dd');
    postData.ServiceEnd = $filter('date')($scope.postData.ServiceEnd, 'yyyy-MM-dd');
    postData.ContractPath = imgs.join(';');
    if (postData.NoDeadLine) {
        postData.BusnissDeadline = '';
        postData.NoDeadLine = 1;
    } else {
        postData.NoDeadLine = 0;
    }
    if (postData.gift) {
      var gift = _.find($scope.giftList, function (item) {
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
    postData.PayType = postData.payType.Id
    // postData.payTypeObj = postData.payType
    delete postData.payType
    if ($scope.searchType != 1) {
      postData.IsSync = 1
    } else {
      postData.IsSync = 0
    }
    console.log(postData, '最终提交数据')

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
    // 判断是否存在预提单初审通过但是未复审的情况 && 判断账期是否连续
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
        }
        $scope.loading = false;
    }).error(function () {
        $scope.loading = false;
    });
  }
  // 预提单保存的时候
  $scope.saveCus = function () {
    var postData = angular.copy($scope.postData);
    var imgs = angular.copy($scope.imgs)
    if ($scope.myForm.$invalid || !postData.payType.Id) {
      alert("请补充必填项！");
      return;
    }
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
    postData.ContractPath = imgs.join(';');
    if (!postData.PersonCardPath) {
        alert('请上传法人身份证照片！');
        return;
    }
    if (postData.gift) {
      var gift = _.find($scope.giftList, function (item) {
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
    postData.PayType = postData.payType.Id
    delete postData.payType
    console.log(postData, '最终提交数据')
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
        }
        $scope.loading = false;
    }).error(function () {
        $scope.loading = false;
    });
  }
  // 多张图片上传
  var uploadUrl = 'https://pilipa.oss-cn-beijing.aliyuncs.com';
  $http.get('/api/signkey').success(function (res) {
      delete res.data.Filename;
      delete res.data.key;
      delete res.data.callback;
      delete res.data.expire;
      delete res.data.Host;
      $scope.signkey = res.data;
  });
  $scope.imgs = [];
  $scope.uploader1 = new FileUploader({
      autoUpload: true,
      url: uploadUrl
  });
  $scope.uploader1.onErrorItem = uploadError;
  $scope.uploader1.onSuccessItem = function (item, response, status, headers) {
      $scope.imgs.push(uploadUrl + '/' + item.key);
  };
  $scope.uploader1.onErrorItem = function (item, response, status, headers) {
      alert(item.file.name + '上传失败');
  };
  $scope.uploader1.onBeforeUploadItem = function (item) {
      //item.formData = [];
      var key = buildKey(item.file.name);
      item.formData.push({
          key: key
      });
      _.each($scope.signkey, function (value, key) {
          var temp = {};
          temp[key] = value;
          item.formData.push(temp);
      });
      item.key = key;

  };
  $scope.uploader1.filters.push({
      name: 'customFilter',
      fn: function(item, options) {
          var reg = /^.*\.(?:png|jpg|bmp|gif|jpeg)$/;
          if (!reg.test(item.name.toLowerCase())) {
              alert('请选择图片');
              return false;
          }
          return true;
      }
  });

  function buildKey(fileName) {
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
      var typMap = 'FileUploads/Recharge/';
      var nowstr = $filter('date')(new Date(), 'yyyyMM');
      var g_object_name = typMap + nowstr + '/' + random_string(10) + suffix;
      return g_object_name;
  }

  function uploadError(item) {
      alert('上传失败!');
  }
}]).controller('AddorderCompanyModal', ['$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance) {
  $scope.save = function () {
    $http.get('/api/order/getcustomerupdatebygs?word=' + $scope.httpWord).success(function (data) {
      if (data.status) {
        var companyData = data.data
        $uibModalInstance.close(companyData);
      }
    })
  }
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
