import React, { useEffect, useState } from "react";
export default function Defects() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3015/defects")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Use .text() to read the response body
      })
      .then((data) => {
        console.log(data); // Log the fetched data
        setData(data); // Update the state with the fetched data
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Handle fetch errors
      });
  }, []);
  return (
    <div>
      <h1>Defects</h1>
      {data.map((defect, idx) => {
        return <p key={defect.id}>{defect.object}</p>;
      })}
    </div>
  );
}
