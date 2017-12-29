var myapp=angular.module('myApp');
myapp.factory("eventbus", [
    '$rootScope',
    function ($rootScope) {
        /**
         * @ngdoc function
         * @name subscribe
         * @methodOf eventbus
         *
         * @description
         * Subscribes a callback to the given application wide event
         * callback(eventObject, data)
         *
         * @param {String} eventName The name of the event to subscribe to.
         * @param {Function} callback A callback which is fire when the event is raised.
         * @return {Function} A function tht can be called to unsubscrive to the event.
         */
        var subscribe = function (eventName, callback, scope) {
                // return $rootScope.$on(eventName, callback);
                var unregister = $rootScope.$on(eventName, callback);
                if (scope && scope.$on) scope.$on('$destroy', unregister);
            },

            /**
             * @ngdoc function
             * @name broadcast
             * @methodOf eventbus
             *
             * @description
             * Broadcasts the given event and data.
             *
             * @param {String} eventName The name of the event to broadcast.
             * @param {object} data A data object that will be passed along with the event.
             */
            broadcast = function (eventName, data) {
                $rootScope.$emit(eventName, data);
            };

        return {
            subscribe: subscribe,
            broadcast: broadcast
        };
    }
]);