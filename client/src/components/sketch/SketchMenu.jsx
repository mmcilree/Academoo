import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';

var randomize = require('randomatic');

class SketchMenu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code: ""
        }
    }
    handleChange(event) {
        this.setState({code: event.target.value})
    }

    handleCreate() {
        const code = randomize('Aa0', 4);
        this.props.history.push("/sketchamoo/" + code);
    }

    handleJoin() {
        
    }

    render() {
        const {code} = this.state;

        return (<Card className="mt-3">
            <Card.Body>
                <h3>Create your own whiteboard</h3>
                
                <Button onClick={this.handleCreate.bind(this)}>Create</Button>
            </Card.Body>

            <Card.Body>
                <h3>Or join an existing room</h3>
                <Form inline>
                    <Form.Control onChange={this.handleChange.bind(this)} className="mr-4" value={code} placeholder="Code e.g. XC32" />
                    <Button onClick={this.handleJoin.bind(this)}>
                        Join
                    </Button>
                </Form>
            </Card.Body>

        </Card>)
    }
}

export default SketchMenu;