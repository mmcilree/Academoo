import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount, dive } from "enzyme";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import { Alert } from 'react-bootstrap'
import CommunityCreator from "../components/community/CommunityCreator";
import { fetchMock } from './fetchMocks.js';

let wrapper;
let titleField;
let idField;
let descriptionField;
let submitButton;
let communityCreator;