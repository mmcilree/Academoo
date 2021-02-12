import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";

import App from "./App";
import Post from "./components/posts/Post";
import CommunityFeed from "./components/community/CommunityFeed";
import CommunityExplorer from "./components/community/CommunityExplorer";
import CommentsViewer from "./components/comments/CommentsViewer";
import HeaderBar from './components/layout/HeaderBar';
import PostCreator from './components/posts/PostCreator';
import { MemoryRouter as Router } from "react-router-dom";
import Login from "./components/authentication/Login";
import SignUp from "./components/authentication/SignUp";
import UserProfile from "./components/user/UserProfile";
import UserSettings from "./components/user/UserSettings";
import Welcome from "./components/static/Welcome";
import PageNotFound from "./components/static/PageNotFound";

it("App renders without crashing", () => {
  shallow(<App />);
});

const test_data = {
  author: {
    host: "Academoo",
    id: "test"
  },
  children: [
    "c0cc144e-fa1a-4213-903d-55f98f40a60c"
  ],
  community: "MyCommunity",
  content: [
    {
      text: {
        text: "My first post!"
      }
    }
  ],
  created: 1612261692,
  id: "171547f6-700b-4099-87bf-cbc4f714c6db",
  modified: 1612261692,
  parentPost: null,
  title: "Test post"
};

it("App renders without crashing", () => {
  shallow(<App />);
});

it("Welcome page renders without crashing", () => {
  shallow(<Welcome />);
});


describe("", () => {
  it("Post accepts data props", () => {
    const wrapper = mount(
    <Router>
      <Post postData={test_data}/>
    </Router>);
    expect(wrapper.find(Post).props().postData).toEqual(test_data);
    
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

it("User Settings renders without crashing", () => {
  shallow(<UserSettings />);
});

it("PageNotFound Settings renders without crashing", () => {
  shallow(<PageNotFound />);
});