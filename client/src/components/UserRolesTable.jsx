import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';

class UserRolesTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adminUsers: [],
            contributorUsers: [],
            memberUsers: [],
            guestUsers: [],
            prohibitedUsers: [],
        }
    }

    componentDidMount() {
        this.fetchUserRoles();
    }

    async fetchUserRoles() {
        await fetch("/api/get-community-roles/" + this.props.community_id)
            .then(response => response.json())
            .then(data =>
                this.setState({
                    adminUsers: data.admins,
                    contributorUsers: data.contributors,
                    memberUsers: data.members,
                    guestUsers: data.guests,
                    prohibitedUsers: data.prohibited,
                })
            )
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
                    {this.state.adminUsers.map(admin => {
                        return (
                            <tr>
                                <td>{admin}</td>
                                <td>Admin</td>
                            </tr>
                        )
                    })}
                    {this.state.contributorUsers.map(contributor => {
                        return (
                            <tr>
                                <td>{contributor}</td>
                                <td>Contributor</td>
                            </tr>
                        )
                    })}
                    {this.state.memberUsers.map(member => {
                        return (
                            <tr>
                                <td>{member}</td>
                                <td>Member</td>
                            </tr>
                        )
                    })}
                    {this.state.guestUsers.map(guest => {
                        return (
                            <tr>
                                <td>{guest}</td>
                                <td>Guest</td>
                            </tr>
                        )
                    })}
                    {this.state.prohibitedUsers.map(prohibited => {
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