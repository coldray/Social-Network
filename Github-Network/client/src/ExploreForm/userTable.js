import React from 'react';
import {Table} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
class userTable extends React.Component {
    render() {
        console.log(this.props.userInfo);

        return (
            <div>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Github Username</th>
                        <th>{this.props.userInfo.login}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Followers</td>
                        <td>{this.props.userInfo.followers}</td>
                    </tr>
                    <tr>
                        <td>company</td>
                        <td>{this.props.userInfo.company}</td>
                    </tr>
                    <tr>
                        <td>Location</td>
                        <td>{this.props.userInfo.location}</td>
                    </tr>
                    <tr>
                        <td>Bio</td>
                        <td>{this.props.userInfo.bio}</td>
                    </tr>
                    <tr>
                        <td>Signup Github at</td>
                        <td>{this.props.userInfo.created_at}</td>
                    </tr>
                    </tbody>
                </Table>
            </div>

        );
    }
}

export default userTable;
