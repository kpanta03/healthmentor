import React, { useState,useContext } from "react";
import axios from "axios";
import HeartDiseaseFormResult from "./HeartDiseaseFormResult";
import { AuthContext } from "../context/AuthContext";

const HeartDiseaseForm = () => {
   const { auth } = useContext(AuthContext);
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
    //  validating age
     if (!formData.Age) {
      newErrors.Age = "Age is required";
    } else if (Number(formData.Age) < 10 || Number(formData.Age) > 100) {
      newErrors.Age = "Age must be between 10 and 100 years";
    }
    // validating gender
    if (!formData.Gender) {
      newErrors.Gender = "Gender is required";
    }

    // validating cholesterol
    if (!formData.Cholesterol) {
      newErrors.Cholesterol = "Cholesterol level is required";
    } else if (Number(formData.Cholesterol) < 100 || Number(formData.Cholesterol) > 400) {
      newErrors.Cholesterol = "Cholesterol must be between 100-400 mg/dL";
    }

    // validating blood pressure
     if (!formData.Blood_Pressure) {
      newErrors.Blood_Pressure = "Blood pressure is required";
    } else if (Number(formData.Blood_Pressure) < 70 || Number(formData.Blood_Pressure) > 250) {
      newErrors.Blood_Pressure = "Blood pressure must be between 70-250 mmHg";
    }
// validating heart rate
     if (!formData.Heart_Rate) {
      newErrors.Heart_Rate = "Heart rate is required";
    } else if (Number(formData.Heart_Rate) < 40 || Number(formData.Heart_Rate) > 180) {
      newErrors.Heart_Rate = "Heart rate must be between 40-180 bpm";
    }
// validating smoking
     if (!formData.Smoking) {
      newErrors.Smoking = "Smoking status is required";
    }
// validating exercise hours
    if (formData.Exercise_Hours === "") {
      newErrors.Exercise_Hours = "Exercise hours is required";
    } else if (Number(formData.Exercise_Hours) < 0 || Number(formData.Exercise_Hours) > 9) {
      newErrors.Exercise_Hours = "Exercise hours must be between 0-9 hours per week";
    }
// validating family history
    if (!formData.Family_History) {
      newErrors.Family_History = "Family history is required";
    }

    // Diabetes
    if (!formData.Diabetes) {
      newErrors.Diabetes = "Diabetes status is required";
    }

    // Obesity
     if (!formData.Obesity) {
      newErrors.Obesity = "Weight status is required";
    }

    // Stress Level
   if (!formData.Stress_Level) {
      newErrors.Stress_Level = "Stress level is required";
    } else if (Number(formData.Stress_Level) < 1 || Number(formData.Stress_Level) > 10) {
      newErrors.Stress_Level = "Stress level must be between 1-10";
    }

    // Blood Sugar
    if (!formData.Blood_Sugar) {
      newErrors.Blood_Sugar = "Blood sugar level is required";
    } else if (Number(formData.Blood_Sugar) < 50 || Number(formData.Blood_Sugar) > 400) {
      newErrors.Blood_Sugar = "Blood sugar must be between 50-400 mg/dL";
    }

    // Exercise Induced Angina
    if (!formData.Exercise_Induced_Angina) {
      newErrors.Exercise_Induced_Angina = "Exercise-related chest discomfort status is required";
    }

    // Chest Pain Type
    if (!formData.Chest_Pain_Type) {
      newErrors.Chest_Pain_Type = "Chest pain type is required";
    }

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
      const response = await axios.post(
      "http://localhost:8000/api/disease/predict-heart-disease/",
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    );
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
              min="10"
              max="80"
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
            {/* {errors.Gender && <p className="text-red-400 text-sm">{errors.Gender}</p>} */}
          </div>

          {/* Cholesterol */}
          <div className="col-md-4">
            <label htmlFor="Cholesterol" className="form-label">Total Cholesterol level</label>
            <input
              type="number"
              className="form-control"
              id="Cholesterol"
              name="Cholesterol"
              value={formData.Cholesterol}
              onChange={handleChange}
              placeholder="Cholesterol level"
              min="100"
              max="400"
              required
            />
            <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>mg/dL (check your last blood test report)</p>
          </div>

          {/* Additional fields follow the same pattern, renamed using backend expected keys */}

          <div className="col-md-4">
            <label htmlFor="Blood_Pressure" className="form-label">Enter systolic blood pressure</label>
            <input
              type="number"
              className="form-control"
              id="Blood_Pressure"
              name="Blood_Pressure"
              value={formData.Blood_Pressure}
              onChange={handleChange}
              placeholder="Blood Pressure (mmHg)"
              min="70"
              max="250"
              required
            />
            <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>Top number in your BP reading (mmHg)</p>
          </div>

          <div className="col-md-4">
            <label htmlFor="Heart_Rate" className="form-label">What is your Resting Heart Rate?</label>
            <input
              type="number"
              className="form-control"
              id="Heart_Rate"
              name="Heart_Rate"
              value={formData.Heart_Rate}
              onChange={handleChange}
              placeholder="Heart Rate (bpm)"
               min="40"
              max="180"
              required
            />
            <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>Beats per minute when at rest</p>
          </div>

          <div className="col-md-4">
            <label htmlFor="Smoking" className="form-label">Do you smoke?</label>
            <select
              className="form-select"
              id="Smoking"
              name="Smoking"
              value={formData.Smoking}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="current">Yes, I currently smoke</option>
              <option value="former">I used to smoke but quit</option>
              <option value="never">No, I've never smoked</option>
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
              placeholder="Hours per day(0-9)"
              min="0"
              max="9"
              required
            />
             <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>Include walking, gym, sports, etc.</p>
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
              <option value="Yes">Yes, family members had heart disease</option>
              <option value="No">No family history of heart disease</option>
            </select>
             <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>Parents, siblings, or grandparents</p>
          </div>

          <div className="col-md-4">
            <label htmlFor="Diabetes" className="form-label">Do you have Diabetes?</label>
            <select
              className="form-select"
              id="Diabetes"
              name="Diabetes"
              value={formData.Diabetes}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes, I have diabetes</option>
              <option value="No">No, I don't have diabetes</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="Obesity" className="form-label">Are You Overweight?</label>
            <select
              className="form-select"
              id="Obesity"
              name="Obesity"
              value={formData.Obesity}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes, I am overweight</option>
              <option value="No">No, I have normal weight</option>
            </select>

          </div>

          <div className="col-md-4">
            <label htmlFor="Stress_Level" className="form-label">Current Stress Level</label>
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
            <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>1 = very low stress, 10 = extremely high stress</p>
          </div>

          <div className="col-md-4">
            <label htmlFor="Blood_Sugar" className="form-label">Blood Sugar Level</label>
            <input
              type="number"
              className="form-control"
              id="Blood_Sugar"
              name="Blood_Sugar"
              value={formData.Blood_Sugar}
              onChange={handleChange}
              placeholder="Blood Sugar Level"
              min="50"
              max="400"
              required
            />
            <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>mg/dL from your latest blood test</p>
          </div>

          <div className="col-md-5">
            <label htmlFor="Exercise_Induced_Angina" className="form-label">Chest Discomfort During Exercise?</label>
            <select
              className="form-select"
              id="Exercise_Induced_Angina"
              name="Exercise_Induced_Angina"
              value={formData.Exercise_Induced_Angina}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes, I feel chest discomfort during exercise</option>
              <option value="No">No, I don't feel chest discomfort during exercise</option>
            </select>
            <p className="text-xs text-gray-400" style={{fontSize:"0.8rem"}}>Pain or discomfort when walking quickly or exercising</p>
          </div>

          <div className="col-md-6">
            <label htmlFor="Chest_Pain_Type" className="form-label">What Type of Chest Pain Do You Experience?</label>
            <select
              className="form-select"
              id="Chest_Pain_Type"
              name="Chest_Pain_Type"
              value={formData.Chest_Pain_Type}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Typical Angina">Chest pain/tightness during activity that goes away with rest</option>
              <option value="Atypical Angina">Unpredictable chest pain that doesn't follow a pattern</option>
              <option value="Non-Anginal Pain">Pain not related to heart (muscle pain, indigestion)</option>
              <option value="Asymptomatic">No chest pain at all</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-4 d-block mx-auto px-4 py-2">
          Get Risk Assessment
        </button>
      </form>
    </div>
     
     {result && <HeartDiseaseFormResult result={result} />}
    </>
  );
};

export default HeartDiseaseForm;


