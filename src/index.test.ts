import { ShaderArtPlugin } from '@shader-art/plugin-base';
import { ShaderArtShim } from './test-utils/shader-art-shim';

jest.mock('dat.gui', () => ({
  GUI: function () {
    const that: any = {
      add: jest.fn().mockImplementation(() => that),
      addColor: jest.fn().mockImplementation(() => that),
      min: jest.fn().mockImplementation(() => that),
      max: jest.fn().mockImplementation(() => that),
      step: jest.fn().mockImplementation(() => that),
      destroy: jest.fn().mockImplementation(() => that),
      onChange: jest.fn(),
    };
    return that;
  },
}));

import { UniformPlugin } from './index';

const html = (x: any) => x;

function asynced(fn: (...args: any[]) => void, timeout = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, timeout);
  });
}

const vertexShader = html`
  <script type="vert">
    precision highp float;
    attribute vec4 position;
    void main() {
      gl_Position = position;
    }
  </script>
`;

const fragmentShader = html`
  <script type="frag">
    precision highp float;
    uniform vec2 resolution;
    unifrom texture2D texture;
    void main() {
      vec2 p = gl_FragCoord.xy / resolution;
      gl_FragColor = texture2D(texture, p);
    }
  </script>
`;

const uniformFloat = html`
  <uniform type="float" name="testFloat" value="123." />
`;

const uniformColor = html`
  <uniform type="float" name="testColor" value="#ff00ff" />
`;

const createShaderArt = (html: string): ShaderArtShim => {
  const element = document.createElement('shader-art');
  element.setAttribute('autoplay', '');
  element.innerHTML = html;
  document.body.appendChild(element);
  return element as ShaderArtShim;
};

describe('UniformPlugin tests', () => {
  beforeAll(() => {
    ShaderArtShim.register([() => new UniformPlugin()]);
  });

  test('shader-art creation', () => {
    const element = createShaderArt(vertexShader + fragmentShader);
    expect(element).toBeDefined();
    expect(element.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(element.activePlugins.map((p: ShaderArtPlugin) => p.name)).toContain(
      'UniformPlugin'
    );
  });

  test('shader-art creates a uniform float', () => {
    const element = createShaderArt(
      uniformFloat + vertexShader + fragmentShader
    );
    expect(element).toBeDefined();
    expect(element.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(
      (element.activePlugins[0] as UniformPlugin)?.gui?.add
    ).toHaveBeenCalled();
  });

  test('shader-art creates a uniform color', () => {
    const element = createShaderArt(
      uniformColor + vertexShader + fragmentShader
    );
    expect(element).toBeDefined();
    expect(element.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(
      (element.activePlugins[0] as UniformPlugin)?.gui?.add
    ).toHaveBeenCalled();
  });

  afterEach(() => {
    const sc = document.querySelector('shader-art');
    if (sc) {
      sc.remove();
    }
    jest.resetAllMocks();
  });
});
