'use strict';

angular.module('channelApp').controller('StatisProportionC', ['$scope', '$http', '$filter', 'user', 'Excel', '$timeout', function ($scope, $http, $filter, user, Excel, $timeout) {
	$scope.isCenter = user.get().IsCenter;
	$scope.search1 = {
		year: '2017',
		months: ''
	};
	$scope.search2 = {
		year: '2017',
		months: ''
	};
	var now = new Date();
	$scope.months = [];
	for (var i = 1; i < 13; i++) {
		$scope.months.push({
			label: i,
			value: i < 10 ? ('0' + i) : i
		})
	}
	$scope.months2 = [];
	for (var i = 1; i < 13; i++) {
		$scope.months2.push({
			label: i,
			value: i < 10 ? ('0' + i) : i
		})
	}

	// $scope.params = {
	// 	getSelectedText: getSelectedText,
	// 	setSelectedText: setSelectedText,
	// 	selectedText: '全部'
	// }
	$scope.params2 = {
		getSelectedText: getSelectedText2,
		setSelectedText: setSelectedText2,
		selectedText: '全部'
	}

	// function getSelectedText() {
	// 	var cities = $scope.months;
	// 	var selected = _.filter(cities, {
	// 		selected: true
	// 	});
	// 	if (selected.length === cities.length || selected.length === 0) {
	// 		return '全部';
	// 	}
	// 	if (selected.length < 3) {
	// 		return _.map(selected, function (item) {
	// 			return item.label + '月';
	// 		}).join(',');
	// 	}
	//
	// 	return _.map(_.slice(selected, 0, 2), function (item) {
	// 		return item.label + '月';
	// 	}).join(',') + '等';
	// }

	// function setSelectedText(open) {
	// 	$scope.params.selectedText = getSelectedText();
	// }

	function getSelectedText2() {
		var cities = $scope.months2;
		var selected = _.filter(cities, {
			selected: true
		});
		if (selected.length === cities.length || selected.length === 0) {
			return '全部';
		}
		if (selected.length < 3) {
			return _.map(selected, function (item) {
				return item.label + '月';
			}).join(',');
		}

		return _.map(_.slice(selected, 0, 2), function (item) {
			return item.label + '月';
		}).join(',') + '等';
	}

	function setSelectedText2(open) {
		$scope.params2.selectedText = getSelectedText2();
	}
	// $scope.chart1 = {
	// 	config: {
	// 		showXAxis: true,
	// 		showYAxis: true,
	// 		showLegend: true,
	// 		stack: false,
	// 		width: 800,
	// 		height: 400,
	// 		grid: {
	// 			left: '3%',
	// 			right: '4%',
	// 			containLabel: true
	// 		},
	// 		tooltip: {
	// 			show: true,
	// 			trigger: 'axis',
	// 			axisPointer: {
	// 				type: 'cross',
	// 				snap: 'true'
	// 			},
	// 			formatter: '{b0}<br/>{a0}: {c0}%'
	// 		},
	// 		yAxis: {
	// 			type: 'value',
	// 			name: '占比',
	// 			min: 0,
	// 			max: 100,
	// 			position: 'left',
	// 			axisLabel: {
	// 				formatter: '{value}%'
	// 			},
	// 			axisLine: {
	// 				show: true
	// 			}
	// 		},
	// 		legend: {
	// 			bottom: 10
	// 		}
	// 	},
	// 	data: [{
	// 		name: '续费占比',
	// 		datapoints: []
	// 	}]
	// };
	$scope.chart2 = {
		config: {
			showXAxis: true,
			showYAxis: true,
			showLegend: true,
			stack: false,
			width: 800,
			height: 400,
			grid: {
				left: '3%',
				right: '4%',
				containLabel: true
			},
			tooltip: {
				show: true,
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					snap: 'true'
				},
				formatter: '{b0}<br/>{a0}: {c0}%<br />{a1}: {c1}%'
			},
			yAxis: {
				type: 'value',
				name: '占比',
				min: 0,
				max: 100,
				position: 'left',
				axisLabel: {
					formatter: '{value}%'
				},
				axisLine: {
					show: true
				}

			},
			legend: {
				bottom: 10
			}
		},
		data: [{
			name: '预提单占比',
			datapoints: []
		}, {
			name: '正式订单占比',
			datapoints: []
		}]
	};
	$scope.tab1Search = function () {
		// var selected = _.filter($scope.months, {
		// 	selected: true
		// });
		console.log($scope.months, '$scope.months')
		// var months = _.map(selected, 'value').join(',');
		console.log($scope.search1.months, 'months')
		if (!$scope.search1.months) {
			alert('请选择到期月份')
		} else {
			var params = {
				year: $scope.search1.year,
				months: $scope.search1.months,
				limit: 9999,
				offset: 0,
			}
			$http.get('/api/dataanalysis/renew?' + $.param(params)).success(function (res) {
				$scope.total1 = res.data.Total[0];
				$scope.data1 = res.data.DataInfo;
			})
		}
		// $http.get('/api/dataanalysis/renewchart?' + $.param(params)).success(function (res) {
		// 	var monthArr = _.map(selected, 'value');
		// 	if (monthArr.length === 0) {
		// 		for (var i = 1; i <= 12; i++) {
		// 			monthArr.push(i)
		// 		}
		// 	}
		// 	var data = res.data;
		// 	_.each(monthArr, function (item) {
		// 		if (!_.find(data, {
		// 				Months: +item
		// 			})) {
		// 			data.push({
		// 				Months: +item,
		// 				reNumRate: 0
		// 			})
		// 		}
		// 	})
		// 	data = _.sortBy(data, 'Months');
		//
		// 	$scope.chart1.data[0].datapoints = _.map(data, function (item) {
		// 		return {
		// 			x: item.Months + '月',
		// 			y: parseFloat(item.reNumRate)
		// 		}
		// 	});
		//
		// })
	}
	$scope.tab2Search = function () {
		var selected = _.filter($scope.months2, {
			selected: true
		});
		var months = _.map(selected, 'value').join(',');

		var params = {
			year: $scope.search2.year,
			months: months,
			limit: 9999,
			offset: 0,
		}
		$http.get('/api/dataanalysis/reneworofficial?' + $.param(params)).success(function (res) {
			$scope.total2 = res.data.Total[0];
			$scope.data2 = res.data.DataInfo;
		})
		$http.get('/api/dataanalysis/reneworofficialchart?' + $.param(params)).success(function (res) {
			var monthArr = _.map(selected, 'value');
			if (monthArr.length === 0) {
				for (var i = 1; i <= 12; i++) {
					monthArr.push(i)
				}
			}
			var data = res.data;
			_.each(monthArr, function (item) {
				if (!_.find(data, {
						currMonth: +item
					})) {
					data.push({
						currMonth: +item,
						preOrderRate: 0,
						zsRate: 0
					})
				}
			})
			data = _.sortBy(data, 'currMonth');
			$scope.chart2.data[0].datapoints = _.map(data, function (item) {
				return {
					x: item.currMonth + '月',
					y: parseFloat(item.preOrderRate)
				}
			});
			$scope.chart2.data[1].datapoints = _.map(data, function (item) {
				return {
					x: item.currMonth + '月',
					y: parseFloat(item.zsRate)
				}
			});
		})
	}
	$scope.export = function () {
		// var selected = _.filter($scope.months1, {
		// 	selected: true
		// });
		// var months = _.map(selected, 'value').join(',');
		var months = $scope.search1.months
		console.log('/api/download/renewdetail?year=' + $scope.search1.year +
			'&months=' + months + '&ccodes=&channelname=');
		window.open('/api/download/renewdetail?year=' + $scope.search1.year +
			'&months=' + months + '&ccodes=&channelname=');
	}
	$scope.dataExport1 = function () {
		var exportHref = Excel.tableToExcel('#table1', '续费订单占比');
		$timeout(function () {
			window.open(exportHref)
		}, 100); // trigger download
		// var selected = _.filter($scope.months, {
		// 	selected: true
		// });
		// var months = _.map(selected, 'value').join(',');
		//
		// var params = {
		// 	year: $scope.search1.year,
		// 	months: months
		// };
		// const url = '/api/download/newtorenew?' + $.param(params);
		// window.open(url)
	}
	$scope.dataExport2 = function () {
		var exportHref = Excel.tableToExcel('#table2', '预提单与正式订单占比');
		$timeout(function () {
			window.open(exportHref)
		}, 100); // trigger download
		// var selected = _.filter($scope.months2, {
		// 	selected: true
		// });
		// var months = _.map(selected, 'value').join(',');
		//
		// var params = {
		// 	year: $scope.search2.year,
		// 	months: months
		// };
		// const url = '/api/download/reneworofficial?' + $.param(params);
		// window.open(url)
	}
	// $scope.tab1Search();
	$scope.tab2Search();
}]);
