let model, classLabels;

async function loadModel() {
  model = await tf.loadLayersModel("model.json");
  console.log("✅ Model loaded");

  // Your final 6 classes
  classLabels = [
    "Tomato_Healthy",
    "Tomato_Late_Blight",
    "Potato_Healthy",
    "Potato_Early_Blight",
    "Potato_Late_Blight",
    "Tomato_Bacterial_Spot"
  ];
}

loadModel();

async function predict() {
  const fileInput = document.getElementById("imageUpload");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload an image!");
    return;
  }

  // Show preview
  const img = document.getElementById("preview");
  img.src = URL.createObjectURL(file);
  img.style.display = "block";

  // Convert to tensor
  const image = document.createElement("img");
  image.src = img.src;
  await new Promise((r) => (image.onload = r));

  let tensor = tf.browser.fromPixels(image)
    .resizeNearestNeighbor([224, 224]) // must match Teachable Machine size
    .toFloat()
    .expandDims();

  // Predict
  const predictions = await model.predict(tensor).data();
  const maxIndex = predictions.indexOf(Math.max(...predictions));

  // Map prediction to class
  let disease = classLabels[maxIndex];

  // Add simple solutions
  let solutions = {
    "Tomato_Healthy": "✅ Plant is healthy. Keep monitoring and provide regular care.",
    "Tomato_Late_Blight": "⚠️ Late Blight detected. Remove infected leaves and apply copper-based fungicide.",
    "Potato_Healthy": "✅ Plant is healthy. Maintain proper watering and soil health.",
    "Potato_Early_Blight": "⚠️ Early Blight detected. Use fungicide (e.g., Mancozeb) and remove diseased leaves.",
    "Potato_Late_Blight": "⚠️ Late Blight detected. Ensure good drainage, avoid overhead watering, and use fungicide.",
    "Tomato_Bacterial_Spot": "⚠️ Bacterial Spot detected. Remove infected leaves and avoid water splashing. Copper spray may help."
  };

  document.getElementById("result").innerHTML =
    `<b>Prediction:</b> ${disease}<br><b>Solution:</b> ${solutions[disease]}`;
}
