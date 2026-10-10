let model;

// Your 6 classes
const classLabels = [
  "Tomato_Healthy",
  "Tomato_Late_Blight",
  "Potato_Healthy",
  "Potato_Early_Blight",
  "Potato_Late_Blight",
  "Tomato_Bacterial_Spot"
];

// Solutions for each class
const solutions = {
  "Tomato_Healthy": "✅ Plant is healthy. Keep monitoring and provide regular care.",
  "Tomato_Late_Blight": "⚠️ Late Blight detected. Remove infected leaves and apply copper-based fungicide.",
  "Potato_Healthy": "✅ Plant is healthy. Maintain proper watering and soil health.",
  "Potato_Early_Blight": "⚠️ Early Blight detected. Use fungicide (e.g., Mancozeb) and remove diseased leaves.",
  "Potato_Late_Blight": "⚠️ Late Blight detected. Ensure good drainage, avoid overhead watering, and use fungicide.",
  "Tomato_Bacterial_Spot": "⚠️ Bacterial Spot detected. Remove infected leaves, avoid water splashing, and apply copper spray."
};

// Load the model
async function loadModel() {
  try {
    model = await tf.loadLayersModel("model.json");
    document.getElementById("predictionResult").innerText = "✅ Model loaded! Ready to predict.";
    console.log("Model loaded successfully");
  } catch (err) {
    document.getElementById("predictionResult").innerText = "❌ Error loading model";
    console.error(err);
  }
}
loadModel();

// Show preview on file select
document.getElementById("imageUpload").addEventListener("change", (e) => {
  const preview = document.getElementById("previewImage");
  preview.src = URL.createObjectURL(e.target.files[0]);
  preview.classList.add("show");
  document.getElementById("predictionResult").innerText = "Ready to predict...";
  document.getElementById("solutionsResult").innerText = "Upload and detect a disease to see solutions here.";
});

// Predict button
document.getElementById("predictBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("imageUpload");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload an image!");
    return;
  }

  const spinner = document.getElementById("spinner");
  spinner.style.display = "block";

  // Create an image element for processing
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  await new Promise((resolve) => (img.onload = resolve));

  // Preprocess image
  let tensor = tf.browser.fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(tf.scalar(255))  // normalize
    .expandDims();

  // Run prediction
  const prediction = await model.predict(tensor).data();
  console.log("Prediction probabilities:", prediction);

  const maxProb = Math.max(...prediction);
  const maxIndex = prediction.indexOf(maxProb);

  // Confidence threshold
  const THRESHOLD = 0.9; // 90%
  if (maxProb < THRESHOLD) {
    document.getElementById("predictionResult").innerHTML = `<b>Prediction:</b> Could not confidently detect a leaf`;
    document.getElementById("solutionsResult").innerHTML = `⚠️ Please upload a tomato or potato leaf image.`;
  } else {
    const predictedClass = classLabels[maxIndex];
    document.getElementById("predictionResult").innerHTML = `<b>Prediction:</b> ${predictedClass}`;
    document.getElementById("solutionsResult").innerHTML = `<b>Solution:</b> ${solutions[predictedClass]}`;
  }

  spinner.style.display = "none";
});
