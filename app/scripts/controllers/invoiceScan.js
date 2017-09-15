'use strict';

/**
 * @ngdoc function
 * @name channelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the channelApp
 */
angular.module('channelApp')
    .controller('InvoiceScanCtrl', ['$scope', '$filter', '$uibModalInstance', 'SelectedInvoice', 'InvoiceService', function ($scope, $filter, $uibModalInstance, SelectedInvoice, InvoiceService) {



        InvoiceService.getDetail({
            id: SelectedInvoice.id
        }).then(function(res){
            $scope.invoiceInfo = res.data;
        }).then(function(){
            /*InvoiceService.getAddress().then(function(res){
                if(res.data){
                    angular.forEach(res.data, function(item, key){
                        if(item.Id == $scope.invoiceInfo.AddressId){
                            $scope.invoiceInfo.addressMap = item.Address;
                        }
                    })
                }
            });*/

            InvoiceService.getInvoiceType().then(function(res){
                if(res){
                    angular.forEach(res, function(item, key){
                        if(item.Key == $scope.invoiceInfo.Project){
                            $scope.invoiceInfo.projectMap = item.Value;
                        }
                    })
                }
            });
        });

        $scope.dismiss = function(){
            $uibModalInstance.dismiss();
        };
     }]);


/*{
 AddressId
 :
 1
 Amount
 :
 20
 ApplyType
 :
 1
 Category
 :
 2
 ChannelId
 :
 "101101160505000005"
 CreateBy
 :
 "12"
 CreateDate
 :
 "2016/5/13 10:03:26"
 InvoiceBy
 :
 "嗡嗡嗡"
 InvoiceDate
 :
 "2016/5/12 0:00:00"
 InvoiceId
 :
 "1220160513000005"
 InvoiceNumber
 :
 "123321"
 ModifyBy
 :
 null
 ModifyDate
 :
 null
 Project
 :
 1
 Property
 :
 2
 ReceiveAddress: {
 Address
 :
 "撒嘎嘎风格的方式"
 CityCode
 :
 "110100"
 Email
 :
 "ddd"
 Id
 :
 1
 Mobile
 :
 "444"
 Name
 :
 "公司"
 PostCode
 :
 "123456"
 Receiver
 :
 "订单"
 }
}
* */
