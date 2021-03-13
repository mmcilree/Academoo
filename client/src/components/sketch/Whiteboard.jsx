import React from 'react';
import { SketchField, Tools } from 'react-sketch-whiteboard';
import { Cursor, Pencil, Slash, Circle, Square, ArrowsMove, Palette, Download, Trash, BorderWidth, CursorText, PlusCircle } from 'react-bootstrap-icons';
import { CompactPicker } from 'react-color';
import {
    Card,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Popover,
    OverlayTrigger,
    Form,
    Dropdown,
    InputGroup
} from 'react-bootstrap';


class Whiteboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTool: Tools.Pencil,
            lineColour: "black",
            backgroundColour: "white",
            lineWidth: 10,
            canUndo: false,
            text: ""
        }
    }

    onSketchChange = () => {
        let prev = this.state.canUndo;
        let now = this.sketch.canUndo();
        if (prev !== now) {
            this.setState({ canUndo: now });
        }
    };

    setTool(event) {
        console.log(event.target.value);
        this.setState({ currentTool: event.target.value });
    }

    clear = () => {
        console.log("here")
        this.sketch.clear();
        this.sketch.setBackgroundFromDataUrl('');
        this.setState({ backgroundColour: "white" })
    }
    
    handleChangeText(event) {
        this.setState({text: event.target.value});
    }
    
    addText = (event) => {
        console.log(this.state)
        event.preventDefault();
        this.sketch.addText(this.state.text);
        this.setState({text: ""});
    }

    download = () => {
        this.downloadURL(this.sketch.toDataURL(), "sketchamoo.png");
    };

    downloadURL(url, filename) {
        fetch(url).then(function (t) {
            return t.blob().then((b) => {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", filename);
                a.click();
            }
            );
        });
    }

    render() {
        const { currentTool, lineColour, backgroundColour, lineWidth, canUndo, text } = this.state;
        const colourPopover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">Pick a Colour!</Popover.Title>
                <Popover.Content>
                    <CompactPicker
                        id='lineColour' color={this.state.lineColour}
                        onChange={(color) => this.setState({ lineColour: color.hex })} />
                </Popover.Content>
            </Popover>
        );

        const textPopover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">Add text to sketch:</Popover.Title>
                <Popover.Content>
                    <Form onSubmit={this.addText.bind(this)}>
                        <InputGroup controlId="addText">
                            <Form.Control placeholder="Mooo" value={text} onChange={this.handleChangeText.bind(this)}/>
                            <InputGroup.Append>
                                <Button type="submit" variant="outline-secondary"><PlusCircle /></Button>
                            </InputGroup.Append>
                        </InputGroup>

                    </Form>

                </Popover.Content>
            </Popover>
        );

        console.log(lineWidth)
        return (

            <Card className="mt-4 p-4">
                <h1>Whiteboard</h1>
                <p>Share your moosings on the sketch-a-moo!</p>
                <Card>
                    <Card.Header className="d-flex">
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

                        <OverlayTrigger trigger={['click', 'focus']} placement="bottom" overlay={colourPopover}>
                            <Button className="ml-4" >
                                <Palette />
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger trigger={['click', 'focus']} placement="bottom" overlay={textPopover}>
                            <Button className="ml-2" >
                                <CursorText />
                            </Button>
                        </OverlayTrigger>

                        <Dropdown >
                            <Dropdown.Toggle variant="primary" className="ml-2" id="dropdown-basic">
                                <BorderWidth />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Header>Pick a Line Thickness</Dropdown.Header>
                                <Dropdown.Item onClick={() => this.setState({ lineWidth: 10 })}>Small</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.setState({ lineWidth: 25 })} >Medium</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.setState({ lineWidth: 50 })}>Thiccc</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button className="ml-4" onClick={this.download}>
                            <Download /> Save
                            </Button>
                        <Button className="ml-2" onClick={this.clear}>
                            <Trash /> Clear
                            </Button>
                    </Card.Header>
                    <Card.Body>
                        <SketchField width='1024px'
                            name="sketch"
                            ref={c => (this.sketch = c)}
                            height='768px'
                            tool={currentTool}
                            lineColor={lineColour}
                            lineWidth={lineWidth}
                            backgroundColor={backgroundColour}
                            canUndo={canUndo}
                            onChange={this.onSketchChange}
                        />
                    </Card.Body>
                </Card>


            </Card>
        );
    }
}

export default Whiteboard;