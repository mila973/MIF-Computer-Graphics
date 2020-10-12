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