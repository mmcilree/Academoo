import React, { Component } from "react";
import { Card, Media, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';
import defaultProfile from "../../images/default_profile.png";
import { authFetch } from '../../auth';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PostsViewer from '../posts/PostsViewer';
var md5 = require("md5");

class UserProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: "",
      username: this.props.match.params.id,
      email: null,
      bio: "",
      postError: null,
      userError: null,
      posts: [],
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

  async fetchPosts() {
    this.fetchCurrentUser();
    await fetch('/api/posts?author=' + this.state.username + (this.state.host !== "local" ? "&external=" + this.state.host : ""),
      {
        headers: {
          'User-ID': this.state.currentUser,
          'Client-Host': window.location.protocol + "//" + window.location.hostname
        }
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then((error) => {
            let err = error.title + ": " + error.message
            throw new Error(err);
          })
        } else {
          return response.json()
        }
      })
      .then(data =>
        this.setState({
          posts: data,
          host: this.state.host
        })
      )
      .catch(error => this.setState({ postError: error.message, isLoading: false }));
  }

  componentDidMount() {
    this.fetchCurrentUser();
    this.fetchPosts();
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
      .catch(error => this.setState({ userError: error, isLoading: false }));
  }

  render() {
    let emailHash = ""
    if (this.state.email) {
      emailHash = !this.state.isLoading && md5(this.state.email);
    }

    const { username, email, bio, posts, postError, userError, isLoading } = this.state;
    return username && (
      <Card className="mt-4">
        <Card.Body className="mb-0">
          {userError ? <Alert variant="danger">Error fetching user details: {userError.message}</Alert> : null}
          <Media>
            <img
              width={150}
              height={150}
              className="mr-5 rounded-circle border border-primary"
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
        <Card.Body>
          <Card >
            <Card.Body>
              <Card.Title> Posts from {username} :</Card.Title>
              {postError ? <Alert variant="danger">Error fetching posts: {postError}</Alert> : null}
              {!isLoading ? (
                <PostsViewer posts={posts} displayCommunityName/>
              ) : (
                  <h3>Loading Posts...</h3>
                )}
              {!isLoading && posts.length === 0 ? <h6>OMG... You haven't posted a Moo yet! What are you waiting for? <Link to='/create-post'> Create a Moo</Link> now!</h6> : null}
            </Card.Body>
          </Card>
        </Card.Body>

      </Card>
    );
  }
}

export default UserProfile;
