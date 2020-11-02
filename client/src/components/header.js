import React from 'react';
import Navbar from 'react-bootstrap/navbar';
import Nav from 'react-bootstrap/nav';
import Form from 'react-bootstrap/form';
import Button from 'react-bootstrap/button';
import FormControl from 'react-bootstrap/formcontrol';
import { PlusCircle } from 'react-bootstrap-icons';

class Header extends React.Component {
    render() {
        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">Academoo</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <Nav.Link href="#home">Hoome</Nav.Link>
                        <Nav.Link href="#link">
                            <span>NewMoo </span>
                            <PlusCircle />
                        </Nav.Link>
                    </Nav>
                    <Form inline>
                        <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                        <Button variant="outline-success">Search</Button>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default Header;