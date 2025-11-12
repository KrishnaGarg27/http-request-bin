import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  function newBin() {
    fetch("http://localhost:3000/", { method: "POST" })
      .then((res) => res.json())
      .then((binId) => navigate(`/${binId}`))
      .catch((err) => console.log(err));
  }

  return (
    <div className="homepage">
      <div className="homepage-main-content">
        <h1>HTTP Request Bin</h1>
        <h2>Inspect your HTTP requests in real time</h2>
        <button onClick={newBin}>Create Bin</button>
      </div>
    </div>
  );
}

export default Home;
