import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SetupScreen from './screens/SetupScreen';
import RaffleScreen from './screens/RaffleScreen';
import GameScreen from './screens/GameScreen';
import { supabase } from './lib/supabase';
import './index.css';

function HomeScreen({ savedGame, onContinue, onNewGame, setPlayers }) {
    if (savedGame) {
        return (
            <div className="glass-card setup-card flex flex-col items-center">
                <h1 className="title">Jogo em Andamento</h1>
                <p className="subtitle" style={{marginBottom: '2rem', textAlign: 'center'}}>Encontramos um jogo salvo da família. Deseja continuar?</p>
                <div style={{display:'flex', gap:'1rem', justifyContent: 'center'}}>
                    <button className="magical-btn primary-btn" onClick={onContinue}>Continuar Antigo</button>
                    <button className="magical-btn cancel-btn" onClick={onNewGame}>Novo Jogo (Apagar)</button>
                </div>
                <div style={{marginTop: '2rem', display: 'flex', gap: '5px', justifyContent: 'center'}}>
                    {savedGame.game_state.players.map(p => (
                        <img key={p.name} src={p.image} style={{width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${p.color}`, objectFit: 'cover'}} />
                    ))}
                </div>
            </div>
        );
    }
    return <SetupScreen setPlayers={setPlayers} />;
}

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

  const handleContinue = () => {
      setPlayers(savedGame.game_state.players);
      setStartingPlayerIndex(savedGame.game_state.currentPlayerIndex);
      navigate('/game');
  };

  const handleNewGame = () => {
      setSavedGame(null);
      // Fica na home (que agora renderizará o SetupScreen pois savedGame é null)
  };

  if (loading) return <div className="app-container"><h1 className="title" style={{color:'white'}}>Carregando Banco Imobiliário...</h1></div>;

  return (
    <div className="app-container">
        <Routes>
          <Route path="/" element={
            <HomeScreen 
                savedGame={savedGame} 
                onContinue={handleContinue} 
                onNewGame={handleNewGame} 
                setPlayers={setPlayers} 
            />} 
          />
          <Route 
            path="/raffle" 
            element={<RaffleScreen players={players} setStartingPlayerIndex={setStartingPlayerIndex} />} 
          />
          <Route 
            path="/game" 
            element={<GameScreen players={players} startingPlayerIndex={startingPlayerIndex} initialGameState={savedGame} />} 
          />
        </Routes>
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
