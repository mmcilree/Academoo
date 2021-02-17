import React, { Component } from "react";
import { Card, Media } from "react-bootstrap";
import defaultProfile from "../../images/default_profile.png";
import { authFetch } from '../../auth';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
var md5 = require("md5");

class UserProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: "",
      username: this.props.match.params.id,
      email: null,
      bio: "",
      host: this.props.match.params.instance ? this.props.match.params.instance : "local",
      isLoading: true
    };
  }
  // handleChange(event) {
  //   const target = event.target;
  //   const value = target.value;
  //   const name = target.name;
  //   this.setState({
  //     [name]: value
  //   });

  // }

  fetchCurrentUser() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data => {
        if (data.id === this.state.username) {
          this.setState({
            currentUser: data.id,
            email: data.email,
            bio: data.bio,
            isLoading: false
          })
        } else {
          this.setState({
            currentUser: data.id,
          })
          this.fetchUserDetails();
        }
      }

      )
  }

  componentDidMount() {
    this.fetchCurrentUser();
  }


  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.state.username = this.props.match.params.id;
      this.state.host = this.props.match.params.instance ? this.props.match.params.instance : "local";
      this.fetchCurrentUser();
    }
  }

  fetchUserDetails() {
    fetch('/api/users/' + this.state.username + (this.state.host !== "local" ? "&external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          isLoading: false,
          email: data.email,
          // host: data.host,
          bio: data.bio,
          error: null,
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
  }

  render() {
    let emailHash = ""
    if (this.state.email) {
      emailHash = !this.state.isLoading && md5(this.state.email);
    }

    const { username, email, bio } = this.state;
    return username && (
      <Card className="mt-4">
        <Card.Body>

          <Media>
            <img
              width={150}
              height={150}
              className="mr-5 mb-3 rounded-circle border border-primary"
              src={email ? "https://en.gravatar.com/avatar/" + emailHash : defaultProfile}
              alt="Profile image placeholder"
            />
            {!this.state.isLoading ? (
              <Media.Body className="mr-3">
                <h3>Username: {username}</h3>
                <h4 className="text-muted"> Email: {email} </h4>
                <p>Bio: {bio ? bio : "No bio has been set yet!"} </p>
              </Media.Body>) : <h3>Loading Profile...</h3>}
          </Media>
        </Card.Body> 
        <Card className = "mt-4">
        <Card.Body>
          <h5>Posts from {username} :</h5>
        </Card.Body>
        </Card>
      </Card>
    );
  }
}

export default UserProfile;
