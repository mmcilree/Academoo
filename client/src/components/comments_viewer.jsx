import React from "react";
import Post from "./post";
import Card from "react-bootstrap/Card";
import { posts } from "./test_post_json";
import Button from "react-bootstrap/Card";
import { ArrowReturnLeft } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

function CommentsViewer({ match }) {
  const parentPostId = match.params.id;

  // const allPosts = props.allPosts;
  const parentPost = posts.filter((data) => data.id === parentPostId)[0];

  const children = [];
  parentPost.children.map((childId) => {
    const child = posts.filter((data) => childId === data.id)[0];
    children.push(child);
  });

  return (
    <div className="container-md comments_view">
      <Card className="mt-4">
        <Card.Body>
          <Link to="/moosfeed" className="btn btn-secondary">
            Back to Moosfeed <ArrowReturnLeft />
          </Link>
          <Card className="mt-4">
            <Card.Body>
              <Post postData={parentPost} />
            </Card.Body>
          </Card>
          {children.map((child) =>
            child ? (
              <Card key={child.id} className="mt-4 ml-4 comment">
                <Card.Body>
                  <Post postData={child} />
                </Card.Body>
              </Card>
            ) : null
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
export default CommentsViewer;
