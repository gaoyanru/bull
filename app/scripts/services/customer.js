'use strict';

angular.module('channelApp').factory('CustomerService', ['$http', function($http) {

    return {
        cities: function(){
        	return $http.get("/api/citybychannel");
        },
        industry: function(){
        	return $http.get("/api/code/industry");
        },
        sales: function(){
        	return $http.get("/api/orders/sales");
        },
        save: function(data){
        	if(!data.CustomerId)
        		return $http.post('/api/customer',data);
        	else
        		return $http.put('/api/customer',data);
        },
        getCustomers: function(data){
        	return $http.get("/api/customer?" + jQuery.param(data));
        },
        custype: function(){
        	return $http.get('/api/customer/custype');
        },
        delete: function(id){
        	return $http.delete('/api/customer/' + id);
        },
        getCustomer_pub: function(data){
            return $http.get("/api/opencustomer?" + jQuery.param(data));
        },
        rob: function(cId,tId){
            return $http.put('/api/opencustomer/'+ cId + '/'+tId);
        },
        getTrack: function(cId){
            return $http.get("/api/customertrack/" + cId);
        },
        saveTrack: function(data){
            return $http.post('/api/customertrack',data);
        },
        trackDelete: function(id){
            return $http.delete('/api/customertrack/'+ id);
        },
        getSettings: function(id){
            return $http.get('/api/cuscategory?ChannelId='+id);
        },
        saveSettings: function(data){
            return $http.put('/api/cuscategory',data);
        },
        forward: function(cid,sid){
            return $http.put('/api/customer/'+cid+'/'+sid);
        },
        getCustomer_total: function(){
            return $http.get('/api/customerforchannel');
        },
        getCustomer_total_toc: function(){
            return $http.get('/api/customerforcenter');
        },
        getCustomersByDetail: function(data){
            return $http.get("/api/customerbycustype?" + jQuery.param(data));
        },
        getSignedCustomers: function(data){
            return $http.get("/api/customer/bill?" + jQuery.param(data));
        },
        getObNames: function(){
            return $http.get("/api/code/cusregister");
        },
        getObList: function(data){
            return $http.get("/api/cusregister?" + jQuery.param(data))
        },
        getObById: function(id){
            return $http.get("/api/cusregister/" + id);
        },
        deleteObById: function(id){
            return $http.delete("/api/cusregister/" + id);
        },
        getCustomerRemind: function(data){
            return $http.get("/api/signacontract?" + jQuery.param(data));
        },
        getCustomerChange: function(data){
            return $http.get("/api/signacontract/my?" + jQuery.param(data));
        }
    };
 }]);
