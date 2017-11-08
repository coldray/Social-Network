import React from 'react';
import {Table} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
class traverseTable extends React.Component {

    render() {
        console.log(this.props);

        return (
            <div>
                <Table striped bordered condensed hover>
                    <thead>
                    </thead>
                    <tbody>
                    <tr>
                        <th>First person</th>
                        <th>{this.props.user_1}</th>
                    </tr>
                    <tr>
                        <th>second person</th>
                        <th>{this.props.user_2}</th>
                    </tr>
                    </tbody>
                </Table>
            </div>

        );
    }
}

export default traverseTable;
