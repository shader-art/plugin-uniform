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

export class UniformPlugin implements ShaderArtPlugin {
  name = 'UniformPlugin';
  gui: dat.GUI | null = null;

  setup(
    hostElement: HTMLElement,
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    program: WebGLProgram,
    canvas: HTMLCanvasElement
  ): void | Promise<void> {
    const gui = new dat.GUI();
    this.gui = gui;
    const elements = [...hostElement.querySelectorAll('uniform')];
    for (const el of elements) {
      const params: Record<string, number | string> = {};
      const name = el.getAttribute('name');
      const type = el.getAttribute('type');
      if (!name || !type) {
        continue;
      }
      if (type === 'float') {
        const value = parseFloat(el.getAttribute('value') || '0.');
        const min = parseFloat(el.getAttribute('min') || '0.');
        const max = parseFloat(el.getAttribute('max') || '0.');
        const step = parseFloat(el.getAttribute('step') || '0.');
        const useGui = !el.hasAttribute('no-gui');
        params[name] = value;
        const uName = gl.getUniformLocation(program, name);
        gl.uniform1f(uName, value);
        if (useGui) {
          gui
            .add(params, name)
            .min(min)
            .max(max)
            .step(step)
            .onChange(() => {
              gl.uniform1f(uName, params[name] as number);
            });
        }
      }
      if (type === 'color') {
        const value = el.getAttribute('value') || '#000000';
        params[name] = value;
        const uName = gl.getUniformLocation(program, name);
        gl.uniform3fv(uName, color(value));
        gui.addColor(params, name).onChange(() => {
          gl.uniform3fv(uName, color(params[name] as string));
        });
      }
    }
  }

  dispose() {
    this.gui?.destroy();
  }
}
