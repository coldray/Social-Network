import React from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import Network from '../Network/Network';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
class Tabbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            eventKey: 1,
        }
    }
    render() {
        return (
            <div>
                <Tabs onSelect={eventKey => this.setState({eventKey})} defaultActiveKey={1} animation={false} id="noanim-tab-example">
                    <Tab eventKey={1} title="Initialization"></Tab>
                    <Tab eventKey={2} title="Exploration"></Tab>
                    <Tab eventKey={3} title="Traverse"></Tab>
                </Tabs>
                <Network tabKey={this.state.eventKey}/>
            </div>


        );
    }
}

export default Tabbar;
