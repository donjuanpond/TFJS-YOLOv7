import { renderBoxes } from "./utils/renderBox.js";
import { non_max_suppression } from "./utils/nonMaxSuppression.js";

$("#image-selector").change(function () {
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		const back_img = new Image();
		back_img.src = dataURL
		setTimeout(function () {
			console.log(back_img.height, back_img.width)
			let c = document.createElement('canvas')
			c.height = 640, c.width = 640
			const ctx = c.getContext('2d')

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
			
			$("#selectedImage").attr("src", c.toDataURL());
		},100)
		
		
	}
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});


$("#webcam-capture-button").click(async function () {
	const webcamElement = document.getElementById("webcam")
	const webcam = await tf.data.webcam(webcamElement) 
	
	let c = document.createElement('canvas')
	const v = document.querySelector('video')
	c.height = v.videoHeight || parseInt(v.style.height)
	c.width = v.videoWidth || parseInt(v.style.width)
	const ctx = c.getContext('2d')
	ctx.drawImage(v, 0, 0)

	const back_img = new Image();
	back_img.onload = function() {
		console.log('loaded - ', this.height, this.width)
	}
	back_img.src = c.toDataURL()
	console.log(back_img.src)
	
	setTimeout(function () {
		console.log(back_img.height, back_img.width)
		let c = document.createElement('canvas')
		c.height = 640, c.width = 640
		const ctx = c.getContext('2d')

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
		
		$("#selectedImage").attr("src", c.toDataURL());
	}, 100)

});

function showProgress(percentage) {
	var pct = Math.floor(percentage*100.0);
	$('.progress-bar').html(`Loading Model (${pct}%)`);
	console.log(`${pct}% loaded`);
}


let model;
$( document ).ready(async function () {
	tf.setBackend('webgl')
	console.log("backend: ", tf.getBackend())
	$('.progress-bar').html("Loading Model");
	$('.progress-bar').show();
    console.log( "Loading model..." );
	model = await tf.loadGraphModel('model/model.json');
	console.log( "Model loaded." );
	$('.progress-bar').hide();
});

function _logistic(x) {
	if (x > 0) {
	    return (1 / (1 + Math.exp(-x)));
	} else {
	    const e = Math.exp(x);
	    return e / (1 + e);
	}
}

async function loadImage(onProgress) {
	console.log( "Pre-processing image..." );
	
	const pixels = $('#selectedImage').get(0);
		
	// Pre-process the image
	const img = tf.browser.fromPixels(pixels)
		.resizeNearestNeighbor([640,640])
		.toFloat()
		.div(tf.scalar(127.5))
		.expandDims();
	const inp = tf.transpose(img, [0,3,1,2])
	return inp;
}


function shortenedCol(arrayofarray, indexlist) {
	return arrayofarray.map(function (array) {
		return indexlist.map(function (idx) {
			return array[idx];
		});
	});
}

$("#predict-button").click(async function () {
	$('.progress-bar').html("Starting prediction");
	$('.progress-bar').show();

	const image = await loadImage();
	const res = model.execute(image).arraySync()[0]
	
	var detections = non_max_suppression(res)
	const boxes = shortenedCol(detections, [0,1,2,3])
	const scores = shortenedCol(detections, [4])
	const class_detect = shortenedCol(detections, [5])
	const threshold = 0.45
	const back_img = $('#selectedImage').get(0)

	console.log(detections)
	console.log(boxes)
	console.log(scores)
	console.log(class_detect)
	console.log('rendering boxes...')

	renderBoxes(back_img, threshold, boxes, scores, class_detect);
    tf.dispose(res);
	console.log('boxes rendered')
	$('.progress-bar').hide();
});
