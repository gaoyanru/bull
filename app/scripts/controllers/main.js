'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the channelApp
 */
angular.module('channelApp')
    .controller('MainCtrl', ['$scope', '$http', '$state', '$stateParams', '$uibModal', 'user', '$timeout', function($scope, $http, $state, $stateParams, $uibModal, user, $timeout) {
        $scope.user = user.get();
        $scope.noticelists = [];
        $scope.doclists = [];

        function sortFn(a, b) {
            return a.Rank > b.Rank;
        }
        $scope.curHeight = document.body.clientHeight - 60  + 'px'
        // $scope.curHeight = ($(document).height() - 60) + 'px'
        // $scope.rightcurHeight = ($(document).height() - 60) / 2 - 10 + 'px'
        $scope.rightcurHeight = (document.body.clientHeight - 60) / 2 - 10 + 'px'
        console.log($scope.curHeight, $scope.rightcurHeight)
        var navTreeModel = angular.fromJson($scope.user.FunctionList);
        navTreeModel = _.sortBy(navTreeModel,'Rank');
        navTreeModel.forEach(function(item) {
            item.children = item.children.sort(sortFn);
        });

        $scope.navTreeModel = navTreeModel;
        // nav tree options
        $scope.navTreeOptions = {
            nodeChildren: 'children',
            dirSelectable: false
        };

        // nav tree node selected
        $scope.routerChange = function(node) {
            $scope.selectedNavTree = node;
            if (node.url) {
                var params = node.params || {};
                $state.go(node.url.trim(), params, { inherit: false });
            }
        };

        //更改密码
        $scope.updatePswd = function() {
            var updateModal = $uibModal.open({
                templateUrl: 'views/updatePswd.html',
                controller: 'UpdatePswdCtrl'
            });

            updateModal.result.then(function(updateNode) {

            }, function() {
                console.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.logout = function() {
            $http.delete('/api/security/logout').then(function() {
                //sessionStorage.removeItem('user');
                sessionStorage.clear();
                location.href = "#/login";
            });
        };

        function findCurrentPath() {
            var route = $state.current.name;
            var uPath = getNodeByName($scope.navTreeModel, route);
            if (uPath.length === 0) {
                // $state.go('main');
                return;
            }
            $scope.selectedNavTree = uPath.pop();
            $scope.expandedNodes = uPath;

            function getNodeByName(tree, name) {
                var path = [];
                $.each(tree, function(index, node) {
                    if (!node) return true;
                    if (node.url === name) {
                        if (!node.hash) {
                            path.push(node);
                            return false;
                        } else if (node.hash == location.hash) {
                            path.push(node);
                            return false;
                        }

                    } else if (node.children) {
                        var temp = getNodeByName(node.children, name);
                        if (temp && temp.length) {
                            path.push(node);
                            path = path.concat(temp);
                            return false;
                        }

                    }
                });
                return path;
            }
        }

        findCurrentPath();

        function verifyBalance() {
            $http.get('/api/agent/alert').success(function(res) {
                if (+res.data < 1000) {
                    $scope.showBalanceWarning = true;
                } else {
                    $scope.showBalanceWarning = false;
                }
            });
            $timeout(verifyBalance, 1000 * 60 * 5);
        }
        if ($scope.user.IsCenter == 0) {
            verifyBalance();
        }

        // 首页路由
        $scope.goMainHtml = function () {
          console.log($state, '$state')
          $state.go('main');
        }
        // 获取公告列表
        function getNoticeLists() {
          var data = angular.extend({
              offset: 0,
              limit: 4,
              title: '',
              type: 1
          }, data);
          $http.get('/api/notice/getnoticelist?' + jQuery.param(data)).success(function(result) {
              $scope.noticelists = result.data;
              console.log($scope.noticelists)
          });
        }
        getNoticeLists()
        // 获取文档列表
        function getFileList() {
          var data = angular.extend({
              offset: 0,
              limit: 8,
              filename: '',
              type: 0
          }, data);
          $http.get('/api/doc/getdoclist?' + jQuery.param(data)).success(function(result) {
              $scope.doclists = result.data;
              console.log($scope.doclists)
          });
        }
        getFileList()
        // 公告列表
        $scope.goMoreNotice = function () {
          $state.go('main.noticelists')
        }
        // 公告详情
        $scope.noticeDetail = function (id) {
          console.log(id, 'id')
          $state.go('main.noticeDetail', { id: id });
        }
        // 下载文档
        $scope.download = function (id) {
          var url = 'api/doc/downloadfile?id=' + id
          window.open(url)
        }
        // 文档列表
        $scope.goMorefile = function () {
          $state.go('main.doclist')
        }
    }]);
