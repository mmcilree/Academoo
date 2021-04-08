import React, { Component } from "react";
import SearchViewer from "../search/SearchViewer";
import { Card,  Alert } from "react-bootstrap";
import { authFetch } from '../../auth';

/**
 * component which shows all of the search results in a given query
 */
class SearchFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingPosts: true,
      posts: [],
      error: null,
    }
  }

  componentDidMount() {
    this.fetchPosts();
  }

  /**
   * fetch the posts from a given query
   */
  async fetchPosts() {
    await authFetch('/api/search?query=' + this.props.match.params.query)
      .then((response) => response.json())
      .then(data => {
        this.setState({
          posts: data,
          isLoadingPosts: false
        })
      })
      .catch(error => {
        this.setState({ error: error.message, isLoadingPosts: false })
      });
  }

  render() {
    const { isLoadingPosts, posts, error } = this.state;

    return (
      <Card className="mt-4 mb-10">
        <Card.Body>
          <h3>Search Results 🐮</h3>
          {!isLoadingPosts && posts.length === 0 ? <h4>No results for '{this.props.match.params.query}' :-(</h4> : "Showing results for " + "'" + this.props.match.params.query + "'"}
          {error ? <Alert variant="warning">Error fetching posts: {error}</Alert> : null}
          {!isLoadingPosts ? (
            <SearchViewer posts={posts} />
          ) : (
              <h3>Loading Posts...</h3>
            )}
        </Card.Body>
      </Card >
    );
  }
}

export default SearchFeed;