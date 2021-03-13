import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import CommunityExplorer from "../components/community/CommunityExplorer";
import { fetchMock, authFetchMock } from './fetchMocks.js';

import each from 'jest-each';

// const App = require('../App').default;
const auth = require('../auth');
let wrapper;

// Mock the necessary API calls for authentication
jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);

const history = createMemoryHistory();

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



