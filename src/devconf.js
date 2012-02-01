/**
 * @author Josef Skladanka http://search.twitter.com/search.json?q=%23devconf
 * 
 */


enyo.kind({
    name: "DevConf",
    kind: enyo.VFlexBox,
    transitionKind: "enyo.transitions.LeftRightFlyin",
    selected_day: "Now", // "Now", "Day 1", "Day 2"
    day_to_date: {"Day 1": "2012-02-17", "Day 2": "2012-02-18"},
    selected_type: "talk", // "talk", "lab", "social"
    schedule: null,
    filtered_schedule: null,
    last_start: null,
    last_end: null,
    selectedScheduleItemIndex: 0,
    twitter_data: null,
    lastScheduleCheck: null,
    scheduleCheckInterval: 600000, // 10 minutes in miliseconds

    components:
      [
        {kind: enyo.ApplicationEvents, onBack: "backGestureHandler"},
        
        {name: "getLocalSchedule", kind: "WebService",
    	   url: "data/schedule.json",
    	   onSuccess: "gotSchedule",
    	   onFailure: "gotScheduleFailure"
    	},
    	{name: "getLocalScheduleTs", kind: "WebService",
     	   url: "data/schedule-ts.json",
     	   onSuccess: "gotScheduleTs",
     	   onFailure: "gotScheduleTsFailure"
     	},
     	{name: "getSchedule", kind: "WebService",
     	   url: "http://m.devconf.cz/schedule.json",
     	   onSuccess: "gotSchedule",
     	   onFailure: "gotScheduleFailure"
     	},
     	{name: "getScheduleTs", kind: "WebService",
      	   url: "http://m.devconf.cz/schedule-ts.json",
      	   onSuccess: "gotScheduleTs",
      	   onFailure: "gotScheduleTsFailure"
      	},
     	{name: "getTwitter", kind: "WebService",
      	   url: "http://search.twitter.com/search.json?q=%23devconf",
      	   onSuccess: "gotTwitter",
      	   onFailure: "gotTwitterFailure"
      	},
    	{
            name : "openCalendar",
            kind : "PalmService",
            service : "palm://com.palm.applicationManager",
            method : "open",
            subscribe : true
        },
        {
            name : "getConnMgrStatus",
            kind : "PalmService",
            service : "palm://com.palm.connectionmanager/",
            method : "getStatus",
            onSuccess : "connStatusFinished",
            onFailure : "connStatusFail",
            onResponse : "gotConnResponse",
            subscribe : true
        },
        {name: "AppManService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
        
        {kind: "AppMenu", components: [
                                       {kind: "EditMenu"},
                                       {content: "Help", onclick: "helpBtn_click"},
                                       ]
        },
        {kind: "Popup", name: "connPopup", components: [
                                     {style: "margin-bottom: 10px", content: "Please, enable the internet connection!"},
                                     {style: "font-size: 80%", content: "This application requires internet connection to be able to download schedule updates, show twitter feed and venue map."},
                                     {style: "font-size: 80%; margin-bottom: 10px", content: "Other parts of the application are, of course, acessible offline."},
                                     {kind: "Button", caption: "OK", onclick:"closeConnPopup"}
                                 ]
        },
                               
        {kind: "PageHeader", name: "fullHeader", style: "background: url('images/header_main.png')"},
        {kind: "Image", name: "slimHeader", src:"images/header_slim.png"},
        {name: "pane", kind:"Pane", flex: 1, onSelectView: "viewSelected", components: 
          [
	        {
			    name: "mainPane",
			    kind: enyo.VFlexBox, components:
			      [           
			        {kind: "Group", caption: "Program", components:
			          [
			            {kind: "Button", name: "currentBtn", caption: "Now", onclick: "currentBtn_click"},
			            {kind: "Button", name: "day1Btn", caption: "Day 1", onclick: "day1Btn_click"},
			            {kind: "Button", name: "day2Btn", caption: "Day 2", onclick: "day2Btn_click"},
			          ]
			        },
		            {kind: "Button", name: "aboutBtn", caption: "About", onclick: "aboutBtn_click"},
		            {kind: "Button", name: "contactBtn", caption: "Contacts", onclick: "contactBtn_click"},
		            {kind: "Button", name: "twitterBtn", caption: "#devconf", onclick: "twitterBtn_click"},
			      ]
			},
			{
			    name: "eventSelect",
			    kind: enyo.VFlexBox,
			    components:
			      [
 	                {kind: "Group", name: "dayGroup", caption: "Day ?", components:
			          [
			            {kind: "Button", name: "talksBtn", caption: "Talks", onclick: "talksBtn_click"},
			            {kind: "Button", name: "labsBtn", caption: "Labs", onclick: "labsBtn_click"},
			            {kind: "Button", name: "socialBtn", caption: "Social Events", onclick: "socialBtn_click"},
			          ]
			        },     
			      ]
			},
			{
				name: "scheduleListView",
				kind: "Scroller", flex: 1, components: 
				  [
	     			{name: "listSchedule", kind: "Repeater", onSetupRow: "scheduleSetupRow"}
				  ]
			},
			{
			    name: "scheduleItemDetail",	
			    kind: enyo.VFlexBox,
			    components:
			      [
			        {name: "sdTopic", content: "Topic", style: "font-weight: bold; font-size: 110%;"},
			        {name: "sdSpeaker", content: "Speaker", style: "font-size: 90%; font-style: italic;"},
			        {name: "sdTags", content: "Tags", style: "font-size: 80%"},
			        {content: "&nbsp;"},
			        {kind: "Scroller", flex: 1, components: [{name: "sdDescription", content: "Description"}]},
			      ]
			},
			{
				name: "twitterWall",
				kind: "VFlexBox", components:
				  [
					{name: "twitterListView",
					kind: "Scroller", flex: 1, components: 
					  [
		     			{name: "listTwitter", kind: "Repeater", onSetupRow: "twitterSetupRow"}
					  ]},
					{kind: "Button", caption: "Update", onclick: "twitterBtn_click"}
				  ]
			},
			{
				name: "mapPane",
				kind: "VFlexBox", components:
				  [
					{ name: "myMap",
				        kind: "Map",
				        flex: 1,
				        credentials: "AgqpAhknuhgBPUc-xalAQ6bFO6I4LceEk3mCxaEF1w3RiYW7wAnX65dmeLYiKMcT"
				    },
				  ]
			},
			{
				name: "aboutPane",
				kind: "VFlexBox", components:
				  [
				   {kind: "Scroller", flex: 1, components: [
				    {style: "font-size: 90%", content: "<b>About Developer Conference</b>"},
				    {style: "font-size: 80%; margin-bottom: 5px", content: "Developer Conference is a two-day conference that is focused on Red Hat, Fedora, and JBoss technologies. All talks and workshops are highly technical and targer developers, admins, and computer science students. It's organized by Red Hat Czech."},
				    {style: "font-size: 90%", content: "<b>Dates</b>"},
				    {style: "font-size: 80%", content: "February 2012; Friday 17th - Saturday 18th"},
				    {style: "font-size: 90%", content: "<b>Admission</b>"},
				    {style: "font-size: 90%; margin-bottom: 5px", content: "Free"},
				    {style: "font-size: 90%", content: "<b>Venue</b>"},
				    {style: "font-size: 80%; margin-bottom: 10px", content: "Faculty of Informatics, Masaryk University<br>Botanická 554/68a<br>602 00 Brno-Ponava<br>Czech Republic"},
				    {kind: "Button", caption: "Show map", name: "showMapBtn", onclick: "showMapBtn_click"},
				   ]}
				  ]
			},
			{
				name: "contactsPane",
				kind: "VFlexBox", components:
				  [
				    {style: "font-size: 90%",content: "<b>Organizational Team Lead</b>"},
				    {kind: "HFlexBox", components:[
                       {style: "font-size: 80%;margin-top: 8px",content: "Jiří Eischmann"},
                       {kind: "Spacer"},
                       {kind: "Button", caption: "Call", onclick: "callEischmann"}
				    ]},
				    {style: "font-size: 90%",content: "<b>Red Hat</b>"},
				    {kind: "HFlexBox", components:[
                       {style: "font-size: 80%;margin-top: 8px",content: "Radek Vokál"},
                       {kind: "Spacer"},
                       {kind: "Button", caption: "Call", onclick: "callVokal"}
				    ]},
				    {style: "font-size: 90%",content: "<b>Fedora KDE SIG FAD</b>"},
				    {kind: "HFlexBox", components:[
                       {style: "font-size: 80%;margin-top: 8px",content: "Jaroslav Řezník"},
                       {kind: "Spacer"},
                       {kind: "Button", caption: "Call", onclick: "callReznik"}
				    ]},
				  ]
			},
			{
				name: "helpPane",
				kind: "VFlexBox", components:
				  [
				   {content: "If you should come to any trouble connected to using this app, please contact the author using email <rajcze@gmail.com>.<br/> <br/>"},
				   {content: "If you require help during the Developer Conference, please use one of the contacts on the 'Contacts' page,"},
				   {kind: "Button", caption: "Contacts", onclick: "contactBtn_click"},
				  ]
			},
          ]
        },
        {kind: "Toolbar", name: "backBtn", components: [
                                       {icon: "images/back_32.png", onclick: "goBack"},
                                       {kind:"Spacer"},
                                       {icon: "images/calendar_32.png", name: "sdAddToCalendar", onclick: "sdAddToCalendar_click"}
                                     ]}
     ],


     create: function() {
         this.inherited(arguments);
         lcl = this.getLocalObject("schedule");
         if ((lcl == null) || (JSON.stringify(lcl).length < 100)){
         	this.$.getLocalSchedule.call();
         }
         else{
         	this.schedule = lcl;
         }
         lcl = localStorage.getItem("timestamp");
         if ((lcl == null) || (JSON.stringify(lcl).length < 8)){
         	this.$.getLocalScheduleTs.call();
         }
         this.$.pane.selectViewByName("mainPane");
         this.getConnStatus();
         
    },
     
/* ==== Helper methods ==== */
    
     /*
		 * Because localStorage stores just strings, and we need to save the
		 * whole json object (schedule), these two methods handle the
		 * storing/retrieving.
		 */
     setLocalObject: function(key, value){
     	localStorage.setItem(key, JSON.stringify(value));
     },

     getLocalObject: function(key){
     	var value = localStorage.getItem(key);
     	return value && JSON.parse(value);
     },
    
     /* Triggers the request for current connections state. */
     getConnStatus : function(inSender, inResponse)
     {
         this.$.getConnMgrStatus.call({ "subscribe": true });
     },


/* ==== Pane Switching; UI components displaying/hiding ==== */

    /*
	 * This method shows/hides UI components according to the currently selected
	 * pane view. This mostly consists of switching the big/slim header and
	 * showing/hiding the back button, where appropriate.
	 * 
	 * The only exception here is the selection of the schedule list, which
	 * triggers check for the schedule update.
	 */
    viewSelected: function(inSender, inView) {
         if (inView == this.$.mainPane) {
             this.$.backBtn.hide();
             this.$.slimHeader.hide();
             this.$.fullHeader.show();
             this.$.sdAddToCalendar.hide();
         } else if (inView == this.$.eventSelect) {
             this.$.backBtn.show();
             this.$.slimHeader.show();
             this.$.fullHeader.hide();
             this.$.sdAddToCalendar.hide();
             this.$.dayGroup.setCaption(this.selected_day);
         }
         else if (inView == this.$.twitterWall) {
 	        this.$.backBtn.show();
 	        this.$.sdAddToCalendar.hide();
         }
         else if (inView == this.$.scheduleItemDetail){
         	this.$.sdAddToCalendar.show();
         }
         else if (inView == this.$.mapPane){
             this.$.backBtn.show();
             this.$.slimHeader.show();
             this.$.fullHeader.hide();
         }
         else if (inView == this.$.aboutPane){
         	this.$.backBtn.show();
             this.$.slimHeader.show();
             this.$.fullHeader.hide();
         }
         else if (inView == this.$.contactsPane){
         	this.$.backBtn.show();
         }
         else if (inView == this.$.helpPane){
         	this.$.backBtn.show();
         }
         else if (inView == this.$.scheduleListView){
          	this.$.sdAddToCalendar.hide();
          	/*
			 * Check, whether it's time for next check for updates of the
			 * schedule. Update check is triggered either if the
			 * lastScheduleCheck is null (i.e. the scheduleListView is shown for
			 * the first time), or when the specified interval passed from the
			 * last check.
			 */
          	d = new Date();
          	now = d.getTime();
          	if ((this.lastScheduleCheck == null) || ((this.lastScheduleCheck + this.scheduleCheckInterval) < now)){
          		this.lastScheduleCheck = now;
                this.$.getScheduleTs.call();	
          	}
          }
     },
     
     /* Show the previous pane view. */
     goBack: function(){
     	this.$.pane.back();
     },
     
     /* Show/hide the popup informing about the internet connection */
     showConnPopup:function(){
    	 this.$.connPopup.openAtCenter();
     },
     
     closeConnPopup: function(){
     	this.$.connPopup.close()
     },
     
/* ==== System events ==== */
     
     /*
		 * Because Enyo does not process the gestures from the Pre3 gesture zone
		 * 'automagically', this handler does it programatically
		 */
     backGestureHandler: function(inSender, inEvent) {
         if (this.$.pane.getView() != this.$.mainPane){
         	/*
			 * Using preventDefault() will prevent it from going to card view.
			 * To preserve the expected behaviour, we need to use it only when
			 * there is no possible 'back' step - i.e. on the mainPane.
			 */
         	inEvent.preventDefault();
         	this.goBack();
         }
     },
     
    
    /* Handlers for the getConnMgrStatus service calls */
    connStatusFinished : function(inSender, inResponse) {
        if (inResponse.isInternetConnectionAvailable != true){
        	this.showConnPopup();
        }
    },
    
    connStatusFail : function(inSender, inResponse) {
        enyo.log("getConnStatus failure, results=" + enyo.json.stringify(inResponse));
    },
    

    /* Handlers for downloading the schedule updates. */
    
    /*
	 * If the reponse seems to be OK, store the received JSON object into the
	 * localStorage.
	 */
    gotSchedule: function(inSender, inResponse, inRequest){
    	if (JSON.stringify(inResponse).length > 100){
    		this.setLocalObject("schedule", inResponse);
    		this.schedule = this.getLocalObject("schedule");
    	}
    },
    /*
	 * When the request fails, schedule next try for the subsequent 'showing' of
	 * the scheduleListView
	 */
	gotScheduleFailure: function(inSender, inResponse, inRequest){
    	// since something went terribly wrong, make sure that we retry
    	// download by setting timestamp & lastScheduleCheck to 0
		now_time = new Date();
		localStorage.setItem("timestamp", 0);
		this.lastScheduleCheck = 0;		
    },

    
    /*
	 * When new schedule-ts is downloaded, check, whether the timestamp is newer
	 * than the locally stored data. If so, then trigger the full schedule
	 * download
	 */
    gotScheduleTs: function(inSender, inResponse, inRequest){
    	if (JSON.stringify(inResponse).length > 8){
    		last_ts = localStorage.getItem("timestamp");
    		if ((last_ts == null) || (last_ts < inResponse)){
    			localStorage.setItem("timestamp", inResponse);
    			this.$.getSchedule.call();
    		}
    	}
    	
    },
    gotScheduleTsFailure: function(inSender, inResponse, inRequest){
    	enyo.log("gotScheduleTsFailure");
    },
    
    
    /* Twitter download handler */
    gotTwitter: function(inSender, inResponse, inRequest){
    	this.twitter_data = inResponse;
    	if (inResponse.length < 100){
    		return this.gotTwitterFailure(inSender, inResponse, inRequest);
    	}
    	// Refresh the twitter wall page
    	if (this.$.pane.getViewName() != "twitterWall"){
    		this.$.pane.selectViewByName("twitterWall");
    	}
    	this.$.twitterListView.setScrollTop(0);
    	this.$.listTwitter.render();
    },
    
	gotTwitterFailure: function(inSender, inResponse, inRequest){
    	enyo.log("gotTwitterFailure");
    },
    

    
/* ==== List Views (Repeater) display ==== */

/*
 * The Repeaters call the xyzSetupRow method (callbacks from onSetupRow), as
 * long, as the xyzSetupRow keeps returning new Items to add to the List View.
 * Each time the xyzSetupRow is called, the inIndex is increased by one.
 */

/* ---- Twitter Wall ---- */
    
    /* Creates an item containing user image, name and tweet. */
    twitterSetupRow: function(inSender, inIndex){
    	if (this.twitter_data != null){
    		if (inIndex < this.twitter_data.results.length){
    			item = this.twitter_data.results[inIndex];
    			user = item['from_user'];
    			name = item['from_user_name'];
    			image = {kind: "Image", src: item['profile_image_url'], style: "margin-right:10px"};
    			text = item['text'];
    			
    			line1 = {content: user + " (" + name + ")", style: "font-size: 90%;font-weight:bold;"};
    			line2 = {content: text, style: "font-size: 80%"};
    			
    			container = {kind: "VFlexBox", flex: 1, components: [line1, line2]};
    			return {kind: "Item", layoutKind: "HFlexLayout", components: [image, container] }
    		}
    	}
    },

	/*
	 * Takes the previously filtered schedule events (see filter_schedule() in
	 * the 'Schedule' secion), and creates Item for each one.
	 * 
	 * There is a minor 'hack' tied to our need of showing duration of the
	 * talks/labs in 'header' of each 'section of events with equal duration'.
	 * When start/end time of the item is different from the previous one
	 * (previous values are stored in this.last_start & this.last_end), we add a
	 * a 'two liner' - a VFlexBox containing two HFlexBoxes. Top one is the
	 * 'header with time', bottom one is the event information.
	 */
	scheduleSetupRow: function(inSender, inIndex) {

		if (this.filtered_schedule != null){
	    	if (inIndex < this.filtered_schedule.items.length){
	    		item = this.filtered_schedule.items[inIndex];
	    		room = {content: item.room,className: "listItemRoom" + item.room, style: "padding: 5px; margin-right: 5px;border-radius: 10px"};
	    		about = {kind: "VFlexBox", flex: 1, components: [
	    		              	    		                   {content: item.topic, style: "font-weight:bold;"},
	    		            	    		                   {content: item.speaker, style: "font-size: 80%;"},
	    		            	    		                                                 ]};
	    		to_detail = {content: ">", style: "margin-left: 5px; font-weight: bold"};
	    		// The time has changed -> we need to add also the 'time
				// header'.
	    		if ((item.start != this.last_start) || (item.end != this.last_end)){
	    			line1 = {kind:"HFlexBox", components: [{content: item.date, style: "font-size: 80%"},{kind: "Spacer"}, {content: item.start+" - "+item.end, style: "font-size: 80%"}]};
	    			line2 = {kind:"HFlexBox", components: [room, about, to_detail]};
	    			cmpnt = [{kind:"VFlexBox", flex: 1, components: [line1, line2]}];
	    			this.last_start = item.start;
	    			this.last_end = item.end;
	    		}
	    		else{
	    			cmpnt = [room, about, to_detail];
	    		}
	    		return {kind: "Item", layoutKind: "HFlexLayout", onclick: "scheduleItemClick", components: cmpnt};
	    	}
    	}

		this.last_start = null;
		this.last_end = null;
	},

/* ==== Schedule ==== */
	
/* ---- Helper methods ---- */
	
	/*
	 * This method is pointless, since the timestamp-end property was added in
	 * the newer versions of the schedule.json, but it's cool magic :D
	 * 
	 * Start time is taken from the item.timestamp; End time is computed from
	 * start time & duration; Duration is computed from two HH:MM strings
	 * (item.start & item.end) First the strings are split to an aray [hours,
	 * minutes] Then the duration in hours/minutes is compuder as
	 * end[hours/minuts] - start[hours/minutes] And then the 'hour duration' and
	 * 'minute duration' is converted to seconds.
	 * 
	 * This obviously works even for times like 9:15 to 10:05; since the event
	 * then lasts for 1 hour & -10 minutes (which equals 50 minutes ;)).
	 */
	scheduleItemEndTimestamp: function(item){
		start = item.start.split(':');
		end = item.end.split(':');
		
		hours = parseInt(end[0]) - parseInt(start[0]);
		minutes = parseInt(end[1]) - parseInt(start[1]);
		duration = hours*3600 + minutes * 60;

		
		start = item.timestamp + "000";
		end = (parseInt(item.timestamp) + duration) * 1000;
		end = end.toString();
		return end;
	},
	
	/*
	 * Selects a subset of events from the whole schedule, based on the day
	 * (this.selected_day) and event type (this.selected_type).
	 * 
	 * If the selected_day is "Now", then additional filtering, based on the
	 * current date & time takes place, in order to show just some of the events
	 * 'around' the current datetime.
	 */
	filter_schedule: function(){
		this.filtered_schedule = {items:[]};
		now_helper = [];
		if (this.schedule != null){
			for (i in this.schedule.items){
				item = this.schedule.items[i];
				if (item.type == this.selected_type){
					if (this.selected_day == "Now"){
						// store all items of the requested type
						// then we'll go throught these items once again
						// and take the one, which will start after current
						// timestamp
						// and the one before that (the one, which is currently
						// active).
						now_helper.push(item);
					}
					else if (item.date == this.day_to_date[this.selected_day]){
							this.filtered_schedule.items.push(item);
					}
				}
				
			}
			if (this.selected_day == "Now"){
				now_len = now_helper.length;
				offset = 1800000; // 30 minutes in miliseconds
				
				now_time = new Date();
				now_time = now_time.getTime()
				
				/*
				 * interval <"now" - 30 min; "now" + 60 min>, in which we show
				 * the 'current' activities
				 */ 
				start_interval = (now_time - offset).toString();
				end_interval = (now_time + offset+offset).toString();
				now_time = now_time.toString();
				
				for (i in now_helper){
					item = now_helper[i];
					start = item.timestamp + "000";
					end = this.scheduleItemEndTimestamp(item);
					
					/* The event is currently in progress */
					if ((start <= now_time) && (now_time <= end)){
						this.filtered_schedule.items.push(item);
					}
					/*
					 * The event starts outside the interval, but ends inside
					 * the interval -> The event ended just before 'now'.
					 */
					else if ((start < start_interval) && (end > start_interval)){
						this.filtered_schedule.items.push(item);
					}
					/*
					 * The event starts inside the interval, but ends outside
					 * the interval -> The event will take place just after
					 * 'now'.
					 */
					else if ((start < end_interval) && (end > end_interval)){
						this.filtered_schedule.items.push(item);
					}
					
				}
		    }
			
		}

	},
	
/* ==== Calendar ==== */
	
	sdAddToCalendar_click: function(){

		item = this.filtered_schedule.items[this.selectedScheduleItemIndex];
		
		start = item.timestamp + "000";
		
		var event = {subject: item.topic,  // string
	            dtstart: start,
	            dtend: this.scheduleItemEndTimestamp(item),
	            allDay: false,
	            location: item.location + "/" + item.room,
	            note: item.description}
	    	var params = {"newEvent": event }
	    	this.$.openCalendar.call({"id": "com.palm.app.calendar", "params": params})
	},
	
/* ==== Map ==== */
	
	/* Show associated infobox on click */
    doPinOnclick: function(inSender) {
        var pin = inSender.target;
        if (pin) {
            var infobox = pin.infobox;
            if (infobox) {
                infobox.setOptions({ visible: true });
            }
        }
    },
     
    /* Hide infobox */
    doInfoboxOnclick: function(inSender) { var pin = inSender.target;
        if (pin) {
            var infobox = pin.infobox;
            if (infobox) {
                infobox.setOptions({ visible: false });
            }
        }
    },
 
    /* Add three navigation points to the map */
    setup_map: function(){
    	var bingMap = this.$.myMap.hasMap();
    	
    	locations = [
    			{"title": "Red Hat Czech", "description": "Purkyňova 99, Brno", "lat": 49.2260839, "lon": 16.5812650},
    			{"title": "Hotel Avanti", "description": "Střední 549/61, Brno", "lat": 49.2129761, "lon": 16.6045919},
    			{"title": "FI MUNI", "description": "Botanická 554/68a, Brno", "lat": 49.2099867, "lon": 16.5990378},
    	];
    	for (i in locations){
    		loc = locations[i];

    		var location = new Microsoft.Maps.Location(loc['lat'], loc['lon']);
        	bingMap.setView({
        	        center: location,
        	        zoom: 13
        	});
        	
    		var inOptions = null;
    		var pushpin = new Microsoft.Maps.Pushpin(location, inOptions);
        	  
    	    var infobox = new Microsoft.Maps.Infobox(location, {title: loc['title'], description: loc['description'], visible:false, offset:new Microsoft.Maps.Point(0,35)});

    	    pushpin.infobox = infobox;
    	    
    	    Microsoft.Maps.Events.addHandler(pushpin, 'click', enyo.bind(this, "doPinOnclick"));
    	    Microsoft.Maps.Events.addHandler(infobox, 'click', enyo.bind(this, "doInfoboxOnclick")); 
        	
    	    this.$.myMap.map.entities.push(infobox);
        	this.$.myMap.map.entities.push(pushpin);	
    	}
    	
    },	
	

/* ==== Buttons and other clickable stuff ==== */
    
	scheduleItemClick: function(inSender) {
		item = this.filtered_schedule.items[inSender.rowIndex];
		this.selectedScheduleItemIndex = inSender.rowIndex;
		this.$.sdTopic.setContent(item.topic);
		this.$.sdSpeaker.setContent(item.speaker);
		this.$.sdTags.setContent(item.tags);
		this.$.sdDescription.setContent(item.description);
		this.$.pane.selectViewByName("scheduleItemDetail");
		
	},
	
    talksBtn_click: function(){
    	this.selected_type = "talk"
    	this.$.pane.selectViewByName("scheduleListView");
    	this.filter_schedule();
    	this.$.scheduleListView.setScrollTop(0);
    	this.$.listSchedule.render();
    },
    
    labsBtn_click: function(){
    	this.selected_type = "lab"
    	this.$.pane.selectViewByName("scheduleListView");
    	this.filter_schedule();
    	this.$.scheduleListView.setScrollTop(0);
    	this.$.listSchedule.render();
    },
    
    socialBtn_click: function(){
    	this.selected_type = "social"
    	this.$.pane.selectViewByName("scheduleListView");
    	this.filter_schedule();
    	this.$.scheduleListView.setScrollTop(0);
    	this.$.listSchedule.render();
    },
    
    currentBtn_click: function(){
    	this.selected_day = "Now";
    	this.$.pane.selectViewByName("eventSelect");
    },
    day1Btn_click: function(){
    	this.selected_day = "Day 1";
    	this.$.pane.selectViewByName("eventSelect");
    },
    day2Btn_click: function(){
    	this.selected_day = "Day 2";
    	this.$.pane.selectViewByName("eventSelect");
    },
    twitterBtn_click: function(){
    	  this.$.getTwitter.call();
    },

    aboutBtn_click: function(){
    	this.$.pane.selectViewByName("aboutPane");
// localStorage.clear();
    },
    contactBtn_click: function() {
    	this.$.pane.selectViewByName("contactsPane");
    },
    showMapBtn_click: function(){
        this.setup_map();
    	this.$.pane.selectViewByName("mapPane");
    },
    helpBtn_click: function() {
    	this.$.pane.selectViewByName("helpPane");
    },
    
    callEischmann: function(){
     	this.$.AppManService.call({target: "tel://+420604346394"});
    },
    callVokal: function(){
     	this.$.AppManService.call({target: "tel://+420608437507"});
    },
    callReznik: function(){
     	this.$.AppManService.call({target: "tel://+420602797774"})
    },
    
});
