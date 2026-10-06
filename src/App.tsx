import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Library from './pages/Library';
import StudyRoom from './pages/StudyRoom';
import ReadMode from './pages/ReadMode';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/study/:roomId" element={<StudyRoom />} />
        <Route path="/read/:categoryId" element={<ReadMode />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
