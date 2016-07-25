// "getting/fetching" the MUHCApp module to apply changes to it
var app = angular.module('MUHCApp');

// binding the controller of appointments.html and attaching our required services 
app.controller('AppointmentsController', ['$scope','$location','$anchorScroll', '$compile', 'uiCalendarConfig', 'Appointments', '$timeout', '$uibModal', '$mdMedia', '$mdDialog', function($scope,$location, $anchorScroll, $compile, uiCalendarConfig, Appointments, $timeout, $uibModal, $mdMedia, $mdDialog) {
    init(); // calling the init function below 
    $scope.displayCalendar = true; 
    $scope.date = new Date();
    function init() {
        $scope.dateToday = new Date();
        var date;
        $scope.nextAppointment = Appointments.getNextAppointment();
        $scope.lastAppointment = Appointments.getLastAppointmentCompleted();
        displayNextEvent();
        $(".agendaList").hide();
    }
    function displayNextEvent() {
        if (Appointments.isThereNextAppointment()) {
            console.log($scope.nextAppointment.Object);
            $scope.nextApppointmentType = $scope.nextAppointment.Object.AppointmentType_EN;
            $scope.nextAppointmentDateStartDate = $scope.nextAppointment.Object.ScheduledStartTime;
            $scope.nextAppointmentResourceName = $scope.nextAppointment.Object.Resource.Machine;
            $scope.nextAppointmentMapImage = $scope.nextAppointment.Object.MapUrl;
            $scope.nextAppointmentMapName = $scope.nextAppointment.Object.MapDescription_EN;
            $scope.nextAppointmentDoctorImage = getDoctorImageForAppointment($scope.nextAppointment.Object);
        }
    }

    $scope.currentDisplayedCalendarView = 'Month';
    $scope.showLocation = function(ev) {
        $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: locationDialogController,
            templateUrl: './views/appointments/location.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                items: {
                    nextAppointmentMapImage: $scope.nextAppointmentMapImage,
                    nextAppointmentMapName: $scope.nextAppointmentMapName
                }
            },
            clickOutsideToClose: true,
            fullscreen: useFullScreen
        })
    };

    function getDoctorImageForAppointment(App) {
        return "./img/doctor.png";
    }

    function locationDialogController($scope, $mdDialog, items) {
        $scope.mapInfo = items;
        $scope.hideLocationMap = function() {
            $mdDialog.hide();
        };
    }
    //Today's date
    $scope.today = new Date();
    $scope.futureAppointments = Appointments.getFutureAppointments(); // get the future appointments of the user
    $scope.pastAppointments = Appointments.getPastAppointments();   // get past appointments of the user
    $scope.appointments = Appointments.getUserAppointments(); // get ALL the appointmnets of the user
    
    // check if there are no appointmnets for the user
    if ($scope.appointments.length == 0) {
        $scope.noAppointments = true;
    }
        // check if there are no future appointments for the user 
    if ($scope.futureAppointments.length == 0) {
        $scope.noFutureAppointments = true;
    }
    // $scope.goToListState = function(){
    //     console.log("I'm changing the state to list");
    //     $state.go('app.Appointments.list');
    // };
    //  $scope.goToAppointmentState = function(){
    //     console.log("I'm changing the state to normal");
    //     $state.go('app.Appointments');
    // };
    //Function to select the color of the appointment depending on whether the date has passed or not
    $scope.getStyle = function(index) {
        var today = $scope.today;
        var dateAppointment = $scope.appointments[index].ScheduledStartTime;
        if (today.getDate() === dateAppointment.getDate() && today.getMonth() === dateAppointment.getMonth() && today.getFullYear() === dateAppointment.getFullYear()) {
            return '#3399ff';
        } else if (dateAppointment > today) {
            return '#3399ff';
        } else {
            return '#5CE68A';
        }
    };

    $scope.toggleCalendar = function (){
         $(".agendaList").hide();
         $(".mainCalendar").show();
        

        //$scope.displayCalendar = true; 
    };
    $scope.toggleList = function () {
         $(".mainCalendar").hide();
         $(".agendaList").show();
         $scope.scrollToAppointment();
        //$scope.displayCalendar = false;
        hideAllPops();
        

    };
    $scope.scrollToAppointment = function()
    {   
        var current = $scope.date;
        console.log($scope.date);
        var min = Infinity;
        var minIndex = 0;
        for (var i = 0;i< $scope.appointments.length; i++) {
            var minVal = Math.abs($scope.appointments[i].ScheduledStartTime.getTime()-current.getTime());
            if(minVal<min)
            {
                minIndex = i;
                min = minVal;
            }
        }
        console.log(minIndex);
        console.log($scope.appointments[minIndex]);
        $location.hash('agendaAppointment'+minIndex);
        $anchorScroll();
    };

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    
    // $scope.eventSource = {
    //     url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
    //     className: 'gcal-event', // an option!
    //     currentTimezone: 'America/Chicago' // an option!
    // };
    /* event source that contains custom events on the scope */
    $scope.events = [];
    var appointments = Appointments.getUserAppointments();
    for (var i = 0; i < appointments.length; i++) {
        var objectEvent = {};
        objectEvent.title = appointments[i].AppointmentType_EN;
        objectEvent.id = appointments[i].AppointmentSerNum;
        objectEvent.start = appointments[i].ScheduledStartTime;
        objectEvent.ResourceName = appointments[i].Resource.Machine;
        objectEvent.mapDescription = appointments[i].MapDescription_EN;
        var copiedDate = new Date(objectEvent.start.getTime());
        copiedDate.setHours(copiedDate.getHours() + 1);
        objectEvent.end = copiedDate;
        var today = date;
        var dateAppointment = appointments[i].ScheduledStartTime;

        if (today.getDate() === dateAppointment.getDate() && today.getMonth() === dateAppointment.getMonth() && today.getFullYear() === dateAppointment.getFullYear()) {
            objectEvent.color = '#3399ff';

        } else if (dateAppointment > today) {
            objectEvent.color = '#3399ff';


        } else {
            objectEvent.color = '#5CE68A';
        }

        $scope.events.push(objectEvent);
    }

    /* event source that calls a function on every view switch */
    $scope.eventsF = function(start, end, timezone, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
        callback(events);
    };
    /* alert on eventClick */
    $scope.clickEventOnList = function(app) {
        console.log("The appointment is " + app.AppointmentType_EN)
        $scope.appointmentType = app.AppointmentType_EN;
        $scope.scheduleStartTime = app.ScheduledStartTime;
        $scope.resourceName = app.ResourceName;
        $scope.mainAppointmentType = ""
    };

    var otherPop = false; 
    
    $scope.alertOnEventClick = function(event, jsEvent, view) {
        $this = $(this);
        $scope.date = event.start._i;
        console.log('event click',event);
        if (!event.hasOwnProperty('isPoped')){
            console.log("I don't have a poped property creating one.."); 
            if (otherPop) hideAllPops();
            event.isPoped = true; 
            $this.popover({ html: true, title: event.title, placement: 'top', container: 'body', animation: true, content : (
                ('<i class="fa fa-calendar " style="color:#2B6197 "></i>&nbsp;')+
                (event.start.format('MMMM YYYY, hh:mm a'))+
                ('<br><i class="ion-person iconHomeView "></i>&nbsp;'+event.mapDescription)) })
            .popover('toggle');
            otherPop = true;
        }else if (event.isPoped == true){
            hideAllPops();
        }else {
            if (otherPop) hideAllPops();
            $this.popover({ html: true, title: event.title, placement: 'top', container: 'body', animation: true, content : (
                ('<i class="fa fa-calendar " style="color:#2B6197 "></i>&nbsp;')+
                (event.start.format('MMMM YYYY, hh:mm a'))+
                ('<br><i class="ion-person iconHomeView "></i>&nbsp;'+event.mapDescription)) })
            .popover('toggle');
            event.isPoped = true;
            otherPop = true; 
        }
    };

    hideAllPops = function (){ 
        for (i = 0 ; i <  uiCalendarConfig.calendars['myCalendar1'].fullCalendar('clientEvents').length; i++ ){
           uiCalendarConfig.calendars['myCalendar1'].fullCalendar('clientEvents')[i].isPoped = false;
        }
        $('.fc-event').each(function() {
            $(this).popover('destroy');
        });
        otherPop = false; 
    };
    $scope.$on('$destroy',function()
    {
        hideAllPops();
    });
    
    $scope.alertOnDayClick = function(date, jsEvent, view) {
        $scope.date = new Date(date.format());
    };

    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function(value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function() {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };
    $scope.uiConfig = {
        MiniCalendar: {
            height: 400,
            contentHeight: 400,
            editable: false,
            header: {
                left: '',
                center: '',
                right: ''
            },
            // dayClick: $scope.alertOnDayClick,
            // eventClick: $scope.alertOnEventClick,
            // eventDrop: $scope.alertOnDrop,
            // eventResize: $scope.alertOnResize,
            // eventRender: $scope.eventRender,
            // dayRender: $scope.onDayRender
        },

        MainCalendar: {
            height: 608,
            contentHeight: 608,
            editable: false,
            slotDuration: '00:15:00',
            slotLabelInterval: '01:00:00',
            header: {
                left: '',
                center: '',
                right: ''
            },
            dayClick: $scope.alertOnDayClick,
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender,
            dayRender: $scope.onDayRender
        }
    };
    /* remove event */
    $scope.remove = function(index) {
        $scope.events.splice(index, 1);
    };
    /* Change View */
    $scope.changeView = function(view, calendar) {
        hideAllPops();
        $scope.toggleCalendar();
        $scope.currentDisplayedCalendarView = view; 
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    $scope.renderCalender = function(calendar) {
        if (uiCalendarConfig.calendars[calendar]) {
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* Render Tooltip */
    $scope.eventRender = function(event, element, view) {
        element.attr({
            'tooltip': event.title,
            'tooltip-append-to-body': true
        });
        $compile(element)($scope)
    };
    $scope.onDayRender = function(date, cell) {
        
    };

    $scope.currentDisplayedMonth = moment().format('MMMM YYYY');

    // These functions should also work on mini calendar?
    $scope.getCurrentMonth = function(calendar) {
        $scope.currentDisplayedMonth = uiCalendarConfig.calendars[calendar].fullCalendar('getDate').format('MMMM YYYY');
    };
    $scope.nextView = function(calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('next');
        $scope.currentDisplayedMonth = uiCalendarConfig.calendars[calendar].fullCalendar('getDate').format('MMMM YYYY');
    };
    $scope.prevView = function(calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('prev');
        $scope.currentDisplayedMonth = uiCalendarConfig.calendars[calendar].fullCalendar('getDate').format('MMMM YYYY');

    };
    // $scope.dayClick = function (calendar){
    //     uiCalendarConfig.calendars[calendar].fullCalendar({
    //         dayClick: function(date, jsEvent, view) {

    //     alert('Clicked on: ' + date.format());

    //     alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);

    //     alert('Current view: ' + view.name);

    //     // change the day's background color just for fun
    //     $(this).css('background-color', 'red');

    //         }
    //     });
    // }

    /* config object */


    $scope.changeLang = function() {
        if ($scope.changeTo === 'Hungarian') {
            $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
            $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
            $scope.changeTo = 'English';
        } else {
            $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $scope.changeTo = 'Hungarian';
        }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventsF];
    //$scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];


}]);
