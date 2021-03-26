import React from "react";
import { Component } from "react";
import {
    Card,
    Form,
    InputGroup,
    Col,
    Button,
    Dropdown,
    DropdownButton,
    Alert
} from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { Redirect } from "react-router-dom";
import { authFetch } from "../../auth";
import { Typeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import ModeratorControls from "./ModeratorControls";


class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: "",
            isAdmin: false,
            isModerator: false,
            instances: [],
            users: [],
            host: "local",
            serverDropdown: "Select Server",
            selected: [{
                user: ""
            }],
            roles: ["site-admin", "site-moderator"],
            role: "",
            isLoading: true,
            errors: [],
            clientErrors: [],
            changed: false,
            success: "",

        }
    }

    componentDidMount() {
        this.fetchUserDetails();
        this.fetchInstances();
        this.fetchUsers(this.state.host);
    }

    async fetchUserDetails() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    currentUser: data.id,
                    isAdmin: data.site_roles.split(",").includes("site-admin"),
                    isModerator: data.site_roles.split(",").includes("site-moderator"),
                    isLoading: false,
                })
            )
            .catch(error => this.setState({ clientErrors: error, isLoading: false }));
    }

    async fetchInstances() {
        await fetch("/api/get-instances")
            .then(response => response.json())
            .then(data =>
                this.setState({
                    instances: ["local", ...data],
                })
            ).catch(() => { })
    }

    //currently fetches user list for specified host every time a host is selected
    //TO-DO: Add local storage/caching of users 
    async fetchUsers(host) {
        await authFetch('/api/users' + (host !== "local" ? "?external=" + host : "")).then(response => response.json())
            .then(data =>
                this.setState({
                    users: [...data.map(user => ({ host: host, user: user }))],
                })).catch(() => { })
    }

    handleHostChange(name) {
        this.setState({ host: name, serverDropdown: name, changed: false })
        this.fetchUsers(name);
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

    handleSubmit(event) {
        event.preventDefault();
        const errors = this.validateUserRolesForm();
        if (errors.length > 0) {
            this.setState({ clientErrors: errors });
            return;
        }

        if (this.state.role == "remove-all") {
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        username: this.state.selected[0].user,
                        host: this.state.host
                    }
                )
            };

            authFetch('/api/remove-site-roles/', requestOptions)
                .then(response => response.json())
                .then((data) => {
                    if (data) {
                        let errors = []
                        errors.push(data)
                        this.setState({ changed: false, errors: errors })
                    } else {
                        this.setState({ changed: true, errors: [], host: "local", serverDropdown: "Select Server", role: "", selected: [{ user: "" }] });
                    }
                }).catch(() => { });
        } else {

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        admin: this.state.currentUser,
                        username: this.state.selected[0].user,
                        key: "",
                        role: this.state.role,
                        host: this.state.host
                    }
                )
            };


            authFetch('/api/add-site-role/', requestOptions)
                .then((response) => {
                    if (response.ok) {
                        this.setState({ changed: true, errors: [], host: "local", serverDropdown: "Select Server", role: "", selected: [{ user: "" }] });
                        return;
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    if (data != null) {
                        let errors = []
                        errors.push(data)
                        this.setState({ changed: false, errors: errors })
                    }

                }).catch(() => { });
        }
    }

    render() {
        const { isLoading, isAdmin, isModerator } = this.state;
        return (
            isLoading ? <Card className="mt-4"><Card.Body><Card.Title>Loading ...</Card.Title></Card.Body></Card> :
                (!isAdmin && !isModerator) ? <Redirect to='/forbidden' /> :
                    <Card className="mt-4">
                        <Card.Body>
                            <Card.Title>{isAdmin ? "Admin " : "Moderator "} Control Panel</Card.Title>
                            {isAdmin && <Card className="mt-4">
                                <Card.Body>
                                    <Card.Title>Assign User Role</Card.Title>
                                    <Form onSubmit={this.handleSubmit.bind(this)}>
                                        {/* <Form.Label>Assign User Role</Form.Label> */}
                                        <Form.Row>
                                            <Form.Group as={Col} xs={12} sm={12} md={12} lg={6}>
                                                <InputGroup>
                                                    <DropdownButton
                                                        variant="outline-secondary"
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
                                                            this.setState({ errors: [], clientErrors: [], selected: selected, changed: false, success: "" })
                                                        }}

                                                        options={this.state.users}
                                                        selected={this.state.selected}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                            <Form.Group as={Col} xs={12} sm={6} md={7} lg={4}>
                                                <DropdownButton
                                                    variant="outline-secondary"
                                                    title={(this.state.role == "" ? "Select Role" : this.state.role)}>
                                                    {this.state.roles.map(role => {
                                                        return <Dropdown.Item key={role} onClick={() => this.setState({ role: role })}>{role}</Dropdown.Item>
                                                    })
                                                    }
                                                    <Dropdown.Item key={"Remove-all"} onClick={() => this.setState({ role: "remove-all" })} style={{ color: "red" }}>Remove All Roles</Dropdown.Item>

                                                </DropdownButton>
                                            </Form.Group>
                                            <Form.Group as={Col} xs={12} sm={6} md={5} lg={2}>
                                                <Button type="submit"><PlusCircle className="mb-1" /> Assign</Button>
                                            </Form.Group>
                                        </Form.Row>
                                    </Form>
                                    {this.state.errors.length !== 0 && this.state.errors.map(error => (
                                        <Alert variant='warning' key={error}>{error.title}: {error.message}</Alert>
                                    ))}
                                    {this.state.clientErrors.map(error => (
                                        <Alert variant='warning' key={error}>{error}</Alert>
                                    ))}
                                    {this.state.changed && <Alert variant='success'>permissions have been changed successfully!</Alert>}

                                </Card.Body>
                            </Card>}

                            {isModerator &&
                                < ModeratorControls instances={this.state.instances} users={this.state.users} />
                            }
                        </Card.Body>
                    </Card>
        );
    }
}
export default ControlPanel
