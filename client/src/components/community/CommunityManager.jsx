import React from 'react';
import UserRolesTable from '../user/UserRolesTable'
import Form from 'react-bootstrap/Form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { authFetch } from '../../auth';
import { Link, Redirect } from 'react-router-dom';
import { Typeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { InputGroup, Col } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';

class CommunityManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdmin: null,
            isSiteAdmin: false,
            currentUser: "",
            currentCommunity: this.props.match.params.id,
            users: [],
            host: "local",
            serverDropdown: "Select Server",
            selected: [{
                user: ""
            }],
            instances: [],
            roles: ["admin", "contributor", "member", "guest", "prohibited"],
            role: "",
            defaultRole: "",
            currentDefaultRole: "",
            tableUpdate: "",
            usersWithRoles: {
                adminUsers: [],
                contributorUsers: [],
                memberUsers: [],
                guestUsers: [],
                prohibitedUsers: [],
            },
            errors: [],
        };
    }

    componentDidMount() {
        this.fetchUserDetails();
        this.fetchInstances();
        this.fetchUsers(this.state.host);
        this.fetchDefaultRole();
        this.fetchUserRoles();
    }

    validateUserRolesForm() {
        const errors = [];
        if (this.state.selected[0].user.length === 0 || this.state.role.length === 0) {
            errors.push("Required fields have been left blank.");
        }

        if (this.state.selected[0].user === this.state.currentUser) {
            errors.push("You cannot change your own role");
        }

        return errors;
    }

    validateDefaultRoleForm() {
        const errors = [];
        if (this.state.defaultRole.length === 0) {
            errors.push("Required fields have been left blank.");
            return errors;
        }
        return errors;
    }

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    currentUser: data.id,
                    isAdmin: data.adminOf.includes(this.state.currentCommunity),
                    isSiteAdmin: data.site_roles.split(",").includes("site-admin")
                })
            )
            .catch(() => { })
    }

    fetchDefaultRole() {
        authFetch("/api/get-default-role/" + this.state.currentCommunity).then(response => response.json())
            .then(data =>
                this.setState({
                    currentDefaultRole: data.default_role
                }))
            .catch(() => { })
    }

    async fetchUserRoles() {
        await authFetch("/api/get-community-roles/" + this.state.currentCommunity)
            .then(response => response.json())
            .then(data =>
                this.setState((prevState) => ({
                    usersWithRoles: {
                        adminUsers: data.admins,
                        contributorUsers: data.contributors,
                        memberUsers: data.members,
                        guestUsers: data.guests,
                        prohibitedUsers: data.prohibited,
                    }
                }))
                // usersWithRoles: {
                //     adminUsers: data.admins,
                // contributorUsers: data.contributors,
                // memberUsers: data.members,
                // guestUsers: data.guests,
                // prohibitedUsers: data.prohibited,
                // }
                // })
            ).catch(() => { })
    }

    async fetchInstances() {
        await fetch("/api/get-instances")
            .then(response => response.json())
            .then(data =>
                this.setState({
                    instances: ["local", ...data],
                })
            )
            .catch(() => { })
        // this.state.instances.map(host => (this.fetchCommunities(host)));
    }

    //currently fetches user list for specified host every time a host is selected
    //TO-DO: Add local storage/caching of users 
    async fetchUsers(host) {
        await authFetch('/api/users' + (host !== "local" ? "?external=" + host : "")).then(response => response.json())
            .then(data =>
                this.setState({
                    users: [...data.map(user => ({ host: host, user: user }))],
                }))
            .catch(() => { })
    }

    handleHostChange(name) {
        this.setState({ host: name })
        this.setState({ serverDropdown: name })
        this.fetchUsers(name);
    }

    handleSubmit(event) {
        event.preventDefault();
        const errors = this.validateUserRolesForm();
        if (errors.length > 0) {
            this.setState({ errors });
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-ID': this.state.currentUser,
                'Client-Host': window.location.protocol + "//" + window.location.hostname
            },
            body: JSON.stringify(
                {
                    host: this.state.host,
                    user: this.state.selected[0].user,
                    community: this.state.currentCommunity,
                    role: this.state.role,
                }
            )
        };

        fetch('/api/assign-role', requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.json().then((error) => {
                        let err = error.title + ": " + error.message
                        throw new Error(err);
                    })
                } else {
                    this.fetchUserRoles();
                }
            })
            .catch(error => {
                let errors = []
                errors.push(error.message)
                this.setState({ errors, isLoadingPosts: false })
            });


        this.setState(
            { host: "local", serverDropdown: "Select Server", role: "", selected: [{ user: "" }] }
        );

    }

    handleDefRoleSubmit(event) {
        event.preventDefault();
        const errors = this.validateDefaultRoleForm();
        if (errors.length > 0) {
            this.setState({ errors });
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-ID': this.state.currentUser,
                'Client-Host': window.location.protocol + "//" + window.location.hostname
            },
            body: JSON.stringify(
                {
                    role: this.state.defaultRole,
                    community: this.state.currentCommunity,
                }
            )
        };
        fetch('/api/set-default-role', requestOptions)
            .then(response => {
                this.setState(
                    { defaultRole: "" }
                );
                this.fetchDefaultRole();
            })
            .catch(() => { })
    }

    render() {
        return (
            this.state.isAdmin == null ? <h3> Loading... </h3> :
                (!this.state.isAdmin && !this.state.isSiteAdmin) ? <Redirect to='/forbidden' /> :
                    <Card className="mt-4">
                        <Card.Header className="pt-4">
                            <Card.Title>
                                <span className="mr-2">Manage your community:</span>
                                <Link to={"/communities/" + this.state.currentCommunity} >
                                    {this.state.currentCommunity}
                                </Link>
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {this.state.errors.map(error => (
                                <Alert variant='warning' key={error}>{error}</Alert>
                            ))}

                            <Card className="mt-4">
                                <Card.Body>
                                    <Card.Title>Assign User Role</Card.Title>
                                    <Form onSubmit={this.handleSubmit.bind(this)}>
                                        {/* <Form.Label>Assign User Role</Form.Label> */}
                                        <Form.Row>
                                            <Form.Group as={Col} xs={12} sm={12} md={12} lg={6}>
                                                <InputGroup>
                                                    <DropdownButton
                                                        variant="outline-secondary"
                                                        id="instance-selector"
                                                        title={this.state.serverDropdown}
                                                        as={InputGroup.Prepend}>

                                                        {this.state.instances.map(name => {
                                                            return <Dropdown.Item key={name} onClick={() => this.handleHostChange(name)}>{name}</Dropdown.Item>
                                                        })
                                                        }
                                                    </DropdownButton>
                                                    <Typeahead
                                                        labelKey={option => `${option.user}`}
                                                        id="user-choice"
                                                        renderMenu={(results, menuProps) => (
                                                            <Menu {...menuProps} maxHeight="500%">
                                                                {results.map((result, index) => (
                                                                    <MenuItem option={result} position={index} key={index}>
                                                                        {/* <small className="text-muted">{result.host + ":  "}</small> */}
                                                                        {result.user}

                                                                    </MenuItem>
                                                                ))}
                                                            </Menu>
                                                        )}

                                                        onChange={(selected) => {
                                                            this.setState({ errors: [], selected: selected })
                                                        }}

                                                        options={this.state.users}
                                                        selected={this.state.selected}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                            <Form.Group as={Col} xs={12} sm={6} md={7} lg={4}>
                                                <DropdownButton
                                                    variant="outline-secondary"
                                                    id="role-selector"
                                                    title={(this.state.role == "" ? "Select Role" : this.state.role)}>
                                                    {this.state.roles.map(role => {
                                                        return <Dropdown.Item key={role} onClick={() => this.setState({ role: role })}>{role}</Dropdown.Item>
                                                    })
                                                    }
                                                </DropdownButton>
                                            </Form.Group>
                                            <Form.Group controlId="user-role-button" as={Col} xs={12} sm={6} md={5} lg={2}>
                                                <Button type="submit"><PlusCircle className="mb-1" /> Assign</Button>
                                            </Form.Group>
                                        </Form.Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                            <Card className="mt-4">
                                <Card.Body>
                                    <Card.Title>Set Default Role</Card.Title>
                                    <Form onSubmit={this.handleDefRoleSubmit.bind(this)}>
                                        <Form.Row>
                                            <Form.Group as={Col} xs={12} sm={4}>
                                                <DropdownButton
                                                    variant="outline-secondary"
                                                    title={(this.state.defaultRole == "" ? "Select Role" : this.state.defaultRole)}
                                                    id="default-role-selector"
                                                >
                                                    {this.state.roles.map(role => {
                                                        return <Dropdown.Item key={role} onClick={() => this.setState({ defaultRole: role })}>{(role === this.state.currentDefaultRole ? "current default: " + role : role)}</Dropdown.Item>
                                                    })
                                                    }
                                                </DropdownButton>
                                            </Form.Group>
                                            <Form.Group controlId="default-role-button" as={Col} xs={10} sm={8}>
                                                <Button type="submit">Set default role</Button>
                                            </Form.Group>
                                        </Form.Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                            <Card className="mt-4">
                                <Card.Body>
                                    <Card.Title>Users Assigned Roles</Card.Title>
                                    <UserRolesTable community_id={this.state.currentCommunity} userRoles={this.state.usersWithRoles} />
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card >
        )
    }
}

export default CommunityManager;