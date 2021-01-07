import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import { posts } from "./components/test_post_json";

import App from "./App";
import Post from "./components/Post";
import CommunityFeed from "./components/CommunityFeed";
import CommunityExplorer from "./components/CommunityExplorer";
import CommentsViewer from "./components/CommentsViewer";
import HeaderBar from './components/HeaderBar';
import PostCreator from './components/PostCreator';
import { MemoryRouter as Router } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import UserProfile from "./components/UserProfile";
import UserSettings from "./components/UserSettings";
import Welcome from "./components/Welcome";
import PageNotFound from "./components/PageNotFound";

it("App renders without crashing", () => {
  shallow(<App />);
});

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

it("Welcome page renders without crashing", () => {
  shallow(<Welcome />);
});

describe("", () => {
  it("Post accepts data props", () => {
    const wrapper = mount(<Post postData={test_data} />);
    expect(wrapper.props().postData).toEqual(test_data);
  });
});

it("CommunityFeed renders without crashing", () => {
  shallow(<CommunityFeed />);
});

it("CommunityExplorer renders without crashing", () => {
  shallow(<CommunityExplorer />);
});

it("HeaderBar renders without crashing", () => {
  shallow(<HeaderBar />);
});

it("PostCreator renders without crashing", () => {
  shallow(<PostCreator />);
});

it("Login renders without crashing", () => {
  shallow(<Login />);
});

it("SignUp renders without crashing", () => {
  shallow(<SignUp />);
});

it("Profile renders without crashing", () => {
  shallow(<UserProfile />);
});

it("User Settings renders without crashing", () => {
  shallow(<UserSettings />);
});

it("PageNotFound Settings renders without crashing", () => {
  shallow(<PageNotFound />);
});