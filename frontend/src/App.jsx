import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Bin from "./pages/Bin";

import "./css/app.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/:binId" element={<Bin />}></Route>
    </Routes>
  );
}

export default App;
