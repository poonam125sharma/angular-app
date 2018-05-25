
var app = angular.module("ToDoListApp",["ngRoute"]);

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
  }]);

app.config(function($routeProvider){
    $routeProvider
        .when("/",{
            templateUrl: "views/toDoTaskList.html",
            controller: "ToDoListTasksController"
        })
        .when("/addTask",{
            templateUrl: "views/addTask.html",
            controller: "ToDoListTasksController"
        })
        .when("/addTask/edit/:id",{
            templateUrl: "views/addTask.html",
            controller: "ToDoListTasksController"
        })
        .otherwise({
            redirectTo: "/"
        })
});

app.directive("taskList",function(){
    return {
        restrict:"E",
        templateUrl:"views/taskList.html"
    }
});

app.service("ToDoListService",function($http){
    var toDoListService = {};
    toDoListService.ListTasks = [];
    $http.get("data/data_source.json")
    .then(function(data){
        toDoListService.ListTasks = data.data;
        for(var item in toDoListService.ListTasks){
            toDoListService.ListTasks[item].date = new Date(toDoListService.ListTasks[item].date);
        }
    },function(data,status){
        alert("Things went wrong!");
    });

    toDoListService.getNewId = function(){
        if(toDoListService.newId)
        {
            toDoListService.newId++;
            return toDoListService.newId;
        }
        else{
            var maxId = _.max(toDoListService.ListTasks, function(entry){
                return entry.id;
            });
            toDoListService.newId = maxId.id + 1;
            return toDoListService.newId;
        }
    }

    toDoListService.getById = function(id) {
        for(Item in toDoListService.ListTasks)
        {
            if(toDoListService.ListTasks[Item].id === id)
            {
                return toDoListService.ListTasks[Item];
            }
        }
    }

    toDoListService.save = function(entry){
        var item = toDoListService.getById(entry.id);
        if(item)
        {
            item.completed = entry.completed;
            item.taskName = entry.taskName;
            item.date = new Date();
        }
        else{
            $http.post("data/added_task.json", entry)
                .then(function(data){
                    entry.id = data.data.newId;
                },function(){
                    alert("Something is wrong!");
                })
            //entry.id = toDoListService.getNewId();
            toDoListService.ListTasks.push(entry);
        }
    }

    toDoListService.markComplete = function(entry){
        entry.completed = !entry.completed;
    }

    toDoListService.remove = function(entry)
    {
        $http.post("data/delete_task.json",{id: entry.id})
            .then(function(data){
                if(data.data.status)
                {
                    var item = toDoListService.ListTasks.indexOf(entry);
                    toDoListService.ListTasks.splice(item,1);
                }
            },function(data){
                alert("Something is wrong!");
            })        
    }
    return toDoListService;
});

app.controller("HomeController",["$scope","ToDoListService",function($scope,ToDoListService)
{
    // $scope.appTitle = ToDoListService.ListTasks[0].itemName;
    $scope.appTitle = "To-Do List App";
}]);

app.controller("ToDoListTasksController",["$scope","$routeParams","$location","ToDoListService",function($scope,$routeParams,$location,ToDoListService)
{
    $scope.ListTasks = ToDoListService.ListTasks;
    if($routeParams.id)
    {       
        $scope.ListTask = _.clone(ToDoListService.getById(parseInt($routeParams.id)));
    }else{
        $scope.ListTask = {id:0,completed:false, itemName: '', date: new Date()}
    }
    $scope.save = function(){
        ToDoListService.save($scope.ListTask);
        $location.path('/');
    }
    $scope.remove = function(entry)
    {
        ToDoListService.remove(entry);
    }
    $scope.markComplete = function(entry){
        ToDoListService.markComplete(entry);
    }
    $scope.$watch(function(){ return ToDoListService.ListTasks;},function(ListTasks){
        $scope.ListTasks = ListTasks; 
    })
}]);