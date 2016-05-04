(function(ng) {
  'use strict';
  var module = ng.module('zInfiniteScroll', []);

  module.directive('infiniteScroll', ['$interval', '$timeout', '$document', function($interval, $timeout, $document) {
    return {
      restrict: 'A',
      scope: {
        infiniteScroll: '=',
        infiniteScrollDisabled: '=?',
        inifiniteScrollThreshold: '=?',
        inifiniteScrollTimeThreshold: '=?'
      },
      link: function link($scope, $element, $attrs) {
        var isScrollDisabled, scrollThreshold, scrollTimeThreshold, throttle,
          element = $element[0],
          isBodyScroll = !!$attrs.hasOwnProperty('infiniteScrollBody'),
          isInverseScroll = !!$attrs.hasOwnProperty('infiniteScrollInverse'),
          lastScrolled = 9999,
          isLoading = false,
          isDestroying = false;

        throttle = function(func, wait) {
          var later, previous, timeout;
          timeout = null;
          previous = 0;
          later = function() {
            previous = new Date().getTime();
            $interval.cancel(timeout);
            timeout = null;
            return func.call();
          };
          return function() {
            var now, remaining;
            now = new Date().getTime();
            remaining = wait - (now - previous);
            if (remaining <= 0) {
              $interval.cancel(timeout);
              timeout = null;
              previous = now;
              return func.call();
            } else {
              if (!timeout) {
                return timeout = $interval(later, remaining, 1);
              }
            }
          };
        };

        $scope.$on('$destroy', function handleDestroyEvent() {
          isDestroying = true;
          $document.unbind('scroll', scrollEvent);
        });

        // if element doesn't want to set height, this would be helpful.
        if (isBodyScroll) {
          $document.on('scroll', scrollEvent);
          element = $document[0].documentElement;
        } else {
          $element.on('scroll', scrollEvent);
        }

        function handleInfiniteScroll() {
          isLoading = true;
          var originalHeight = element.scrollHeight;
          $scope.infiniteScroll().finally(function() {
            $timeout(function() {
              isLoading = false;
              if (isInverseScroll) {
                element.scrollTop = element.scrollHeight - originalHeight;
              }
            });
          });
        }

        // it will be scrolled once your data loaded
        function scrollEvent() {
          if (isDestroying || isScrollDisabled) return;

          var scrolled = calculateBarScrolled();
          // if we have reached the threshold and we scroll up
          if (scrolled < scrollThreshold && (scrolled - lastScrolled) < 0 && (element.scrollHeight >= element.clientHeight)) {
            !isLoading && handleInfiniteScroll();
          }
          lastScrolled = scrolled;
        }

        // for compatibility for all browser
        function calculateBarScrolled() {
          var scrollTop;
          if (isBodyScroll) {
            scrollTop = $document[0].documentElement.scrollTop || $document[0].body.scrollTop;
          } else {
            scrollTop = element.scrollTop;
          }
          return isInverseScroll ? scrollTop : element.scrollHeight - (element.clientHeight + scrollTop);
        }

        function handleInfiniteScrollDisabled(v) {
          isScrollDisabled = !!v;
        }

        $scope.$watch('infiniteScrollDisabled', handleInfiniteScrollDisabled);
        handleInfiniteScrollDisabled($scope.infiniteScrollDisabled);

        function handleInfiniteScrollThreshold(v) {
          scrollThreshold = parseInt(v) || 200;
        }

        $scope.$watch('inifiniteScrollThreshold', handleInfiniteScrollThreshold);
        handleInfiniteScrollThreshold($scope.inifiniteScrollThreshold);

        function handleInfiniteScrollTimeThreshold(v) {
          v = parseInt(v);
          if (v) {
            scrollTimeThreshold = v;
            handleInfiniteScroll = throttle(handleInfiniteScroll, scrollTimeThreshold);
          }
        }

        $scope.$watch('inifiniteScrollTimeThreshold', handleInfiniteScrollTimeThreshold);
        handleInfiniteScrollTimeThreshold($scope.inifiniteScrollTimeThreshold);
      }
    };
  }]);
})(angular);
