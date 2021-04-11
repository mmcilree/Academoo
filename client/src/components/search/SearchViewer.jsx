import React, { Component } from "react";
import Post from "../posts/Post";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

class SearchViewer extends Component {
  render() {
    return (
      this.props.posts.map(data => {
        const { id } = data;
        return (
          <Card key={id} className="mt-4">
            <Card.Body className="pb-2">
              <Post postData={data} postType="preview" displayCommunityName hideOptions />
              
              <div className="d-flex justify-content-between">
                <Link
                  to={data.host ? '/comments/' + data.host + `/${id}` : `/comments/${id}`}
                  className={"stretched-link"}>
                </Link>
              </div>
            </Card.Body>
          </Card>
        )
      })
    )
  }
}

export default SearchViewer;

