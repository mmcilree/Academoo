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

/* Moderator Controls component includes a form to disable or enable a user account */
class ModeratorControls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: "",
            host: "local",
            serverDropdown: "Select Server",
            selected: [{
                user: ""
            }],
            role: "",
            errors: [],
            clientErrors: [],
            changed: false,
            success: "",

        }
    }

    componentDidMount() {
        this.fetchUsers(this.state.host)
    }

    //fetch the users for a given instance
    async fetchUsers(host) {
        await fetch('/api/users' + (host !== "local" ? "?external=" + host : "")).then(response => response.json())
            .then(data =>
                this.setState({
                    users: [...data.map(user => ({ host: host, user: user }))],
                }))
    }

    handleHostChange(name) {
        this.setState({ host: name, serverDropdown: name, changed: false })
        this.fetchUsers(name);
    }

    //input validation for the users form
    validateUserActiveForm() {
        const errors = [];
        if (this.state.selected[0].user.length === 0 || this.state.role.length === 0) {
            errors.push("Required fields have been left blank.");
        }

        if (this.state.selected[0].user === this.state.currentUser) {
            errors.push("You cannot change your own role");
        }

        return errors;
    }

    //submit update for disabling or enabling a user's account
    handleSubmit(event) {
        event.preventDefault();
        const errors = this.validateUserActiveForm();
        if (errors.length > 0) {
            this.setState({ clientErrors: errors });
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    username: this.state.selected[0].user,
                    host: this.state.host,
                    activation: this.state.role,
                }
            )
        };

        // fetch the user's current account status
        authFetch('/api/account-activation/', requestOptions)
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
            });
    }

    /* Render the control options for moderator permissions */
    render() {
        return (
            <React.Fragment>
                <Card className="mt-4">
                    <Card.Body>
                        <Card.Title>Change Active Status of User Accounts</Card.Title>
                        <Form onSubmit={this.handleSubmit.bind(this)}>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} sm={12} md={12} lg={6}>
                                    <InputGroup>
                                        <DropdownButton
                                            variant="outline-secondary"
                                            title={this.state.serverDropdown}
                                            as={InputGroup.Prepend}>

                                            {this.props.instances.map(name => {
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

                                            options={this.props.users}
                                            selected={this.state.selected}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} sm={6} md={7} lg={4}>
                                    <DropdownButton
                                        variant="outline-secondary"
                                        title={(this.state.role == "" ? "Select Role" : this.state.role)}>
                                        <Dropdown.Item key={"active"} onClick={() => this.setState({ role: "active" })} style={{ color: "green" }}>Activate Account</Dropdown.Item>
                                        <Dropdown.Item key={"disable"} onClick={() => this.setState({ role: "disable" })} style={{ color: "red" }}>Disable Account</Dropdown.Item>

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
                </Card>
            </React.Fragment>
        );
    }
}
export default ModeratorControls
