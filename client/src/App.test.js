import React from 'react';
import { shallow, mount } from "enzyme";
import App from './App';
import HeaderBar from './components/HeaderBar';
import PostCreator from './components/PostCreator';

it("App renders without crashing", () => {
  shallow(<App />);
});

it("HeaderBar renders without crashing", () => {
  shallow(<HeaderBar />);
});

it("PostCreator renders without crashing", () => {
  shallow(<PostCreator />);
});

