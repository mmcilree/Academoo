import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';

var randomize = require('randomatic');

/* Sketch Menu component lets a user choose whether to create a new whiteboard room or join an existing room */
class SketchMenu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code: "",
        }
    }
    handleChange(event) {
        this.setState({ code: event.target.value })
    }

    //Generates a unique 4-digit code for a new room
    handleCreate() {
        const code = randomize('Aa0', 4);
        let path = {
            pathname: "/sketchamoo/" + code,
            state: {
                ready: true
            }
        }
        this.props.history.push(path);
    }

    //User can join a room using the 4-digit code
    handleJoin(event) {
        event.preventDefault();
        this.props.history.push("/sketchamoo/" + this.state.code);
    }

    /* Renders a menu with options for interacting with the shared whiteboard */
    render() {
        const { code } = this.state;

        return (<Card className="mt-4">
            <Card.Body>
                <h1>Sketch A Moo!</h1>

                <div className="m-4 d-flex flex-column align-items-center">
                    <h4 className="m-2" >Create your own whiteboard: </h4>
                    <Button variant="secondary" onClick={this.handleCreate.bind(this)} >Create</Button>
                </div>

                <div className="m-4 d-flex flex-column align-items-center">
                    <h4 className="m-2">Or join an existing room</h4>
                    <Form inline onSubmit={this.handleJoin.bind(this)}>
                        <Form.Control onChange={this.handleChange.bind(this)} className="m-2" value={code} placeholder="Code e.g. XC32" />
                        <Button type="submit" variant="secondary">
                            Join
                    </Button>
                    </Form>
                </div>
            </Card.Body>

        </Card >)
    }
}

export default SketchMenu;