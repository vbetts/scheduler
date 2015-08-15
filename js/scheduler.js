var HOUR_HEIGHT = 42; /* pixels */
var MS_PER_HOUR = 3600000;
var MINS_PER_HOUR = 60;

var appointments = {};
var nextId = 1;

/* on load, set default values for form inputs */

$(document).ready(function(){
	var now = new Date();
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);
	$("#start_date")[0].valueAsDate = now;
	$("#start_time")[0].valueAsDate = now;

	now.setHours(now.getHours() + 1);

	$("#end_time")[0].valueAsDate = now;
});



function insertAppointment(appt) {
	
	var week_start = getStartOfWeek();
	var week_end = getEndOfWeek();

	/* calculate size of appointment box */
	if (appt.start >= week_start && appt.start <= week_end){
		var time = (appt.start.getHours() * MINS_PER_HOUR + appt.start.getMinutes())/MINS_PER_HOUR; /* find total number of minutes since midnight, convert to # hours */
		var top = time * HOUR_HEIGHT; /* number of hours * 42 pixels per hour */
		
		var day = appt.start.getDay();
		
		var height = ((appt.end.getTime() - appt.start.getTime())/MS_PER_HOUR) * HOUR_HEIGHT; /* hours since midnight of start time * height of one hour*/

		/* append appointment to day div or output error if out of bounds */
		$('.day:eq(' + day + ')')
		.append(
			$('<div>')
			.addClass('appointment')
			.css('top', top + 'px')
			.css('height', height + 'px')
			.attr('id', appt.id)
			.text(appt.name)
			.append(
				$('<span>')
				.addClass('glyphicon glyphicon-minus-sign')
				.css('color', 'red')
				.css('float', 'right')
				.css('margin', '1px')
				.click(deleteAppointment)
				)/* append span */
			);
	} else {
		$('#error').append(
			$('<p>')
			.addClass('text-danger')
			.text('Date is out of bounds: Please select a date between Midnight ' + week_start.toDateString()+ ' and 11:59pm ' + week_end.toDateString())
			);

	} 

} 

/* check for overlapping appointments and resize accordingly */

function resizeAppointments(start, end) {
	var overlaps = [];
	var endTimes = [];
	var hasOverlapped = 0;
	var overlapIds = {};
	
	do {
		/*
		For each object in global variable 'appointments', check if it overlaps with the start time and end times passed
		into the function, or if it has already been added to the list of overlaps
		*/
		hasOverlapped = overlaps.length;
		for (var id in appointments){
			if (appointments.hasOwnProperty(id)) {
				var a = appointments[id];

				if (start >= a.end || end <= a.start || overlapIds[a.id]){
					continue;
				} else {
					if (a.start < start){
						start = a.start;
					}

					if (a.end > end){
						end = a.end;
					}
					overlapIds[a.id] = true;
					overlaps.push(a);
				}

			}
		}
	} while ( hasOverlapped != overlaps.length );

	overlaps.sort(
		function(a, b){
			if (a.start < b.start){
				return -1;
			} else if (a.start > b.start){
				return 1;
			} else {
				return 0;
			}
		}); 

	/*  assign a column value to each overlapping appointment*/
	for (var x = 0; x < overlaps.length; x++){
		var item = overlaps[x];
		var columnSet = false;

		for (var i = 0; i < endTimes.length; i++){
			if (item.start >= endTimes[i]){
				item.column = i;
				endTimes[i] = item.end;
				columnSet = true;
				break;
			}

		}

		if (columnSet == false){
			endTimes.push(item.end);
			item.column = endTimes.length - 1;
		}
	}

	var columns = endTimes.length;
	for (var x = 0; x < overlaps.length; x++){
		var item = overlaps[x];

		$('#' + item.id)
		.css('width', 100/columns + '%')
		.css('left', (100/columns)*item.column + '%')
	}



}

/* get values from form and create JSON object */

function parseAppointment() {
	var name = $("#name").val();
	var start_date = $("#start_date").val();
	var start_time = $("#start_time").val();
	var end_time = $("#end_time").val();

	var start = new Date(start_date + ' ' + start_time);
	var end = new Date(start_date + ' ' + end_time);

	return {
		name: name,
		start: start,
		end: end
	};
}

/* Find beginning and end of week to determine whether submitted event is out of bounds */ 

function getStartOfWeek(){
	var week_start = new Date();
	week_start.setDate(week_start.getDate() - week_start.getDay());
	week_start.setHours(0);
	week_start.setMinutes(0);
	week_start.setSeconds(0);

	return week_start;

}

function getEndOfWeek() {
	var end = getStartOfWeek();
	end.setDate(end.getDate() + 7);
	return end;

} 

/* master function called onclick to create appointments */

window.createAppointment = function() {
	var appt = parseAppointment();
	appt.id = nextId;
	nextId += 1;
	appointments[appt.id] = appt;
	insertAppointment(appt);

	resizeAppointments(appt.start, appt.end);
	
}

window.deleteAppointment = function() {

	var appointmentDiv = $(this).closest('.appointment');

	var id = appointmentDiv.attr('id');

	var start = appointments[id].start;
	var end = appointments[id].end;

	delete appointments[id];	
	appointmentDiv.remove();

	resizeAppointments(start, end);

}