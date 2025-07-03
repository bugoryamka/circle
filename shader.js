// shader.js
(async function() {
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL не поддерживается');
    return;
  }
  // Подгоняем размер канваса под окно
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // Утилита для загрузки и компиляции шейдера
  function compileShader(src, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // Загружаем GLSL код (пример — через fetch, но можно встраивать строкой)
  const [vertSrc, fragSrc] = await Promise.all([
    fetch('vertex.glsl').then(r => r.text()),
    fetch('fragment.glsl').then(r => r.text())
  ]);

  const vertShader = compileShader(vertSrc, gl.VERTEX_SHADER);
  const fragShader = compileShader(fragSrc, gl.FRAGMENT_SHADER);

  // Создаём и линкуем программу
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Привязываем атрибуты: создаём квадрат (две треугольные полосы)
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

  // Получаем локации униформ
  const iResolutionLoc = gl.getUniformLocation(program, 'iResolution');
  const iMouseLoc = gl.getUniformLocation(program, 'iMouse');

  // Отслеживаем положение мыши
  const mouse = [0, 0];
  canvas.addEventListener('mousemove', e => {
    mouse[0] = e.clientX;
    mouse[1] = canvas.height - e.clientY;
  });

  // Основной цикл рендера
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(iResolutionLoc, canvas.width, canvas.height);
    gl.uniform2f(iMouseLoc, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
})();
