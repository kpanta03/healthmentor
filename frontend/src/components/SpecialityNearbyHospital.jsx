import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SpecialityNearbyHospital({ speciality }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await axios.get(
              `http://localhost:8000/api/hospitals/speciality_nearby/?lat=${position.coords.latitude}&lon=${position.coords.longitude}&speciality=${speciality}`
            );
            setHospitals(res.data);
          } catch (err) {
            setError("Failed to fetch nearby hospitals.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Location access denied. Please allow location access.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
    }
  }, [speciality]);

  if (loading) {
    return <p className="text-center mt-4">Loading {speciality} hospitals...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-4">{error}</p>;
  }

  return (
    <div className="container-fluid mt-4" style={{ width:"115%",marginLeft:"-8%"}}>
      <h4 className="mb-4 text-start mt-4">
        Nearby Hospitals for Heart Disease
      </h4>
      <div className="row">
        {hospitals.length === 0 ? (
          <p className="text-center">No hospitals found for {speciality} nearby.</p>
        ) : (
          hospitals.map((hospital, index) => (
            <div className="col-md-6 mb-4 text-start" key={index}>
              <div className="hospital-card p-3 border rounded shadow-sm">
                <h5 className="mb-4">{hospital.name}</h5>
                <div className="row">
                   <div className="col-md-6">
                    <p>
                      <strong>Address:</strong>{" "}
                      {hospital.address || "Not available"}
                    </p>
                    <p>
                      <strong>Speciality:</strong>{" "}
                      {hospital.speciality || "Not available"}
                    </p>
                    <p>
                      <strong>Emergency:</strong>{" "}
                      {hospital.emergency || "N/A"}
                    </p>
                    <p>
                      <strong>ICU:</strong> {hospital.icu || "N/A"}
                    </p>
                    <p>
                      <strong>Operating Theatre:</strong>{" "}
                      {hospital.operating_theatre || "N/A"}
                    </p>
                  </div>

                 <div className="col-md-6">
                    <p>
                      <strong>Ventilator:</strong>{" "}
                      {hospital.ventilator || "N/A"}
                    </p>
                    <p>
                      <strong>X-Ray:</strong> {hospital.x_ray || "N/A"}
                    </p>
                    <p>
                      <strong>Opening Hours:</strong>{" "}
                      {hospital.opening_hours || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {hospital.phone ? (
                        <a href={`tel:${hospital.phone}`}>
                          {hospital.phone}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      {hospital.website ? (
                        <a
                          href={hospital.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {hospital.website}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
