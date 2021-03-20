import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { mount } from "enzyme";
import { Router } from "react-router-dom";
import { createMemoryHistory } from 'history';
import { fetchMock } from './fetchMocks.js';
import CommunityManager from "../components/community/CommunityManager";

let wrapper;

jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);

it("Routes to Community Manager page", () => {
    const history = createMemoryHistory();
    global.fetch = jest.fn().mockImplementation(fetchMock);
    history.push('/communities/community1/manage')
    wrapper = mount(
        <Router history={history}>
            <CommunityManager match={{ params: { id: "community1" }, isExact: true, path: "", url: "" }} />
        </Router>
    );
    expect(wrapper.find(CommunityManager)).toHaveLength(1);
});