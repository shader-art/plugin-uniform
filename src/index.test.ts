import { ShaderArtPlugin } from '@shader-art/plugin-base';
import { ShaderArtShim } from './test-utils/shader-art-shim';

jest.mock('dat.gui', () => ({
  GUI: function () {
    const gui: Record<string, jest.Mock> = {
      add: jest.fn().mockImplementation(() => gui),
      addColor: jest.fn().mockImplementation(() => gui),
      addFolder: jest.fn().mockImplementation(() => gui),
      open: jest.fn().mockImplementation(() => gui),
      min: jest.fn().mockImplementation(() => gui),
      max: jest.fn().mockImplementation(() => gui),
      step: jest.fn().mockImplementation(() => gui),
      destroy: jest.fn(),
      onChange: jest.fn(),
    };
    return gui;
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

const uniformInt = html` <uniform type="int" name="testInt" value="16" /> `;

const uniformColor = html`
  <uniform type="color" name="testColor" value="#ff00ff" />
`;

const uniformVec2 = html` <uniform type="vec2" name="testVec2" value="1,2" /> `;

const uniformVec3 = html`
  <uniform type="vec3" name="testVec3" value="1,2,3" />
`;

const uniformVec4 = html`
  <uniform type="vec4" name="testVec4" value="1,2,3,4" />
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

  test('shader-art creates a uniform int', () => {
    const element = createShaderArt(uniformInt + vertexShader + fragmentShader);
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
      (element.activePlugins[0] as UniformPlugin)?.gui?.addColor
    ).toHaveBeenCalled();
  });

  test('shader-art creates a uniform vec2', () => {
    const element = createShaderArt(
      uniformVec2 + vertexShader + fragmentShader
    );
    expect(element).toBeDefined();
    expect(element.canvas).toBeInstanceOf(HTMLCanvasElement);
    const plugin = element.activePlugins[0] as UniformPlugin;
    expect(plugin?.gui?.addFolder).toHaveBeenCalled();
    expect(plugin?.params?.testVec2).toEqual({ x: 1, y: 2 });
  });

  test('shader-art creates a uniform vec3', () => {
    const element = createShaderArt(
      uniformVec3 + vertexShader + fragmentShader
    );
    expect(element).toBeDefined();
    expect(element.canvas).toBeInstanceOf(HTMLCanvasElement);
    const plugin = element.activePlugins[0] as UniformPlugin;
    expect(plugin?.gui?.addFolder).toHaveBeenCalled();
    expect(plugin?.params?.testVec3).toEqual({ x: 1, y: 2, z: 3 });
  });

  test('shader-art creates a uniform vec4', () => {
    const element = createShaderArt(
      uniformVec4 + vertexShader + fragmentShader
    );
    expect(element).toBeDefined();
    expect(element.canvas).toBeInstanceOf(HTMLCanvasElement);
    const plugin = element.activePlugins[0] as UniformPlugin;
    expect(plugin?.gui?.addFolder).toHaveBeenCalled();
    expect(plugin?.params?.testVec4).toEqual({ x: 1, y: 2, z: 3, w: 4 });
  });

  afterEach(() => {
    const sc = document.querySelector('shader-art');
    if (sc) {
      sc.remove();
    }
    jest.resetAllMocks();
  });
});
