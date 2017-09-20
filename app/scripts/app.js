'use strict';

/**
 * @ngdoc overview
 * @name channelApp
 * @description
 * # channelApp
 *
 * Main module of the application.
 */

var channelApp = angular
    .module('channelApp', [
        'ngAnimate',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ui.bootstrap',
        'ui.router',
        'treeControl',
        'angularFileUpload',
        'ngLocale',
        'formly',
        'formlyBootstrap',
        'fixed.table.header',
        'angular-echarts',
        'ngMaterial'
    ]);

channelApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'userProvider', function($stateProvider, $urlRouterProvider, $httpProvider, user) {

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            }).state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            }).state('main.employee', {
                url: '/employee',
                templateUrl: 'views/employee.html',
                controller: 'EmployeeCtrl'
            }).state('main.finance', { //财务明细
                url: '/finance',
                templateUrl: 'views/finance.html',
                controller: 'FinanceCtrl'
            }).state('main.addOrder', {
                url: '/addOrder/:orderId',
                templateUrl: 'views/addOrder.html',
                controller: ''
            }).state('main.balance', { //余额（会员）
                url: '/balance',
                templateUrl: 'views/balance.html',
                controller: 'BalanceCtrl'
            }).state('main.orderList', {
                url: '/orderList',
                templateUrl: 'views/orderList.html',
                controller: 'OrderListCtrl'
            }).state('main.orderSearch', { //订单查询
                url: '/orderSearch',
                templateUrl: 'views/orderSearch.html',
                controller: 'OrderSearchCtrl'
            }).state('main.users', {
                url: '/user',
                templateUrl: 'views/users.html',
                controller: 'UserCtrl'
            }).state('main.users.usersList', {
                url: '/userList',
                templateUrl: 'views/usersList.html',
                controller: 'UserListCtrl'
            }).state('main.users.addUser', {
                url: '/addUser?deparment',
                templateUrl: 'views/addUser.html',
                controller: 'AddUserCtrl'
            }).state('main.users.updateUser', {
                url: '/updateUser?user',
                templateUrl: 'views/updateUser.html',
                controller: 'UpdateUserCtrl'
            }).state('main.achieve', {
                url: '/achieve',
                templateUrl: 'views/achieve.html',
                controller: 'AchieveCtrl'
            }).state('main.recharge', {
                url: '/recharge',
                templateUrl: 'views/recharge.html',
                controller: 'RechargeCtrl'
            }).state('main.review', {
                url: '/review',
                templateUrl: 'views/review.html',
                controller: 'ReviewCtrl'
            }).state('main.agent', {
                url: '/agent/:type',
                templateUrl: 'views/agentList.html',
                controller: 'AgentListCtrl'
            }).state('main.agentAuth', {
                url: '/agentAuth/:type',
                templateUrl: 'views/agentList.html',
                controller: 'AgentListCtrl'
            }).state('main.agapply', {
                url: '/agapply',
                templateUrl: 'views/agent.html',
                controller: 'agentCtrl'
            }).state('main.invoice', {
                url: '/invoice',
                templateUrl: 'views/invoice.html',
                controller: 'InvoiceCtrl'
            }).state('main.invoiceReview', {
                url: '/invoiceReview',
                templateUrl: 'views/invoiceReview.html',
                controller: 'InvoiceReviewCtrl'
            }).state('main.invoiceSearch', {
                url: '/invoiceSearch',
                templateUrl: 'views/invoiceSearch.html',
                controller: 'InvoiceSearchCtrl'
            }).state('main.address', {
                url: '/address',
                templateUrl: 'views/addressList.html',
                controller: 'AddressListCtrl'
            }).state('main.customers', {
                url: '/customers',
                templateUrl: 'views/customers.html',
                controller: 'CustomerList'
            }).state('main.pubcus', {
                url: '/pubcus',
                templateUrl: 'views/customer_pub.html',
                controller: 'CustomerPubList'
            }).state('main.custotal', {
                url: '/custotal',
                templateUrl: 'views/customer_total.html',
                controller: 'CustomerTotal'
            }).state('main.gift', {
                url: '/custsetting',
                templateUrl: 'views/customer_setting.html',
                controller: 'CustomerSetting'
            }).state('main.custotaltoc', {
                url: '/custotaltoc',
                templateUrl: 'views/customer_totaltoc.html',
                controller: 'CustomerTotalToC'
            }).state('main.signed', {
                url: '/signed',
                templateUrl: 'views/customer_signed.html',
                controller: 'CustomerSigned'
            }).state('main.cusReview', {
                url: '/cusReview',
                templateUrl: 'views/review.html',
                controller: 'ReviewCusCtrl'
            }).state('main.tobReview', {
                url: '/tobReview',
                templateUrl: 'views/review.html',
                controller: 'ReviewTobCtrl'
            }).state('main.orderstob', {
                url: '/orderstob',
                templateUrl: 'views/orderList.html',
                controller: 'OrdersTob'
            }).state('main.dateremind', {
                url: '/dateremind',
                templateUrl: 'views/dateremind.html',
                controller: 'DateRemind'
            }).state('main.conchange', {
                url: '/conchange',
                templateUrl: 'views/conchange.html',
                controller: 'ConChange'
            }).state('main.newcus', {
                url: '/newcus',
                templateUrl: 'views/newcus.html',
                controller: 'NewCustomer'
            }).state('main.statis_paytype', {
                url: '/statis_paytype',
                templateUrl: 'views/statis_paytype.html',
                controller: 'StatisPaytype'
            }).state('main.fd_settings', {
                url: '/fd_settings',
                templateUrl: 'views/fd_settings.html',
                controller: 'FD_settings'
            }).state('main.fd_list', {
                url: '/fd_list',
                templateUrl: 'views/fd_aglist.html',
                controller: 'FD_AgentList'
            }).state('main.users_fq', {
                url: '/users_fq',
                templateUrl: 'views/users_fq.html',
                controller: 'Users_fq'
            }).state('main.order_outworker', {
                url: '/orders/outworker',
                templateUrl: 'views/order_outworker.html',
                controller: 'Order_outworker'
            })
            // .state('main.user_outworker', {
            //     url: '/user/outworker',
            //     templateUrl: 'views/user_outworker.html',
            //     controller: 'User_outworker'
            // })
            .state('main.outwork_dict', {
                url: '/user/outwork_dict',
                templateUrl: 'views/outwork_dict.html',
                controller: 'Outwork_dict'
            }).state('main.statis_proportion_c', {
                url: '/statis_proportion_c',
                templateUrl: 'views/statis_proportion_c.html',
                controller: 'StatisProportionC'
            }).state("main.go_task_config", {
                url: '/orders/go_task_config',
                templateUrl: 'views/go_task_config.html',
                controller: 'Gotaskconfig'
            }).state("main.recharge_apply", {
                url: '/orders/recharge_apply',
                templateUrl: 'views/recharge_apply.html',
                controller: 'RechargeApply'
            }).state("main.operateAccount", {
                url: '/operateAccount',
                templateUrl: 'views/operateAccount.html',
                controller: 'OperateAccount'
            }).state("main.waitSetAccount", {
                url: '/waitSetAccount',
                templateUrl: 'views/waitSetAccount.html',
                controller: 'WaitSetAccount'
            }).state("main.receipt", {
                url: '/receipt',
                templateUrl: 'views/receipt.html',
                controller: 'Receipt'
            }).state("main.makeAccount", {
                url: '/makeAccount',
                templateUrl: 'views/makeAccount.html',
                controller: 'MakeAccount'
            }).state('main.statis_orders', {
                url: '/statis_orders',
                templateUrl: 'views/statisOrders.html',
                controller: 'StatisOrders'
            }).state('main.statis_achieve', {
                url: '/statis_achieve',
                templateUrl: 'views/statisAchieve.html',
                controller: 'StatisAchieve'
            }).state('main.statis_newCustomers', {
                url: '/statis_newCustomers',
                templateUrl: 'views/statisNewCustomers.html',
                controller: 'StatisNewCustomers'
            }).state('main.statis_renew', {
                url: '/statis_renew',
                templateUrl: 'views/statisRenew.html',
                controller: 'StatisRenew'
            }).state('main.statis_ytOdersTozsOders', {
                url: '/statis_ytOdersTozsOders',
                templateUrl: 'views/statisYtOdersTozsOders.html',
                controller: 'StatisYtOdersTozsOders'
            }).state('main.statis_ZeroTonoZero', {
                url: '/statis_ZeroTonoZero',
                templateUrl: 'views/statisZeroTonoZero.html',
                controller: 'StatisZeroTonoZero'
            }).state('main.statis_companyType1To2', {
                url: '/statis_companyType',
                templateUrl: 'views/statisCompanyType.html',
                controller: 'StatisCompanyType'
            });
        $urlRouterProvider
            .when('/main/user', '/login')
            .otherwise('/login');


        $httpProvider.defaults.transformResponse.push(function(response, header, status) { //请求成功
            if (angular.isString(response)) {
                return response;
            }
            if (status == 401) {
                location.href = "#login"
                return;
            }

            return response;
        });

        function exceptUrl(url) {
            return url.indexOf('api/orders/companyname?name=') >= 0;
        }

        function exceptAlertUrl(url) {
            return url.indexOf('api/promotion/count') >= 0;
        }

        $httpProvider.interceptors.push(['$q', '$rootScope', function($q, $rootScope) {
            var ajaxCount = 0
            return {
                'request': function(config) {
                    if (exceptUrl(config.url)) return config;
                    ajaxCount++;
                    $rootScope.isLoading = true;
                    return config;
                },

                'response': function(response) {
                    if (exceptUrl(response.config.url)) return response;
                    ajaxCount--;
                    if (ajaxCount === 0)
                        $rootScope.isLoading = false;
                    if (angular.isObject(response.data) && !response.data.status) {
                        if (!exceptAlertUrl(response.config.url))
                            alert(response.data.message)
                    };
                    return response;
                },
                'responseError': function(rejection) {
                    ajaxCount--;
                    if (ajaxCount <= 0)
                        $rootScope.isLoading = false;
                    ajaxCount = 0;
                    return $q.reject(rejection);
                }
            };
        }]);
    }])
    .run(['$rootScope', '$state', '$locale', function($rootScope, $state, $locale) {
        $rootScope.$on('$stateChangeStart', function(event, toState) {

            if (toState.name === "main.users") {
                event.preventDefault();
                $state.go('main.users.usersList');
            }
        });
    }]).factory('showDetails', ['$uibModal', function($uibModal) {
        return function showDetails(message, title) {
            title = title || "消息";
            var modalInstance = $uibModal.open({
                templateUrl: "views/details.html",
                controller: ['$scope', '$sce', '$uibModalInstance', function($scope, $sce, $uibModalInstance) {
                    $scope.message = $sce.trustAsHtml(message);
                    $scope.title = title;
                    $scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    }

                }],
                backdrop: false,
                windowClass: 'toast-modal'
            });

            return modalInstance.result;
        };
    }]);
Date.prototype.toISOString = function() {
    var month = this.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    return [this.getFullYear(), month, this.getDate()].join('-')
};
Date.prototype.toString = function() {
    var month = this.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    return [this.getFullYear(), month, this.getDate()].join('-')
};
