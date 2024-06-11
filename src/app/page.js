"use client";
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import Link from 'next/link';
import styles from './page.module.css';

// Function to normalize data
function normalizeData(data, maxValues, minValues) {
  const normalizedData = {};
  for (const key in data) {
    normalizedData[key] = (data[key] - minValues[key]) / (maxValues[key] - minValues[key]);
  }
  return normalizedData;
}

// Function to denormalize data
function denormalizeData(data, maxValues, minValues) {
  const denormalizedData = {};
  for (const key in data) {
    denormalizedData[key] = data[key] * (maxValues[key] - minValues[key]) + minValues[key];
  }
  return denormalizedData;
}

function Page() {
  const [model, setModel] = useState(null);
  const [inputs, setInputs] = useState({
    fixedAcidity: '',
    volatileAcidity: '',
    citricAcid: '',
    residualSugar: '',
    chlorides: '',
    freeSulfurDioxide: '',
    totalSulfurDioxide: '',
    density: '',
    pH: '',
    sulphates: '',
    alcohol: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [maxValues, setMaxValues] = useState(null);
  const [minValues, setMinValues] = useState(null);

  useEffect(() => {
    async function loadModel() {
      const modelUrl = `${window.location.origin}/model/model.json`;
      const model = await tf.loadLayersModel(modelUrl);
      setModel(model);
      console.log('Modelo cargado');

      // Set max and min values for normalization
      const maxValues = {
        fixedAcidity: 15.90000,
        volatileAcidity: 1.58000,
        citricAcid: 1.00000,
        residualSugar: 15.50000,
        chlorides: 0.61100,
        freeSulfurDioxide: 72.00000,
        totalSulfurDioxide: 289.00000,
        density: 1.00369,
        pH: 4.01000,
        sulphates: 2.00000,
        alcohol: 14.90000,
        quality: 8.00000
      };
      const minValues = {
        fixedAcidity: 4.60000,
        volatileAcidity: 0.12000,
        citricAcid: 0.00000,
        residualSugar: 0.90000,
        chlorides: 0.01200,
        freeSulfurDioxide: 1.00000,
        totalSulfurDioxide: 6.00000,
        density: 0.99007,
        pH: 2.74000,
        sulphates: 0.33000,
        alcohol: 8.40000,
        quality: 3.00000
      };
      setMaxValues(maxValues);
      setMinValues(minValues);
    }
    loadModel();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handlePredict = async () => {
    // Verificar si hay inputs vacíos
    for (const key in inputs) {
      if (inputs[key] === '') {
        alert(`Please complete the field: ${key.split(/(?=[A-Z])/).join(' ')}`);
        return;
      }
    }
    if (model) {
      const normalizedInputs = normalizeData(inputs, maxValues, minValues);
      const inputValues = Object.values(normalizedInputs).map(value => parseFloat(value));
      const inputTensor = tf.tensor2d([inputValues]);
      const predictionTensor = model.predict(inputTensor);
      const predictionArray = await predictionTensor.array();
      const predictionNormalized = predictionArray[0][0].toFixed(2);
      const predictionDenormalized = denormalizeData({ quality: parseFloat(predictionNormalized) }, maxValues, minValues);
      setPrediction(predictionDenormalized['quality'].toFixed(2));
    }
  };

  return (
    <div>
    <h1>Wine Quality Prediction</h1>
    <div className={styles.card}>
      <div className={styles['input-container']}>
        {Object.keys(inputs).map((key) => (
          <div key={key}>
            <label>
              {key.split(/(?=[A-Z])/).join(' ')}:
              <input type="number" name={key} value={inputs[key]} onChange={handleInputChange} />
            </label>
          </div>
        ))}
      </div>
      <button onClick={handlePredict}>Predict Quality</button>
      {prediction !== null && (
        <div>
          <h3>Predicted Quality:</h3>
          <h2>{prediction}</h2>
        </div>
      )}
    </div>
    <div className="project-github">
      <p>This project is in </p>
      <Link href="https://github.com/diegoperea20">
        <img width="96" height="96" src="https://img.icons8.com/fluency/96/github.png" alt="github" />
      </Link>
    </div>
  </div>
  );
}

export default Page;
