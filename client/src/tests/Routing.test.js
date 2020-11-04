import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";

import App from "../App";
import Welcome from "../components/Welcome";
import PostsViewer from "../components/PostsViewer";
import CommentsViewer from "../components/CommentsViewer";
import PostCreator from "../components/PostCreator";

import { MemoryRouter as Router, Route } from "react-router-dom";

it("Routes to default page", () => {
  const wrapper = mount(
    <Router initialEntries={["/"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Welcome)).toHaveLength(1);
});

it("Routes to welcome page", () => {
  const wrapper = mount(
    <Router initialEntries={["/home"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Welcome)).toHaveLength(1);
});

it("Routes to Moosfeed page", () => {
  const wrapper = mount(
    <Router initialEntries={["/moosfeed"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(PostsViewer)).toHaveLength(1);
});

it("Routes to Create-Post page", () => {
  const wrapper = mount(
    <Router initialEntries={["/create-post"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(PostCreator)).toHaveLength(1);
});

it("Routes to Comments page for parent post id", () => {
  const wrapper = mount(
    <Router initialEntries={["/moosfeed/comments/post1"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(CommentsViewer)).toHaveLength(1);
});
