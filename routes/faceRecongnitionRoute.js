const express = require("express");
const router = express.Router();
//require("@tensorflow/tfjs-node");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
const jimp = require("jimp");
const { createCanvas, loadImage } = require("canvas");

// Load face-api.js models
//const MODEL_PATH = "../";
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
let initialized = false;

async function initializeFaceAPI() {
  if (initialized) {
    return;
  }

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(`./weights`);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(`./weights`);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(`./weights`);

  initialized = true;
}

async function convertImageToJPEG(buffer) {
  const image = await jimp.read(buffer);
  const convertedBuffer = await image.getBufferAsync(jimp.MIME_JPEG);
  return convertedBuffer;
}

// Helper function to load image from buffer
async function loadImageFromBuffer(buffer) {
  const image = await loadImage(buffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const detections = await faceapi
    .detectAllFaces(canvas)
    .withFaceLandmarks()
    .withFaceDescriptors();

  const outBuffer = canvas.toBuffer("image/jpeg");

  return { detections, processedImageBuffer: outBuffer };
}

const UserImage = require("../Model/UserImage");

router.post("/save", upload.single("image"), async (req, res) => {
  try {
    await initializeFaceAPI();
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const { detections } = await loadImageFromBuffer(
      fs.readFileSync(req.file.path)
    );

    if (detections.length === 0) {
      res.status(400).json({ error: "No faces detected in the image" });
      return;
    }

    const name = req.body.name || "Unknown";
    const descriptors = detections.map((detection) => [
      Array.from(detection.descriptor),
    ]);
    const userImage = new UserImage({ name, descriptors });
    await userImage.save();

    return res
      .status(200)
      .json({ message: "Image descriptors saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Remove uploaded file after processing
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
});

router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    await initializeFaceAPI();

    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const { detections, processedImageBuffer } = await loadImageFromBuffer(
      fs.readFileSync(req.file.path)
    );

    if (detections.length === 0) {
      res.status(200).json({ message: "No faces detected in the image" });
      return;
    }

    const unknownDescriptors = detections.map(
      (detection) => detection.descriptor
    );
    const faceMatches = {};

    const userImages = await UserImage.find();

    for (const userImage of userImages) {
      const descriptors = userImage.descriptors;
      const labeledDescriptors = descriptors.map(
        (descriptor) =>
          new faceapi.LabeledFaceDescriptors(userImage.name.toString(), [
            Float32Array.from(descriptor[0]),
          ])
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
      const results = unknownDescriptors.map((descriptor) =>
        faceMatcher.findBestMatch(descriptor)
      );

      faceMatches[userImage.name] = results;
    }

    res.status(200).json({ faceMatches, processedImageBuffer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Remove uploaded file after processing
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
});

module.exports = router;
