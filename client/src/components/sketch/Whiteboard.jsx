import React from 'react';
import { SketchField, Tools } from 'react-sketch-whiteboard';
import { Clipboard, Link45deg, Cursor, Pencil, Slash, Circle, Square, ArrowsMove, Palette, Download, Trash, BorderWidth, CursorText, PlusCircle, Share, ArrowCounterclockwise, ArrowClockwise, Eraser } from 'react-bootstrap-icons';
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
    InputGroup,
    Tooltip,

} from 'react-bootstrap';
import { Route, Link } from 'react-router-dom';
import { authFetch } from '../../auth';

class Whiteboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTool: Tools.Pencil,
            lineColour: "black",
            backgroundColour: "white",
            lineWidth: 10,
            canUndo: false,
            canRedo: false,
            text: "",
            codeCopied: false,
            enableRemoveSelected: false,
            receivedUpdate: false,
        }
    }

    onSketchChange() {
        let prev = this.state.canUndo;
        let now = this.sketch.canUndo();
        if (prev !== now) {
            this.setState({ canUndo: now });
        }

        // console.log(this.props.receivedJson);
        if (!this.props.receivedJson) {
            this.sendUpdate()
        } else {
            this.props.setReceivedJson();
        }

    };

    sendUpdate() {
        this.props.onSketchChange(this.sketch.toJSON());
    }

    getUpdate() {
        console.log(this.props.jsonValue);
        this.sketch.fromJSON(this.props.jsonValue);
    }

    setTool(event) {
        this.setState({
            currentTool: event.target.value,
            enableRemoveSelected: event.target.value === Tools.Select
        });
    }

    clear = () => {
        this.sketch.clear();
        this.sketch.setBackgroundFromDataUrl('');
        this.setState({
            backgroundColour: "white",
            canUndo: this.sketch.canUndo(),
            canRedo: this.sketch.canRedo(),
        })
    }

    removeSelected = () => {
        this.sketch.removeSelected()
    };


    handleChangeText(event) {
        this.setState({ text: event.target.value });
    }

    addText = (event) => {
        event.preventDefault();
        this.sketch.addText(this.state.text);
        this.setState({ text: "" });
    }

    undo = () => {
        this.sketch.undo();
        this.setState({
            canUndo: this.sketch.canUndo(),
            canRedo: this.sketch.canRedo(),
        });
    };

    redo = () => {
        this.sketch.redo();
        this.setState({
            canUndo: this.sketch.canUndo(),
            canRedo: this.sketch.canRedo(),
        });
    };

    // remove = index => {
    //     this.sketch.removeSelected();
    // }

    download = () => {
        this.downloadURL(this.sketch.toDataURL(), "sketchamoo.png");
    };

    downloadURL(url, filename) {
        authFetch(url).then(function (t) {
            return t.blob().then((b) => {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", filename);
                a.click();
            }
            );
        }).catch(() => { });
    }

    share = () => {
        const dataURL = this.sketch.toDataURL();
        this.props.history.push({
            pathname: "/create-post",
            state: {
                body: "![sketchamoo](" + dataURL + ")",
                markdown: true,
            }
        })
    }

    render() {
        const { currentTool, lineColour, backgroundColour, lineWidth, text, selected } = this.state;
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
                            <Form.Control placeholder="Mooo" value={text} onChange={this.handleChangeText.bind(this)} />
                            <InputGroup.Append>
                                <Button type="submit" variant="outline-secondary"><PlusCircle /></Button>
                            </InputGroup.Append>
                        </InputGroup>

                    </Form>

                </Popover.Content>
            </Popover>
        );

        return (
            <Card className="mt-4 p-4" style={{ width: '1200px' }}>
                <h1>Whiteboard</h1>
                <p>Share your moosings on the sketch-a-moo!</p>
                <Card>
                    <Card.Header className="d-flex justify-content-left">
                        <h4 className="m-2">Code: {this.props.code}</h4>
                        <Button className="m-1" variant="outline-secondary" onClick={() => { navigator.clipboard.writeText(this.props.code); this.setState({ codeCopied: true }) }}>
                            {this.state.codeCopied ? <span>Code Copied! </span> : <span><Clipboard className="m-1" /> Copy Code</span>}
                        </Button>
                        <Link to={
                            {
                                pathname: "/create-post",
                                state: {
                                    body: "Join our shared whiteboard here: " + window.location,
                                    community: "",
                                    host: ""
                                }

                            }}
                        >
                            <Button variant="outline-secondary" className="m-1">
                                <Link45deg /> Send Invite Link
                                        </Button>
                        </Link>
                    </Card.Header>
                    <Card.Header className="d-flex justify-content-between">
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
                            {/* <ToggleButton type="radio" value={this.state.canUndo}
                                disabled={!this.state.canUndo} onChange={this.undo}>
                                <ArrowCounterclockwise />
                            </ToggleButton> */}

                            {/* <ToggleButton type="radio" value={this.state.canRedo}
                                disabled={!this.state.canRedo} onChange={this.redo}>
                                <ArrowClockwise />
                            </ToggleButton> */}

                            <ToggleButton type="radio" value={this.state.enableRemoveSelected}
                                disabled={!this.state.enableRemoveSelected} onChange={this.removeSelected}>
                                <Eraser />
                            </ToggleButton>

                        </ToggleButtonGroup>

                        <OverlayTrigger trigger={['click', 'focus']} placement="bottom" overlay={colourPopover}>
                            <Button className="ml-4">
                                <Palette />
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger trigger={['click', 'focus']} placement="bottom" overlay={textPopover}>
                            <Button className="ml-2">
                                <CursorText />
                            </Button>
                        </OverlayTrigger>

                        <Dropdown>
                            <Dropdown.Toggle variant="primary" className="ml-2" id="dropdown-basic" >
                                <BorderWidth />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Header>Pick a Line Thickness</Dropdown.Header>
                                <Dropdown.Item onClick={() => this.setState({ lineWidth: 10 })}>Small</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.setState({ lineWidth: 25 })} >Medium</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.setState({ lineWidth: 50 })}>Thiccc</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <OverlayTrigger
                            key="save"
                            placement="bottom"
                            overlay={
                                <Tooltip id="tooltip-save">
                                    Save
                                </Tooltip>
                            }
                        >
                            <Button variant="outline-secondary" className="ml-4" onClick={this.download}>
                                <Download />
                            </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                            key="clear"
                            placement="bottom"
                            overlay={
                                <Tooltip id="tooltip-clear">
                                    Clear
                                </Tooltip>
                            }
                        >
                            <Button variant="outline-secondary" className="ml-2" onClick={this.clear}>
                                <Trash />
                            </Button>
                        </OverlayTrigger>
                        <Route render={({ history }) => (
                            <Button variant="outline-secondary" className="justify-content-right ml-4" onClick={this.share}>
                                <Share /> Share on Academoo
                            </Button>
                        )} />

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
                            value={this.props.jsonValue}
                            // canUndo={this.state.canUndo}
                            // canRedo={this.state.canRedo}
                            defaultValue={this.props.jsonValue}
                            // forceValue
                            onChange={this.onSketchChange.bind(this)}
                        />
                    </Card.Body>
                </Card>


            </Card >
        );
    }
}

export default Whiteboard;