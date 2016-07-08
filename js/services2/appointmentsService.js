var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.services:PatientAppointments
*@requires $filter
*@requires MUHCApp.service:RequestToServer
*@requires $q
*@requires MUHCApp.service:UserAuthorizationInfo
*@description Sets the User appointment objects for the different views.
**/
myApp.service('Appointments', ['$q', 'RequestToServer','UserAuthorizationInfo', '$filter', function ($q,RequestToServer, UserAuthorizationInfo, $filter) {
    /**
    *@ngdoc property
    *@name  UserAppointmentsArray
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains all user appointments organized chronologically from most recent to least recent.
    **/
    /**
    *@ngdoc property
    *@name  TodayAppointments
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains today's appointments organized in increasing order of date.
    *
    **/
    /**
    *@ngdoc property
    *@name  FutureAppointments
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains today's appointments organized in increasing order of date.
    *
    **/
    /**
    *@ngdoc property
    *@name  PastAppointments
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains Past's appointments organized in decreasing order of date.
    *
    **/
    /**
    *@ngdoc property
    *@name  calendar
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Contains the appointment calendar object organized in a {year}->{months}->{day}->[Array Of Appointments That Day] format
    *
    **/
      function findAppointmentIndexInArray(array, serNum)
      {
        for (var i = 0; i < array.length; i++) {
          if(array[i].AppointmentSerNum==serNum)
          {
            return i;
          }
        }
        return -1;

      }
    return {

         /**
        *@ngdoc method
        *@name setUserAppoinments
        *@methodOf MUHCApp.services:UserAppointments
        *@param {Object} appointments Appointment object obtain from Firebase
        *@description Function is called from the {@link MUHCApp.services:UpdateUI}. The function sets the UserAppointmentsArray, TodayAppointments, FutureAppointments, PastAppointments for the Appointment List used in
        the {@link MUHCApp.controller:AppointmentListController AppointmentListController}, and calendar object used in the {@link MUHCApp.controller:CalendarController CalendarController}.
        **/
        setUserAppointments: function (appointments) {
        //Initializing Variables
                this.UserAppointmentsInNativeCalendar=[];
                this.UserAppointmentsArray = [];
                this.TodayAppointments = [];
                this.FutureAppointments = [];
                this.PastAppointments = [];
                this.NextAppointment={};
                if (appointments === undefined) return;
                var keysArray = Object.keys(appointments);
                //Setting min date for upcoming appointment
                var min=Infinity;
                //Format date to javascript date
                var index=-1;
                var numberOfSessions=0;
                var date = new Date();
                for (var i = 0; i < keysArray.length; i++) {
                    appointments[keysArray[i]].ScheduledStartTime = new Date(date); //$filter('formatDate')(appointments[keysArray[i]].ScheduledStartTime);
                    appointments[keysArray[i]].ScheduledStartTime.setDate(date.getDate()-25);
                    appointments[keysArray[i]].ScheduledEndTime =  new Date(date);//$filter('formatDate')(appointments[keysArray[i]].ScheduledEndTime);
                    appointments[keysArray[i]].ScheduledEndTime.setDate(date.getDate());
                    date.setDate(date.getDate()+i);
                    this.UserAppointmentsArray[i] = appointments[keysArray[i]];
                    if(appointments[keysArray[i]].AppointmentType_EN=='Daily Radiotherapy Treatment Session'||appointments[keysArray[i]].AppointmentType_EN=='First Radiotherapy Treatment Session'||appointments[keysArray[i]].AppointmentType_EN=='Final Radiotherapy Treatment Session')
                    {
                      numberOfSessions++;
                    }

                    //Sort them by upcoming, past categories. Today's appointment array can be past or upcoming
                    var today = new Date();
                    var todayDay = today.getDate();
                    var todayMonth = today.getMonth() + 1;
                    var todayYear = today.getFullYear();
                    var appointmentDate = (this.UserAppointmentsArray[i]).ScheduledStartTime;

                    var appointmentDateDay = appointmentDate.getDate();
                    var appointmentDateMonth = appointmentDate.getMonth() + 1;
                    var appointmentDateYear = appointmentDate.getFullYear();

                    //Deciding the appointments for the day
                    if (todayDay === appointmentDateDay && todayMonth === appointmentDateMonth && todayYear === appointmentDateYear) {
                        this.TodayAppointments.push(this.UserAppointmentsArray[i]);
                    }

                    //Deciding whether they are future or past appointments
                    var dateDiff = this.UserAppointmentsArray[i].ScheduledStartTime-today;
                    if (dateDiff > 0) {
                        //Choosing the next appointment
                         if(dateDiff<min){
                            this.NextAppointment.Object=this.UserAppointmentsArray[i];
                            this.NextAppointment.Index=i;
                            index=i;
                            min=dateDiff;
                        }
                        this.FutureAppointments.push(this.UserAppointmentsArray[i]);
                    } else {
                        this.PastAppointments.push(this.UserAppointmentsArray[i]);
                    }
                }



                //Sort Appointments chronologically most recent first
                this.UserAppointmentsArray = $filter('orderBy')(this.UserAppointmentsArray, 'ScheduledStartTime', false);
                this.PastAppointments=$filter('orderBy')(this.PastAppointments, 'ScheduledStartTime',true);
                this.TodayAppointments=$filter('orderBy')(this.TodayAppointments, 'ScheduledStartTime',false);
                this.FutureAppointments=$filter('orderBy')(this.FutureAppointments, 'ScheduledStartTime',false);

                var sessionNumber = 1;
                for (var i = 0; i < this.UserAppointmentsArray.length; i++) {
                  if(this.UserAppointmentsArray[i].AppointmentType_EN=='Daily Radiotherapy Treatment Session'||this.UserAppointmentsArray[i].AppointmentType_EN=='Final Radiotherapy Treatment Session'||this.UserAppointmentsArray[i].AppointmentType_EN=='First Radiotherapy Treatment Session')
                  {
                    this.UserAppointmentsArray[i].sessionNumber="Session "+sessionNumber+ " of "+ numberOfSessions;
                    sessionNumber++;
                  }

                }
                console.log(this.UserAppointmentsArray);
                if(this.NextAppointment.hasOwnProperty('Index')){
                    for (var i = 0; i < keysArray.length; i++) {
                        if(this.NextAppointment.Object.AppointmentSerNum==this.UserAppointmentsArray[i].AppointmentSerNum)
                        {
                           this.NextAppointment.Index=i;
                        }


                    };
                }else{

                  this.NextAppointment.Object={};
                  this.NextAppointment.Index=-1;
                  console.log(this.NextAppointment.Object);
                }
        /*
            * Setting User Calendar
            //The rest of this function takes the results from the sorted by date appointments and organizes them into an object with
             //hierarchical structure year->month->day->appointments for the day, the dayly appointments are arrays.

        */
        //Initializing local variables
        var year = -1;
        var month = -1;
        var day = -1;
        this.calendar = {};
        var calendarYear = {};
        var calendarMonth = {};
        //If there are not appointments return -1;
        if (this.UserAppointmentsArray === undefined) return -1;
        //Loop goes through all the appointments in the sorted array of appointments, remember this only works if ap
        //appointments are already sorted
        for (var i = 0; i < this.UserAppointmentsArray.length; i++) {

            //Gets year, month and day for appointment
            var tmpYear = (this.UserAppointmentsArray[i].ScheduledStartTime).getFullYear();
            var tmpMonth = (this.UserAppointmentsArray[i].ScheduledStartTime).getMonth() + 1;
            var tmpDay = (this.UserAppointmentsArray[i].ScheduledStartTime).getDate();

            //if month has changed, since appointments in order, add the resulting appointments to for that month to the correspongding
            //calendar year.
            if (month !== tmpMonth || (month === tmpMonth && year !== tmpYear)) {
                if (i > 0) {
                    calendarYear[month] = {};
                    calendarYear[month] = calendarMonth;
                    calendarMonth = {};
                }
                month = tmpMonth;
            }

            //if year has changed, add year to the calendar object and changed the year to the year it changed too
            if (year !== tmpYear) {
                if (i > 0) {
                    this.calendar[year] = {};
                    this.calendar[year] = calendarYear;
                    calendarYear = {};
                    calendarMonth = {};
                }
                year = tmpYear;

            }

            //If statement just to defined objects and prevent exception in case certain day does not
            //have any appointments yet. It then adds to the calendaMonth object for that day the
            //appointment
            if (calendarMonth[tmpDay] === undefined) calendarMonth[tmpDay] = [];
            calendarMonth[tmpDay].push(this.UserAppointmentsArray[i]);

        }
        //Last Month, of year
        calendarYear[month] = {};
        calendarYear[month] = calendarMonth;
        this.calendar[year] = {};
        this.calendar[year] = calendarYear;

        },
        isThereNextAppointment:function(){
          if(this.FutureAppointments.length==0)
          {
            return false;
          }else{
            return true;
          }
        },
        isThereAppointments:function()
        {
          if(this.UserAppointmentsArray.length==0)
          {
            return false;
          }else{
            return true;
          }
        },
        getAppointmentBySerNum:function(serNum){
            for (var i = 0; i < this.UserAppointmentsArray.length; i++) {
                if(this.UserAppointmentsArray[i].AppointmentSerNum==serNum){
                    return this.UserAppointmentsArray[i];
                }
            };
        },
        /**
        *@ngdoc method
        *@name getUserAppointment
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} UserAppointmentArray
        *@description Returns the Array of Appointments organized chronologically.
        **/
        getUserAppointments: function () {

            return this.UserAppointmentsArray;
        },
         /**
        *@ngdoc method
        *@name getTodaysAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} TodayAppointments
        *@description Returns an Array with appointments for the day.
        **/
        getTodaysAppointments: function () {

            return this.TodayAppointments;
        },
         /**
        *@ngdoc method
        *@name getFutureAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} FutureAppointments
        *@description Returns array of future appointments.
        **/
        getFutureAppointments: function () {
            return this.FutureAppointments;
        },
          /**
        *@ngdoc method
        *@name getPastAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} PastAppointments
        *@description Returns array of past appointments.
        **/
        getPastAppointments: function () {
            return this.PastAppointments;
        },
        getNextAppointment:function(){
            return this.NextAppointment;
        },
        setAppointmentCheckin:function(serNum, val){
              var appointments=this.UserAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments[i].AppointmentSerNum==serNum){
                    this.UserAppointmentsArray[i].Checkin=val;
                }
            }
        },
         /**
        }
        }
        *@ngdoc method
        *@name getUserCalendar
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Object} calendar
        *@description Returns the calendar object.
        **/
        getLastAppointmentCompleted:function(){
          if(this.PastAppointments.length==0) return -1;
          return this.PastAppointments[0];
        },
        getUpcomingAppointment:function()
        {
          if(this.FutureAppointments.length==0) return -1;
          return this.FutureAppointments[0];
        },
        getUserCalendar:function(){
            return this.calendar;
        },
        setChangeRequest:function(index,value){
            var appointments=this.UserAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments.AppointmentSerNum==index){
                    this.UserAppointmentsArray[i].ChangeRequest=value;
                }
            }
        },
        checkinNextAppointment:function()
        {
          this.FutureAppointments[0].Checkin='1';
          var nextAppointmentSerNum=this.FutureAppointments[0].AppointmentSerNum;
          var index=findAppointmentIndexInArray(this.TodayAppointments, nextAppointmentSerNum);
          this.TodayAppointments[index].Checkin='1'
          this.UserAppointmentsArray[this.NextAppointment.Index].Checkin='1';

        }

    };
}]);


/*
var myApp=angular.module('MUHCApp');
*/
/**
*@ngdoc service
*@name MUHCApp.services:PatientAppointments
*@requires $filter
*@requires MUHCApp.service:RequestToServer
*@requires $q
*@requires MUHCApp.service:UserAuthorizationInfo
*@requires $cordovaCalendar
*@description Sets the User appointment objects for the different views.
**/
//myApp.service('Appointments', ['$q', 'RequestToServer','UserAuthorizationInfo', '$filter', 'UserPreferences', function ($q, RequestToServer, UserAuthorizationInfo, $filter, UserPreferences) {
    /**
    *@ngdoc property
    *@name  UserAppointmentsArray
    *@propertyOf MUHCApp.services:PatientAppointments
    *@description Array that contains all user appointments organized chronologically from most recent to least recent.
    **/
    /*
    var UserAppointmentsInNativeCalendar=[];
    var UserAppointmentsArray = [];
    var calendar={};
    var numberOfSessions=0;
    var NextAppointment = {};
    function searchAppointmentsAndDelete(appointments)
    {
      for (var i = 0; i < appointments.length; i++) {
        for (var j = 0; j < UserAppointmentsArray.length; j++) {
           if(UserAppointmentsArray[j].AppointmentSerNum==appointments[i].AppointmentSerNum)
           {
             UserAppointmentsArray.splice(j,1);
             break;
           }
        }

      }
    }
    function findClosestAppointmentForCheckin(todayAppointments)
    {
      var todayTime = (new Date()).getTime();
      var min = todayAppointments[0];
      var minDifference = Infinity;
      for (var i = 1; i < todayAppointments.length; i++) {
        var difference = Math.abs((todayAppointments[i].ScheduledStartTime).getTime() - todayTime);
        if(difference<minDifference)
        {
          minDifference = difference;
          min = todayAppointments[i];
        }
      }
      return min;
    }
    function getCheckinAppointment()
    {
      var todayAppointments = getAppointmentsInPeriod('Today');
      console.log(todayAppointments);
      todayAppointments = todayAppointments.filter(function(appointment){
        if(appointment.hasOwnProperty('StatusClose')) return false;
        else return true;
      });
      if(todayAppointments.length >0)
      {
        return findClosestAppointmentForCheckin(todayAppointments);
      }else{
        return null;
      }
    }

    function getAppointmentsInPeriod(period)
    {
      //Variables for comparing dates
      var today=new Date();
      var day=today.getDate();
      var month=today.getMonth();
      var year=today.getFullYear();
      var time=today.getTime();
      var sorting=false;
      //If sorting=false then latest appointment will be last, else it will be first
      if(period=='Past') sorting=true;
      var array=[];
      for (var i = 0; i < UserAppointmentsArray.length; i++) {
        var date=UserAppointmentsArray[i].ScheduledStartTime;
        //If appointment is the same date add it to the array
          if(period=='Today'&&date.getDate() == day && date.getFullYear() == year && date.getMonth() == month)
          {
            array.push(UserAppointmentsArray[i]);
            //If appointment is in the future add it to the array
          }else if(period=='Future'&&time<date.getTime())
          {
            array.push(UserAppointmentsArray[i]);
          //ditto
          }else if(period=='Past'&&date.getTime()<=time){
            array.push(UserAppointmentsArray[i]);
          }
      }
      //Sort it correctly for each case
      array=$filter('orderBy')(array, 'ScheduledStartTime',sorting);
      return array;
    }

    function isThereAppointmentToday() {
            var todayAppointments = getAppointmentsInPeriod('Today');
            if(todayAppointments.length == 0) {
              return false;
            } else {
              return true;
            }
        }

    function isThereNextAppointmentPrivate() {
          var FutureAppointments = getAppointmentsInPeriod('Future');
          if(FutureAppointments.length == 0) {
            return false;
          } else {
            return true;
          }
        }

    function addAppointmentsToService(appointments) {
      if (appointments === undefined) return;
      //Setting min date for upcoming appointment
      var min=Infinity;
      //Format date to javascript date
      var index=-1;
      numberOfSessions=0;
      for (var i = 0; i < appointments.length; i++) {
          appointments[i].ResourceName = (appointments[i].Resource.hasOwnProperty('Machine')) ? appointments[i].Resource.Machine:appointments[i].Resource.Doctor;
          appointments[i].ScheduledStartTime = $filter('formatDate')(appointments[i].ScheduledStartTime);
          appointments[i].ScheduledEndTime =  $filter('formatDate')(appointments[i].ScheduledEndTime);
          UserAppointmentsArray[i] = appointments[i];
          if(appointments[i].AppointmentType_EN=='Daily Radiotherapy Treatment'||appointments[i].AppointmentType_EN=='First Radiotherapy Treatment Session'||appointments[i].AppointmentType_EN=='Final Radiotherapy Treatment Session')
          {
            numberOfSessions++;
          }
      }
      //Sort Appointments chronologically most recent first
      UserAppointmentsArray = $filter('orderBy')(UserAppointmentsArray, 'ScheduledStartTime', false);
      var sessionNumber = 1;
      for (var j = 0; j < UserAppointmentsArray.length; j++) {
        if(UserAppointmentsArray[j].AppointmentType_EN=='Daily Radiotherapy Treatment'||UserAppointmentsArray[j].AppointmentType_EN=='Final Radiotherapy Treatment Session'||UserAppointmentsArray[j].AppointmentType_EN=='First Radiotherapy Treatment Session')
        {
          UserAppointmentsArray[j].sessionNumber="Session "+sessionNumber+ " of "+ numberOfSessions;
          sessionNumber++;
        }
      }
      */
      /*
        * Setting User Calendar
        //The rest of this function takes the results from the sorted by date appointments and organizes them into an object with
         //hierarchical structure year->month->day->appointments for the day, the dayly appointments are arrays.

      */
      /*
      //Initializing local variables
      var year = -1;
      var month = -1;
      var day = -1;
      calendar = {};
      var calendarYear = {};
      var calendarMonth = {};
      //Loop goes through all the appointments in the sorted array of appointments, remember this only works if ap
      //appointments are already sorted
      for (var i = 0; i < UserAppointmentsArray.length; i++) {

        //Gets year, month and day for appointment
        var tmpYear = (UserAppointmentsArray[i].ScheduledStartTime).getFullYear();
        var tmpMonth = (UserAppointmentsArray[i].ScheduledStartTime).getMonth() + 1;
        var tmpDay = (UserAppointmentsArray[i].ScheduledStartTime).getDate();

        //if month has changed, since appointments in order, add the resulting appointments to for that month to the correspongding
        //calendar year.
        if (month !== tmpMonth || (month === tmpMonth && year !== tmpYear)) {
            if (i > 0) {
                calendarYear[month] = {};
                calendarYear[month] = calendarMonth;
                calendarMonth = {};
            }
            month = tmpMonth;
        }

        //if year has changed, add year to the calendar object and changed the year to the year it changed too
        if (year !== tmpYear) {
            if (i > 0) {
                calendar[year] = {};
                calendar[year] = calendarYear;
                calendarYear = {};
                calendarMonth = {};
            }
            year = tmpYear;

        }

        //If statement just to defined objects and prevent exception in case certain day does not
        //have any appointments yet. It then adds to the calendaMonth object for that day the
        //appointment
        if (calendarMonth[tmpDay] === undefined) calendarMonth[tmpDay] = [];
        calendarMonth[tmpDay].push(UserAppointmentsArray[i]);

      }
      //Last Month, of year
      calendarYear[month] = {};
      calendarYear[month] = calendarMonth;
      calendar[year] = {};
      calendar[year] = calendarYear;
    }
      function findAppointmentIndexInArray(array, serNum)
      {
        for (var i = 0; i < array.length; i++) {
          if(array[i].AppointmentSerNum==serNum)
          {
            return i;
          }
        }
        return -1;

      }
      function manageAppointmentsInNativeCalendar(appointments,index)
      {
        //var appointments=UserAppointmentsArray;
        var indexValue=index;
        var r=$q.defer();
        var today=new Date();
        if(index===appointments.length||typeof index=='undefined')
        {
          r.resolve('Done adding all appointments');
        }else{
          var startDate=appointments[indexValue].ScheduledStartTime;
          console.log(appointments[indexValue]);
          if(today<startDate)
          {
            var eventToCalendar={};
            var tmp=new Date(appointments[indexValue].ScheduledStartTime);
            var endDate = tmp.setHours(startDate.getHours()+1);
            eventToCalendar.startDate=startDate;
            eventToCalendar.endDate=endDate;
            (UserPreferences.getLanguage()=='EN')?eventToCalendar.title=appointments[indexValue].AppointmentType_EN:eventToCalendar.title=appointments[indexValue].AppointmentType_FR;
            eventToCalendar.location=appointments[index].Location;
            eventToCalendar.notes='Source: ' +appointments[indexValue].ResourceName;
            if(isAppointmentInNativeCalendar(appointments[indexValue].AppointmentSerNum))
            {
              console.log('Found event in Calendar');
              var newIndex=indexValue+1;
              r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
            }else{
              $cordovaCalendar.createEvent(eventToCalendar).then(function (result) {
                  addEventToNativeCalendar(appointments[indexValue].AppointmentSerNum);
                  var newIndex=indexValue+1;
                  r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
              }, function (err) {
                  console.log(err);
                   navigator.notification.alert(
                      'An error occured while adding your appointments',  // message
                      function(error){
                        console.log(error);
                      },         // callback
                      'Error',            // title
                      'OK'                  // buttonName
                  );
                  var newIndex=indexValue+1;
                  r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
              });
            }

          }else{
            var newIndex=indexValue+1;
            r.resolve(manageAppointmentsInNativeCalendar(appointments,newIndex));
          }
        }
        return r.promise;
      }
        function isAppointmentInNativeCalendar(serNum)
        {
            var appointmentsString=window.localStorage.getItem('NativeCalendarAppoinments');
            if(!appointmentsString){
                return false;
            }else{
                console.log(appointmentsString);
                appointmentsObject=JSON.parse(appointmentsString);
                var appointmentList=appointmentsObject.AppointmentList;
                for(var i=0;i<appointmentList.length;i++){
                     if(appointmentList[i]===serNum){
                        return true;
                     }
                }
                return false;
            }
        }

        function addEventToNativeCalendar(serNum){
            var appointmentsString=window.localStorage.getItem('NativeCalendarAppoinments');
            if(appointmentsString){
                appointmentsObject=JSON.parse(appointmentsString);
                appointmentsObject.AppointmentList.push(serNum);
                appointmentString=JSON.stringify(appointmentsObject);
                window.localStorage.setItem('NativeCalendarAppoinments',appointmentString);
            }
        }
        
    return {
        */
         /**
        *@ngdoc method
        *@name setUserAppoinments
        *@methodOf MUHCApp.services:UserAppointments
        *@param {Object} appointments Appointment object obtain from Firebase
        *@description Function is called from the {@link MUHCApp.services:UpdateUI}. The function sets the UserAppointmentsArray, TodayAppointments, FutureAppointments, PastAppointments for the Appointment List used in
        the {@link MUHCApp.controller:AppointmentListController AppointmentListController}, and calendar object used in the {@link MUHCApp.controller:CalendarController CalendarController}.
        **/
        /*
        setUserAppointments: function (appointments) {
        //Initializing Variables
            UserAppointmentsInNativeCalendar=[];
            UserAppointmentsArray = [];
            calendar={};
            addAppointmentsToService(appointments);
        },
        updateUserAppointments:function(appointments)
        {
          searchAppointmentsAndDelete(appointments);
          addAppointmentsToService(appointments);
        },
        isThereAppointments:function()
        {
          if(UserAppointmentsArray.length==0)
          {
            return false;
          }else{
            return true;
          }
        },
        isThereNextAppointment: function() {
          var FutureAppointments = getAppointmentsInPeriod('Future');
          if(FutureAppointments.length == 0) {
            return false;
          } else {
            return true;
            }
          },
        isThereFirstTreatmentAppointment:function()
        {
          if(numberOfSessions>0)
          {
            return true;
          }else{
            return false;
          }
        },
        getAppointmentBySerNum:function(serNum){
            for (var i = 0; i < UserAppointmentsArray.length; i++) {
                if(UserAppointmentsArray[i].AppointmentSerNum==serNum){
                    return angular.copy(UserAppointmentsArray[i]);
                }
            };
        },*/
        /**
        *@ngdoc method
        *@name getUserAppointment
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} UserAppointmentArray
        *@description Returns the Array of Appointments organized chronologically.
        **/
        /*
        getUserAppointments: function () {
            return UserAppointmentsArray;
        },
        */
         /**
        *@ngdoc method
        *@name getTodaysAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} TodayAppointments
        *@description Returns an Array with appointments for the day.
        **/
        /*
        getTodaysAppointments: function () {
          return getAppointmentsInPeriod('Today');
        },*/
         /**
        *@ngdoc method
        *@name getFutureAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} FutureAppointments
        *@description Returns array of future appointments.
        **/
        /*
        getFutureAppointments: function () {
          return getAppointmentsInPeriod('Future');
        },*/
          /**
        *@ngdoc method
        *@name getPastAppointments
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Array} PastAppointments
        *@description Returns array of past appointments.
        **/
        /*
        getPastAppointments: function () {
          return getAppointmentsInPeriod('Past');
        },
        getNextAppointment:function(){
          if(isThereAppointmentToday()) {
            var todayAppointments = getTodaysAppointments();
            if(Object.prototype.toString.call(todayAppointments) === '[object Array]') { // if multiple appointments in one day
              return todayAppointments[0];
            } else { // if only one appointment
              return todayAppointments;
            }
          } else if(isThereNextAppointmentPrivate()) {
            var nextAppointments = getFutureAppointments();
            if(Object.prototype.toString.call(nextAppointments) === '[object Array]') { // if nextAppointments is an array
              return nextAppointments[0];
            } else { // if nextAppointments is an object
            return nextAppointments;
            }
          }
            return this.NextAppointment;
        },
        setAppointmentCheckin:function(serNum){
              var appointments=UserAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments[i].AppointmentSerNum==serNum){
                    UserAppointmentsArray[i].Checkin='1';
                }
            }
        },*/
         /**
        }
        }
        *@ngdoc method
        *@name getUserCalendar
        *@methodOf MUHCApp.services:UserAppointments
        *@returns {Object} calendar
        *@description Returns the calendar object.
        **/
        /*
        getLastAppointmentCompleted:function(){
          var pastApp= getAppointmentsInPeriod('Past');
          if(pastApp.length === 0) return -1;
          return pastApp[0];
        },
        getUpcomingAppointment:function()
        {
          var FutureAppointments=getAppointmentsInPeriod('Future');
          if(FutureAppointments.length ===0) return -1;
          return FutureAppointments[0];
        },
        getUserCalendar:function(){
            return calendar;
        },
        setChangeRequest:function(index,value){
            var appointments=UserAppointmentsArray;
            for(var i=0;i<appointments.length;i++){
                if(appointments.AppointmentSerNum==index){
                    UserAppointmentsArray[i].ChangeRequest=value;
                }
            }
        },
        getAppointmentsToday:function()
        {
           return getAppointmentsInPeriod('Today');
        },
        getCheckinAppointment:function()
        {
          return getCheckinAppointment();
        },
        setCheckinAppointmentAsClosed:function(serNum)
        {
          for (var i = 0; i < UserAppointmentsArray.length; i++)
          {
            if(UserAppointmentsArray[i].AppointmentSerNum == serNum)
            {
              UserAppointmentsArray[i].StatusClose = true;
            }
          }
        },
        isCheckinAppointment:function(appointment)
        {
          var checkInAppointment = getCheckinAppointment();
          if(checkInAppointment)
          {
            if(checkInAppointment.AppointmentSerNum == appointment.AppointmentSerNum)
            {
              return true;
            }else{
              return false;
            }
          }else{
            return false;
          }

        },
        getAppointmentName:function(serNum)
        {
          console.log(serNum);
          console.log(UserAppointmentsArray);
          for (var i = 0; i < UserAppointmentsArray.length; i++) {
            if(UserAppointmentsArray[i].AppointmentSerNum == serNum)
            {
              console.log({NameEN:UserAppointmentsArray[i].AppointmentType_EN, NameFR: UserAppointmentsArray[i].AppointmentType_FR });
              return {NameEN:UserAppointmentsArray[i].AppointmentType_EN, NameFR: UserAppointmentsArray[i].AppointmentType_FR };
            }
          }
        },
        readAppointmentBySerNum:function(serNum)
        {
          for (var i = 0; i < UserAppointmentsArray.length; i++) {
            if(UserAppointmentsArray[i].AppointmentSerNum == serNum)
            {
              UserAppointmentsArray[i].ReadStatus = '1';
              RequestToServer.sendRequest('Read',{"Id":serNum, "Field": "Appointments"});
            }
          }
        },
        checkAndAddAppointmentsToCalendar:function(){
          var r=$q.defer();
          if(UserAppointmentsArray.length>0)
          {
            console.log(UserAppointmentsArray.length);
            manageAppointmentsInNativeCalendar(UserAppointmentsArray,0).then(
              function(app){
                r.resolve(app);
              });
          }else{
            r.resolve('No appointments');
          }
          return r.promise;
        },
        getAppointmentUrl:function(serNum)
        {
          return './views/personal/appointments/individual-appointment.html';
        },
        //Getting radiotherapy treatment appointments
        getTreatmentAppointments:function()
        {
          var array = [];
          var number = 0;
          var completedBoolean = false;
          var currentAppointment = {};
          var Index = 0;
          var todayTime = (new Date()).getTime();
          for (var i = 0; i < UserAppointmentsArray.length; i++) {
            if(UserAppointmentsArray[i].AliasSerNum =='6'||UserAppointmentsArray[i].AliasSerNum=='7'||UserAppointmentsArray[i].AliasSerNum=='9')
            {
              number++;
              if(UserAppointmentsArray[i].ScheduledStartTime.getTime() > todayTime)
              {
                  if(!completedBoolean)
                  {
                      UserAppointmentsArray[i].TimeStatus = 'Next';
                      currentAppointment = UserAppointmentsArray[i];
                      Index = number;
                      console.log(UserAppointmentsArray[i]);
                      completedBoolean = true;
                  }else{
                    UserAppointmentsArray[i].TimeStatus = 'Future';
                  }
              }else{
                UserAppointmentsArray[i].TimeStatus = 'Past';
              }
              array.push(UserAppointmentsArray[i]);
            }
          }
          return {Total: number, CurrentAppointment:{ Index: Index, Appointment: currentAppointment}, AppointmentList:array, Completed: !completedBoolean};
        },
        //Get number of unread news
        getNumberUnreadAppointments:function()
        {
          var array = [];
          var number = 0;
          for (var i = 0; i < UserAppointmentsArray.length; i++) {
            if(UserAppointmentsArray[i].ReadStatus == '0')
            {
              number++;
            }
          }
          return number;
        },
        //Input array or string sets the language of the appointments for controllers to use
        setAppointmentsLanguage:function(array)
        {
          var language = UserPreferences.getLanguage();
          //Check if array
          if (Object.prototype.toString.call( array ) === '[object Array]') {
            for (var i = 0; i < array.length; i++) {
              //set language
              if(!array[i].hasOwnProperty('Title')||!array[i].hasOwnProperty('Description')||!array[i].hasOwnProperty('ResourceName'))
              {
                if( array[i].Resource.hasOwnProperty('Machine')||Object.keys(array[i].Resource).length == 0)
                {
                  array[i].ResourceName = (language =='EN')? array[i].MapName_EN : array[i].MapName_FR;
                }else if(array[i].Resource.hasOwnProperty('Doctor')){
                  array[i].ResourceName = (language =='EN')? array[i].Resource.Doctor : array[i].Resource.Doctor;
                }else{
                  array[i].ResourceName = (language =='EN')? array[i].MapName_EN : array[i].MapName_FR;
                }
                array[i].Title = (language=='EN')? array[i].AppointmentType_EN : array[i].AppointmentType_FR;
                array[i].Description = (language == 'EN')? array[i].AppointmentDescription_EN : array[i].AppointmentDescription_FR;
              }
            }
          }else{
            //set language if string
            if(!array.hasOwnProperty('Title')||!array.hasOwnProperty('Description'))
            {
              array.Title = (language=='EN')? array.AppointmentType_EN : array.AppointmentType_FR;
              array.Description = (language == 'EN')? array.AppointmentDescription_EN: array.AppointmentDescription_FR;
            }
          }
          return array;
        }
    };
}]);

*/