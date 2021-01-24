import React from 'react';
import Form from 'react-bootstrap/Form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { authFetch } from '../auth';
import { Redirect } from "react-router-dom";
import { Typeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { InputGroup, Col } from 'react-bootstrap';
import { PlusCircle } from "react-bootstrap-icons";

class CommunityManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdmin: null,
            currentCommunity: this.props.match.params.id,
            users: [],
            host: "local",
            serverDropdown: "Select Server",
            selected: [{
                user: ""
            }],
            instances: [],
            roles: ["admin", "contributor", "general member", "guest", "banned"],
            role: "",
        };
    }



    componentDidMount() {
        this.fetchUserDetails();
        this.fetchInstances();
        this.fetchUsers(this.state.host)
    }

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    isAdmin: data.adminOf.includes(this.state.currentCommunity),
                })
            )
    }

    async fetchInstances() {
        await fetch("/api/get-instances")
            .then(response => response.json())
            .then(data =>
                this.setState({
                    instances: ["local", ...data],
                })
            )
        // this.state.instances.map(host => (this.fetchCommunities(host)));
    }

    //currently fetches user list for specified host every time a host is selected
    //TO-DO: Add local storage/caching of users 
    async fetchUsers(host) {
        await fetch('/api/users' + (host !== "local" ? "?external=" + host : "")).then(response => response.json())
            .then(data =>
                this.setState({
                    users: [...this.state.users, ...data.map(user => ({ host: host, user: user }))],
                }))
    }

    handleHostChange(name) {
        this.setState({ host: name })
        this.setState({ serverDropdown: name })
        if (this.state.host != "local") {
            this.fetchUsers(this.state.host);
        }
    }


    render() {
        console.log(this.state)
        return (
            this.state.isAdmin == null ? <h3> Loading... </h3> :
                !this.state.isAdmin ? <Redirect to='/forbidden' /> :
                    <Card className="mt-4">
                        <Card.Header className="pt-4">
                            <Card.Title>Manage your community</Card.Title>
                        </Card.Header>

                        <Card.Body>
                            <Form>
                                <Form.Label>Assign User Role</Form.Label>
                                <Form.Row>
                                    <Form.Group as={Col} xs={12} sm={12} md={6} lg={6}>
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
                                                    this.setState({ selected: selected })
                                                }}

                                                options={this.state.users}
                                                selected={this.state.selected}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} sm={4} md={4} lg={4}>
                                        <DropdownButton
                                            variant="outline-secondary"
                                            title={(this.state.role == "" ? "Select Role" : this.state.role)}>
                                            {this.state.roles.map(role => {
                                                return <Dropdown.Item key={role} onClick={() => this.setState({ role: role })}>{role}</Dropdown.Item>
                                            })
                                            }
                                        </DropdownButton>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={2} sm={2} md={2} lg={2}>
                                        <Button><PlusCircle className="mb-1" /> Assign</Button>
                                    </Form.Group>
                                </Form.Row>
                            </Form>
                        </Card.Body>
                    </Card >
        )
    }
}

export default CommunityManager;