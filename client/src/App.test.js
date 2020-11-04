import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import { posts } from "./components/test_post_json";

import App from "./App";
import Welcome from "./components/Welcome";
import Post from "./components/post";
import PostsViewer from "./components/posts_viewer";
import CommentsViewer from "./components/comments_viewer";
import HeaderBar from "./components/HeaderBar";
import PostCreator from "./components/PostCreator";
import { MemoryRouter as Router } from "react-router-dom";

const test_data = {
  id: "post1",
  parent: "",
  children: ["comment1"],
  title: "My First Post",
  contentType: "text",
  body: "This is my first moo on Academoo, excited to chat and learn!",
  author: {
    id: "user1",
    host: "somewhere_else.edu",
  },
  modified: 1552832552,
  created: 1552832584,
};

it("App renders without crashing", () => {
  shallow(<App />);
});

describe("", () => {
  it("Post accepts data props", () => {
    const wrapper = mount(<Post postData={test_data} />);
    expect(wrapper.props().postData).toEqual(test_data);
  });
});

it("PostsViewer renders without crashing", () => {
  shallow(<PostsViewer />);
});

it("HeaderBar renders without crashing", () => {
  shallow(<HeaderBar />);
});

it("PostCreator renders without crashing", () => {
  shallow(<PostCreator />);
});
