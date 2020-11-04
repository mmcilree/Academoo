import React from "react";
import Post from "./post";
import Card from "react-bootstrap/Card";
import { posts } from "./test_post_json";

function CommentsViewer({ match }) {
  const parentPostId = match.params.id;

  // const allPosts = props.allPosts;
  const parentPost = posts.filter((data) => data.id === parentPostId)[0];
  console.log(parentPost);

  const children = [];
  parentPost.children.map((childId) => {
    const child = posts.filter((data) => childId === data.id)[0];
    children.push(child);
  });

  return (
    <div className="comments_view">
      <Card className="mt-4">
        <Post postData={parentPost} />
      </Card>
      {children.map((child) =>
        child ? (
          <Card key={child.id} className="mt-4 comment">
            <Post postData={child} />
          </Card>
        ) : null
      )}
    </div>
  );
}
export default CommentsViewer;
