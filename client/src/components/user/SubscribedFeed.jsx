import React, { Component, useContext } from "react";
import Post from "../posts/Post";
import Sidebar from "../layout/Sidebar";
import { Nav, Card, Container, Row, Col, Form, FormControl, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { CodeSlash, PlusCircle } from "react-bootstrap-icons";
import MiniPostCreator from "../posts/MiniPostCreator";
import PostsViewer from "../posts/PostsViewer";
import { authFetch } from '../../auth';

class SubscribedFeed extends Component {
    state = {
        isLoading: true,
        posts: [],
        error: null,
        subscribedCommunities: [],
    }

    componentDidMount() {
        this.fetchSubscribedCommunities();
    }

    async fetchSubscribedCommunities() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data => {
                // console.log("data = "  + data.subcriptions);
                this.setState({
                    subscribedCommunities: data.subscriptions,
                    posts: []
                })
            }
            ).catch(() => { })

        this.fetchPosts();
    }

    async fetchPosts() {
        await Promise.all(this.state.subscribedCommunities.map((subscription, i) => {
            this.appendPostsFromSubscription(subscription, i);
        }));
        this.state.subscribedCommunities.length === 0 && this.setState({ isLoading: false });
    }

    async appendPostsFromSubscription(subscription, i) {
        console.log(i)
        await authFetch('/api/posts?community=' + subscription.communityId
        + '&includeSubChildrenPosts=false'
        + (subscription.external !== null ? '&external=' + subscription.external : ''),
            {
                headers: {
                    'User-ID': this.state.user_id,
                    'Client-Host': window.location.protocol + "//" + window.location.hostname
                }
            })
            .then(response => response.json())
            .then(data =>
                i === this.state.subscribedCommunities.length - 1 ? 
                this.setState((prevState) => {return {posts: [...prevState.posts, ...data]}}, () => console.log("done?"))
                : this.setState({posts: [...this.state.posts, ...data]})
            )
            .catch(error => this.setState({ error, isLoading: false }));
        this.setState({ posts: this.state.posts.slice().sort((a, b) => b.created - a.created) });
           
    }

    sortRecent() {
        console.log("recent")
        this.setState({ posts: this.state.posts.slice().sort((a, b) => b.created - a.created) });
    }

    sortCommented() {
        console.log("commented")
        this.setState({ posts: this.state.posts.slice().sort((a, b) => b.children.length - a.children.length) });
    }

    sortVoted() {
        console.log("voted")
        this.setState({ posts: this.state.posts.slice().sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)) });
    }

    async refreshPost(post) {
        await fetch('/api/posts/' + post,
            {
                headers: {
                    'User-ID': this.state.user_id,
                    'Client-Host': window.location.protocol + "//" + window.location.hostname
                }
            })
            .then(response => response.json())
            .then(data => this.setState({ postData: this.state.posts.map(o => o.id === post ? data : o) }));
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    render() {
        console.log(this.state)
        const { isLoading, posts, error, currentCommunity, newPostText } = this.state;
        return (
            <Container fluid>
                <Row>
                    <Col xs={12} lg={8}>
                        <Card className="mt-4">
                            <Card.Header>
                                <Nav variant="tabs" defaultActiveKey="recent">
                                    <Nav.Item>
                                        <Nav.Link eventKey="recent" onClick={this.sortRecent.bind(this)}><div className="d-none d-sm-inline">Most</div> Recent</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="commented" onClick={this.sortCommented.bind(this)}>Most Commented</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="top" onClick={this.sortVoted.bind(this)}>
                                            Top <div className="d-none d-sm-inline">Posts</div>
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>
                            <Card.Body>
                                <MiniPostCreator currentCommunity={null} />

                                {error ? <Alert variant="danger">Error fetching posts: {error.message}</Alert> : null}
                                {!isLoading ? (
                                    posts.length !== 0 ? 
                                    <PostsViewer posts={posts} refreshPost={this.refreshPost.bind(this)} displayCommunityName />
                                    : <h3>There's no posts here :-(</h3>
                                ) : (
                                    <h3>Loading Posts...</h3>
                                )}
                                
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={6} lg={4}>
                        <Sidebar currentCommunity={currentCommunity}
                            fetchSubscribedCommunities={this.fetchSubscribedCommunities.bind(this)} />

                    </Col>

                </Row>
            </Container>
        );
    }
}

export default SubscribedFeed;
