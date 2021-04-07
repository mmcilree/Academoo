import React, { Component } from "react";
import { Card, Media, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';
import defaultProfile from "../../images/default_profile.png";
import { authFetch } from '../../auth';
import PostsViewer from '../posts/PostsViewer';
var md5 = require("md5");

/*
    Component which renders the users' profile
    icludes fetch methods to get username, information
    */
class UserProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: "",
      username: this.props.match.params.id,
      email: null,
      bio: "",
      private_acc: false,
      postError: null,
      userError: null,
      posts: [],
      host: this.props.match.params.instance ? this.props.match.params.instance : "local",
      isLoading: true
    };
  }


    /*
    method which retrieves the user so we can then render the profile
    */
  fetchCurrentUser() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data => {
        if (data.id === this.state.username) {
          this.setState({
            currentUser: data.id,
            email: data.email,
            bio: data.about,
            private_acc: false,
            isLoading: false
          })
        } else {
          this.setState({
            currentUser: data.id,
          })
          this.fetchUserDetails();
        }
        this.fetchPosts();
      })
      .catch(error => this.setState({ userError: error, isLoading: false }));
  }

  /*
  Method to fetch the posts of the given user
  */
  async fetchPosts() {
    await authFetch('/api/posts?author=' + this.state.username + (this.state.host !== "local" ? "&external=" + this.state.host : ""),
      {
        headers: {
          'User-ID': this.state.currentUser,
          'Client-Host': window.location.hostname
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
          host: this.state.host,
          postError: null
        })
      )
      .catch(error => this.setState({ postError: error.message, isLoading: false }));
  }

  componentDidMount() {
    this.fetchCurrentUser();
    // this.fetchPosts();
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
  }


  /*
  Method to update the user if it has not already occured
  */
  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.state.username = this.props.match.params.id;
      this.state.host = this.props.match.params.instance ? this.props.match.params.instance : "local";
      this.fetchCurrentUser();
      this.fetchPosts();
    }
  }

  /*
  Method to fetch the other details about the user, like email, bio, if they have a private account
  */
  fetchUserDetails() {
    authFetch('/api/users/' + this.state.username + (this.state.host !== "local" ? "&external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data => {
        this.setState({
          isLoading: false,
          email: data.email,
          // host: data.host,
          bio: data.bio,
          private_acc: data.private,
          error: null,
        })
      })
      .catch(error => this.setState({ userError: error, isLoading: false }));
  }

  /*
  Method which renders all of the information to the profile page
  */
  render() {
    let emailHash = ""
    if (this.state.email) {
      emailHash = !this.state.isLoading && md5(this.state.email);
    }

    const { username, email, bio, private_acc, posts, postError, userError, isLoading } = this.state;
    return username && (
      <Card className="mt-4">
        <Card.Body className="mb-0">
          {userError ? <Alert variant="danger">Error fetching user details: {userError.message}</Alert> : null}
          <Media>
            <img
              width={150}
              height={150}
              className="mr-5 rounded-circle border border-primary"
              src={email ? "https://en.gravatar.com/avatar/" + emailHash + "?d=wavatar" : defaultProfile}
              alt="Profile image placeholder"
            />
            {!this.state.isLoading ? (
              <Media.Body className="mr-3">
                <h3>Username: {username}</h3>
                {!private_acc ?
                  <div>
                    <h4 className="text-muted"> Email: {email} </h4>
                    <p>Bio: {bio ? bio : "No bio has been set yet!"} </p>
                  </div>
                  : <div><Card.Text>This user's account is private!</Card.Text></div>}
              </Media.Body>) : <h3>Loading Profile...</h3>}
          </Media>
        </Card.Body>
        <Card.Body>
          <Card >
            <Card.Body>
              <Card.Title> Posts from {username} :</Card.Title>
              {postError ? <Alert variant="danger">{postError}</Alert> : null}
              {!isLoading ? (
                <PostsViewer posts={posts} displayCommunityName />
              ) : (
                  <h3>Loading Posts...</h3>
                )}
              {!isLoading && posts.length === 0 && this.state.currentUser === username ? <h6>OMG... You haven't posted a Moo yet! What are you waiting for? <Link to='/create-post'> Create a Moo</Link> now!</h6> : null}
            </Card.Body>
          </Card>
        </Card.Body>

      </Card>
    );
  }
}

export default UserProfile;
