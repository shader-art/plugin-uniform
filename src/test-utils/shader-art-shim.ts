import { ShaderArtPlugin } from '@shader-art/plugin-base';

export class ShaderArtShim extends HTMLElement {
  canvas: HTMLCanvasElement | null = null;
  gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  program: WebGLProgram | null = null;
  activePlugins: ShaderArtPlugin[] = [];
  initialized = false;

  static plugins: (() => ShaderArtPlugin)[] = [];
  static register(plugins: (() => ShaderArtPlugin)[]): void {
    ShaderArtShim.plugins = plugins;
    if (typeof customElements.get('shader-art') === 'undefined') {
      customElements.define('shader-art', ShaderArtShim);
    }
  }

  constructor() {
    super();
  }

  setup(): void {
    const canvas = document.createElement('canvas');
    this.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('create WebGLRenderingContext failed');
    }

    const program = gl.createProgram();
    if (!program) {
      throw new Error('create WebGLProgram failed');
    }

    this.gl = gl;
    this.canvas = canvas;
    this.program = program;

    const pluginQueue: Promise<void>[] = [];
    for (const plugin of ShaderArtShim.plugins) {
      const instance = plugin();
      this.activePlugins.push(instance);
      const result = instance.setup(this, gl, program, canvas);
      if (result instanceof Promise) {
        pluginQueue.push(result);
      }
    }
    Promise.all(pluginQueue).then(() => {
      this.initialized = true;
    });
  }

  connectedCallback(): void {
    if (!this.gl) {
      this.setup();
    }
  }

  disconnectedCallback(): void {
    this.dispose();
  }

  dispose(): void {
    if (!this.gl || !this.canvas) {
      return;
    }
    for (const plugin of this.activePlugins) {
      plugin.dispose();
    }
    this.activePlugins = [];
    this.gl = null;
    this.program = null;
    this.removeChild(this.canvas);
  }

  render(): void {
    if (this.gl) {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 0);
    }
  }
}
