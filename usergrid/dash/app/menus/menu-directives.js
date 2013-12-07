'use strict';


/**
 * @description
 * Active menu item directive: Adds an 'active' class to a clicked item (for static menus)
 *
 * @param {string} can be anything, just gives a unique context to a given
 * menu.
 * Allows for reuse and multiple unordered list menus on one page.
 */
AppServices.Directives.directive('menu', ["$location", "$rootScope", function ($location, $rootScope) {
  return{
    link: function linkFn(scope, lElement, attrs) {

      var menuContext, parentMenuItems, activeParentElement, menuItems, activeMenuElement, locationPath, subMenuContext;

      function setupMenuState() {
        //setup a menuContext (passed in as an attr) to avoid namespace collisions and allow reuse
        menuContext = attrs.menu;

        //find all parent menu items (since this is a static list)
        parentMenuItems = lElement.find('li.option');

        //see if there is an already active element
        activeParentElement;

        if (lElement.find('li.option.active').length !== 0) {
          $rootScope[menuContext + 'Parent'] = lElement.find('li.option.active')
        }

        activeParentElement = ($rootScope[menuContext + 'Parent'] || null);
        if (activeParentElement) {
          activeParentElement = angular.element(activeParentElement);
        }

        //find all menu items (since this is a static list)
        menuItems = lElement.find('li.option li');

        locationPath = $location.path();

        if (activeParentElement) {
          activeMenuElement = angular.element(activeParentElement);
          activeMenuElement = activeMenuElement.find('li.active');

          if (activeParentElement.find('a')[0]) {
            //find the link
            subMenuContext = activeParentElement.find('a')[0].href.split('#!')[1];
            //find the parent part of the submenu link (this is for tertiary linking where a menu option does not exist, but
            // we still want to keep the current menu active)
            var tempMenuContext = subMenuContext.split('/');
            subMenuContext = '/' + tempMenuContext[1];
            if (tempMenuContext.length > 2) {
              subMenuContext += '/' + tempMenuContext[2];
            }
          }
        }

        var activeElements;

        //see if the url location is the same as the default active parent element
        if (locationPath !== '' && locationPath.indexOf(subMenuContext) === -1) {
          activeElements = setActiveElement(activeParentElement, locationPath, scope);
          $rootScope[menuContext + 'Parent'] = activeElements.parentMenuItem;
          $rootScope[menuContext + 'Menu'] = activeElements.menuitem;
        } else {
          setActiveElement(activeParentElement, subMenuContext, scope);
        }

      }
      setupMenuState();

      //need the listener here to detect location changes and keep the menu highlighted
      scope.$on('$routeChangeSuccess', function () {
        setupMenuState()
      });

      //bind parent items to a click event
      parentMenuItems.bind('click', function (cevent) {
        //pull the previous selected menu item
        var previousParentSelection = angular.element($rootScope[menuContext + 'Parent']),
          targetPath = angular.element(cevent.currentTarget).find('> a')[0].href.split('#!')[1];
        var activeElements = setActiveElement(previousParentSelection, targetPath, scope, true);
        $rootScope[menuContext + 'Parent'] = activeElements.parentMenuItem;
        $rootScope[menuContext + 'Menu'] = activeElements.menuitem;


        //broadcast so other elements can deactivate
        scope.$broadcast('menu-selection');

      });

      //bind all menu items to a click event
      menuItems.bind('click', function (cevent) {
        //pull the previous selected menu item
        var previousMenuSelection = $rootScope[menuContext + 'Menu'],
          targetElement = cevent.currentTarget;

        if (previousMenuSelection !== targetElement) {
          if (previousMenuSelection) {
            angular.element(previousMenuSelection).removeClass('active')
          } else {
            //remove the default active element on case of first click
            activeMenuElement.removeClass('active');
          }

          scope.$apply(function () {
            angular.element($rootScope[menuContext]).addClass('active');
          })

          $rootScope[menuContext + 'Menu'] = targetElement;

          //remember where we were at when clicking to another parent menu item
          angular.element($rootScope[menuContext + 'Parent']).find('a')[0].setAttribute('href', angular.element(cevent.currentTarget).find('a')[0].href)


        }

      })

    }
  }
}])


function setActiveElement(ele, locationPath, $rootScope, isParentClick) {
  ele.removeClass('active');


  //now search all menu items to find the correct location path
  var newActiveElement = ele.parent().find('a[href*="#!' + locationPath + '"]'),
    menuItem,
    parentMenuItem;

  //there isn't a link in the menu anchors for the locationPath.. resolve to default
  //todo - duplicating code here.. needs rework
  if (newActiveElement.length === 0) {
    parentMenuItem = ele;
  } else {

    menuItem = newActiveElement.parent();
    //set the menu item to active
//

    //check if this is a top level (parent) menuitem without children
    if (menuItem.hasClass('option')) {
      parentMenuItem = menuItem[0];
    } else {
      if (menuItem.size() === 1) {
        //todo - omg this is terrible (please fix)
        parentMenuItem = newActiveElement.parent().parent().parent();
        //set the menu items parent to active
        parentMenuItem.addClass('active');
      } else {
        parentMenuItem = menuItem[0];
        menuItem = menuItem[1];
      }
    }

    try {
      //this try block is strictly for setting height for css transitions
      var menuItemCompare = (parentMenuItem[0] || parentMenuItem);

      //here we compare the selected parent element against the one clicked
      if (ele[0] !== menuItemCompare && isParentClick) {
        //reset back to 0 for css transition
        if (ele.find('ul')[0]) {
          ele.find('ul')[0].style.height = 0;
        }
      }

      var subMenuSizer = angular.element(parentMenuItem).find('.nav-list')[0];
      //if this menu item has a submenu then go
      if (subMenuSizer) {
        var clientHeight = subMenuSizer.getAttribute('data-height'),
          heightCounter = 1,
          heightChecker;

        if (!clientHeight && !heightChecker) {
          //hack for animation to get height. Have to set a data attribute to store the client height and use
          // it as a global var (data-*) for further nav
          heightChecker = setInterval(function () {
            var tempHeight = (subMenuSizer.getAttribute('data-height') || subMenuSizer.clientHeight);
            heightCounter = subMenuSizer.clientHeight;
            //ugh, setting the heightCounter incase the dom does not instantly render the container height
            //this allows the condition to be (or not be) met when both are equal on the interval
            if(heightCounter === 0){
              heightCounter = 1;
            }

            if (typeof tempHeight === 'string') {
              tempHeight = parseInt(tempHeight,10)
            }
            console.log(tempHeight)
            if (tempHeight > 0 && heightCounter === tempHeight) {
              subMenuSizer.setAttribute('data-height', tempHeight);
              menuItem.addClass('active');
              subMenuSizer.style.height = tempHeight + 'px';
              clearInterval(heightChecker)
            }
            heightCounter = tempHeight;
          }, 1)

        } else {
          menuItem.addClass('active');
          subMenuSizer.style.height = clientHeight + 'px';
        }

        $rootScope.menuExecute = true;
      } else {
        //last and final case (if the parent menu item does not have a submenu we must set active)
        menuItem.addClass('active');
      }

    } catch (e) {
      console.log('menu sizer', e)
    }
  }

  //return the active element
  return {
    menuitem: menuItem,
    parentMenuItem: parentMenuItem
  };
}


/**
 * @description
 * Filter menus (derived from menu directive) but this is dynamically driven from a model
 *
 * @param {string} can be anything, just gives a unique
 * context to a given filter.
 *
 */
AppServices.Directives.directive('timeFilter', ["$location", "$routeParams", "$rootScope", function ($location, $routeParams, $rootScope) {
  return{
    restrict: 'A',
    transclude: true,
    template: '<li ng-repeat="time in timeFilters" class="filterItem"><a ng-click="changeTimeFilter(time)">{{time.label}}</a></li>',
    link: function linkFn(scope, lElement, attrs) {
      var menuContext = attrs.filter;

      scope.changeTimeFilter = function (newTime) {
        $rootScope.selectedtimefilter = newTime;
        $routeParams.timeFilter = newTime.value;
      }

      lElement.bind('click', function (cevent) {
        menuBindClick(scope, lElement, cevent, menuContext)
      })

    }
  }
}])


//todo: I am copying the code above and making a new filter because the template markup below is tied directly to a model
//not sure if there is a way to parameterize and abstract out... thus only having one instance of this filter directive.
AppServices.Directives.directive('chartFilter', ["$location", "$routeParams", "$rootScope", function ($location, $routeParams, $rootScope) {
  return{
    restrict: 'ACE',
    scope: '=',
    template: '<li ng-repeat="chart in chartCriteriaOptions" class="filterItem"><a ng-click="changeChart(chart)">{{chart.chartName}}</a></li>',
    link: function linkFn(scope, lElement, attrs) {
      var menuContext = attrs.filter;

      scope.changeChart = function (newChart) {
        $rootScope.selectedChartCriteria = newChart;
//        $rootScope.selectedChartCriteriaChange = ($routeParams[newChart.type + 'ChartFilter'] !== newChart.chartCriteriaId);
        //reset to "NOW" for now :)
        $routeParams.currentCompare = 'NOW';
        $routeParams[newChart.type + 'ChartFilter'] = newChart.chartCriteriaId;
      }

      lElement.bind('click', function (cevent) {
        menuBindClick(scope, lElement, cevent, menuContext)
      })
    }
  }
}])


//helper function for menu filters
function menuBindClick(scope, lElement, cevent, menuContext) {

  var currentSelection = angular.element(cevent.srcElement).parent();
  var previousSelection = scope[menuContext];

  if (previousSelection !== currentSelection) {
    if (previousSelection) {
      angular.element(previousSelection).removeClass('active')
    }
    scope[menuContext] = currentSelection;

    scope.$apply(function () {
      currentSelection.addClass('active');
    })
  }

}

AppServices.Directives.directive('orgMenu', ["$location", "$routeParams", "$rootScope", "ug", function ($location, $routeParams, $rootScope, ug) {
  return{
    restrict: 'ACE',
    scope: '=',
    replace: true,
    template: '<div class="btn-group">' +
      '         <a class="btn top-selector org-selector org-selector-parent" href="#!/org-overview" ng-click="expandMenu()">' +
      '<i class="pictogram">&#128193</i> {{currentOrg}}<span class="caret"></span>' +
      ' </a>' +
      '<ul class="org-options nav nav-list trans" >' +
      '<li class="option" ng-repeat="(k,v) in organizations">' +
      '<a class="org-overview" ng-click="orgChange(v.name)">' +
      '<i class="pictogram">&#128193</i> {{v.name}}' +
      '</a>' +
      '</li>' +
      '</ul></div>',

    link: function linkFn(scope, lElement, attrs) {

      var menuContext = attrs.context,
        orgOptions = lElement.find('.org-options')[0];

      //deactivate menu on this event
      scope.$on('menu-selection', function () {
        lElement.find('.org-options')[0].style.height = 0;
      });

      var heightFinder,
        tempHeight = 1;
      //hack for animation to get height
      heightFinder = setInterval(function () {
        var clientHeight = orgOptions.clientHeight;
        if (clientHeight > 0 && tempHeight === clientHeight) {
          orgOptions.setAttribute('data-height', clientHeight);
          orgOptions.style.height = 0;
          clearInterval(heightFinder)
        }
        if (clientHeight !== 0) {
          tempHeight = clientHeight;
        }

      }, 100)

      scope.expandMenu = function () {
        console.log(orgOptions.style.opacity,orgOptions.style.opacity === '0')
        if(orgOptions.style.opacity === '0' || !orgOptions.style.opacity){
          orgOptions.style.height = orgOptions.getAttribute('data-height') + 'px';
          orgOptions.style.opacity = 1;
          //deactivate regular menu options
          angular.element($rootScope['sideMenuParent']).removeClass('active');
          angular.element($rootScope['sideMenuMenu']).removeClass('active');
        }else{
          lElement.find('.org-options')[0].style.height = 0;
          orgOptions.style.opacity = 0;
        }

      }

      scope.orgChange = function (orgName) {

        lElement.find('.org-options')[0].style.height = 0;
        orgOptions.style.opacity = 0;

        ug.client().set('orgName', orgName);
        $rootScope.currentOrg = orgName;

        //make a call to get the users applications
        ug.client().getApplications(function (err, data) {
          if (err) {

          } else {
            $rootScope.currentApp = ug.client().get('appName');
            $rootScope.applications = ug.client().getObject('applications');
            $rootScope.organizations = ug.client().getObject('organizations');
          }
        });
      }

      lElement.bind('click', function (cevent) {
        menuBindClick(scope, lElement, cevent, menuContext)
      })

    }
  }
}])