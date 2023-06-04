const express = require("express");
const router = express.Router();

const { spawn } = require("child_process");

const pythonScriptPath = "/Users/zine/Downloads/projet_zino/AI/diab.py";

router.post("/", async (req, res) => {
  const input_data = req.body;
  const childPython = spawn("conda", [
    "run",
    "-n",
    "base",
    "python",
    pythonScriptPath,
    JSON.stringify(input_data),
  ]);

  let output = "";

  childPython.stdout.on("data", (data) => {
    output += data;
  });

  childPython.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  return new Promise((resolve, reject) => {
    childPython.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}`));
      } else {
        const result = parseInt(output.trim());
        res.status(200).json({ result });
        resolve();
      }
    });
  });
});

module.exports = router;
