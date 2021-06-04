const createDrawConfig = (opts) => {
  const percent = opts.percent || 0;

  const template = {
    rootId: 'poster',
    id: 'poster-canvas',
    width: 349,
    height: 233,
    debug: false, // process.env.NODE_ENV === 'development',
    children: []
  }

  const children = [
    {
      id: '背景图',
      type: 'image',
      url: require('./assets/flower_bg.png').default,
      x: 0,
      y: 0,
      width: 349,
      height: 233,
    },
    {
      id: '前景图',
      type: 'shadeMaskImage',
      url: require('./assets/flower_ft.png').default,
      x: 0,
      y: 0,
      width: 349,
      height: 233,
      percent,
    },
  ]


  template.children = children;

  return template
}

export default createDrawConfig;