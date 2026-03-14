import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const AVAILABLE_PLAYERS = [
  { name: 'Papai', image: '/jogadores/Papai.png' },
  { name: 'Mamãe', image: '/jogadores/Mamãe.png' },
  { name: 'Issa', image: '/jogadores/Issa.png' },
  { name: 'Arthur', image: '/jogadores/Arthur.png' },
  { name: 'Sara', image: '/jogadores/Sara.png' }
];

const PAWN_COLORS = [
  { name: 'Verde', hex: '#2ecc71' },
  { name: 'Vermelho', hex: '#e74c3c' },
  { name: 'Amarelo', hex: '#f1c40f' },
  { name: 'Azul', hex: '#3498db' },
  { name: 'Preto', hex: '#000000' },
  { name: 'Branco', hex: '#ffffff' }
];

export default function SetupScreen({ setPlayers }) {
  const [step, setStep] = useState(1); // 1: Select Players, 2: Select Colors
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const togglePlayer = (player) => {
    if (selected.find(p => p.name === player.name)) {
      setSelected(selected.filter(p => p.name !== player.name));
    } else {
      setSelected([...selected, { ...player, color: null }]);
    }
  };

  const setPlayerColor = (playerName, colorHex) => {
    setSelected(prev => prev.map(p => 
      p.name === playerName ? { ...p, color: colorHex } : p
    ));
  };

  const handleNextStep = () => {
    if (selected.length >= 2) {
      setStep(2);
    } else {
      alert("Por favor, selecione pelo menos 2 jogadores para iniciar.");
    }
  };

  const handleStart = () => {
    const allHaveColors = selected.every(p => p.color);
    if (!allHaveColors) {
      alert("Por favor, escolha uma cor para cada jogador!");
      return;
    }
    
    // Check uniqueness
    const colors = selected.map(p => p.color);
    if (new Set(colors).size !== colors.length) {
      alert("Cada jogador deve ter uma cor única!");
      return;
    }

    // Ordenar os jogadores conforme a lista oficial antes de começar
    const sortedPlayers = [...selected].sort((a, b) => {
      const indexA = AVAILABLE_PLAYERS.findIndex(p => p.name === a.name);
      const indexB = AVAILABLE_PLAYERS.findIndex(p => p.name === b.name);
      return indexA - indexB;
    });

    setPlayers(sortedPlayers);
    navigate('/raffle');
  };

  return (
    <div className="setup-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card setup-card"
        style={{ maxWidth: '800px' }}
      >
        {step === 1 ? (
          <>
            <h1 className="title">Quem vai jogar?</h1>
            <p className="subtitle">Selecione os participantes da partida</p>
            
            <div className="players-grid">
              {AVAILABLE_PLAYERS.map(player => {
                const isSelected = selected.find(p => p.name === player.name);
                return (
                  <motion.div
                    key={player.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`player-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => togglePlayer(player)}
                  >
                    <div className="avatar-wrapper">
                      <img src={player.image} alt={player.name} className="player-avatar" style={{objectFit: 'cover'}} />
                    </div>
                    <h3>{player.name}</h3>
                  </motion.div>
                );
              })}
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="magical-btn primary-btn mt-6"
              onClick={handleNextStep}
              disabled={selected.length < 2}
            >
              Escolher Cores
            </motion.button>
          </>
        ) : (
          <>
            <h1 className="title">Escolha os Peões</h1>
            <p className="subtitle">Escolha uma cor para cada jogador</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '2rem 0' }}>
              {selected.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '15px' }}>
                  <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${p.color || 'transparent'}` }} />
                  <h3 style={{ minWidth: '100px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    {PAWN_COLORS.map(c => {
                      const isTaken = selected.some(other => other.name !== p.name && other.color === c.hex);
                      const isSelected = p.color === c.hex;
                      return (
                        <button
                          key={c.hex}
                          onClick={() => !isTaken && setPlayerColor(p.name, c.hex)}
                          style={{
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            backgroundColor: c.hex,
                            border: isSelected ? '4px solid white' : '2px solid rgba(255,255,255,0.2)',
                            cursor: isTaken ? 'not-allowed' : 'pointer',
                            opacity: isTaken ? 0.2 : 1,
                            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.2s'
                          }}
                          title={isTaken ? 'Já escolhida' : c.name}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="magical-btn" onClick={() => setStep(1)}>Voltar</button>
              <button className="magical-btn primary-btn" onClick={handleStart}>Começar Jogo!</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
