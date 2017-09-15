(function () {
	angular.module('channelApp').controller('CustomerTotalToC', ['$scope', '$http', 'Excel', '$timeout', function ($scope, $http, Excel, $timeout) {
		// var start = new Date();
		// var end = new Date();
		// start.setDate(0);
		// start.setDate(1);
		// end.setDate(0);

		$scope.search1 = {
			starttime: '',
			endtime: ''
		};
		$scope.search2 = {
			starttime: '',
			endtime: ''
		};

		$scope.tab1Search = function () {
			var params = _.extend({
				limit: 9999,
				offset: 0,
			}, $scope.search1);
			if (_.isDate(params.starttime)) params.starttime = params.starttime.toISOString();
			if (_.isDate(params.endtime)) params.endtime = params.endtime.toISOString();
			$http.get('/api/newcustomer?' + $.param(params)).success(function (res) {
				$scope.total1 = res.data.Total[0];
				$scope.data1 = res.data.DataInfo;
				// console.log($scope.data1.length, 'length')
			})
		}
		$scope.tab2Search = function () {
			var params = _.extend({
				limit: 9999,
				offset: 0,
			}, $scope.search2);
			if (_.isDate(params.starttime)) params.starttime = params.starttime.toISOString();
			if (_.isDate(params.endtime)) params.endtime = params.endtime.toISOString();
			$http.get('/api/dataanalysis/notrenewstatistics?' + $.param(params)).success(function (res) {
				$scope.total2 = res.data.Total[0];
				$scope.data2 = res.data.DataInfo;
			})
		}
		$scope.tab1Search();
		$scope.tab2Search();
		$scope.export = function () {
			var starttime = _.isDate($scope.search2.starttime) ? $scope.search2.starttime.toISOString() : $scope.search2.starttime;
			var endtime = _.isDate($scope.search2.endtime) ? $scope.search2.endtime.toISOString() : $scope.search2.endtime;

			window.open('/api/download/notrenewdetail?starttime=' + starttime +
				'&endtime=' + endtime + '&ccodes=&channelname=');
		}
		// $scope.dataExport1 = function(){
		//     console.log('/api/download/notrenewdetail?starttime='+$scope.search2.starttime.toISOString()+
		//         '&endtime='+$scope.search2.endtime.toISOString()+'&ccodes=&channelname=');
		//     window.open('/api/download/notrenewdetail?starttime='+$scope.search2.starttime.toISOString()+
		//         '&endtime='+$scope.search2.endtime.toISOString()+'&ccodes=&channelname=');
		// }
		$scope.dataExport1 = function () {
			var exportHref = Excel.tableToExcel('#table1', '新增客户统计');
			$timeout(function () {
				window.open(exportHref)
			}, 100); // trigger download
		}
		$scope.dataExport2 = function () {

			var exportHref = Excel.tableToExcel('#table2', '到期未续费客户统计');
			$timeout(function () {
				window.open(exportHref)
			}, 100); // trigger download
			// var params = {
			// 	starttime: '',
			// 	endtime: '',
			// 	ccodes: '',
			// 	channelname: ''
			// };
			// if (_.isDate(params.starttime)) params.starttime = params.starttime.toISOString();
			// if (_.isDate(params.endtime)) params.endtime = params.endtime.toISOString();
			// const url = '/api/download/notrenewstatistics?' + $.param(params);
			// window.open(url)
		}
	}]);
})(angular);
