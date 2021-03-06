import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import React from 'react'
import {connect} from 'react-redux'

BigCalendar.momentLocalizer(moment);
moment.locale("pl");



const MyCalendar = props => (
    <div style={{height: 350}}>
        <BigCalendar
            events={props.events.map(event => ({
                ...event,
                title: event.Name ,
                start: new Date(event.Date),
                end: new Date(event.Date)
            }))}
            onSelectEvent={ event => {
                props.history.push('/calendar/' + event.id)
            }}


            messages={{
                today: 'w tym miesiącu',
                previous: '<',
                next: '>',
                month: 'miesiąc',
                week: 'tydzień',
                day: 'dzień'
            }}
            views={['month', 'week', 'day']}
        />
    </div>
);

export default MyCalendar