import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import Welcome from "../components/Welcome";
import CommunityFeed from "../components/CommunityFeed";
import SubscribedFeed from "../components/SubscribedFeed"
import CommentsViewer from "../components/CommentsViewer";
import PostCreator from "../components/PostCreator";
import UserSettings from "../components/UserSettings";
import UserProfile from "../components/UserProfile";
import Login from "../components/Login";
import SignUp from "../components/SignUp";
import { MemoryRouter as Router, Route } from "react-router-dom";

// const App = require('../App').default;
const auth = require('../auth');

// Mock the necessary API calls for authentication
jest.mock('../auth', () => ({
    useAuth: () => [true],
    authFetch: () =>
        Promise.resolve({
            json: () => Promise.resolve(
                {
                    id: "academoo",
                    email: "academoo@academoo.com",
                    host: "academoo",
                    subscriptions: [],
                    adminOf: []
                }),
        })
}));

it("Routes to default page", () => {
    const wrapper = mount(
        <Router initialEntries={["/"]}>
            <App />
        </Router>
    );
    expect(wrapper.find(Welcome)).toHaveLength(1);
});

it("Login page reroutes to welcome page", () => {
    const wrapper = mount(
        <Router initialEntries={["/login"]}>
            <App />
        </Router>
    );
    expect(wrapper.find(Welcome)).toHaveLength(1);
});

it("Sign-up page reroutes to welcome page", () => {
    const wrapper = mount(
        <Router initialEntries={["/sign-up"]}>
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
    expect(wrapper.find(SubscribedFeed)).toHaveLength(1);
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
        <Router initialEntries={["/comments/post1"]}>
            <App />
        </Router>
    );
    expect(wrapper.find(CommentsViewer)).toHaveLength(1);
});

it("Routes to User-Profile page", () => {
    const wrapper = mount(
        <Router initialEntries={["/user-profile/academoo"]}>
            <App />
        </Router>
    );
    expect(wrapper.find(UserProfile)).toHaveLength(1);
});

it("Routes to User-Settings page", () => {
    const wrapper = mount(
        <Router initialEntries={["/user-settings"]}>
            <App />
        </Router>
    );
    expect(wrapper.find(UserSettings)).toHaveLength(1);
});
