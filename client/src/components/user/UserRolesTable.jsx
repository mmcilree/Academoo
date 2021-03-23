import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';

class UserRolesTable extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.userRoles.adminUsers.map(admin => {
                        return (
                            <tr key={admin}>
                                <td>{admin}</td>
                                <td>Admin</td>
                            </tr>
                        )
                    })}
                    {this.props.userRoles.contributorUsers.map(contributor => {
                        return (
                            <tr key={contributor}>
                                <td>{contributor}</td>
                                <td>Contributor</td>
                            </tr>
                        )
                    })}
                    {this.props.userRoles.memberUsers.map(member => {
                        return (
                            <tr key={member}>
                                <td>{member}</td>
                                <td>Member</td>
                            </tr>
                        )
                    })}
                    {this.props.userRoles.guestUsers.map(guest => {
                        return (
                            <tr key={guest}>
                                <td>{guest}</td>
                                <td>Guest</td>
                            </tr>
                        )
                    })}
                    {this.props.userRoles.prohibitedUsers.map(prohibited => {
                        return (
                            <tr style={{ "color": "red" }}>
                                <td>{prohibited}</td>
                                <td>Prohibited</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table >
        )
    }
}
export default UserRolesTable;