var HOUR_HEIGHT = 42; /* pixels */
var MS_PER_HOUR = 3600000;
var MINS_PER_HOUR = 60;

var appointments = [];
var nextId = 1;


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

	console.log(week_start);
	console.log(week_end);

	if (appt.start >= week_start && appt.start <= week_end){
		var time = (appt.start.getHours() * MINS_PER_HOUR + appt.start.getMinutes())/MINS_PER_HOUR; /* find total number of minutes since midnight, convert to # hours */
		var top = time * HOUR_HEIGHT; /* number of hours * 42 pixels per hour */
		
		var day = appt.start.getDay();
		
		var height = ((appt.end.getTime() - appt.start.getTime())/MS_PER_HOUR) * HOUR_HEIGHT;

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

	} /* end if statement */

} /* insertAppointment */

function resizeAppointments() {

}

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
}/* parseAppointment */

function getStartOfWeek(){
	var week_start = new Date();
	week_start.setDate(week_start.getDate() - week_start.getDay());
	week_start.setHours(0);
	week_start.setMinutes(0);
	week_start.setSeconds(0);

	return week_start;

}/* getStartOfWeek */

function getEndOfWeek() {
	var end = getStartOfWeek();
	end.setDate(end.getDate() + 7);
	return end;

} /* getEndOfWeek */

function createAppointment() {
	var appt = parseAppointment();
	appt.id = nextId;
	nextId += 1;
	appointments.append(appt);
	insertAppointment(appt);
} /* createAppointment */

function deleteAppointment() {
	$(this).closest('.appointment').remove();
}