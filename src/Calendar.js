import React from 'react'
import {Col, Grid, Table, Thumbnail, Button, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {NotificationContainer, NotificationManager} from 'react-notifications';
import moment from 'moment';
import Burger from 'react-burger-king';

import Filter from './Filter'
import  {LinkContainer} from 'react-router-bootstrap'
import MyCalendar from './BigCalendar'
import FavoriteEvents from './FavoriteEvents'

const filters = {
    word: (eventt, search) => [

        eventt.Name
    ].map(
        word => word.toLowerCase()
    ).some(
        word => word.includes(
            search.toLowerCase()
        )
    ),
    type_kino: eventt => eventt.Type === 'Kino',
    type_koncert: eventt => eventt.Type === 'Koncert',
    type_kultura: eventt => eventt.Type === 'Kultura',
    type_clubbing: eventt => eventt.Type === 'Clubbing',
    type_sport: eventt => eventt.Type === 'Sport',
    city_gdansk: eventt => eventt.Town === 'Gdańsk',
    city_gdynia: eventt => eventt.Town === 'Gdynia',
    city_sopot: eventt => eventt.Town === 'Sopot'

}


class Calendar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            events: [],
            search: '',
            activeFilter: [],
            filterByType: false,
            favoriteEventIds: JSON.parse(localStorage.getItem('favoriteEventIds')) || [],
            showReply: false
        }



        this.searchUpdate = event => this.setState({
                search: event.target.value
            },

            () => this.setState({
                activeFilter: this.state.activeFilter.filter(
                    word => word !== 'word'
                ).concat(this.state.search === '' ? [] : 'word')
            }))

        this.FilterUpdate = (filterType, enabled) => this.setState({
            activeFilter: this.state.activeFilter.filter(
                type => {
                    const selectedPrefix = filterType.split('_')[0]
                    const currentPrefix = type.split('_')[0]
                    return selectedPrefix !== currentPrefix
                }
            ).concat(enabled === true ? filterType : [])
        })

        this.resetFilter = (prefix) => this.setState({
            activeFilter: this.state.activeFilter.filter(
                item => item.indexOf(prefix) !== 0
            ),


        })


        if (this.state.events.length === 0) {
            fetch(
                process.env.PUBLIC_URL + '/data/events.json'
            ).then(
                response => response.json()
            ).then(
                events => this.setState({
                    events: events
                }, () => {
                    this.state.events.filter(
                        event => this.state.favoriteEventIds.includes(event.id)
                    ).forEach( event => {
                        console.log(event)
                        console.log(moment(event.Date).format())
                        console.log(moment().format())
                        if (moment(event.Date).isSame(moment().format(), 'day'))  {
                            NotificationManager.info("Wydarzenie:" + " " + "'"+ event.Name +"'" + " " + "startuje już dzsiaj! Musisz tam być!");
                        }
                    })
                })
            )


        }


    }

    onClick(e){
        e.preventDefault();
        this.setState({showReply: !this.state.showReply})
    }


    removeFromFavs = eventId => {
        this.setState({
            favoriteEventIds: this.state.favoriteEventIds.filter(
                id => id !== eventId
            )
        }, () => {
            localStorage.setItem('favoriteEventIds', JSON.stringify(this.state.favoriteEventIds))
        })
    }

    createNotification = (type) => {
        return () => {
            switch (type) {
                case 'info':
                    NotificationManager.info('Jedno z wydarzeń, które dodałeś do ulubionych startuje dzisiaj');
                    break;
                case 'success':
                    NotificationManager.success('Success message', 'Title here');
                    break;
            }
        };
    };


    render() {
        console.log(this.props)
        return (
            <Grid>
                <div>
                    <NotificationContainer/>
                    <Row className="show-grid">
                        <div className="container-fluid calendar-setcion"><MyCalendar events={this.state.events} history={this.props.history}/></div>
                        <h4 className="find">Skorzystaj z naszej wyszukiwarki !</h4>
                        <Col sm={6} md={4}>
                            <Filter search={this.state.search}
                                    searchUpdate={this.searchUpdate}
                                    FilterUpdate={this.FilterUpdate}
                                    activeFilter={this.state.activeFilter}
                                    resetFilter={this.resetFilter}/>
                        </Col>
                        <Col>
                            <div className="notice">
                                <p>Dzięki naszemu Kalendarzowi nie ominie Cię żadne ważne wydarzenie!</p>
                            <h5> Wystarczy że klikniesz na symbol serca przy wydarzeniu, które Cie interesuje a my przypomnimy Ci o nim, w dniu jego rozpoczęcia.Wydarzenia, które dodano do ulubionych możesz podejrzeć kiedy chcesz,klikając na hamburgera &darr;.</h5>
                            </div>
                        </Col>
                        <Col sm={6} md={8} >
                            <div className="favsSection">
                            <a onClick={this.onClick.bind(this)} href='#'><Burger
                                onClick={console.log(10)}
                                size={36}
                                    isActive={false}
                                type="arrow"
                            /></a>
                                {this.state.showReply && <div><FavoriteEvents remove={this.removeFromFavs}
                                                                         events={this.state.events.filter(
                                                                             event => this.state.favoriteEventIds.includes(event.id)
                                                                         )}/></div>}
                            </div>
                        </Col>
                    </Row>
                    <div>
                        {
                            this.state.events.filter(
                                eventt => (

                                    this.state.activeFilter.map(
                                        filterName => filters[filterName]
                                    ).every(
                                        func => func(eventt, this.state.search)
                                    )
                                )
                            ).map(
                                eventt => (
                                    <Col xs={12} md={5}>
                                        <Thumbnail key={eventt.id}>

                                            <h2>{eventt.Name}</h2>
                                            <p><img src="/localization.png" alt="" className="local-img"/> {eventt.Town}</p>
                                            <p><img src="/calendar.png" alt="" className="local-img"/> {eventt.Date}</p>
                                            <p className="thumbnail-image">
                                                <img src={eventt.image} alt="" className="img"/>
                                            </p>
                                            <p>{eventt.Type}</p>
                                            <p><LinkContainer to={'/calendar/' + eventt.id}><Button onClick=""
                                                                                                    bsStyle="primary">Więcej</Button></LinkContainer>
                                            </p>
                                            <p>
                                                <img onClick={() => {NotificationManager.success('Dodano do ulubionych', 'Wydarzenie:' + ' ' + eventt.Name);
                                                    this.setState({
                                                        favoriteEventIds: this.state.favoriteEventIds.filter(
                                                            id => id !== eventt.id
                                                        ).concat(eventt.id)
                                                    }, () => {
                                                        localStorage.setItem('favoriteEventIds', JSON.stringify(this.state.favoriteEventIds))
                                                    })
                                                } } src={"/heart-add-512.png"}
                                                className="icon"/>
                                            </p>

                                        </Thumbnail>
                                    </Col>

                                )
                            )
                        }
                    </div>


                </div>
                <footer></footer>
            </Grid>

        )
    }
}

export default Calendar