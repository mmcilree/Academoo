import React from "react";
import { shallow, mount } from "enzyme";
import App from "./App";
import Post from "./components/post";
import PostsViewer from "./components/posts_viewer";
import CommentsViewer from "./components/comments_viewer";

it("renders without crashing", () => {
  shallow(<App />);
});

it("renders without crashing", () => {
  shallow(<Post />);
});

it("renders without crashing", () => {
  shallow(<PostsViewer />);
});

it("renders without crashing", () => {
  shallow(<CommentsViewer />);
});
