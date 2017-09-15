'use strict';
/**
 * @ngdoc function
 * @name channelApp.controller:AddOrderCtrl
 * @description
 * # AddOrderCtrl
 * Controller of the channelApp
 */
angular.module('channelApp').controller('Gotaskconfig', ['$scope', '$http', 'user', '$uibModal',
    function ($scope, $http, User, $uibModal) {
        $scope.user = User.get()

        refreshData()

        function refreshData() {
            $http.get('/api/commontask').success(function (res) {
                $scope.weights = _.uniq(_.pluck(res.data, 'CommonWeight'));
                $scope.tasksArr = formatData(res.data);
            });
        }

        function formatData(data) {
            var result = [];
            var last = {};
            _.each(data, function (item) {
                if (last.CommonTaskId !== item.CommonTaskId) {
                    last = _.pick(item, 'CommonTaskName', 'Status', 'CommonTaskId', 'CommonWeight');
                    last.TaskList = [_.pick(item, 'TaskName', 'OuterTaskId', 'Weight')];
                    result.push(last);
                } else {
                    last.TaskList.push(_.pick(item, 'TaskName', 'OuterTaskId', 'Weight'));
                }
            });
            return result;

        }
        $scope.add = function (item, $event, name) {
            $event.stopPropagation();
            $event.preventDefault();


            var modalInstance = $uibModal.open({
                templateUrl: 'views/go_task_config_view.html',
                controller: 'Gotaskconfig_add',
                size: 'lg',
                resolve: {
                    increased: function () {
                        return {
                            name: name,
                            weights: $scope.weights,
                            task: item || {}
                        }
                    }
                }
            });
            modalInstance.result.then(function (result) {
                refreshData();
            }, function () {

            });
        }
        $scope.ifuse = function ($event, item) {
            $event.stopPropagation();
            $event.preventDefault();
            if (item.Status == 1) {
                $http.put("/api/commontask/commontaskisstop?isstop=" + 2 + "&id=" + item.CommonTaskId).success(function (res) {
                    refreshData()
                })
            } else {
                $http.put("/api/commontask/commontaskisstop?isstop=" + 1 + "&id=" + item.CommonTaskId).success(function (res) {
                    refreshData()
                })
            }
        }

    }
]).controller('Gotaskconfig_add', ['$scope', '$http', '$uibModalInstance', '$uibModal', "increased", "user",
    function ($scope, $http, $uibModalInstance, $uibModal, increased, user) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        }
        $scope.title = increased.name;
        $scope.Math = Math;
        $scope.task = {
            Id: increased.task.CommonTaskId,
            CommonTaskName: increased.task.CommonTaskName,
            TaskList: increased.task.TaskList,
            Status: increased.task.Status,
            Weight: increased.task.CommonWeight
        };
        var orgWeight = $scope.task.Weight;
        $http.get('/api/outertasksub?taskname=&BusinessType=&status=0&offset=0&limit=10000').success(function (res) {
            $scope.Tasks = _.filter(res.data, {
                Status: 1
            });
            _.each(increased.task.TaskList, function (item) {
                var temp = _.find($scope.Tasks, {
                    Id: item.OuterTaskId
                });
                if (temp) {
                    temp._weight = item.Weight;
                    temp.checked = true;
                }
            });
        })

        $scope.checkWeight = function (n) {
            var subtasks = _.filter($scope.Tasks, {
                checked: true
            });
            var _arr = _.uniq(subtasks, function (t) {
                return t.Weight;
            });
            if (_arr.length < subtasks.length) {
                alert('请注意，权重不能重复!');
            }
        }
        $scope.ok = function () {
            var data = $scope.task;
            var subtasks = _.filter($scope.Tasks, {
                checked: true
            });
            subtasks = _.map(subtasks, function (t) {
                if (!$scope.task.Id) {
                    return {
                        Weight: t._weight,
                        OuterTaskId: t.Id
                    }
                } else {
                    return {
                        CommonTaskId: data.Id,
                        Weight: t._weight,
                        OuterTaskId: t.Id
                    }
                }

            });
            data.OutWorkerTasks = subtasks
            delete data.TaskList;
            //判断权重是否重复
            var w = $scope.task.Weight;
            var ws = increased.weights;
            if(w!==orgWeight && ws.indexOf(w)>-1){
               alert('通办任务权重不能重复！')
               return;
            }

            var _arr = _.uniq(subtasks, function (t) {
                return t.Weight;
            });
            if (_arr.length == subtasks.length) {
                if (!$scope.task.Id) {
                    $http.post("/api/commontask", data).success(function (res) {
                        $uibModalInstance.close();
                    })
                } else {
                    $http.put("/api/commontask", data).success(function (res) {
                        $uibModalInstance.close();
                    })
                }
            } else {
                alert("子任务权重不能重复！")
                return
            }

            // console.log(data);



        }


    }
])
