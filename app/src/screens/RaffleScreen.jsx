import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function RaffleScreen({ players, setStartingPlayerIndex }) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isRaffling, setIsRaffling] = useState(false);
  const [winner, setWinner] = useState(null);
  const navigate = useNavigate();

  const handleStartRaffle = () => {
    setIsRaffling(true);
    let currentInterval = 50;
    let cycles = 0;
    
    // Web Audio API simple beep
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const tick = () => {
      setHighlightedIndex((prev) => (prev + 1) % players.length);
      
      try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 400 + (cycles * 10); // pitch goes up
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
      } catch (e) {
        console.error("Audio error", e);
      }

      currentInterval += 15;
      cycles++;

      if (cycles < 40) {
        setTimeout(tick, currentInterval);
      } else {
        const _winnerIndex = Math.floor(Math.random() * players.length);
        setHighlightedIndex(_winnerIndex);
        setStartingPlayerIndex(_winnerIndex);
        setWinner(players[_winnerIndex]);
        
        try {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
          gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 1);
        } catch (e) {
             console.error("Audio error", e);
        }
      }
    };

    setTimeout(tick, currentInterval);
  };

  const handleProceed = () => {
    navigate('/game');
  };

  return (
    <div className="raffle-container">
      <motion.div 
        className="glass-card flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h1 className="title">Sorteio Inicial</h1>
        <p className="subtitle">Quem vai começar a partida?</p>

        <div className="raffle-wheel">
          {players.map((p, index) => (
            <motion.div 
              key={p.name}
              className={`raffle-player ${highlightedIndex === index ? 'highlighted' : ''} ${winner?.name === p.name ? 'winner-card' : ''}`}
            >
              <img src={p.image} alt={p.name} style={{objectFit: 'cover'}} />
              <h4>{p.name}</h4>
            </motion.div>
          ))}
        </div>

        {!winner && !isRaffling && (
          <button className="magical-btn" onClick={handleStartRaffle}>
            Sortear Jogador
          </button>
        )}

        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="winner-announcement"
          >
            <h2>{winner.name} COMEÇA!</h2>
            <button className="magical-btn primary-btn mt-4" onClick={handleProceed}>
              Ir para o Jogo!
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
