import { renderBoxes } from "./utils/renderBox.js";
import { non_max_suppression } from "./utils/nonMaxSuppression.js";

$("#image-selector").change(function () {
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selectedImage").attr("src", dataURL);
	}
	
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

$("#webcam-capture-button").click(async function () {
	const webcamElement = document.getElementById("webcam")
	const webcam = await tf.data.webcam(webcamElement) 

	const v = document.querySelector('video')
	let c = document.createElement('canvas')
	c.height = v.videoHeight || parseInt(v.style.height)
	c.width = v.videoWidth || parseInt(v.style.width)
	const ctx = c.getContext('2d')
	ctx.drawImage(v, 0, 0)

	$("#selectedImage").attr("src", c.toDataURL());
});

function showProgress(percentage) {
	var pct = Math.floor(percentage*100.0);
	$('.progress-bar').html(`Loading Model (${pct}%)`);
	console.log(`${pct}% loaded`);
}


let model;
$( document ).ready(async function () {
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
