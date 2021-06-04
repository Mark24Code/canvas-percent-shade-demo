import React, { Component } from 'react';
import FastCanvas from './fastCanvas';
import createDrawConfig from './drawConfig';


export default class CanvasDemo extends Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.state = {
      percent: 50
    }


  }

  componentDidMount() {
    console.log('update')
    this.renderCanvas();
  }

  renderCanvas = async () => {
    const config = createDrawConfig({
      percent: this.state.percent / 100
    })

    this.fastCanvas = new FastCanvas(config);
    await this.fastCanvas.render();
  }

  updatePercent = () => {
    console.log(this.textInput.current.value)
    this.setState({
      percent: this.textInput.current.value
    },() => {
      this.renderCanvas();
    })
  }

  render() {
    const { percent } = this.state;
    return (
      <>
        <input type="number" step="1" min="0" max="100" ref={this.textInput} defaultValue={percent} />
        <button onClick={this.updatePercent}>update percent</button>
        <div>display percent: {percent}%</div>
        <div id='poster' />
      </>

    )
  }
}
