'use strict';
angular.module('channelApp').controller('AgentListCtrl', ['$scope', '$http', '$state', '$uibModal', 'user', function ($scope, $http, $state, $uibModal, user) {
    $scope.isCenter = user.get().IsCenter;
    $scope.user = user.get();
    $scope.status = 0
    $scope.addAgent = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/agentModal.html',
            controller: 'agentCtrlModal',
            size: "lg",
            resolve: {
                agent: function () {
                    return null;
                },
                title: function() {
                  return '申请下级代理商'
                }
            },
            backdrop: 'static'
        });

        modalInstance.result.then(function (result) {
            refreshData();
        }, function () {

        });
    };

    //$scope.data = formateData(result);
    $scope.modify = function (row) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/agentModal.html',
            controller: 'agentCtrlModal',
            size: "lg",
            resolve: {
                agent: function () {
                    return row;
                },
                title: function() {
                  return '修改下级代理商'
                }
            },
            backdrop: 'static'
        });

        modalInstance.result.then(function (result) {
            refreshData();
        }, function () {

        });
    }

    $scope.remove = function (id) {

        if (confirm("确认删除?")) {
            $http.delete('/api/agent/' + id).success(function () {
                refreshData();
            })
        }
    };

    $scope.pass = function (item, status) {
        if (status == 1) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/userPassword.html',
                backdrop: 'static',
                controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                    $scope.item = item;
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                    $scope.ok = function () {
                        $scope.submited = true;
                        if ($scope.agForm.$error.required) {
                            alert('请补充必填项。');
                            return;
                        }
                        if ($scope.agForm.$error.pattern) {
                            alert("请输入有效的用户名");
                            return;
                        }
                        $uibModalInstance.close($scope.item);
                    }
                }]
            });
            modalInstance.result.then(function (result) {
                pass(result, status).success(function () {
                    refreshData();
                });
            }, function () {

            });
        } else {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/rejectModal.html',
                controller: 'agRejectModalCtrl'
            });
            modalInstance.result.then(function (reason) {
                item.Desc = reason;
                pass(item, status).success(function () {
                    refreshData();
                });
            }, function () {

            });
        }
    }
    // $scope.showReason = function (reason) {
    //     var modalInstance = $uibModal.open({
    //         templateUrl: 'views/messageModal.html',
    //         controller: 'messageModalCtrl',
    //         resolve: {
    //             message: function () {
    //                 return reason;
    //             }
    //         }
    //     });
    //     modalInstance.result.then(function (reason) {
    //         item.Desc = reason;
    //         pass(item, status).success(function () {
    //             refreshData();
    //         });
    //     }, function () {
    //
    //     });
    // };


    /*
     * paginator
     * */
    $scope.paginator = {
        total: 0,
        currentPage: 1,
        perPage: 10,
        userName: '',
        previousText: '上一页',
        nextText: '下一页',
        lastText: '最后一页',
        firstText: '首页'
    };

    $scope.pageChanged = function () {
        refreshData();
    };
    $scope.setCurrentPage = function () {
        $scope.paginator.currentPage = $scope.currentPage;
        $scope.pageChanged();
    };

    function pass(data, status) {
        data.status = status;
        data = angular.extend(data);
        delete data.cols;
        return $http.put('/api/checkagent/' + data.ChannelId, data);
    }

    function refreshData() {
        var url;
        var params = {
            limit: $scope.paginator.perPage,
            offset: $scope.paginator.perPage * ($scope.paginator.currentPage - 1),
            channelname: $scope.channelname,
            status: $scope.status
        }
        $http.get("/api/agents?" + jQuery.param(params)).success(function (result) {
            $scope.paginator.total = result.Count;
            $scope.data = result.data;
        })
    }
    refreshData();

}]).controller('agentCtrlModal', ['$scope', '$http', '$uibModalInstance', 'agent', 'FileUploader', 'user', '$filter', 'title', function ($scope, $http, $uibModalInstance, agent, FileUploader, user, $filter, title) {
    $scope.item = agent || {};
    console.log($scope.item, '$scope.item')
    $scope.title= title
    $scope.isCenter = user.get().IsCenter;
    if ($scope.item.ChannelId) {
        $http.get('/api/agent/' + $scope.item.ChannelId).success(function (result) {
            $scope.item = result.data[0];
            $scope.item.IsFetation = "" + $scope.item.IsFetation;
        });
    }
    $http.get("/api/code/city").success(function (data) {
        $scope.cities = data.data;
    });
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.isModal = true;

    $scope.ok = function () {
        $scope.submited = true;
        if ($scope.loading) return;
        if ($scope.agForm.$error.required) {
            alert('请补充必填项。');
            return;
        }
        if ($scope.agForm.$error.pattern) {
            alert("请输入有效的用户名");
            return;
        }
        if (!$scope.item.ChannelId) {
            $http.post('/api/agent', $scope.item).success(function (result) {
                if (result.status) $uibModalInstance.close('');
            });
        } else {
            $scope.loading = true;
            delete $scope.item.PassWrod;
            delete $scope.item.UserName;
            delete $scope.item.Balance;
            delete $scope.item.CityName;
            delete $scope.item.CreateDate;
            delete $scope.item.ModifyBy;
            delete $scope.item.ModifyDate;
            delete $scope.item.ParentId;
            delete $scope.item.Status;
            delete $scope.item.ProvinceName;
            $http.put('/api/agent/' + $scope.item.ChannelId, $scope.item).success(function (result) {
                if (result.status) $uibModalInstance.close('');
            });
        }
    };
    var uploadUrl = 'https://pilipa.oss-cn-beijing.aliyuncs.com';

    $http.get('/api/signkey').success(function (res) {
        delete res.data.Filename;
        delete res.data.key;
        delete res.data.callback;
        delete res.data.expire;
        delete res.data.Host;
        $scope.signkey = res.data;
    });

    $scope.uploader1 = new FileUploader({
        url: uploadUrl,
        autoUpload: true
    });
    $scope.uploader1.onErrorItem = uploadError;
    $scope.uploader1.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.item.IdCard = uploadUrl + '/' + $scope._key1;
    };
    $scope.uploader1.onBeforeUploadItem = function (item) {
        bindFormData(item, 1);
    };

    $scope.uploader2 = new FileUploader({
        url: uploadUrl,
        autoUpload: true
    });
    $scope.uploader2.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.item.Aptitude = uploadUrl + '/' + $scope._key2;
    };
    $scope.uploader2.onBeforeUploadItem = function (item) {
        bindFormData(item, 2);
    };
    $scope.uploader2.onErrorItem = uploadError;

    $scope.uploader3 = new FileUploader({
        url: uploadUrl,
        autoUpload: true
    });
    $scope.uploader3.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.item.Documents = uploadUrl + '/' + $scope._key3;
    };
    $scope.uploader3.onErrorItem = uploadError;
    $scope.uploader3.onBeforeUploadItem = function (item) {
        bindFormData(item, 3);
    };

    // $scope.uploader4 = new FileUploader({
    //     url: uploadUrl,
    //     autoUpload: true
    // });
    // $scope.uploader4.onCompleteItem = function (fileItem, response, status, headers) {
    //     $scope.item.Documents2 = uploadUrl + '/' + $scope._key4;
    // };
    // $scope.uploader4.onErrorItem = uploadError;
    // $scope.uploader4.onBeforeUploadItem = function (item) {
    //     bindFormData(item, 4);
    // };

    // $scope.uploader5 = new FileUploader({
    //     url: uploadUrl,
    //     autoUpload: true
    // });
    // $scope.uploader5.onCompleteItem = function (fileItem, response, status, headers) {
    //     $scope.item.Documents3 = uploadUrl + '/' + $scope._key5;
    // };
    // $scope.uploader5.onBeforeUploadItem = function (item) {
    //     bindFormData(item, 5);
    // };
    // $scope.uploader5.onErrorItem = uploadError;

    function bindFormData(item, up) {
        var key = buildKey(4, item.file.name);
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
        var nowstr = $filter('date')(new Date(), 'yyyyMM');
        var g_object_name = typMap[type] + nowstr + '/' + random_string(10) + suffix;
        return g_object_name;
    }

    function uploadError(item) {
        alert('上传失败!');
    }

}]).controller('agentCtrl', ['$scope', '$http', '$state', 'FileUploader', 'user','$filter', function ($scope, $http, $state, FileUploader, user,$filter) {
    $scope.item = {};
    $scope.isCenter = user.get().IsCenter;
    $http.get("/api/code/city").success(function (data) {
        $scope.cities = data.data;
    });

    $scope.ok = function () {
        $scope.submited = true;
        if ($scope.loading) return;
        if ($scope.agForm.$error.required) {
            alert('请补充必填项。');
            return;
        }
        if ($scope.agForm.$error.pattern) {
            alert("请输入有效的用户名");
            return;
        }
        $scope.loading = true;
        $http.post('/api/agent', $scope.item).success(function (result) {
            if (result.status) $state.go('^.agent');
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
    });

    $scope.uploader1 = new FileUploader({
        url: uploadUrl,
        autoUpload: true
    });
    $scope.uploader1.onErrorItem = uploadError;
    $scope.uploader1.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.item.IdCard = uploadUrl + '/' + $scope._key1;
    };
    $scope.uploader1.onBeforeUploadItem = function (item) {
        bindFormData(item, 1);
    };

    $scope.uploader2 = new FileUploader({
        url: uploadUrl,
        autoUpload: true
    });
    $scope.uploader2.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.item.Aptitude = uploadUrl + '/' + $scope._key2;
    };
    $scope.uploader2.onBeforeUploadItem = function (item) {
        bindFormData(item, 2);
    };
    $scope.uploader2.onErrorItem = uploadError;

    $scope.uploader3 = new FileUploader({
        url: uploadUrl,
        autoUpload: true
    });
    $scope.uploader3.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.item.Documents = uploadUrl + '/' + $scope._key3;
    };
    $scope.uploader3.onErrorItem = uploadError;
    $scope.uploader3.onBeforeUploadItem = function (item) {
        bindFormData(item, 3);
    };

    // $scope.uploader4 = new FileUploader({
    //     url: uploadUrl,
    //     autoUpload: true
    // });
    // $scope.uploader4.onCompleteItem = function (fileItem, response, status, headers) {
    //     $scope.item.Documents2 = uploadUrl + '/' + $scope._key4;
    // };
    // $scope.uploader4.onErrorItem = uploadError;
    // $scope.uploader4.onBeforeUploadItem = function (item) {
    //     bindFormData(item, 4);
    // };

    // $scope.uploader5 = new FileUploader({
    //     url: uploadUrl,
    //     autoUpload: true
    // });
    // $scope.uploader5.onCompleteItem = function (fileItem, response, status, headers) {
    //     $scope.item.Documents3 = uploadUrl + '/' + $scope._key5;
    // };
    // $scope.uploader5.onBeforeUploadItem = function (item) {
    //     bindFormData(item, 5);
    // };
    // $scope.uploader5.onErrorItem = uploadError;

    function bindFormData(item, up) {
        var key = buildKey(4, item.file.name);
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
        var nowstr = $filter('date')(new Date(), 'yyyyMM');
        var g_object_name = typMap[type] + nowstr + '/' + random_string(10) + suffix;
        return g_object_name;
    }
    function uploadError(item) {
        alert('上传失败!');
    }
}]).controller('agRejectModalCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
    $scope.item = {
        reason: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function () {
        $uibModalInstance.close($scope.item.reason);
    };
}]).controller('messageModalCtrl', ['$scope', '$uibModalInstance', 'message', function ($scope, $uibModalInstance, message) {
    $scope.message = message;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function () {
        $uibModalInstance.close($scope.item.reason);
    };
}]);
