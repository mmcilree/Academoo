import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { mount } from "enzyme";
import { createMemoryHistory } from 'history';
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

function setFormDataAndSubmit(instance, username, role) {
    wrapper.instance().handleHostChange(instance);
    wrapper.instance().setState({ selected: [{ user: username }] })
    wrapper.instance().setState({ role: role })
    submitButton = (wrapper.find('[controlId="user-role-button"]')).find('[type="submit"]').hostNodes();
    submitButton.simulate('submit');
}

beforeEach(() => {
    const history = createMemoryHistory();
    global.fetch = jest.fn().mockImplementation(fetchMock);
    history.push('/communities/community1/manage')
    wrapper = mount(
        <CommunityManager match={{ params: { id: "community1" }, isExact: true, path: "", url: "" }} />
    );
});

describe('CommunityManager form is valid', () => {
    it.each`
    instance            | username          | role
    ${"instance1"}      | ${"user1"}        | ${"admin"}
    ${"instance2"}      | ${"user2"}        | ${"contributor"}
    ${"instance3"}      | ${"user3"}        | ${"member"}
    ${"instance3"}      | ${"user2"}        | ${"guest"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }, done) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                expect(alert).toHaveLength(0);
                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});

describe('CommunityManager form is invalid (blank fields)', () => {
    it.each`
    instance            | username          | role
    ${"instance1"}      | ${""}        | ${"admin"}
     ${"instance2"}      | ${"user2"}   | ${""}
     ${"instance3"}      | ${""}        | ${""}
  `('for input [$instance, $username, $role]', ({ instance, username, role }, done) => {
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

describe('CommunityManager form is invalid (user tries to change own role)', () => {
    it.each`
    instance            | username          | role
    ${"academoo"}       | ${"academoo"}      | ${"contributor"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }, done) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                let alert = wrapper.find(Alert)
                expect(alert).toHaveLength(1);
                expect(alert.containsMatchingElement(<div>You cannot change your own role</div>)).toEqual(true);

                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});
