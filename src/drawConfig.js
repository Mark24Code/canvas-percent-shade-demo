const createDrawConfig = ({ percent }) => {

  return {
    rootId: 'poster',
    id: 'poster-canvas',
    width: 349,
    height: 233,
    debug: false,
    children: [
      {
        id: '背景图',
        type: 'image',
        url: require('./assets/background.jpg').default,
        x: 0,
        y: 0,
        width: 349,
        height: 233,
      },
      {
        id: '前景图',
        type: 'shadeMaskImage',
        url: require('./assets/frontend.jpg').default,
        x: 0,
        y: 0,
        width: 349,
        height: 233,
        percent,
      },
    ]
  }
}

export default createDrawConfig;