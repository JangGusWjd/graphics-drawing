let gl;
const maxNumTriangles = 300;
const maxNumVertices = 3 * maxNumTriangles;

let index = 0; // 마우스로 입력받은 정점의 순서 저장
let cIndex = 0; // 입력받은 색상의 인덱스 값 저장
let sIndex = 0; // 그리고자 하는 모양들 중 선택된 모양 인덱스 저장
let bgIndex = 0; // 캔버스 배경 색상 인덱스 저장

let draw = false; // 마우스가 내려갔다가 다시 올라갔을 때 그리기 위해 마우스의 상태 저장할 변수

const color = [
  vec4(0.0, 0.0, 0.0, 1.0), // black
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 0.5, 0.0, 1.0), // orange
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // purple
  vec4(1.0, 1.0, 1.0, 1.0), // white
];

window.onload = function init() {
  const canvas = document.getElementById("canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // 그릴 선의 색상을 가져와 cIndex에 저장하는 과정
  const drawingColor = document.getElementById("color");
  drawingColor.addEventListener("click", function (e) {
    cIndex = drawingColor.selectedIndex;
  });

  // 그릴 모양(선, 삼각형)중 어떤 것이 선택되었는지 sIndex에 불러오는 과정
  const drawingShape = document.getElementById("shape");
  drawingShape.addEventListener("click", function () {
    sIndex = drawingShape.selectedIndex;
  });

  // 어떤 배경 색상을 선택하였는지 bgColor에 저장
  const bgColor = document.getElementById("background");
  bgColor.addEventListener("click", function () {
    bgIndex = bgColor.selectedIndex;

    // 선택된 배경 색상에 따라 canvas 배경 색상 변경하는 과정
    switch (bgIndex) {
      case 0:
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black
        break;
      case 1:
        gl.clearColor(0.5, 0.5, 0.5, 1.0); // Grey
        break;
      case 2:
        gl.clearColor(1.0, 1.0, 1.0, 1.0); // White
        break;
      case 3:
        gl.clearColor(0.0, 0.0, 1.0, 0.5); // LightBlue
        break;
      case 4:
        gl.clearColor(1.0, 1.0, 0.0, 0.5); // LightYellow
        break;
    }
  });

  // 그렸던 그림들을 지우기 위해 canvas를 비우는 버튼에 대한 이벤트 작성
  const clearBtn = document.getElementById("clearBtn");
  clearBtn.onclick = function () {
    gl.clearColor(0.5, 0.5, 0.5, 1.0); // canvas 배경 색상 기본값 grey 색상으로 지정
    index = 0; // index를 0으로 초기화하여 canvas를 비운다.
  };

  canvas.addEventListener("mousedown", function () {
    draw = true; // 마우스 버튼을 눌렀을 때 draw = true로 바꿔 canvas에 그려지도록 함
  });

  canvas.addEventListener("mouseup", function () {
    draw = false; // 마우스 버튼을 떼었을 때 draw=false로 바꿔 그려지는 과정을 멈춤
  });

  // 마우스가 움직였을 때(그림이 그려지고 있을 때) 발생하는 이벤트 처리
  canvas.addEventListener("mousemove", function (e) {
    if (draw) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      let t = vec2(
        (2 * e.clientX) / canvas.width - 1,
        (2 * (canvas.height - e.clientY)) / canvas.height - 1
      );
      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      if (cIndex == 8) {
        // 색상 Rainbow일때 color 배열에서 순서대로 다른 색 보여줌.
        t = vec4(color[index % 8]);
      } else {
        t = vec4(color[cIndex]);
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
      index++;
    }
  });

  // 마우스가 클릭되었을 때 발생하는 이벤트 처리
  canvas.onclick = function (e) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    let t = vec2(
      (2 * e.clientX) / canvas.width - 1,
      (2 * (canvas.height - e.clientY)) / canvas.height - 1
    );
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    if (cIndex == 8) {
      // 색상이 Rainbow일때. colors 배열에서 순서대로 다른 색 보여줌
      t = vec4(color[index % 8]);
    } else {
      t = vec4(color[cIndex]);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
    index++;
  };

  // webgl 실행하기 위해 필요한 과정
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

  const vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  render();
};

// line을 그릴 때 connected와 separated를 선택하는 과정에서 하나만 선택되게 하기 위해 clickOne() 함수 생성
function clickOne(e) {
  document
    .querySelectorAll(`input[type=checkbox]`)
    .forEach((el) => (el.checked = false));
  e.checked = true;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (sIndex == 0) {
    // Line이 선택되었을 때
    if (document.getElementById("line1").checked) {
      // 이어진 선 그리기
      gl.drawArrays(gl.LINE_STRIP, 0, index);
    } else if (document.getElementById("line2").checked) {
      // 분리된 선 그리기
      gl.drawArrays(gl.LINES, 0, index);
    }
  } else if (sIndex == 1) {
    // Triangle 선택되어 삼각형 그리기
    gl.drawArrays(gl.TRIANGLES, 0, index);
  } else if (sIndex == 2) {
    // Rectangle-line 선택되어 사각형 점으로 구성된 선 그리기
    gl.drawArrays(gl.POINTS, 0, index);
  }

  window.requestAnimationFrame(render);
}
