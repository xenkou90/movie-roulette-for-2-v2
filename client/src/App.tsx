import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./routes/Home";
import CreateRoom from "./routes/CreateRoom";
import JoinRoom from "./routes/JoinRoom";
import WaitingRoom from "./routes/WaitingRoom";
import GameScreen from "./routes/GameScreen";
import MatchScreen from "./routes/MatchScreen";
import NotFound from "./routes/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/room/:code/wait" element={<WaitingRoom />} />
        <Route path="/room/:code/game" element={<GameScreen />} />
        <Route path="/room/:code/match" element={<MatchScreen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;