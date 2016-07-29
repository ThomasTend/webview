/*
Written by Amro Gazlan 
Summer 2016

For a list of TODO's remaining scroll to end of the file.
Some useful functions are commented at the end of the file, but for more functionality 
you should visit: 

http://angular-ui.github.io/ui-calendar/
http://fullcalendar.io/docs/
*/

var app = angular.module('MUHCApp'); // loading the angular app module
app.controller('AppointmentsController', ['$scope', '$location', '$anchorScroll', '$compile', 'uiCalendarConfig', 'Appointments', '$timeout', '$uibModal', '$mdMedia', '$mdDialog', function($scope, $location, $anchorScroll, $compile, uiCalendarConfig, Appointments, $timeout, $uibModal, $mdMedia, $mdDialog) {
    init();
    /* when our controller initializes
    we fetch the next appointment, last appoitnment completed 
    and display next appointment in the nextAppointment card 
    */
    function init() {
        $scope.nextAppointment = Appointments.getNextAppointment(); // this is the next appointment coming up
        $scope.lastAppointment = Appointments.getLastAppointmentCompleted(); // the last appointment that the client completed
        $scope.today = new Date(); //Today's date
        $scope.appointments = Appointments.getUserAppointments(); // get all the appointmnets of the user
        displayNextAppointment();
        $(".agendaList").hide();
    }

    /*** Start of function responsible to display appointment information ***/

    //this functions displays the next appointment in the next appointment card 
    function displayNextAppointment() {
        if (!Appointments.isThereNextAppointment()) {
            // get the type of appointment
            $scope.nextApppointmentType = $scope.nextAppointment.Object.AppointmentType_EN;
            //start time of the appointment 
            $scope.nextAppointmentDateStartDate = $scope.nextAppointment.Object.ScheduledStartTime;
            // check if the next appointment is conducted by a doctor or machine 
            if ($scope.nextAppointment.Object.Resource.hasOwnProperty("Machine")) {
                $scope.nextAppointmentResourceName = '<i class="ion-ios-pulse-strong iconHomeView "></i>&nbsp;' + $scope.nextAppointment.Object.Resource.Machine;
            } else if ($scope.nextAppointment.Object.Resource.hasOwnProperty("Doctor")) {
                $scope.nextAppointmentResourceName = '<i class="ion-person iconHomeView "></i>&nbsp;' + $scope.nextAppointment.Object.Resource.Doctor;
            }
            // image of map of location that represents the place of appointment
            $scope.nextAppointmentMapImage = $scope.nextAppointment.Object.MapUrl;
            $scope.nextAppointmentMapName = $scope.nextAppointment.Object.MapDescription_EN;
            $scope.nextAppointmentDoctorImage = getResourceImageForAppointment($scope.nextAppointment.Object);
            $scope.nextAppointmentContactEmail = getAppointmentContactEmail($scope.nextAppointment.Object);
        } else {
            $scope.nextApppointmentType = "No upcoming appointments";
        }
    }
    // image of doctor or machine conducting the appointment
    function getResourceImageForAppointment(app) {
        return "./img/doctor.png";
    }
    //Email of the doctor or person responsible for appointment 
    function getAppointmentContactEmail(app) {
        return "bieber@justin.com";
    }
    // returns the name of the resource. 
    // Doctor's name if a doctor is responsible for an appointment 
    // Machine name if a machine 
    $scope.getResource = function(app) {
            if (app.Resource.hasOwnProperty("Machine")) {
                return '<i class="ion-ios-pulse-strong iconHomeView "></i>&nbsp;' + app.Resource.Machine;
            } else if (app.Resource.hasOwnProperty("Doctor")) {
                return '<i class="ion-person iconHomeView "></i>&nbsp;' + app.Resource.Doctor;
            }
        }
        // displays the location of next appointment in the appointments card
        // in the form of an angular dialog
    $scope.showNextAppLocation = function(ev) {
        $scope.showLocation(ev, $scope.nextAppointmentMapName, $scope.nextAppointmentMapImage);
    };
    // display the location of an appointment in the form of an angular dialog
    $scope.showLocation = function(ev, mapName, mapLocation) {
        $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: locationDialogController,
            templateUrl: './views/appointments/location.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                items: {
                    nextAppointmentMapImage: mapLocation,
                    nextAppointmentMapName: mapName
                }
            },
            clickOutsideToClose: true,
            fullscreen: useFullScreen
        })
    };
    // controller for the mdDialog.show in showLocation function
    function locationDialogController($scope, $mdDialog, items) {
        $scope.mapInfo = items;
        // function that will close the dialog when you click 
        $scope.hideLocationMap = function() {
            $mdDialog.hide();
        };
    }

    /*** End of function responsible to display appointment information ***/

    /*** Start of calendar functions ***/

    // event source that contains events on the scope 
    // events will pushed to our eventSources for main calendar to render 
    $scope.events = [];
    for (var i = 0; i < $scope.appointments.length; i++) {
        var objectEvent = {};
        objectEvent.title = $scope.appointments[i].AppointmentType_EN;
        objectEvent.id = $scope.appointments[i].AppointmentSerNum;
        objectEvent.start = $scope.appointments[i].ScheduledStartTime;
        objectEvent.ResourceName = $scope.appointments[i].Resource.Machine;
        objectEvent.mapDescription = $scope.appointments[i].MapDescription_EN;
        var copiedDate = new Date(objectEvent.start.getTime());
        copiedDate.setHours(copiedDate.getHours() + 1);
        objectEvent.end = copiedDate;
        var dateAppointment = $scope.appointments[i].ScheduledStartTime;

        if ($scope.today.getDate() === dateAppointment.getDate() && $scope.today.getMonth() === dateAppointment.getMonth() && $scope.today.getFullYear() === dateAppointment.getFullYear()) {
            objectEvent.color = '#3399ff';

        } else if (dateAppointment > $scope.today) {
            objectEvent.color = '#3399ff';


        } else {
            objectEvent.color = '#5CE68A';
        }

        $scope.events.push(objectEvent);
    }
    $scope.eventSources = [$scope.events, $scope.eventsF];
    // changes view of the calendar between month, week, day

    // renders the calendar 
    // this is useful if someone adds another event 
    // and want to reload the calendar without leaving page
    $scope.renderCalender = function(calendar) {
        if (uiCalendarConfig.calendars[calendar]) {
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    // called when you click on a different view type 
    // like month, week, day
    $scope.changeView = function(view, calendar) {
        clearButtonsStyle();
        $("." + view + "Button").css("background-color", "#FFE082")
        $scope.toggleCalendar();
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    // goes to the next view depending
    // changes months in case of month view 
    // changes weeks in case of week view
    // changes days in case of day view 
    $scope.nextView = function(calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('next');
        if (calendar == 'myCalendar1') $scope.currentDisplayedMonth = uiCalendarConfig.calendars[calendar].fullCalendar('getDate').format('MMMM YYYY');
        else $scope.currentDisplayedMonthMini = uiCalendarConfig.calendars[calendar].fullCalendar('getDate').format('MMM YYYY');
    };
    // goes to the previous view depending
    // changes months in case of month view 
    // changes weeks in case of week view
    // changes days in case of day view 
    $scope.prevView = function(calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('prev');
        if (calendar == 'myCalendar1') $scope.currentDisplayedMonth = uiCalendarConfig.calendars[calendar].fullCalendar('getDate').format('MMMM YYYY');
        else $scope.currentDisplayedMonthMini = uiCalendarConfig.calendars[calendar].fullCalendar('getDate').format('MMM YYYY');
    };
    // clicking a day on the main calendar
    var currentSelectedDay;
    $scope.dayClick = function(date, jsEvent, view) {
        if (!$(this).hasClass("fc-today")) {
            if (currentSelectedDay) {
                currentSelectedDay.css("background-color", "white");
            }
            currentSelectedDay = $(this);
            currentSelectedDay.css("background-color", "#fedf88");
        }

        $scope.date = new Date(date.format());
    };
    // clicking a day on the mini calendar
    $scope.dayClickMini = function(date, jsEvent, view) {
        $scope.date = new Date(date.format());
        $scope.scrollToAppointment();
        $scope.currentDisplayedMonth = uiCalendarConfig.calendars['myCalendar1'].fullCalendar('gotoDate', date);
        $scope.currentDisplayedMonth = uiCalendarConfig.calendars['myCalendar1'].fullCalendar('getDate').format('MMMM YYYY');
    };
    // moves calendar dates to the current date 
    $scope.goToToday = function() {
        uiCalendarConfig.calendars['myCalendar1'].fullCalendar('today');
        uiCalendarConfig.calendars['myCalendar2'].fullCalendar('today');
        $scope.date = new Date();
        $scope.scrollToAppointment();
        $scope.setTodayMonthViews();
    };
    // scrolls closest Appointment to selected day 
    // by clicking on a day on the mini calendar or main calendar
    $scope.scrollToAppointment = function() {
        var current = $scope.date;
        var min = Infinity;
        var minIndex = 0;
        for (var i = 0; i < $scope.appointments.length; i++) {
            var minVal = Math.abs($scope.appointments[i].ScheduledStartTime.getTime() - current.getTime());
            if (minVal < min) {
                minIndex = i;
                min = minVal;
            }
        }
        $location.hash('agendaAppointment' + minIndex);
        $anchorScroll();

    };
    //This will show a tooltip with apppointment name when
    // mouse hover's over an appointment 
    $scope.eventRender = function(event, element, view) {
        element.attr({
            'tooltip': event.title,
        });
        $compile(element)($scope)
    };
    // when an event/appointment is clicked a popup is displayed containing 
    // some information regarding the event/appointment 
    var otherPop = false;
    $scope.eventClick = function(event, jsEvent, view) {
        $this = $(this);
        $scope.date = event.start._i;
        if (!event.hasOwnProperty('isPoped')) {
            if (otherPop) hideAllPops();
            event.isPoped = true;
            $this.popover({
                    html: true,
                    title: event.title,
                    placement: 'top',
                    container: 'body',
                    animation: true,
                    content: (
                        ('<i class="fa fa-calendar " style="color:#2B6197 "></i>&nbsp;') +
                        (event.start.format('MMMM YYYY, hh:mm a')) +
                        ('<br><i class="ion-location iconHomeView "></i>&nbsp;' + event.mapDescription))
                })
                .popover('toggle');
            otherPop = true;
        } else if (event.isPoped == true) {
            hideAllPops();
        } else {
            if (otherPop) hideAllPops();
            $this.popover({
                    html: true,
                    title: event.title,
                    placement: 'top',
                    container: 'body',
                    animation: true,
                    content: (
                        ('<i class="fa fa-calendar " style="color:#2B6197 "></i>&nbsp;') +
                        (event.start.format('MMMM YYYY, hh:mm a')) +
                        ('<br><i class="ion-person iconHomeView "></i>&nbsp;' + event.mapDescription))
                })
                .popover('toggle');
            event.isPoped = true;
            otherPop = true;
        }
    };
    // hides all popups by going through all events on the dom and 
    // destroying a popup if it exists
    hideAllPops = function() {
        for (i = 0; i < uiCalendarConfig.calendars['myCalendar1'].fullCalendar('clientEvents').length; i++) {
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('clientEvents')[i].isPoped = false;
        }
        $('.fc-event').each(function() {
            $(this).popover('destroy');
        });
        otherPop = false;
    };
    $scope.$on('$destroy', function() {
        hideAllPops();
        document.removeEventListener('mouseup', mouseDownHidePopups);
    });
    // listens to when a mouse is clicked
    document.addEventListener('mouseup', mouseDownHidePopups)
        // if a mouse is clicked outside a popup, it closes all popups that have 
        // been created
    function mouseDownHidePopups(event) {
        console.log(event.srcElement.className);
        console.log(event.srcElement.className !== 'fc-title');
        if (event.srcElement.className !== 'fc-title' && event.srcElement.className !== 'popover-content') {
            console.log(event);
            hideAllPops();
        }
    }
    // clears selected days
    function clearSelectedDayColor() {
        $(".fc-day").css("background-color", "white");
    }
    // clears selected buttons
    function clearButtonsStyle() {
        $(".calendarViewButton").css("background-color", "white");
    }
    // this is called at the start of the page
    // to set the month title on the toolbars of 
    // main and mini calendar to the current month
    $scope.setTodayMonthViews = function() {
        $scope.currentDisplayedMonth = moment().format('MMMM YYYY');
        $scope.currentDisplayedMonthMini = moment().format('MMM YYYY');
    };
    $scope.setTodayMonthViews();
    // this is called when going from agenda view to one
    // of the calendar views 
    $scope.toggleCalendar = function() {
        $(".agendaList").hide();
        $(".mainCalendar").show();
    };
    // this is called when going from one of the 
    // calendar views to the agenda view
    $scope.toggleList = function() {
        $(".mainCalendar").hide();
        $(".agendaList").show();
        $scope.scrollToAppointment();
        $location.hash("topOfAppointments");
        $anchorScroll();
        hideAllPops();
        clearButtonsStyle();
        $(".agendaListButton").css("background-color", "#FFE082");
    };
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
    // declaring calendars and configuring them 
    $scope.uiConfig = {
        MiniCalendar: {
            editable: false,
            header: {
                left: '',
                center: '',
                right: ''
            },
            dayClick: $scope.dayClickMini
        },

        MainCalendar: {
            editable: false,
            slotDuration: '00:15:00',
            slotLabelInterval: '01:00:00',
            header: {
                left: '',
                center: '',
                right: ''
            },
            dayClick: $scope.dayClick,
            eventClick: $scope.eventClick,
            eventRender: $scope.eventRender,
            dayRender: $scope.onDayRender
        }
    };

    // /* add and removes an event source of choice */
    // $scope.addRemoveEventSource = function(sources, source) {
    //     var canAdd = 0;
    //     angular.forEach(sources, function(value, key) {
    //         if (sources[key] === source) {
    //             sources.splice(key, 1);
    //             canAdd = 1;
    //         }
    //     });
    //     if (canAdd === 0) {
    //         sources.push(source);
    //     }
    // };
    // /* add custom event*/
    // $scope.addEvent = function() {
    //     $scope.events.push({
    //         title: 'Open Sesame',
    //         start: new Date(y, m, 28),
    //         end: new Date(y, m, 29),
    //         className: ['openSesame']
    //     });
    // };
    // /* remove event */
    // $scope.remove = function(index) {
    //     $scope.events.splice(index, 1);
    // };
}]);



//TODO : * a lit of things remaining to be done or could be improved 

/*
    1. Get contact email for doctor or machine for an appointment and display them in agenda and next appointment card
    2. Get image of doctor or machine for an appointment in getResourceImageForAppointment function
    3. Ability to change languages of all the information on the page
    4. Insert proper contacting information at the "Questions regarding your appointments page"
    5. Different colors for different appointments type. Right now its different color based on past and future appointment

*/
