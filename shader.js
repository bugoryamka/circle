(async function() {
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL не поддерживается');
    return;
  }

  // Подгонка канваса под экран + DPR
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // Компиляция шейдера
  function compileShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  // Загрузка GLSL (можно inline-строками или через fetch)
  const [vertSrc, fragSrc] = await Promise.all([
    fetch('vertex.glsl').then(r => r.text()),
    fetch('fragment.glsl').then(r => r.text())
  ]);

  const vertShader = compileShader(vertSrc, gl.VERTEX_SHADER);
  const fragShader = compileShader(fragSrc, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Квадрат на весь экран
  const quad = new Float32Array([
    -1, -1,   1, -1,  -1, 1,
     1, -1,   1,  1,  -1, 1
  ]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Uniform‑ы
  const iResolutionLoc = gl.getUniformLocation(program, 'iResolution');
  const iMouseLoc      = gl.getUniformLocation(program, 'iMouse');

  // Координаты мыши/пальца (в пикселях WebGL‑канваса)
  const mouse = [0, 0];
  
  // Мышь
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mouse[0] = (e.clientX - rect.left) * dpr;
    mouse[1] = canvas.height - (e.clientY - rect.top) * dpr;
  });

  // Touch
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const touch = e.touches[0];
    mouse[0] = (touch.clientX - rect.left) * dpr;
    mouse[1] = canvas.height - (touch.clientY - rect.top) * dpr;
  }, { passive: false });

  // Рендер‑цикл
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(iResolutionLoc, canvas.width, canvas.height);
    gl.uniform2f(iMouseLoc, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
})();
