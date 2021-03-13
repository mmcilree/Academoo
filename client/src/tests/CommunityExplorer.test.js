import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import CommunityExplorer from "../components/community/CommunityExplorer";
import {fetchMock} from './fetchMocks.js';

import each from 'jest-each';

// const App = require('../App').default;
const auth = require('../auth');
let wrapper;

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


const history = createMemoryHistory();
jest.mock('../auth', () => ({
    useAuth: () => [false],
    authFetch: () =>
        Promise.resolve({
            json: () => Promise.resolve(
                {
                    id: "academoo",
                    email: "academoo@academoo.com",
                    host: "academoo"
                }),
        })
}));

beforeEach(() => {
    
    global.fetch = jest.fn().mockImplementation(fetchMock);
    history.push('/explore')
    wrapper = mount(
        <Router history={history}>
            <CommunityExplorer />
        </Router>
    );
});


it("Routes to welcome page", () => {

    expect(wrapper.find(CommunityExplorer)).toHaveLength(1);
});



