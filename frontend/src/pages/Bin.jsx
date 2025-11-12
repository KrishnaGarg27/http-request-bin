import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Bin() {
  const [requests, setRequests] = useState([]);
  const { binId } = useParams();

  useEffect(() => {
    const connection = new EventSource(`http://localhost:3000/${binId}`);
    connection.onmessage = (event) => {
      const data = event.data;
      setRequests((r) => [...r, data]);
    };
  }, []);

  return (
    <ul>
      {requests.map((request, index) => (
        <li key={index}>{request}</li>
      ))}
    </ul>
  );
}
