import React from 'react';
import { Card, Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { SketchField, Tools } from 'react-sketch-whiteboard';
import { Cursor, Pencil, Slash, Circle, Square, ArrowsMove } from 'react-bootstrap-icons';

class Whiteboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTool: Tools.Pencil
        }
    }


    setTool(event) {
        console.log(event.target.value);
        this.setState({ currentTool: event.target.value });
    }

    render() {
        const { currentTool } = this.state;

        return (

            <Card className="mt-4 p-4">
                <h1>Whiteboard</h1>
                <p>Share your moosings on the sketch-a-moo!</p>
                <Card>
                    <Card.Header className="">
                        <ToggleButtonGroup name="tools" >
                            <ToggleButton type="radio" value={Tools.Select}
                                onClick={this.setTool.bind(this)}
                            ><Cursor /></ToggleButton>
                            <ToggleButton type="radio" value={Tools.Line}
                                onClick={this.setTool.bind(this)}
                            ><Slash /></ToggleButton>
                            <ToggleButton type="radio" value={Tools.Pencil}
                                onClick={this.setTool.bind(this)}
                            ><Pencil /></ToggleButton>
                            <ToggleButton type="radio" value={Tools.Rectangle}
                                onClick={this.setTool.bind(this)}
                            ><Square /></ToggleButton>
                            <ToggleButton type="radio" value={Tools.Circle}
                                onClick={this.setTool.bind(this)}
                            ><Circle /></ToggleButton>

                            <ToggleButton type="radio" value={Tools.Pan}
                                onClick={this.setTool.bind(this)}
                            ><ArrowsMove /></ToggleButton>
                        </ToggleButtonGroup>

                    </Card.Header>
                    <Card.Body>
                        <SketchField width='1024px'
                            height='768px'
                            tool={currentTool}
                            lineColor='black'
                            lineWidth={3} />
                    </Card.Body>
                </Card>


            </Card>
        );
    }
}

export default Whiteboard;