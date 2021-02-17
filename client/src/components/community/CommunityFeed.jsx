import React, { Component } from "react";
import PostViewer from "./PostsViewer";
import { Card, Button, Alert, OverlayTrigger, Popover, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BookmarkPlus } from "react-bootstrap-icons";
import { authFetch } from '../auth';
import MiniPostCreator from "./MiniPostCreator";
import React, { Component, useContext } from "react";
import Post from "../posts/Post";
import Sidebar from "../layout/Sidebar";
import { Nav, Card, Container, Row, Col, Form, FormControl, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PlusCircle } from "react-bootstrap-icons";
import MiniPostCreator from "../posts/MiniPostCreator";

class CommunityFeed extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: this.props.match.params.id,
    error: null,
    host: this.props.match.params.instance ? this.props.match.params.instance : "local",
    newPostText: "",
    isAdmin: false,
    communityData: null
  }

  componentDidMount() {
    this.fetchPosts();
    this.fetchUserDetails();
  }

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          isAdmin: data.adminOf.includes(this.state.currentCommunity)
        })
      )

  }

  async fetchPosts() {
    await fetch('/api/posts?community=' + this.state.currentCommunity + (this.state.host !== "local" ? "&external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          posts: data,
          host: this.state.host
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
    this.fetchCommunityDetails();
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  fetchCommunityDetails() {
    fetch('/api/communities/' + this.state.currentCommunity + (this.state.host !== "local" ? "?external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          communityData: data,
          isLoading: false,
        })
      )
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const { isLoading, posts, error, currentCommunity, newPostText, host, communityData, isAdmin } = this.state;
    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Community description</Popover.Title>
        <Popover.Content>
          {!isLoading && communityData.description}
        </Popover.Content>
      </Popover>
    );
    return currentCommunity && (
      <Card className="mt-4 mb-10">
        <Card.Header className="pt-4 pr-4">
          <div className="d-flex justify-content-right">
            {!isLoading ?
              <Card.Title >
                <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popover}>
                  <Link to="#" className="px-0 py-0" variant="none" style={{ color: "black", fontSize: "36px" }}>{communityData.title}
                  </Link></OverlayTrigger>
              </Card.Title>

              : <h2> Loading... </h2>}
          <Button className="h-50 ml-4 mt-1" variant="outline-secondary">
              <BookmarkPlus className="mr-2"/>Folloow
          </Button>
          </div>

          <Card.Subtitle className="text-muted"><h6>{host + "/" + currentCommunity}</h6></Card.Subtitle>
          

        </Card.Header>
        <Card.Body>
          {isAdmin &&
            <Alert className="d-flex justify-content-between align-itemsp-center" variant="primary">You are an admin!
            <Link to={"/communities/" + currentCommunity + "/manage"}>
                Manage Community
              </Link>
            </Alert>}
          <MiniPostCreator currentCommunity={currentCommunity} host={host}/>
          {error ? <Alert variant="danger">Error fetching posts: {error.message}</Alert> : null}
          {!isLoading ? (
            <PostViewer posts={posts} />
          ) : (
              <h3>Loading Posts...</h3>
            )}
          {!isLoading && posts.length === 0 ? <h4>There's no posts yet :-(</h4> : null}

        </Card.Body>
      </Card>
    );
  }
}

export default CommunityFeed;