'use strict';

angular.module('channelApp').filter('filterRole', function() {
    var filterRole = function(role) {
        var roleMap = '';
        switch (role) {
            case 1:
                roleMap = '系统管理员';
                break;
            case 2:
                roleMap = '总经理';
                break;
            case 3:
                roleMap = '财务总监';
                break;
            case 4:
                roleMap = '销售总监';
                break;
            case 5:
                roleMap = '业务员';
                break;
            default:
                roleMap = '其他';
        }

        return roleMap;
    };

    return filterRole;
});

angular.module('channelApp').filter('filter1Status', function() {
    var filterStatus = function(status) {
        var statusMap = '';
        switch (status) {
            case 1:
                statusMap = '未审核';
                break;
            case 2:
                statusMap = '通过';
                break;
            case 3:
                statusMap = '拒审';
                break;
        }

        return statusMap;
    };

    return filterStatus;
}).filter('filterInvoiceProperty', function() {
    var filterStatus = function(status) {
        var statusMap = '';
        switch (+status) {
            case 1:
                statusMap = '公司';
                break;
            case 2:
                statusMap = '个人';
                break;
        }

        return statusMap;
    };

    return filterStatus;
}).filter('filterInvoiceCategory', function() {
    var filterStatus = function(status) {
        var statusMap = '';
        switch (+status) {
            case 1:
                statusMap = '专票';
                break;
            case 2:
                statusMap = '普票';
                break;
        }

        return statusMap;
    };

    return filterStatus;
}).filter('outWorkStatus', function () {
    var filterStatus = function (status) {
        var statusMap = '';
        switch (+status) {
        case 1:
            statusMap = '待分配';
            break;
        case 2:
            statusMap = '待处理';
            break;
        case 3:
            statusMap = '进行中';
            break;
        case 4:
            statusMap = '已取消';
            break;
        case 5:
            statusMap = '已完成';
            break;
        }

        return statusMap;
    };

    return filterStatus;
});

angular.module('channelApp').filter('filterInvoice', function() {
    var filterInvoice = function(status) {
        var invoiceMap = '';
        switch (status) {
            case 1:
                invoiceMap = '非预借发票';
                break;
        }

        return invoiceMap;
    };

    return filterInvoice;
});


angular.module('channelApp').filter('filterCate', function() {
    var filterCate = function(cate) {
        var cateMap = '';
        switch (cate) {
            case 1:
                cateMap = '专票';
                break;
            case 2:
                cateMap = '普票';
                break;
        }

        return cateMap;
    };

    return filterCate;
});

angular.module('channelApp').filter('filterProp', function() {
    var filterProp = function(cate) {
        var propMap = '';
        switch (cate) {
            case 1:
                propMap = '公司';
                break;
            case 2:
                propMap = '个人';
                break;
        }

        return propMap;
    };

    return filterProp;
});
angular.module('channelApp').filter('filterAddValue', function() {
    var filterProp = function(cate) {
        var propMap = {
            1: '小规模',
            2: '一般纳税人'
        };
        return propMap[cate];
    };

    return filterProp;
}).filter('tDateTime', function () {
    var filter = function (param) {
        if (param.substr(0, 4) == "0001") return '';
        return param ? param.replace('T', ' ') : '';
    };

    return filter;
}).filter('tDate', function () {
    var filter = function (param) {
        if (!param) return '';
        if (param.substr(0, 4) == "0001") return '';
        return param ? param.substring(0, 10) : '';
    };

    return filter;
}).filter('fPayType', function() {
    var filter = function(param) {
        var propMap = {
            1: '半年付',
            2: '年付',
            3: '季付',
            4: '零税(半年)'
        };
        return propMap[param];
    };

    return filter;
}).filter('cusCategory', function() {
    var filter = function(c) {
        return c > 1 ? '注+记' : '记';
    };

    return filter;
}).filter('fOtType', function() {
    return function(value) {
        var propMap = {
            1: '税务',
            2: '工商',
            3: '其他'
        };
        return propMap[value];
    }
}).filter('otStatus', function() {
    var propMap = {
        1: '待分配',
        2: '待处理',
        3: '进行中',
        4: '已取消',
        5: '已完成'
    };
    return function(value) {
        return propMap[value];
    }
}).filter('YesOrNo', function() {
    return function(value) {
        return value ? '是' : '否';
    }
}).filter('filterNum', function() {
    return function(value) {
      if (value) {
        return (value*100).toFixed(2) + '%';
      } else {
        return ''
      }
    }
}).filter('filterStatus', function() {
    return function(value) {
        return value ? '正常' : '解约';
    }
});
