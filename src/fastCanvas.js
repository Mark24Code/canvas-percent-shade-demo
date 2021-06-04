import { camelCase } from 'lodash';
import qs from 'query-string';
import { transToHttps } from './utils';


export default class FastCanvas {
  constructor(config) {
    const { debug, rootId, id, width, height, children, preset } = config;

    this.canvasConfig = {
      rootId: rootId || 'root',
      id: id || `${rootId}-canvas`,
      width,
      height,
      debug: debug || false,
    }
    this.drawList = children || [];
    this.ctx = null;
    this.preset = preset;
    this.init()
  }

  init = () => {
    const {
      id,
      width,
      height,
    } = this.canvasConfig;
    const c = window.document.createElement('canvas');

    c.id = id;

    const ctx = c.getContext('2d'); // 创建context对象
    if (!ctx) {
      throw Error('Cannot find canvas.getContext');
    }

    // global
    this.c = c;
    this.canvas = c;
    this.ctx = ctx;
    this.ratio = this.getPixelRatio();

    // setting
    c.style.width = width + 'px';
    c.style.height = height + 'px';

    c.width = width * this.ratio;
    c.height = height * this.ratio;

    ctx.scale(this.ratio, this.ratio);
  }

  getPixelRatio = () => {
    const context = this.ctx;
    const backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }

  startDraw = async () => {
    const ctx = this.ctx;
    const { debug } = this.canvasConfig;
    if (this.drawList <= 0) { return };

    const drawTasks = [...this.drawList];

    for (let i = 0; i < drawTasks.length; i++) {
      const currentTask = drawTasks[i];
      const { id, type, ...args } = currentTask;
      const methodName = camelCase(`draw_${type}`);

      if (debug) {
        console.log(`[start draw] ${id || JSON.stringify(currentTask)}`)
      }
      ctx.save();
      await this[methodName](args);
      ctx.restore();
      if (debug) {
        console.log(`[finished draw] ${id || JSON.stringify(currentTask)}`)
      }
    }
  }

  drawImage = async ({ url, x, y, width, height }) => {
    const ctx = this.ctx;
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      url = transToHttps(url);
      // 可能会修改origin，为了加载同一张图片时候不产生跨域报错，增加时间戳不使用缓存
      const [imgUrl, originImgUrlQuery] = url.split('?');
      const noCacheQuery = qs.stringify({ time: new Date().valueOf() })

      url = imgUrl + '?' + noCacheQuery + originImgUrlQuery;
      const { debug } = this.canvasConfig;
      if (debug) {
        console.log('[drawImageUrl]:' + url)
      }
      // iOS13 BUG crossOrigin必须先于 src 设置 https://blog.csdn.net/DavidFFFFFF/article/details/95217076
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = function () {
        ctx.drawImage(img, x, y, width, height);
        resolve();
      }
      img.onerror = function (err) {
        reject(err);
      }
    })
  }

 
  drawShadeMaskImage = async ({ url, x, y, width, height, percent }) => {
    // 因为画布计算式反着的坐标系
    percent = 1 - percent;
    // 不规则百分比遮罩
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0)'; // 隐藏贝塞尔边缘线
    ctx.beginPath();
    ctx.moveTo(0, height * percent);
    ctx.bezierCurveTo(width * 0.25, height * percent * 1.5, width * 0.75, height * percent * 0.5, width, height*percent );
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, height * percent);
    ctx.stroke();
    ctx.clip();
    await this.drawImage({ url, x, y, width, height });
  }

  insertRoot = () => {
    const { rootId } = this.canvasConfig;
    const root = window.document.getElementById(rootId)
    root.append(this.c);
  }

  downloadImg = async () => {
    const { id } = this.canvasConfig;
    const canvas = this.c;
    const imgSrc = await new Promise((resolve, reject) => {
      canvas.toBlob(function (blobObj) {
        const imgSrc = window.URL.createObjectURL(blobObj)
        resolve(imgSrc)
      })
    })

    const aLink = window.document.createElement('a');
    aLink.download = `${id}.png`;
    aLink.href = imgSrc;
    aLink.click();
  }

  render = async () => {
    try {
      await this.startDraw();
      await this.insertRoot();
      const base64 = await this.toBase64();
      return base64;
    } catch (err) {
      if (this.canvasConfig.debug) {
        console.log(err)
      }
    }
  }

  toBase64 = (imgPrefix = 'image/png', quality) => {
    return this.c.toDataURL(imgPrefix, quality);
  }
}


// 其他 canvas写法 ------------  暂时不需要


  // drawClearRect = ({ x, y, width, height }) => {
  //   const ctx = this.ctx;
  //   ctx.clearRect(x, y, width, height);
  // }

  // drawBackgroundColor = ({ color }) => {
  //   const ctx = this.ctx;
  //   ctx.fillStyle = color;
  //   ctx.fillRect(0, 0, this.c.width, this.c.height);
  // }

  // drawFillRect = ({ x, y, width, height }) => {
  //   const ctx = this.ctx;
  //   ctx.fillRect(x, y, width, height);
  // }

  // drawStrokeRect = ({ x, y, width, height }) => {
  //   const ctx = this.ctx;
  //   ctx.strokeRect(x, y, width, height);
  // }

 // drawText = ({ text, x, y, font, textBaseline, direction, textAlign, color, stroke = false, maxWidth }) => {
  //   const ctx = this.ctx;
  //   const { text: defaultText } = this.preset;

  //   ctx.font = font || defaultText.font;
  //   ctx.textBaseline = textBaseline || defaultText.textBaseline;
  //   ctx.direction = direction || defaultText.direction;
  //   ctx.textAlign = textAlign || defaultText.textAlign;
  //   ctx.fillStyle = color || defaultText.color;
  //   ctx.maxWidth = maxWidth || defaultText.maxWidth;

  //   if (stroke) {
  //     ctx.strokeText(text, x, y, maxWidth);
  //   } else {
  //     ctx.fillText(text, x, y, maxWidth);
  //   }
  // }

  // drawCenterText = ({ text, centerX, y, font, textBaseline, direction, color, stroke = false, maxWidth }) => {
  //   // 居中字体
  //   // 提供一个居中的容器坐标  centerX 中心不提供，默认为画布中心
  //   const x = centerX || this.canvasConfig.width / 2;

  //   this.drawText({ text, x, y, font, textBaseline, direction, textAlign: 'center', color, stroke, maxWidth })
  // }

  // drawCircleImage = async ({ url, x, y, radius, borderColor, borderWidth }) => {
  //   // 带边框的圆头像
  //   const ctx = this.ctx;
  //   ctx.save();
  //   if (borderWidth) {
  //     ctx.beginPath();
  //     if (borderColor) {
  //       ctx.fillStyle = borderColor
  //     }

  //     ctx.arc(x + radius, y + radius, radius + borderWidth, 0, 2 * Math.PI, false);
  //     ctx.fill();
  //     ctx.restore();
  //   }

  //   ctx.beginPath();
  //   ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI, false);
  //   ctx.clip();
  //   await this.drawImage({ url, x, y, width: radius * 2, height: radius * 2 });
  // }