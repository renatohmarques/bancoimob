import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SetupScreen from './screens/SetupScreen';
import RaffleScreen from './screens/RaffleScreen';
import GameScreen from './screens/GameScreen';
import { supabase } from './lib/supabase';
import './index.css';

function MainApp() {
  const [players, setPlayers] = useState([]);
  const [startingPlayerIndex, setStartingPlayerIndex] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [savedGame, setSavedGame] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGame() {
       const { data } = await supabase.from('games').select('*').eq('id', 'main').single();
       if (data && data.game_state && data.game_state.players) {
           setSavedGame(data);
       }
       setLoading(false);
    }
    loadGame();
  }, []);

  if (loading) return <div className="app-container"><h1 className="title" style={{color:'white'}}>Carregando Banco Imobiliário...</h1></div>;

  const handleContinue = () => {
      setPlayers(savedGame.game_state.players);
      setStartingPlayerIndex(savedGame.game_state.currentPlayerIndex);
      navigate('/game');
  };

  const clearAndStart = () => {
      setSavedGame(null);
  };

  return (
    <div className="app-container">
      {savedGame ? (
         <div className="glass-card setup-card flex flex-col items-center">
           <h1 className="title">Jogo em Andamento</h1>
           <p className="subtitle" style={{marginBottom: '2rem'}}>Encontramos um jogo salvo. Deseja continuar?</p>
           <div style={{display:'flex', gap:'1rem'}}>
             <button className="magical-btn primary-btn" onClick={handleContinue}>Continuar da onde parou</button>
             <button className="magical-btn cancel-btn" onClick={clearAndStart}>Novo Jogo (Apagar Antigo)</button>
           </div>
         </div>
      ) : (
        <Routes>
          <Route path="/" element={<SetupScreen setPlayers={setPlayers} />} />
          <Route 
            path="/raffle" 
            element={<RaffleScreen players={players} setStartingPlayerIndex={setStartingPlayerIndex} />} 
          />
          <Route 
            path="/game" 
            element={<GameScreen players={players} startingPlayerIndex={startingPlayerIndex} initialGameState={savedGame} />} 
          />
        </Routes>
      )}
    </div>
  );
}

export default function App() {
   return (
      <Router>
         <MainApp />
      </Router>
   );
}
