import React, { Component } from 'react';
import FastCanvas from './fastCanvas';
import createDrawConfig from './drawConfig';

export default class CanvasDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    }

    const config = createDrawConfig({
      percent: 50 / 100
    })

    this.fastCanvas = new FastCanvas(config);
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    await this.drawPoster();
  }

  drawPoster = async () => {
    const base64Image = await this.fastCanvas.render();
    return base64Image
  }

  render() {
    return (
      <>
        <div id='poster' />
      </>

    )
  }
}
