import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { mount } from "enzyme";
import { createMemoryHistory } from 'history';
import { Router, Route, Switch } from "react-router-dom";
import { Alert } from 'react-bootstrap'
import { fetchMock } from './fetchMocks.js';
import CommunityManager from "../components/community/CommunityManager";

let wrapper;
let submitButton;

jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);

function setFormDataAndSubmit(role) {
    wrapper.find(CommunityManager).instance().setState({ role: role })
    submitButton = (wrapper.find('[controlId="default-role-button"]')).find('[type="submit"]').hostNodes();
    submitButton.simulate('submit');
}

beforeEach(() => {
    const history = createMemoryHistory();
    global.fetch = jest.fn().mockImplementation(fetchMock);
    history.push('/communities/community1/manage')
    wrapper = mount(
        <Router history={history}>
            <CommunityManager match={{ params: { id: "community1" }, isExact: true, path: "", url: "" }} />
        </Router>
    );
});

describe('CommunityManager default role form is valid', () => {
    it.each`
    role            
    ${"admin"}
    ${"contributor"}
    ${"member"}
    ${"guest"}
    ${"prohibited"}
  `('for input [$role]', ({ role }) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                let alert = wrapper.find(Alert)
                expect(alert).toHaveLength(0);
                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});

describe('CommunityManager default role form is invalid (blank)', () => {
    it.each`
    role            
    ${""}
  `('for input [$role]', ({ role }) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                let alert = wrapper.find(Alert)
                expect(alert).toHaveLength(1);
                expect(alert.containsMatchingElement(<div>Required fields have been left blank.</div>)).toEqual(true);
                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});