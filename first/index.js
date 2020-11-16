const showValue = newValue => {
  document.getElementById("range").innerHTML = newValue;
  draw(newValue);
}

const draw = step => {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    canvas.width = canvas.width;


    drawBorder(ctx);
    // step = 5
    // drawT();	
    var s = step - 1;

    // Recursive draw 
    const drawF = step => {
      if (step > 0) {
        step = step - 1;
        ctx.save();
        ctx.save();
        ctx.save();

        if (step == s) {
          ctx.fillStyle = "red";
        }
        ctx.transform(0.5, 0, 0, 0.5, 0, 250);
        drawF(step, 0);
        ctx.restore();

        if (step == s) {
          ctx.fillStyle = "green";
        };
        ctx.transform(0.5, 0, 0, 0.5, 500, 250);
        ctx.rotate(Math.PI / (-1));
        drawF(step, 1);
        ctx.restore();

        if (step == s) {
          ctx.fillStyle = "blue";
        }
        ctx.transform(-0.5, 0, 0, 0.5, 250, 250);
        ctx.rotate(Math.PI / (2));
        drawF(step, 2);
        ctx.restore();

        if (step == s) {
          ctx.fillStyle = "black";
        }
        ctx.transform(-0.25, 0, 0, 0.25, 125, 125);
        ctx.rotate(Math.PI / (1));
        drawF(step, 3);
      }
      else drawT(ctx);
    }

    drawF(step);
  }
}

const animateF1 = () => {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';

  var xCoord = 0;
  var yCoord = 0;

  const transform = i => {
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();

    var vector = 1 - 0.5 * i;

    ctx.transform(vector, 0, 0, vector, xCoord, yCoord);
    drawT(ctx);
    ctx.restore();

    xCoord = xCoord + 25;
  };

  executeTransformation(transform);
}

const animateF2 = () => {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'green';

  var xCoord = 0;
  var yCoord = 0;

  const transform = i => {
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();

    var vector1 = 1 - 1.5 * i;
    var vector2 = 1 - 0.5 * i;

    ctx.transform(vector1, 0, 0, vector2, xCoord, yCoord);
    drawT(ctx);
    ctx.restore();

    xCoord = xCoord + 50;
    yCoord = yCoord + 25;
  };

  executeTransformation(transform);
}

const animateF3 = () => {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'blue';

  var xCoord = 0;
  var yCoord = 0;

  const transform = i => {
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();

    var vector = 1 - 0.5 * i;
    var alpha = Math.PI * i;
    
    ctx.transform(vector * Math.cos(alpha), vector * Math.sin(alpha), vector * (-Math.sin(alpha)), vector * Math.cos(alpha), xCoord, yCoord);
    drawT(ctx);
    ctx.restore();

    xCoord = xCoord + 25;
    yCoord = yCoord + 50;
  };

  executeTransformation(transform);
}

const animateF4 = () => {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';

  var coordinateStart = 0;

  const transform = i => {
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();

    var vector1 = 0.25 * i;
    var vector2 = 1 - i;

    ctx.transform(vector2, vector1, vector1, vector2, coordinateStart, coordinateStart);
    drawT(ctx);
    ctx.restore();

    coordinateStart = coordinateStart + 12.5;
  };

  executeTransformation(transform);
}

const executeTransformation = callback => {
  [...Array(10)].forEach((_, i) => setTimeout(() => { callback((i + 1) / 10) }, i * 100));
} 

const drawT = ctx => {
  ctx.beginPath();
  ctx.moveTo(100, 0);
  ctx.lineTo(500, 0);
  ctx.lineTo(500, 125);
  ctx.lineTo(400, 125);
  ctx.lineTo(400, 250);
  ctx.lineTo(500, 250);
  ctx.lineTo(500, 500);
  ctx.lineTo(0, 500);
  ctx.lineTo(0, 250);
  ctx.lineTo(200, 250);
  ctx.lineTo(200, 125);
  ctx.lineTo(100, 125);
  ctx.lineTo(100 , 0);
  ctx.fill();
}

const drawBorder = ctx => {
  // Draw border
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(500, 0);
  ctx.lineTo(500, 500);
  ctx.lineTo(0, 500);
  ctx.closePath();
  ctx.stroke();
}