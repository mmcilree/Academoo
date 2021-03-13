import React from 'react';
import { Card, Button, ToggleButton, ToggleButtonGroup, Popover, OverlayTrigger } from 'react-bootstrap';
import { SketchField, Tools } from 'react-sketch-whiteboard';
import { Cursor, Pencil, Slash, Circle, Square, ArrowsMove, Palette, Download, Trash } from 'react-bootstrap-icons';
import { CompactPicker } from 'react-color';

class Whiteboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTool: Tools.Pencil,
            lineColour: "black",
            backgroundColour: "transparent"
        }
    }


    setTool(event) {
        console.log(event.target.value);
        this.setState({ currentTool: event.target.value });
    }

    clear = () => {
        console.log("here")
        this.sketch.clear();
        this.sketch.setBackgroundFromDataUrl('');
        this.setState({ backgroundColour: "transparent" })
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
        const { currentTool, lineColour, backgroundColour } = this.state;
        const popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">Pick a Colour!</Popover.Title>
                <Popover.Content>
                    <CompactPicker
                        id='lineColour' color={this.state.lineColour}
                        onChange={(color) => this.setState({ lineColour: color.hex })} />
                </Popover.Content>
            </Popover>
        );
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

                        <OverlayTrigger trigger={['click', 'focus']} placement="right" overlay={popover}>
                            <Button className="ml-4" >
                                <Palette />
                            </Button>
                        </OverlayTrigger>

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
                            lineWidth={3}
                            backgroundColor={backgroundColour} />
                    </Card.Body>
                </Card>


            </Card>
        );
    }
}

export default Whiteboard;