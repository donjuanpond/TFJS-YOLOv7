
function xywh2xyxy(x){
  //Convert boxes from [x, y, w, h] to [x1, y1, x2, y2] where xy1=top-left, xy2=bottom-right
  var y = [];
  y[0] = x[0] - x[2] / 2  //top left x
  y[1] = x[1] - x[3] / 2  //top left y
  y[2] = x[0] + x[2] / 2  //bottom right x
  y[3] = x[1] + x[3] / 2  //bottom right y
  return y;
}

export const renderBoxes = (back_img, threshold, boxes_data, scores_data, classes_data) => {

  const c = document.createElement('canvas')
  const ctx = c.getContext("2d");
  ctx.canvas.width=640
  ctx.canvas.height=640

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas

  var dx=0, dy=0, dWidth=0, dHeight=0;
  if (back_img.height >= back_img.width) {     // if its a tall image
    dWidth = (640 * back_img.width) / back_img.height
    dx = Math.floor((640-dWidth)/2)
    dy = 0
    dHeight = 640
  } else {									// if its a wide image
    dHeight = (640 * back_img.height) / back_img.width
    dx = 0
    dy = Math.floor((640-dHeight)/2)
    dWidth = 640
  }
  console.log(dx, dy, dWidth, dHeight, back_img.width, back_img.height)
  ctx.drawImage(back_img, dx, dy, dWidth, dHeight)

  // font configs
  const font = "18px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  for (let i = 0; i < scores_data.length; ++i) {
    //console.log('scores_data[i]: ', scores_data[i])
    if (scores_data[i] > threshold) {
      const klass = TARGET_CLASSES[classes_data[i]];
      const score = (scores_data[i] * 100).toFixed(1);

      let [x1, y1, x2, y2] = xywh2xyxy(boxes_data[i]);
      console.log(x1, y1, x2, y2)
      const width = x2 - x1;
      const height = y2 - y1;

      // Draw the bounding box.
      ctx.strokeStyle = "#B033FF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, width, height);

      // Draw the label background.
      ctx.fillStyle = "#B033FF";
      const textWidth = ctx.measureText(klass + " - " + score + "%").width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x1 - 1, y1 - (textHeight + 2), textWidth + 2, textHeight + 2);

      // Draw labels
      ctx.fillStyle = "#ffffff";
      ctx.fillText(klass + " - " + score + "%", x1 - 1, y1 - (textHeight + 2));
    }
  }
  var outputImageURL = c.toDataURL()
  console.log(outputImageURL)
  $("#outputImage").attr("src", outputImageURL);
};
