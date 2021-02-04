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
import UserSettings from "../components/UserSettings";
import UserProfile from "../components/UserProfile";
import Login from "../components/Login";
import SignUp from "../components/SignUp";
import { MemoryRouter as Router, Route } from "react-router-dom";

it("Routes to default page", () => {
  const wrapper = mount(
    <Router initialEntries={["/"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/login"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to sign-up page", () => {
  const wrapper = mount(
    <Router initialEntries={["/sign-up"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(SignUp)).toHaveLength(1);
});


it("Home reroutes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/home"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Moosfeed reroutes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/moosfeed"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Create-Post reroutes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/create-post"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Comments page reroutes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/comments/post1"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("User-Profile page reroutes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/user-profile/academoo"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("User-Settings page reroutes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/user-settings"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});





