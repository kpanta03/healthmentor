import React, { useState } from "react";
import axios from "axios";
import HeartDiseaseFormResult from "./HeartDiseaseFormResult";

const HeartDiseaseForm = () => {
  const [formData, setFormData] = useState({
    Age: "",
    Gender: "",
    Cholesterol: "",
    Blood_Pressure: "",
    Heart_Rate: "",
    Smoking: "",
    Exercise_Hours: "",
    Family_History: "",
    Diabetes: "",
    Obesity: "",
    Stress_Level: "",
    Blood_Sugar: "",
    Exercise_Induced_Angina: "",
    Chest_Pain_Type: ""
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for the field when user changes it
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.Age) newErrors.Age = "Age is required";
    else if (Number(formData.Age) < 1 || Number(formData.Age) > 120)
      newErrors.Age = "Age must be between 1 and 120";

    if (!formData.Gender) newErrors.Gender = "Gender is required";

    if (!formData.Cholesterol) newErrors.Cholesterol = "Cholesterol is required";
    else if (Number(formData.Cholesterol) <= 0)
      newErrors.Cholesterol = "Cholesterol must be a positive number";

    if (!formData.Blood_Pressure) newErrors.Blood_Pressure = "Blood Pressure is required";
    else if (Number(formData.Blood_Pressure) <= 0)
      newErrors.Blood_Pressure = "Blood Pressure must be positive";

    if (!formData.Heart_Rate) newErrors.Heart_Rate = "Heart Rate is required";
    else if (Number(formData.Heart_Rate) <= 0)
      newErrors.Heart_Rate = "Heart Rate must be positive";

    if (!formData.Smoking) newErrors.Smoking = "Smoking status is required";

    if (formData.Exercise_Hours === "") newErrors.Exercise_Hours = "Exercise Hours is required";
    else if (Number(formData.Exercise_Hours) < 0)
      newErrors.Exercise_Hours = "Exercise Hours cannot be negative";

    if (!formData.Family_History) newErrors.Family_History = "Family History is required";

    // Diabetes
    if (!formData.Diabetes) newErrors.Diabetes = "Diabetes status is required";

    // Obesity
    if (!formData.Obesity) newErrors.Obesity = "Obesity status is required";

    // Stress Level
    if (!formData.Stress_Level) newErrors.Stress_Level = "Stress Level is required";
    else if (
      Number(formData.Stress_Level) < 1 ||
      Number(formData.Stress_Level) > 10
    )
      newErrors.Stress_Level = "Stress Level must be between 1 and 10";

    // Blood Sugar
    if (!formData.Blood_Sugar) newErrors.Blood_Sugar = "Blood Sugar is required";
    else if (Number(formData.Blood_Sugar) <= 0)
      newErrors.Blood_Sugar = "Blood Sugar must be positive";

    // Exercise Induced Angina
    if (!formData.Exercise_Induced_Angina)
      newErrors.Exercise_Induced_Angina = "Exercise Induced Angina status is required";

    // Chest Pain Type
    if (!formData.Chest_Pain_Type)
      newErrors.Chest_Pain_Type = "Chest Pain Type is required";

    setErrors(newErrors);
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     if (!validate()) {
      // If validation fails, do not submit
      return;
    }


    const formattedData = {
      Age: Number(formData.Age),
      Gender: formData.Gender,
      Cholesterol: Number(formData.Cholesterol),
      "Blood Pressure": Number(formData.Blood_Pressure),
      "Heart Rate": Number(formData.Heart_Rate),
      Smoking: capitalize(formData.Smoking),
      "Exercise Hours": Number(formData.Exercise_Hours),
      "Family History": capitalize(formData.Family_History),
      Diabetes:capitalize(formData.Diabetes),
      Obesity: capitalize(formData.Obesity),
      "Stress Level": Number(formData.Stress_Level),
      "Blood Sugar": Number(formData.Blood_Sugar),
      "Exercise Induced Angina": capitalize(formData.Exercise_Induced_Angina),
      "Chest Pain Type": formatChestPain(formData.Chest_Pain_Type)
    };

    try {
      const response = await axios.post("http://localhost:8000/api/disease/predict-heart-disease/", formattedData);
      setResult(response.data);
      console.log("Prediction Result:", response.data);
    } catch (error) {
      console.error("Prediction Error:", error.response?.data || error.message);
      alert("Error: " + JSON.stringify(error.response?.data || error.message));
    }
  };

  const capitalize = (value) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const formatChestPain = (value) => {
    if (!value) return "";
    return value
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <>
    <div id="heartDiseaseForm" className="mt-3 mb-5">
      <h5 className="fw-bold mb-5 text-center text-info text-white">
        Heart Disease Prediction Form
      </h5>
      <form id="heartDiseaseFormFields" onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Age */}
          <div className="col-md-4">
            <label htmlFor="Age" className="form-label">Age</label>
            <input
              type="number"
              className="form-control"
              id="Age"
              name="Age"
              value={formData.Age}
              onChange={handleChange}
              placeholder="Enter your age"
              min="1"
              max="100"
              required
            />
          </div>
          {/* Gender */}
          <div className="col-md-4">
            <label htmlFor="Gender" className="form-label">Gender</label>
            <select
              className="form-select"
              id="Gender"
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          {/* Cholesterol */}
          <div className="col-md-4">
            <label htmlFor="Cholesterol" className="form-label">Cholesterol</label>
            <input
              type="number"
              className="form-control"
              id="Cholesterol"
              name="Cholesterol"
              value={formData.Cholesterol}
              onChange={handleChange}
              placeholder="Cholesterol level"
              min="1"
              required
            />
          </div>

          {/* Additional fields follow the same pattern, renamed using backend expected keys */}

          <div className="col-md-4">
            <label htmlFor="Blood_Pressure" className="form-label">Blood Pressure</label>
            <input
              type="number"
              className="form-control"
              id="Blood_Pressure"
              name="Blood_Pressure"
              value={formData.Blood_Pressure}
              onChange={handleChange}
              placeholder="Blood Pressure (mmHg)"
              min="1"
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="Heart_Rate" className="form-label">Heart Rate</label>
            <input
              type="number"
              className="form-control"
              id="Heart_Rate"
              name="Heart_Rate"
              value={formData.Heart_Rate}
              onChange={handleChange}
              placeholder="Heart Rate (bpm)"
              min="1"
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="Smoking" className="form-label">Smoking</label>
            <select
              className="form-select"
              id="Smoking"
              name="Smoking"
              value={formData.Smoking}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="current">Current</option>
              <option value="former">Former</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Repeat remaining fields appropriately with exact keys used in backend */}

          <div className="col-md-4">
            <label htmlFor="Exercise_Hours" className="form-label">Exercise Hours</label>
            <input
              type="number"
              className="form-control"
              id="Exercise_Hours"
              name="Exercise_Hours"
              value={formData.Exercise_Hours}
              onChange={handleChange}
              placeholder="Hours per week"
              min="1"
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="Family_History" className="form-label">Family History</label>
            <select
              className="form-select"
              id="Family_History"
              name="Family_History"
              value={formData.Family_History}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="Diabetes" className="form-label">Diabetes</label>
            <select
              className="form-select"
              id="Diabetes"
              name="Diabetes"
              value={formData.Diabetes}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="Obesity" className="form-label">Obesity</label>
            <select
              className="form-select"
              id="Obesity"
              name="Obesity"
              value={formData.Obesity}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="Stress_Level" className="form-label">Stress Level</label>
            <input
              type="number"
              className="form-control"
              id="Stress_Level"
              name="Stress_Level"
              value={formData.Stress_Level}
              onChange={handleChange}
              placeholder="Stress Level (1-10)"
              min="1"
              max="10"
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="Blood_Sugar" className="form-label">Blood Sugar</label>
            <input
              type="number"
              className="form-control"
              id="Blood_Sugar"
              name="Blood_Sugar"
              value={formData.Blood_Sugar}
              onChange={handleChange}
              placeholder="Blood Sugar Level"
              min="1"
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="Exercise_Induced_Angina" className="form-label">Exercise Induced Angina</label>
            <select
              className="form-select"
              id="Exercise_Induced_Angina"
              name="Exercise_Induced_Angina"
              value={formData.Exercise_Induced_Angina}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="Chest_Pain_Type" className="form-label">Chest Pain Type</label>
            <select
              className="form-select"
              id="Chest_Pain_Type"
              name="Chest_Pain_Type"
              value={formData.Chest_Pain_Type}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Typical Angina">Typical Angina</option>
              <option value="Atypical Angina">Atypical Angina</option>
              <option value="Non-Anginal Pain">Non-Anginal Pain</option>
              <option value="Asymptomatic">Asymptomatic</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-4 d-block mx-auto px-4 py-2">
          Submit
        </button>
      </form>
    </div>
     
     {result && <HeartDiseaseFormResult result={result} />}
    </>
  );
};

export default HeartDiseaseForm;
