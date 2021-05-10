import { ShaderArtPlugin } from '@shader-art/plugin-base';
import dat from 'dat.gui';

function color(str: string): number[] {
  if (/^#[0-9a-f]{6}$/g.test(str)) {
    const r = parseInt(str.slice(1, 3), 16) / 255;
    const g = parseInt(str.slice(3, 5), 16) / 255;
    const b = parseInt(str.slice(5, 7), 16) / 255;
    return [r, g, b];
  }
  return [0, 0, 0];
}

export type Uniform = number | Record<string, number> | string;

export class UniformPlugin implements ShaderArtPlugin {
  name = 'UniformPlugin';
  gui: dat.GUI | null = null;
  params: Record<string, Uniform> = {};

  setup(
    hostElement: HTMLElement,
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    program: WebGLProgram,
    canvas: HTMLCanvasElement
  ): void | Promise<void> {
    const gui = new dat.GUI();
    this.gui = gui;
    this.params = {};
    const { params } = this;
    const elements = [...hostElement.querySelectorAll('uniform')];
    for (const el of elements) {
      const name = el.getAttribute('name');
      const type = el.getAttribute('type');
      const useGui = !el.hasAttribute('no-gui');
      if (!name || !type) {
        continue;
      }
      if (type === 'int') {
        const value = parseInt(el.getAttribute('value') || '0.', 10);
        const min = parseInt(el.getAttribute('min') || '', 10);
        const max = parseInt(el.getAttribute('max') || '', 10);
        const step = parseInt(el.getAttribute('step') || '1', 10);
        params[name] = value;
        const uName = gl.getUniformLocation(program, name);
        gl.uniform1i(uName, value);
        if (!useGui) {
          continue;
        }
        const changeHandler = () => {
          gl.uniform1i(uName, Math.floor(params[name] as number));
        };
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          gui
            .add(params, name)
            .min(min)
            .max(max)
            .step(step)
            .onChange(changeHandler);
        } else {
          gui.add(params, name).onChange(changeHandler);
        }
      }
      if (type === 'float') {
        const value = parseFloat(el.getAttribute('value') || '0.');
        const min = parseFloat(el.getAttribute('min') || '');
        const max = parseFloat(el.getAttribute('max') || '');
        const step = parseFloat(el.getAttribute('step') || '0.01');
        params[name] = value;
        const uName = gl.getUniformLocation(program, name);
        gl.uniform1f(uName, value);
        if (!useGui) {
          continue;
        }
        const changeHandler = () => {
          gl.uniform1f(uName, params[name] as number);
        };
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          gui
            .add(params, name)
            .min(min)
            .max(max)
            .step(step)
            .onChange(changeHandler);
        } else {
          gui.add(params, name).onChange(changeHandler);
        }
      }
      if (type === 'color') {
        const value = el.getAttribute('value') || '#000000';
        params[name] = value;
        const uName = gl.getUniformLocation(program, name);
        gl.uniform3fv(uName, color(value));
        if (!useGui) {
          continue;
        }
        gui.addColor(params, name).onChange(() => {
          gl.uniform3fv(uName, color(params[name] as string));
        });
      }
      if (type === 'vec2') {
        const value = (el.getAttribute('value') || '0,0')
          .split(',')
          .map((n) => parseFloat(n));
        params[name] = { x: value[0], y: value[1] };
        const uName = gl.getUniformLocation(program, name);
        gl.uniform2fv(uName, value);
        if (!useGui) {
          continue;
        }
        const changeCallback = () => {
          const valueObject = params[name] as Record<string, number>;
          const newValue = [valueObject.x, valueObject.y];
          gl.uniform2fv(uName, newValue);
        };
        const folder = gui.addFolder(name);
        folder.open();
        folder.add(params[name], 'x').onChange(changeCallback);
        folder.add(params[name], 'y').onChange(changeCallback);
      }
      if (type === 'vec3') {
        const value = (el.getAttribute('value') || '0,0,0')
          .split(',')
          .map((n) => parseFloat(n));
        params[name] = { x: value[0], y: value[1], z: value[2] };
        const uName = gl.getUniformLocation(program, name);
        gl.uniform3fv(uName, value);
        if (!useGui) {
          continue;
        }
        const changeCallback = () => {
          const valueObject = params[name] as Record<string, number>;
          const newValue = [valueObject.x, valueObject.y, valueObject.z];
          gl.uniform3fv(uName, newValue);
        };
        const folder = gui.addFolder(name);
        folder.open();
        folder.add(params[name], 'x').onChange(changeCallback);
        folder.add(params[name], 'y').onChange(changeCallback);
        folder.add(params[name], 'z').onChange(changeCallback);
      }
      if (type === 'vec4') {
        const value = (el.getAttribute('value') || '0,0,0,0')
          .split(',')
          .map((n) => parseFloat(n));
        params[name] = { x: value[0], y: value[1], z: value[2], w: value[3] };
        const uName = gl.getUniformLocation(program, name);
        gl.uniform3fv(uName, value);
        if (!useGui) {
          continue;
        }
        const folder = gui.addFolder(name);
        folder.open();
        const changeCallback = () => {
          const valueObject = params[name] as Record<string, number>;
          const newValue = [
            valueObject.x,
            valueObject.y,
            valueObject.z,
            valueObject.w,
          ];
          gl.uniform4fv(uName, newValue);
        };
        folder.add(params[name], 'x').onChange(changeCallback);
        folder.add(params[name], 'y').onChange(changeCallback);
        folder.add(params[name], 'z').onChange(changeCallback);
        folder.add(params[name], 'w').onChange(changeCallback);
      }
    }
  }

  dispose() {
    this.gui?.destroy();
  }
}
