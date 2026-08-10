import { BrowserRouter, Route, Routes } from "react-router-dom";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Landing />} />
        <Route path="/chat" element={< Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
