'use strict'

AppServices.Controllers.controller('PageCtrl',
  [ 'data',
    'ug',
    'utility',
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$q',
    '$route', function (data,
                     ug,
                     utility,
                     $scope,
                     $rootScope,
                     $location,
                     $routeParams,
                     $q,
                     $route) {


  //$rootScope.urls()... will determine which URL should be used for a given environment
  $scope.use_sso = false;


  $rootScope.urls = function(){
    var BASE_URL = '';
    var DATA_URL = '';
    if($location.host() === 'appservices.apigee.com' && location.pathname.indexOf('/dit') >= 0){
      //DIT
      BASE_URL = 'https://accounts.jupiter.apigee.net';
      DATA_URL = 'http://apigee-internal-prod.jupiter.apigee.net';
      $scope.use_sso = true;
    }else if($location.host() === 'appservices.apigee.com' && location.pathname.indexOf('/mars') >= 0 ){
      //staging
      BASE_URL = 'https://accounts.mars.apigee.net';
      DATA_URL = 'http://apigee-internal-prod.mars.apigee.net';
      $scope.use_sso = true;
    }else if($location.host() === 'apigee.com'){
      //prod
      BASE_URL = 'https://accounts.apigee.com';
      DATA_URL = 'https://api.usergrid.com';
      $scope.use_sso = true;
    }else if($location.host() === 'usergrid.dev'){
      //development
      DATA_URL = 'https://api.usergrid.com';
    }else{
      DATA_URL = Usergrid.apiUrl;
    }

    return {
      DATA_URL: DATA_URL,
      LOGIN_URL: BASE_URL + '/accounts/sign_in',
      PROFILE_URL: BASE_URL + '/accounts/my_account',
      LOGOUT_URL: BASE_URL + '/accounts/sign_out'
    }
  }

  //used in users
  $rootScope.gotoPage = function(path){
    $location.path(path);
  }

  //called in ng-init on main index page (first method called at app startup and every main navigation)
  $scope.verifyUser = function(){

    //avoid polluting our target route with login path
    if($location.path().slice(0,'/login'.length) !== '/login'){
      $rootScope.currentPath = $location.path();
      //show loading screen during verify process
//      $location.path('/login/loading');
    }


    //first check to see if there is a token in the query string, if so, save it
    if ($routeParams.access_token && $routeParams.admin_email && $routeParams.uuid) {

      ug.client().set('token', $routeParams.access_token);
      ug.client().set('email', $routeParams.admin_email);
      ug.client().set('uuid', $routeParams.uuid);

    }

    //use a promise so we can update afterwards in other UI areas
    $scope.deferredLogin = $q.defer();

    //next try to quick login
    ug.client().reAuthenticateLite(function(err) {
      if(err && !$scope.use_sso){
        //there was an error on re-auth lite, immediately send to login
        ug.client().logout();
        $location.path('/login');
        if(!$scope.$$phase) {
          $scope.$apply();
        }
        //if any key info is missing, call the full auth method
      } else if (!ug.client().get('orgName') ||
                 !ug.client().get('appName') ||
                 !ug.client().getObject('organizations') ||
                 !ug.client().getObject('applications')) {

        var email = ug.client().get('email');

        if(!email && $scope.use_sso){
          window.location = $rootScope.urls().LOGIN_URL + '?callback=' + encodeURIComponent($location.absUrl());
        }

          ug.client().reAuthenticate(email, function(err, data, user, organizations, applications) {
            if (err) {
              //user is not authenticated, send to SSO if enabled
              if ($scope.use_sso) {
                //go to sso
                window.location = $rootScope.urls().LOGIN_URL + '?callback=' + encodeURIComponent($location.absUrl());
              } else {
                //go to login page
                ug.client().logout();
                $location.path('/login');
                if(!$scope.$$phase) {
                  $scope.$apply();
                }
              }
            } else {
              //the user is authenticated
              $rootScope.$broadcast('loginSuccesful',  user, organizations, applications);
              $rootScope.$emit('loginSuccesful',  user, organizations, applications);
              if(!$scope.$$phase) {
                $scope.$apply(function(){
                  $scope.deferredLogin.resolve();
                  $location.path('/getting-started/setup');});
              }else{
                $scope.deferredLogin.resolve();
                $location.path('/getting-started/setup');
              }
            }
          });

//        }
      }
      else {
        //all is well - repopulate objects
        $rootScope.userEmail = ug.client().get('email');
        $rootScope.organizations = ug.client().getObject('organizations');
        $rootScope.applications = ug.client().getObject('applications');
        $rootScope.currentOrg = ug.client().get('orgName');
        $rootScope.currentApp = ug.client().get('appName');

        if(!$scope.use_sso){
          //get the current user data
          ug.getCurrentUser(function(data){
            $rootScope.currentUser = data.data;
            $rootScope.currentUser.profileImg = utility.get_gravatar($rootScope.currentUser.email);
          });
        }

        //boolean defines is top level ui menus/buttons should be active/shown
        $rootScope.activeUI = true;

        if(!$scope.$$phase) {
          $scope.$apply(function(){$scope.deferredLogin.resolve();});
        }else{
          $scope.deferredLogin.resolve();
        }

      }
    });

  }

  //verify on every route change
  $scope.$on('$routeChangeSuccess', function () {
    //todo possibly do a date check here for token expiry
    //so we don't call this on every nav change
    $scope.verifyUser();
    $scope.showDemoBar = $location.path().slice(0,'/performance'.length) === '/performance';
  });


  //called from top-level menu when changing apps
  $rootScope.appChange = function(newApp){
    ug.client().set('appName', newApp);
    $rootScope.currentApp = newApp;
    if($rootScope.demoData){
      $rootScope.demoData = false;
    }

  }

    $scope.autoUpdate = null;
    $scope.timerUpdate = null;
    $scope.autoUpdateTimer = 31;
    var keepgoing = true;
    var currentSecond;

    $scope.toggleAutoUpdate = function(){
      //set auto update interval
//      $scope.autoUpdateTimer = 31;
      var isPerformancePage = $location.path().slice(0,'/performance'.length) === '/performance';

      function animate() {
        if(keepgoing && isPerformancePage){
          requestAnimFrame( animate );
          draw();
        }
      }

      function draw() {
        if(!$scope.$$phase && currentSecond !== new Date().getSeconds() ){
          $scope.$apply(function() {
            $scope.autoUpdateTimer--;
            if($scope.autoUpdateTimer === 0){
              var refreshts = new Date();
              $routeParams.ts = refreshts.getTime();
              $scope.autoUpdateTimer = 30;
            }
          });
          currentSecond = new Date().getSeconds();
        }
      }

      if(!$scope.autoUpdate && isPerformancePage){
        console.log('start timers')
        $scope.autoUpdate = true;
        keepgoing = true;
        animate();

      }else{
        keepgoing = false;
        $scope.autoUpdate = null;
      }

    };

    //turn it on on first load
    $scope.toggleAutoUpdate();

    $rootScope.sdkActive = false;
    $rootScope.demoData = false;

    $scope.toggleDemoData = function(){
      $rootScope.demoData = !$rootScope.demoData;
    }

    $rootScope.$watch('demoData',function(value,oldvalue){
      if(value !== oldvalue){
        if(value){
//          if(angular.uppercase($rootScope.currentApp) !== 'SANDBOX'){
//            $rootScope.appChange('Sandbox');
//          }
          $routeParams.demo = 'true';
          $location.search('demo', 'true');
          $rootScope.demoData = true;
        }else{
          $routeParams.demo = 'false';
          $location.search('demo', 'false');
          $rootScope.demoData = false;
        }
        $route.reload();
      }
    });

    //only on first load, check for url param to show demo data by default
    if($location.search().demo === 'true'){
      $rootScope.demoData = true;
    }

    //      ------------------- I need help email


    $scope.showHelpButton = true;

    $scope.iNeedHelp = function(){
      data.jsonp_raw('apigeeuihelpemail', '', {useremail:$rootScope.userEmail}).then(function(data){
        $rootScope.$broadcast('alert', 'success', 'Email sent. Our team will be in touch with you shortly.');
        $scope.showHelpButton = false;
      },function(rejectedData){
        $rootScope.$broadcast('alert', 'error', 'Problem Sending Email. Try sending an email to mobile@apigee.com.');
      });


    }

    $scope.profile = function(){
      if($scope.use_sso){
        window.location = $rootScope.urls().PROFILE_URL + '?callback=' + encodeURIComponent($location.absUrl());
      }else{
        $location.path('/profile')
      }

    }

    $scope.showModal = function(id){
      $('#' + id).modal('show')
    }

    $scope.hideModal = function(id){
      $('#' + id).modal('hide')
    }

    //adding this here for now
    //todo - create a controller for usergrid functionality where all UG pages inherit
    $scope.deleteEntities = function(collection, successBroadcast, errorMessage) {
      collection.resetEntityPointer();
      var entitiesToDelete = []
      while(collection.hasNextEntity()) {
        var entity = collection.getNextEntity();
        var checked = entity.checked;
        if(checked){
          entitiesToDelete.push(entity);
        }
      }
      for(var i=0; i<entitiesToDelete.length; i++) {
        var entity = entitiesToDelete[i];
        collection.destroyEntity(entity, function(err){
          if(err){
            $rootScope.$broadcast('alert', 'error', errorMessage);
          }
          $rootScope.$broadcast(successBroadcast);
          if(!$scope.$$phase) {
            $scope.$apply();
          }
        });
      }
    }

    $scope.getPerm = '';
    $scope.postPerm = '';
    $scope.putPerm = '';
    $scope.deletePerm = '';

    $scope.createPermission = function(type, entity, path, permissions) {
      //e.g.: "get,post,put:/mypermission"
//      var path = $scope.path;

      if(path.charAt(0) != '/') {
        path = '/'+path;
      }
      var ops = "";
      var s = "";
      if (permissions.getPerm) {
        ops = "get";
        s = ",";
      }
      if (permissions.postPerm) {
        ops = ops + s + "post";
        s = ",";
      }
      if (permissions.putPerm) {
        ops =  ops + s + "put";
        s = ",";
      }
      if (permissions.deletePerm) {
        ops =  ops + s + "delete";
        s = ",";
      }
      var permission = ops + ":" + path;

      return permission
    };

    $scope.usersTypeaheadValues = [];
    $scope.$on('users-typeahead-received', function(event, users) {
      $scope.usersTypeaheadValues = users;
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.groupsTypeaheadValues = [];
    $scope.$on('groups-typeahead-received', function(event, groups) {
      $scope.groupsTypeaheadValues = groups;
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.rolesTypeaheadValues = [];
    $scope.$on('roles-typeahead-received', function(event, roles) {
      $scope.rolesTypeaheadValues = roles;
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });


    $scope.newApplicationDialog = function(modalId){
      //todo: put more validate here
      $scope.createNewApp();

      $scope.hideModal(modalId);
    };

    $scope.createNewApp = function(){
      if ($scope.newAppName) {
        ug.createApplication($scope.newAppName);
        $rootScope.$broadcast('alert', 'info', 'New application "' + $scope.newAppName + '" created!');
//        $rootScope.currentApp = $scope.newAppName;
        $rootScope.appChange($scope.newAppName)
        $scope.newAppName = '';
        $location.path('/getting-started/setup')

      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a name.');
      }
    }

  }]);

