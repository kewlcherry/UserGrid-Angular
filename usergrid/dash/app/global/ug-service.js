AppServices.Services.factory('ug', function (configuration, $rootScope) {

  return {

    logoutCallback: function() {
      $rootScope.$broadcast('userNotAuthenticated');
//      client().logout();

    },
    client: function(){return new Usergrid.Client({
      buildCurl:true,
      logging:true
    },$rootScope.urls().DATA_URL)},
    getTopCollections: function () {
      var options = {
        method:'GET',
        endpoint: ''
      }
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting '+type);
        } else {
          var collections = data.entities[0].metadata.collections;
          $rootScope.$broadcast('top-collections-received', collections);
        }
      });
    },
    createCollection: function (collectionName) {
      var collections = {};
      collections[collectionName] = {};
      var metadata = {
        metadata: {
          collections: collections
        }
      }
      var options = {
        method:'PUT',
        body: metadata,
        endpoint: ''
      }
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error creating collection');
        } else {
          console.log(data)
//          collections = data.entities[0].metadata.collections;
          $rootScope.$broadcast('collection-created', collections);
        }
      });
    },
    getApplications: function () {
      this.client().getApplications(function (err, applications) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting applications');
        }
        $rootScope.$broadcast('applications-received', applications);
      });
    },
    getAdministrators: function () {
      this.client().getAdministrators(function (err, administrators) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting administrators');
        }
        $rootScope.$broadcast('administrators-received', administrators);
      });
    },
    createApplication: function (appName) {
      this.client().createApplication(appName, function (err, applications) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error creating application');
        }
        $rootScope.$broadcast('applications-received', applications);
      });
    },
    createAdministrator: function (adminName) {
      this.client().createAdministrator(adminName, function (err, administrators) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error creating administrator');
        }
        $rootScope.$broadcast('administrators-received', administrators);
      });
    },
    getFeed: function () {
      var options = {
        method:'GET',
        endpoint:'management/organizations/'+this.client().get('orgName')+'/feed',
        mQuery:true
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting feed');
        } else {
          var feedData = data.entities;
          var feed = [];
          var i=0;
          for (i=0; i < feedData.length; i++) {
            var date = (new Date(feedData[i].created)).toUTCString();

            var title = feedData[i].title;

            var n=title.indexOf(">");
            title = title.substring(n+1,title.length);

            n=title.indexOf(">");
            title = title.substring(n+1,title.length);

            if (feedData[i].actor) {
              title = feedData[i].actor.displayName + ' ' + title;
            }
            feed.push({date:date, title:title});
          }
          if (i === 0) {
            feed.push({date:"", title:"No Activities found."});
          }

          $rootScope.$broadcast('feed-received', feed);
        }
      });

    },
    createGroup: function (path, title) {
      var options = {
        path:path,
        title:title
      }
      $rootScope.groupsCollection.addEntity(options, function(err){
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error creating group');
        } else {
          $rootScope.$broadcast('groups-received', $rootScope.groupsCollection);
        }
      });
    },
    createUser: function (username, name, email, password){
      var options = {
        username:username,
        name:name,
        email:email,
        password:password
      }
      $rootScope.usersCollection.addEntity(options, function(err){
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error creating user');
        } else {
          $rootScope.$broadcast('users-received', $rootScope.usersCollection);
        }
      });
    },
    getCollection: function (type, path, orderBy, query, limit) {
      var options = {
        type:path,
        qs:{}
      }
      if (query) {
        options.qs['ql'] = query;
      }

      //force order by 'created desc' if none exists
      if (options.qs.ql) {
        options.qs['ql'] = options.qs.ql + ' order by ' + (orderBy || 'created desc');
      } else {
        options.qs['ql'] = ' order by ' + (orderBy || 'created desc');
      }

      if (limit) {
        options.qs['limit'] = limit;
      }
      this.client().createCollection(options, function (err, collection, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting ' + collection._type + ': ' + data.error_description);
        } else {
          $rootScope.$broadcast(type + '-received', collection);
        }
        //temporarily adding scope.apply to get working in prod, otherwise the events won't get broadcast
        //todo - we need an apply strategy for 3rd party ug calls!
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    },
    runDataQuery: function (queryPath, searchString, queryLimit) {
      this.getCollection('query', queryPath, null, searchString, queryLimit);
    },
    runDataPOSTQuery: function(queryPath, body) {
      var self = this;
      var options = {
        method:'POST',
        endpoint:queryPath,
        body:body
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error: ' + data.error_description);
        } else {

          var queryPath = data.path;
          self.getCollection('query', queryPath, null, 'order by modified DESC', null);

        }
      });
    },
    runDataPutQuery: function(queryPath, searchString, queryLimit, body) {
      var self = this;
      var options = {
        method:'PUT',
        endpoint:queryPath,
        body:body
      };

      if (searchString) {
        options.qs['ql'] = searchString;
      }
      if (queryLimit) {
        options.qs['queryLimit'] = queryLimit;
      }

      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error: ' + data.error_description);
        } else {

          var queryPath = data.path;
          self.getCollection('query', queryPath, null, 'order by modified DESC', null);

        }
      });
    },
    runDataDeleteQuery: function(queryPath, searchString, queryLimit) {
      var self = this;
      var options = {
        method:'DELETE',
        endpoint:queryPath
      };

      if (searchString) {
        options.qs['ql'] = searchString;
      }
      if (queryLimit) {
        options.qs['queryLimit'] = queryLimit;
      }

      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error: ' + data.error_description);
        } else {

          var queryPath = data.path;
          self.getCollection('query', queryPath, null, 'order by modified DESC', null);

        }
      });
    },
    getUsers: function () {
      this.getCollection('users','users','username');
    },
    getGroups: function () {
      this.getCollection('groups','groups','title');
    },
    getRoles: function () {
      this.getCollection('roles','roles','name');
    },
    getNotifiers: function () {
      var query = '';
      var limit = '100';
      this.getCollection('notifiers','notifiers','created', query, limit);
    },
    getNotificationHistory: function (type) {
      var query = null;
      if (type) {
        query = "select * where state = '" + type + "'";
      }
      this.getCollection('notifications','notifications', 'created desc', query);
    },
    getNotificationReceipts: function (uuid) {
      this.getCollection('receipts', 'notifications/'+uuid+'/receipts');
    },
    getIndexes: function (path) {
      var options = {
        method:'GET',
        endpoint: path + '/indexes'
      }
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'Problem getting indexes: ' + data.error);
        } else {
          $rootScope.$broadcast('indexes-received', data.data);
        }
      });
    },
    sendNotification: function(path, body) {
      var options = {
        method:'POST',
        endpoint: path,
        body:body
      }
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'Problem creating notification: ' + data.error);
        } else {
          $rootScope.$broadcast('send-notification-complete');
        }
      });
    },
    getRolesUsers: function (username) {
      var self = this;
      var options = {
        type:'roles/users/'+username,
        qs:{ql:'order by username'}
      }
      this.client().createCollection(options, function (err, users) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting users');
        } else {
          $rootScope.$broadcast('users-received', users);

        }
      });
    },
    getTypeAheadData: function (type, searchString, searchBy, orderBy) {

      var self = this;
      var search = '';
      var qs = {limit: 100};
      if (searchString) {
        search = "select * where "+searchBy+" = '"+searchString+"'";
      }
      if (orderBy) {
        search = search + " order by "+orderBy;
      }
      if (search) {
        qs.ql = search;
      }
      var options = {
        method:'GET',
        endpoint: type,
        qs:qs
      }
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting '+type);
        } else {
          var entities = data.entities;
          $rootScope.$broadcast(type +'-typeahead-received', entities);
        }
      });
    },
    getUsersTypeAhead: function (searchString) {
      this.getTypeAheadData('users', searchString, 'username', 'username');
    },
    getGroupsTypeAhead: function (searchString) {
      this.getTypeAheadData('groups', searchString, 'path', 'path');
    },
    getRolesTypeAhead: function (searchString) {
      this.getTypeAheadData('roles', searchString, 'name', 'name');
    },
    getGroupsForUser: function (user) {
      var self = this;
      var options = {
        type:'users/'+user+'/groups'
      }
      this.client().createCollection(options, function (err, groups) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting groups');
        } else {

          $rootScope.$broadcast('user-groups-received', groups);

        }
      });
    },
    addUserToGroup: function (user, group) {
      var self = this;
      var options = {
        type:'users/'+user+'/groups/'+group
      }
      this.client().createEntity(options, function (err, entity) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error adding user to group');
        } else {
//          var groups = $rootScope.groupsCollection.addExistingEntity(entity);
          $rootScope.$broadcast('user-added-to-group-received');
        }
      });
    },
    addUserToRole: function (user, role) {
      var options = {
        method:'POST',
        endpoint:'roles/'+role+'/users/'+user
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error adding user to role');
        } else {
          $rootScope.$broadcast('role-update-received');
        }
      });
    },
    addGroupToRole: function (group, role) {
      var options = {
        method:'POST',
        endpoint:'roles/'+role+'/groups/'+group
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error adding group to role');
        } else {
          $rootScope.$broadcast('role-update-received');
        }
      });
    },
    followUser: function (user) {
      var self = this;
      var username =  $rootScope.selectedUser.get('uuid');
      var options = {
        method:'POST',
        endpoint:'users/'+username+'/following/users/'+user
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error following user');
        } else {
          $rootScope.$broadcast('follow-user-received');
        }
      });
    },
    newPermission: function (permission, type, entity) { //"get,post,put:/mypermission"
      var options = {
        method:'POST',
        endpoint:type+'/'+entity+'/permissions',
        body:{"permission":permission}
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error adding permission');
        } else {
          $rootScope.$broadcast('permission-update-received');
        }
      });
    },
    newUserPermission: function (permission, username) {
      this.newPermission(permission,'users',username)
    },
    newGroupPermission: function (permission, path) {
      this.newPermission(permission,'groups',path)
    },
    newRolePermission: function (permission, name) {
      this.newPermission(permission,'roles',name)
    },

    deletePermission: function (permission, type, entity) { //"get,post,put:/mypermission"
      var options = {
        method:'DELETE',
        endpoint:type+'/'+entity+'/permissions',
        qs:{permission:permission}
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error deleting permission');
        } else {
          $rootScope.$broadcast('permission-update-received');
        }
      });
    },
    deleteUserPermission: function (permission, user) {
      this.deletePermission(permission,'users',user);
    },
    deleteGroupPermission: function (permission, group) {
      this.deletePermission(permission,'groups',group);
    },
    deleteRolePermission: function (permission, rolename) {
      this.deletePermission(permission,'roles',rolename);
    },
    removeUserFromRole: function (user, role) { //"get,post,put:/mypermission"
      var options = {
        method:'DELETE',
        endpoint:'roles/'+role+'/users/'+user
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error removing user from role');
        } else {
          $rootScope.$broadcast('role-update-received');
        }
      });
    },
    removeUserFromGroup: function (group, role) { //"get,post,put:/mypermission"
      console.log('removeUserFromGroup---',group, role)
      var options = {
        method:'DELETE',
        endpoint:'roles/'+role+'/groups/'+group
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error removing role from the group');
        } else {
          $rootScope.$broadcast('role-update-received');
        }
      });
    },
    createAndroidNotifier: function (name, APIkey) {
      var options = {
        method:'POST',
        endpoint:'notifiers',
        body:{"apiKey":APIkey,"name":name,"provider":"google"}
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error creating notifier' + err);
        } else {
          $rootScope.$broadcast('alert', 'success', 'New notifier created successfully.');
          $rootScope.$broadcast('notifier-update');
        }
      });

    },
    createAppleNotifier: function (file, name, environment, certificatePassword ) {

      var provider = 'apple';

      var formData = new FormData();
      formData.append("p12Certificate", file);

      formData.append('name', name);
      formData.append('provider', provider);
      formData.append('environment', environment);
      formData.append('certificatePassword', certificatePassword);

      var options = {
        method:'POST',
        endpoint:'notifiers',
        body:'{"apiKey":APIkey,"name":name,"provider":"google"}',
        formData:formData
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error creating notifier: ' + err);
        } else {
          $rootScope.$broadcast('alert', 'success', 'New notifier created successfully.');
          $rootScope.$broadcast('notifier-update');
        }
      });

    },
    deleteNotifier: function (name) {
      var options = {
        method:'DELETE',
        endpoint: 'notifiers/'+name
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error deleting notifier');
        } else {
          $rootScope.$broadcast('notifier-update');
        }
      });

    },
    getCurrentUser: function (callback) {
      var options = {
        method:'GET',
        endpoint:'management/users/'+ this.client().get('email'),
        mQuery:true
      };
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'Error getting user info');
        } else {
          callback(data);
        }
      });

    },

    updateUser: function (callback) {
      var options = {
        method:'PUT',
        endpoint:'users/' + $rootScope.currentUser.username + '/',
        body:{
          username:$rootScope.currentUser.username,
          name:$rootScope.currentUser.username,
          email:$rootScope.currentUser.email}
      }
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'Error updating user info');
        }
        if (typeof(callback) === 'function') {
          callback(err, data);
        }
      });

    },

    resetUserPassword: function (callback) {
      var pwdata = {};
      pwdata.oldpassword = $rootScope.currentUser.oldPassword;
      pwdata.newpassword = $rootScope.currentUser.newPassword;
      pwdata.username = $rootScope.currentUser.username;
      var options = {
        method:'PUT',
        endpoint:'users/' + pwdata.username + '/',
        body:pwdata
      }
      this.client().request(options, function (err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'Error resetting password');
        }
        //remove old and new password fields so they don't end up as part of the entity object
        $rootScope.currentUser.oldPassword = '';
        $rootScope.currentUser.newPassword = '';
        if (typeof(callback) === 'function') {
          callback(err, data);
        }
      });

    },
    getOrgCredentials: function () {
      var options = {
        method:'GET',
        endpoint:'management/organizations/'+this.client().get('orgName')+'/credentials',
        mQuery:true
      };
      this.client().request(options, function (err, data) {
        if (err && data.credentials) {
          $rootScope.$broadcast('alert', 'error', 'Error getting credentials');
        } else {
          $rootScope.$broadcast('org-creds-updated', data.credentials);
        }
      });
    },
    regenerateOrgCredentials: function () {
      var self = this;
      var options = {
        method:'POST',
        endpoint:'management/organizations/'+ this.client().get('orgName') + '/credentials',
        mQuery:true
      };
      this.client().request(options, function(err, data) {
        if (err && data.credentials) {
          $rootScope.$broadcast('alert', 'error', 'Error regenerating credentials');
        } else {
          $rootScope.$broadcast('alert', 'success', 'Regeneration of credentials complete.');
          $rootScope.$broadcast('org-creds-updated', data.credentials);
        }
      });
    },
    getAppCredentials: function () {
      var options = {
        method:'GET',
        endpoint:'credentials'
      };
      this.client().request(options, function (err, data) {
        if (err && data.credentials) {
          $rootScope.$broadcast('alert', 'error', 'Error getting credentials');
        } else {
          $rootScope.$broadcast('app-creds-updated', data.credentials);
        }
      });
    },

    regenerateAppCredentials: function () {
      var self = this;
      var options = {
        method:'POST',
        endpoint:'credentials'
      };
      this.client().request(options, function(err, data) {
        if (err && data.credentials) {
          $rootScope.$broadcast('alert', 'error', 'Error regenerating credentials');
        } else {
          $rootScope.$broadcast('alert', 'success', 'Regeneration of credentials complete.');
          $rootScope.$broadcast('app-creds-updated', data.credentials);
        }
      });
    }

  }
});
