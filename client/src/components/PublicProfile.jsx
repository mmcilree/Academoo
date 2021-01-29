import React, { Component } from "react"
import { Card, Media } from "react-bootstrap";
import defaultProfile from "../images/default_profile.png";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class PublicProfile extends Component {
    state = {
        isLoading: true,
        username: this.props.match.params.id,
        email: "",
        host: this.props.match.params.instance ? this.props.match.params.instance : "local",
        bio: "",
        error: null,

    };


    componentDidMount() {
        this.fetchUser();
    }

    fetchUser() {
        fetch('/api/users/' + this.state.username + (this.state.host !== "local" ? "&external=" + this.state.host : ""))
            .then(response => response.json())
            .then(data =>
                this.setState({
                    isLoading: false,
                    // usename: data.id,
                    email: data.email,
                    host: data.host,
                    error: null,
                })
            )
            .catch(error => this.setState({ error, isLoading: false }));
    }

    render() {
        const { isLoading, username, email, host, bio, error } = this.state;
        console.log(username)
        return username && (

            < Card className="mt-4" >
                <Card.Body>
                    <Media>
                        <img
                            width={150}
                            height={150}
                            className="mr-3 rounded-circle border border-primary"
                            src={defaultProfile}
                            alt="Profile image placeholder"
                        />
                        {!isLoading ? (
                            <Media.Body className="mr-3">
                                <h3>Username: {username}</h3>
                                <h4 className="text-muted"> Email: {email} </h4>
                            </Media.Body>) : <h3>Loading Profile...</h3>}
                    </Media>

                    <Form.Group controlId="profileBio">
                        <Form.Label>Bio:</Form.Label>
                        <Form.Control type="input"
                            placeholder="Tell us more about yourself"
                            name="bio"
                            //onChange={this.handleChange.bind(this)}
                            value={bio} />
                    </Form.Group>
                    <Button variant="primary" type="submit" className>
                        Update Bio
                            </Button>

                </Card.Body>
            </Card >
        );
    }

}

export default PublicProfile;