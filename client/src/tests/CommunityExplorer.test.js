import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import { Router, Route, Switch } from "react-router-dom";
import {ListGroupItem} from "react-bootstrap";
import { createMemoryHistory } from 'history';
import CommunityExplorer from "../components/community/CommunityExplorer";
import CommunityList from "../components/community/CommunityList";
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
    history.push('/communities')
    wrapper = mount(
        <Router history={history}>
            <CommunityExplorer />
        </Router>
    );
});


it("Has 4 community lists", (done) => {
    setTimeout(() => {
      try {
        wrapper.update();
        expect(wrapper.find(CommunityList)).toHaveLength(4);
        done();
      } catch (error) {
        done(error);
      }
    }, 1000);
});

it("Has 12 list group items", (done) => {
    setTimeout(() => {
      try {
        wrapper.update();
        expect(wrapper.find(ListGroupItem)).toHaveLength(12);
        done();
      } catch (error) {
        done(error);
      }
    }, 1000);
});


