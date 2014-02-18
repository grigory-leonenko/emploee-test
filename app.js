var app = angular.module('requester', [ 'googlechart' ]);

app.service('Api', ['$http', '$q', function($http, $q){
    this.getData = function(start, end){
        var defer = $q.defer();
        /* Errors check*/
        $http({method: 'GET', url: 'http://hits-data.eu01.aws.af.cm/data/' + start + '/' + end + '/'})
            .success(function (data, status, headers, config) {
                defer.resolve({data: data, status: status, headers: headers, config: config});
        })
            .error(function (data, status, headers, config) {
                defer.reject({data: data, status: status, headers: headers, config: config});
        });
        return defer.promise;
    };
}]);

app.service('DataService', ['Api', function(Api){
    this.data = [];
    this.loadData = function(start, end){
        Api.getData(start, end).then(function($result){
            this.data = [];
            var cleared = $result.data.replace('([', '').replace('])', '').replace(/[\[\]']+/g,'').split(',');
            for (var i = 0; i < cleared.length / 2; i++){
                var time = parseInt(cleared[i*2]);
                var requests = parseInt(cleared[i*2+1]);
                this.data.push([time, requests]);
            };
        }.bind(this));
    };
}]);

app.controller('ParamsCtrl', ['DataService', '$scope', function(DataService, $scope){
    $scope.send = function(start, end){
        DataService.loadData(start, end);
    };
}]);

app.controller('Chart', ['DataService', '$scope', function(DataService, $scope){

    $scope.chart = {
        type: 'ColumnChart',
        cssStyle: "height:400px; width:600px; top: 100px;",
        options: {
            title: 'Requests in time',
            hAxis: {title: 'Time', titleTextStyle: {color: 'red'}}
        }
    };

    $scope.$watch(function(){
        return DataService.data;
    },function(newVal){
        if(newVal.length == 0) return;
        $scope.chart.data = [['Time', 'Requests']];
        for (var i in newVal){
            $scope.chart.data.push(newVal[i]);
        };
    });
}]);

