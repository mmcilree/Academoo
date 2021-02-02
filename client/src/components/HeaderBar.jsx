import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import {logout, useAuth} from "../auth";
import defaultProfile from "../images/default_profile.png";
import logo from "../images/logo.svg";
// import logo from "../images/logo.png";
import { HostContext } from './HostContext';
import { useState, useEffect, useContext } from "react";
import { authFetch } from '../auth';


import {
  PlusCircle,
  PersonCircle,
  Gear,
  BoxArrowRight,
} from "react-bootstrap-icons";

import { Link } from "react-router-dom";

var md5 = require("md5");

function HeaderBar() {
  const [logged] = useAuth();


  return (
    <Navbar bg="primary" variant="dark" expand="lg" {...(!logged ? {className: 'justify-content-center'} : {})}>
      <Navbar.Brand as={Link} to="/">
        <img
          alt=""
          src={logo}
          width="70"
          height="70"
          className="d-inline-block align-center"
        />{" "}
        Academoo
      </Navbar.Brand>

      {logged && (
        <React.Fragment>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/moosfeed">
                Moosfeed
              </Nav.Link>
              <Nav.Link as={Link} to="/explore">
                Commoonities
              </Nav.Link>
              <Nav.Link as={Link} to="/create-post">
                <PlusCircle className="mb-1" />
                <span> New Moo</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/create-community">
                <PlusCircle className="mb-1" />
                <span> New Commoonity</span>
              </Nav.Link>
            </Nav>

            <Nav>
              
              <DropdownButton
                // as={Link}
                // to="/user-profile"
                variant="outline-light"
                title={
                  <span>
                    <Image
                      className="mr-3"
                      src={"https://en.gravatar.com/avatar/"}
                      roundedCircle
                      width="25"
                      height="25"
                    ></Image>
                    Yoo
                  </span>
                }
                id="collasible-nav-dropdown"
                alignRight
                className="p0"
              >
                <NavDropdown.Item as={Link} to="/user-profile">
                  <PersonCircle /> Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user-settings">
                  <Gear /> Settings
                </NavDropdown.Item>

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>
                  <BoxArrowRight /> Log Out{" "}
                </NavDropdown.Item>
              </DropdownButton>
            </Nav>
          </Navbar.Collapse>
        </React.Fragment>
      )}

    </Navbar>
  );
}

export default HeaderBar;
