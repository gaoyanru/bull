'use strict';

angular.module('channelApp').controller('RechargeApply', ['$scope', '$http', '$filter', '$uibModal', function ($scope, $http, $filter, $uibModal) {
    //搜索参数
    $scope.searchParams = {
        startTime: '', //开始时间
        endTime: '', //结束时间
        status: "0",
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

    $scope.apply = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/recharge_apply_modal.html',
            size: "lg",
            controller: 'RechargeApplyModal',
            resolve: {
                item: function () {
                    return item || {};
                }
            }
        });

        modalInstance.result.then(function (result) {
            fetchData();
        }, function () {

        });
    }
    $scope.view = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/recharge_apply_ro_modal.html',
            size: "lg",
            controller: 'RechargeApplyModal',
            resolve: {
                item: function () {
                    return item || {};
                }
            }
        });

        modalInstance.result.then(function (result) {
            fetchData();
        }, function () {

        });
    }
    $scope.delete = function (item) {
        if (!confirm('确认要删除充值申请？')) {
            return;
        }
        $http.put('/api/finance/deleteprepai/' + item.Id).success(function (res) {
            if (res.status) {
                fetchData();
                alert('删除成功！');
            }
        })
    }

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

    $scope.pageChanged = function () {
        fetchData();
    };
    //set current page
    $scope.setCurrentPage = function () {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };
    $http.get('/api/finance/balance').success(function (result) {
        $scope.balance = result.data;
    });

    var fetchUrl = '/api/finance/getprepai/list?', // 明细地址
        searchItem = {}; //缓存起止日期
    $scope.search = function () {
        pageReset();
        getDateRange();
        fetchData();
    }

    function pageReset() {
        $scope.paginator.currentPage = 1;
        $scope.paginator.perPage = 15;
    }

    function getDateRange() {
        searchItem.start = $filter('date')($scope.searchParams.startTime, 'yyyy-MM-dd');
        searchItem.end = $filter('date')($scope.searchParams.endTime, 'yyyy-MM-dd');
        searchItem.channelname = $scope.searchParams.channelName;
        searchItem.type = $scope.searchParams.status;
    }

    function fetchData() {
        var params = {
            offset: ($scope.paginator.currentPage - 1) * $scope.paginator.perPage,
            limit: $scope.paginator.perPage,
            start: searchItem.start,
            end: searchItem.end,
            channelname: searchItem.channelname,
            type: searchItem.type || 0
        }
        $http.get(fetchUrl + jQuery.param(params)).success(function (result) {
            $scope.paginator.total = result.Count;
            $scope.data = formateData(result.data);
        });
    }


    fetchData();


    var tbOptions = [{
        header: '一级代理商',
        col: 'ChannelName1',
    }, {
        header: '二级代理商',
        col: 'ChannelName2',
    }, {
        header: '充值金额',
        col: 'Amount',
    }, {
        header: '余额',
        col: 'Balance',
    }, {
        header: '申请时间',
        col: 'CreateDate',
    }, {
        header: '审核状态',
        col: 'StatusStr',
    }, {
        header: '审核意见',
        col: 'AuditOpinion'
    }];
    $scope.rightAlign = [2, 3];

    function getHeaders() {
        return tbOptions.map(function (item) {
            return item.header
        });
    }

    function formateData(data) {
        var StatusList = {
            1: "未审核",
            2: "通过",
            3: "拒审"
        }
        data.forEach(function (row) {
            var cols = [];
            row.CreateDate = row.CreateDate.substr(0, 10);
            row.StatusStr = StatusList[row.Status];
            tbOptions.forEach(function (item) {
                cols.push(row[item.col]);
            });
            row.cols = cols;
        });
        return data;
    }

    $scope.headers = getHeaders();
}]).controller('RechargeApplyModal', ['$scope', '$http', '$uibModalInstance', 'FileUploader', 'item', '$filter', function ($scope, $http, $uibModalInstance, FileUploader, item, $filter) {
    $scope.rAmount = 5000;
    $scope.Remark = ''
    $scope.rlist = [{}];
    if (item.Id) {
        $http.get('/api/finance/getprepai?id=' + item.Id).success(function (res) {
            if (res.status) {
                $scope.rAmount = res.data.Amount;
                _.each(res.data.PrepayDetails, function (t) {
                    t.PayTime = new Date(t.PayTime);
                })
                $scope.rlist = res.data.PrepayDetails;
                $scope.imgs = JSON.parse(res.data.PhotoPath);
                $scope.Remark = res.data.Remark
            }
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.Math = Math;
    $scope.reduce = function(rlist){
      return rlist.reduce(function(r,t){return r + (t.Amount||0);},0) || 0;
    }
    $scope.save = function () {
        if ($scope.uploader1.isUploading) {
            alert('图片正在上传，请稍后尝试保存！')
            return;
        }
        if ($scope.rAmount <= 0 || isNaN($scope.rAmount)) {
            alert('充值金额不正确');
            return;
        }
        if ($scope.rAmount < 5000) {
            alert('充值金额最少为5000元！');
            return;
        }
        var valid = true;
        var invalidMsg = "";
        var amount = 0;
        _.each($scope.rlist, function (item) {
            if (!valid) return;
            if (!item.AccountOfPayment) {
                valid = false;
                invalidMsg = "付款账户必须填写!";
            } else if (!item.PayTime) {
                valid = false;
                invalidMsg = "付款时间必须填写!";
            } else if (isNaN(item.Amount) || !item.Amount) {
                valid = false;
                invalidMsg = "付款金额必须填写,并且为大于零的数字!";
            } else {
                amount += Number(item.Amount);
            }
        });
        if (!valid) {
            alert(invalidMsg);
            return;
        }
        if ($scope.imgs.length === 0) {
            alert('请上传充值图片!');
            return;
        }
        if (amount != $scope.rAmount) {
            alert('充值金额与付款金额合计不相等！');
            return;
        }
        var data = _.extend({}, item, {
            Amount: $scope.rAmount,
            PhotoPath: JSON.stringify($scope.imgs),
            PrepayDetails: $scope.rlist,
            Status: 1,
            Remark: $scope.Remark
        });
        delete data.StatusStr;
        delete data.cols;
        if (!item.Id) {
          console.log(data, '充值申请成功！')
            $http.post('/api/finance/addprepai', data).success(function (res) {
                if (res.status) {
                    alert('充值申请成功！');
                    $uibModalInstance.close();
                }
            });
        } else {
          console.log(data, '充值申请修改成功！')
            $http.put('/api/finance/putprepai', data).success(function (res) {
                if (res.status) {
                    alert('充值申请修改成功！');
                    $uibModalInstance.close();
                }

            });
        }

    };
    $scope.delete = function (index) {
        $scope.rlist.splice(index, 1);
    }
    $scope.dateOptions = {
        startingDay: 1
    };
    $scope.altInputFormats = ['M!/d!/yyyy'];

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

}]);
