import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { BOARD_SPACES, INITIAL_MONEY, CHANCE_CARDS } from '../config/board';
import { supabase } from '../lib/supabase';

let lastSpokenText = "";
let lastSpokenTime = 0;

const speak = (text, interrupt = false) => {
  if (!('speechSynthesis' in window)) return;
  
  // Prevenção de eco/repetição (Ignora se for o mesmo texto em menos de 2 segundos)
  const now = Date.now();
  if (text === lastSpokenText && (now - lastSpokenTime) < 2000) return;
  
  lastSpokenText = text;
  lastSpokenTime = now;

  if (interrupt) window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const brVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR') || voices[0];
  
  if (brVoice) utterance.voice = brVoice;
  
  utterance.lang = 'pt-BR';
  utterance.rate = 1.15; 
  window.speechSynthesis.speak(utterance);
};

const DiceRolling = ({ onFinish, diceValues, isWaiting }) => {
  const [randomValues, setRandomValues] = useState([1, 1]);

  useEffect(() => {
    if (isWaiting) return;
    const interval = setInterval(() => {
      setRandomValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 80);
    return () => clearInterval(interval);
  }, [isWaiting]);

  const displayValues = isWaiting ? diceValues : randomValues;

  return (
    <motion.div 
      initial={{ scale: 0.5, rotate: 0 }}
      animate={{ scale: isWaiting ? 1.5 : [1, 1.2, 1.1, 1], rotate: isWaiting ? 1080 : [0, 720, 1440, 2160] }}
      transition={{ duration: isWaiting ? 0.3 : 2.5, ease: "easeInOut" }}
      onAnimationComplete={() => !isWaiting && onFinish()}
      className="dice-container"
    >
      <div className="dice" style={{boxShadow: '0 15px 35px rgba(0,0,0,0.5)', borderRadius: '20px', border: '4px solid var(--accent)'}}>{displayValues[0]}</div>
      <div className="dice" style={{boxShadow: '0 15px 35px rgba(0,0,0,0.5)', borderRadius: '20px', border: '4px solid var(--accent)'}}>{displayValues[1]}</div>
    </motion.div>
  );
};

export default function GameScreen({ players, startingPlayerIndex, initialGameState }) {
  const [gameState, setGameState] = useState(
    initialGameState?.game_state ? initialGameState.game_state : 
    {
      players: players.map((p, i) => ({
        ...p,
        id: i,
        money: INITIAL_MONEY,
        position: 0,
        properties: [],
        propertyLevels: {},
        inJail: false,
        jailTurns: 0,
      })),
      currentPlayerIndex: startingPlayerIndex || 0,
    }
  );

  const [activeAction, setActiveAction] = useState(initialGameState?.active_action || null); 
  const [diceValues, setDiceValues] = useState(initialGameState?.dice_values || null);
  const [isRolling, setIsRolling] = useState(initialGameState?.is_rolling || false);
  const [isWaitingDice, setIsWaitingDice] = useState(false);
  const [transferModal, setTransferModal] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [playerDetailsModal, setPlayerDetailsModal] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const lastSpokenActionRef = useRef(null);
  
  const syncState = async (updates) => {
     try {
       await supabase.from('games').upsert({ id: 'main', ...updates, updated_at: new Date().toISOString() });
     } catch (err) { console.error('Supabase sync error', err); }
  };

  useEffect(() => {
     const channel = supabase.channel('public:games')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: 'id=eq.main' }, (payload) => {
          const newData = payload.new;
          if (newData.game_state) setGameState(newData.game_state);
          // Only update these if present in payload to avoid nulling out locally
          setActiveAction(newData.active_action);
          setDiceValues(newData.dice_values);
          setIsRolling(newData.is_rolling);
       })
       .subscribe();
     return () => supabase.removeChannel(channel);
  }, []);

  const playSound = (type) => {
    try {
      if (type === 'money' || type === 'credit' || type === 'debit') {
        const audio = new Audio('/som/som_dinheiro.mp3');
        audio.play().catch(e => console.error("Audio file play error", e));
        return;
      }
      if (type === 'dice') {
        const audio = new Audio('/som/som_dados.mp3');
        audio.play().catch(e => console.error("Audio file play error", e));
        return;
      }

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if(audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      const now = audioCtx.currentTime;
      if (type === 'bad') {
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(300, now); 
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.1, now); 
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      }
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(now + 0.5);
    } catch(e) { console.error("Audio error", e); }
  };

  useEffect(() => {
    if(!activeAction) {
       lastSpokenActionRef.current = null;
       return;
    }
    
    // Evita falar a mesma ação duas vezes (comum devido à sincronização do Supabase)
    const actionId = JSON.stringify(activeAction);
    if (lastSpokenActionRef.current === actionId) return;
    lastSpokenActionRef.current = actionId;

    if (activeAction.type === 'buy_property') {
       speak(`Você caiu em ${activeAction.space.title}. Quer comprar por ${activeAction.space.prices.buy} reais?`);
    } else if (activeAction.type === 'build_property') {
       const nextLevel = activeAction.currentLevel === 0 ? "uma casa" : activeAction.currentLevel === 1 ? "um hotel" : "um shopping";
       speak(`Você caiu na sua propriedade ${activeAction.space.title}. Deseja construir ${nextLevel} por ${activeAction.space.prices.build_cost} reais?`);
    } else if (activeAction.type === 'pay_rent') {
       speak(`Propriedade de ${activeAction.owner.name}. Você precisa pagar ${activeAction.amount} reais de aluguel.`);
    } else if (activeAction.type === 'chance') {
       speak(`Sorte ou revés! ${activeAction.card.text}`);
    } else if (activeAction.type === 'go_to_jail') {
       speak(`Opa! Vá direto para a detenção sem receber dinheiro do início! Tente tirar dados iguais nas próximas rodadas para sair ou pague 50 reais.`);
    } else if (activeAction.type === 'info') {
       speak(`${activeAction.title}. ${activeAction.message}`);
    } else if (activeAction.type === 'free_buy') {
       speak("Compra livre! Você pode escolher qualquer propriedade que ainda não tenha dono para comprar agora.");
    } else if (activeAction.type === 'jail_options') {
       speak("Você está na detenção. Deseja tentar a sorte nos dados para sair de graça ou pagar 50 reais de fiança?");
    }
  }, [activeAction]);

  const rollDice = () => {
    const cp = gameState.players[gameState.currentPlayerIndex];
    if (cp.inJail && !activeAction) {
      setActiveAction({ type: 'jail_options' });
      syncState({ active_action: { type: 'jail_options' } });
      return;
    }

    playSound('dice');
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const _dv = [d1, d2];
    setDiceValues(_dv);
    setIsRolling(true);
    setIsWaitingDice(false);
    setIsInitiator(true); // <--- Local flag to know this device started the roll
    speak(`Sorteando dados...`, true);
    
    syncState({ dice_values: _dv, is_rolling: true, active_action: null, game_state: gameState });
  };

  const currentSpace = BOARD_SPACES[gameState.players[gameState.currentPlayerIndex].position];

  const handleDiceFinish = () => {
    if (!isInitiator) {
      setIsRolling(false);
      setIsWaitingDice(false);
      return;
    }

    setIsWaitingDice(true);
    const sum = diceValues[0] + diceValues[1];
    speak(`Caiu ${sum}.`, true);
    
    setTimeout(async () => {
        setIsRolling(false);
        setIsWaitingDice(false);
        
        const cpIndex = gameState.currentPlayerIndex;
        const cp = { ...gameState.players[cpIndex] };
        
        // Jail mechanics BEFORE walking
        if (cp.inJail) {
          if (diceValues[0] === diceValues[1]) {
            speak("Dados iguais! Você saiu da detenção e agora vai se mover.");
            cp.inJail = false; 
            cp.jailTurns = 0;
          } else {
            cp.jailTurns += 1;
            if (cp.jailTurns >= 3) {
               cp.inJail = false; 
               cp.jailTurns = 0; 
               cp.money -= 50; 
               speak("Pagou 50 reais de fiança e saiu da detenção. Agora pode se mover.");
            } else {
               speak("Você continua na detenção. Passe a vez.");
               const newPlayers = [...gameState.players];
               newPlayers[cpIndex] = cp;
               const finalState = { ...gameState, players: newPlayers, currentPlayerIndex: (cpIndex + 1) % newPlayers.length };
               setGameState(finalState);
               setDiceValues(null);
               setIsInitiator(false);
               syncState({ game_state: finalState, is_rolling: false, active_action: null, dice_values: null });
               return;
            }
          }
        }
        
        let currentStepsMove = 0;
        const totalSteps = sum;
        
        // Função interna para mover um passo de cada vez
        const moveOneStep = (stepCount) => {
          if (stepCount >= totalSteps) {
            // Chegou ao destino, processar ação final
            finishMovement(sum);
            return;
          }

          setGameState(prev => {
            const nextPlayers = [...prev.players];
            const cp = nextPlayers[prev.currentPlayerIndex];
            const oldPos = cp.position;
            const newPos = (oldPos + 1) % BOARD_SPACES.length;
            
            cp.position = newPos;
            
            // Narração do passo
            const count = stepCount + 1;
            speak(count.toString());
            
            // Se passar pelo início
            if (newPos === 0) {
              cp.money += 200;
              playSound('money');
              speak("Passou pelo Início, recebeu 200 reais!");
            }

            const newState = { ...prev, players: nextPlayers };
            syncState({ game_state: newState });
            return newState;
          });

          setTimeout(() => moveOneStep(stepCount + 1), 600);
        };

        moveOneStep(0);
    }, 2000);
  };

  const finishMovement = (sum) => {
    const cpIndex = gameState.currentPlayerIndex;
    const currentPlayer = gameState.players[cpIndex];
    const newPosition = currentPlayer.position;
    const space = BOARD_SPACES[newPosition];
    
    speak(`Parou em ${space.title}.`);

    let _nextAction = null;
    const newPlayers = [...gameState.players];
    const cp = newPlayers[cpIndex];

    // Jail check at end of move
    if (cp.inJail && diceValues[0] !== diceValues[1]) {
        // This case should be handled before walking ideally, 
        // but since we already walked, we just land and stay there.
        // Actually Monopoly rules: if in jail and no doubles, don't move.
        // I should have checked this BEFORE starting the walk.
        // Let's assume for now the walk only happens if they are free or rolled doubles.
    }

    if (space.type === 'property' || space.type === 'company') {
      const owner = newPlayers.find(p => p.properties.includes(space.index));
      if (!owner) {
        _nextAction = { type: 'buy_property', space: space };
      } else if (owner.id !== cp.id) {
        let rent = 0;
        if (space.type === 'company') {
           rent = sum * space.prices.multiplier;
        } else {
           const level = owner.propertyLevels[space.index] || 0;
           if (level === 0) rent = space.prices.rent;
           else if (level === 1) rent = space.prices.casa;
           else if (level === 2) rent = space.prices.hotel;
           else rent = space.prices.shopping;
        }
        _nextAction = { type: 'pay_rent', space: space, owner: owner, amount: rent };
      } else if (space.type === 'property') {
        const level = cp.propertyLevels[space.index] || 0;
        if (level < 3) {
            _nextAction = { type: 'build_property', space: space, currentLevel: level };
        } else {
            _nextAction = 'next_turn';
        }
      } else {
        _nextAction = 'next_turn';
      }
    } else if (space.type === 'chance') {
       const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
       _nextAction = { type: 'chance', card: card };
    } else if (space.type === 'go_to_jail') {
       _nextAction = { type: 'go_to_jail' };
    } else if (space.type === 'free_buy') {
       _nextAction = { type: 'free_buy' };
    } else {
       _nextAction = { type: 'info', title: space.title, message: space.description || "Apenas uma casa comum.", space: space };
    }

    if (_nextAction === 'next_turn') {
      const finalState = { ...gameState, players: newPlayers, currentPlayerIndex: (cpIndex + 1) % newPlayers.length };
      setGameState(finalState);
      setDiceValues(null);
      setIsInitiator(false);
      syncState({ game_state: finalState, is_rolling: false, active_action: null, dice_values: null });
    } else {
      setActiveAction(_nextAction);
      syncState({ game_state: { ...gameState, players: newPlayers }, is_rolling: false, active_action: _nextAction });
    }
  };

  const executeAction = (decision) => {
    const newPlayers = [...gameState.players];
    const cpIndex = gameState.currentPlayerIndex;
    const currentPlayer = newPlayers[cpIndex];
    let action = activeAction;
    
    if (action.type === 'buy_property' && decision === 'yes') {
       if (currentPlayer.money >= action.space.prices.buy) {
           currentPlayer.money -= action.space.prices.buy;
           currentPlayer.properties.push(action.space.index);
           playSound('debit');
       } else {
           speak("Dinheiro Insuficiente!");
           alert("Dinheiro Insuficiente!");
       }
    } else if (action.type === 'build_property' && decision === 'yes') {
       if (currentPlayer.money >= action.space.prices.build_cost) {
           currentPlayer.money -= action.space.prices.build_cost;
           currentPlayer.propertyLevels[action.space.index] = (currentPlayer.propertyLevels[action.space.index] || 0) + 1;
           playSound('debit');
       } else {
           speak("Dinheiro Insuficiente!");
           alert("Dinheiro Insuficiente!");
       }
    } else if (action.type === 'pay_rent') {
       const ownerIndex = newPlayers.findIndex(p => p.id === action.owner.id);
       currentPlayer.money -= action.amount;
       newPlayers[ownerIndex].money += action.amount;
       playSound('money');
    } else if (action.type === 'chance') {
       const card = action.card;
       if (card.amount) playSound('money');
       if (card.type === 'receive' || card.type === 'pay') currentPlayer.money += card.amount;
       if (card.type === 'receive_from_players') {
           newPlayers.forEach((p, i) => {
               if (i !== cpIndex) { p.money -= card.amount; currentPlayer.money += card.amount; }
           });
           playSound('money');
       }
       if (card.type === 'go_to_jail') {
           currentPlayer.position = 9; currentPlayer.inJail = true;
       }
       if (card.type === 'move_back') {
           currentPlayer.position = (currentPlayer.position - card.spaces + BOARD_SPACES.length) % BOARD_SPACES.length;
       }
    } else if (action.type === 'go_to_jail') {
       playSound('bad'); currentPlayer.position = 9; currentPlayer.inJail = true;
    } else if (action.type === 'jail_options') {
        if (decision === 'pay') {
            currentPlayer.money -= 50;
            currentPlayer.inJail = false;
            currentPlayer.jailTurns = 0;
            playSound('money');
            speak("Fiança paga! Agora jogue os dados para se mover.");
            
            const nextState = {...gameState, players: newPlayers};
            setGameState(nextState);
            setActiveAction(null);
            setIsInitiator(false);
            syncState({ game_state: nextState, active_action: null });
            return; // Don't advance turn, let them roll
        } else {
            // Decision 'roll'
            setActiveAction(null);
            syncState({ active_action: null });
            // Small delay before rolling to let modal close
            setTimeout(() => {
                // Modified rollDice logic to bypass jail check once
                playSound('dice');
                const d1 = Math.floor(Math.random() * 6) + 1;
                const d2 = Math.floor(Math.random() * 6) + 1;
                const _dv = [d1, d2];
                setDiceValues(_dv);
                setIsRolling(true);
                setIsWaitingDice(false);
                setIsInitiator(true);
                syncState({ dice_values: _dv, is_rolling: true, active_action: null, game_state: gameState });
            }, 500);
            return;
        }
    }

    const nextIdx = (gameState.currentPlayerIndex + 1) % newPlayers.length;
    const nextState = {...gameState, players: newPlayers, currentPlayerIndex: nextIdx};
    
    setGameState(nextState);
     setActiveAction(null);
     setDiceValues(null);
     setIsInitiator(false);
     syncState({ game_state: nextState, active_action: null, dice_values: null });
  };

  const nextTurn = () => {
    setGameState(prev => {
       const nextState = {
         ...prev,
         currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
       };
       setDiceValues(null);
       setActiveAction(null);
       setIsInitiator(false);
       syncState({ game_state: nextState, active_action: null, dice_values: null });
       return nextState;
    });
  };

  const handleTransfer = (targetId) => {
    const val = parseInt(transferAmount);
    if(isNaN(val) || val <= 0) return alert("Valor inválido!");
    
    const newPlayers = [...gameState.players];
    const sourceIndex = newPlayers.findIndex(p => p.id === transferModal.sourceId);
    
    if(newPlayers[sourceIndex].money < val) return alert("Saldo insuficiente!");
    
    newPlayers[sourceIndex].money -= val;
    if(targetId !== 'banco') {
      const targetIndex = newPlayers.findIndex(p => p.id === targetId);
      newPlayers[targetIndex].money += val;
    }
    
    playSound('credit');
    speak(`Transferência de ${val} reais realizada com sucesso.`);
    
    const nextState = {...gameState, players: newPlayers};
    setGameState(nextState);
    setTransferModal(null);
    setTransferAmount('');
    
    syncState({ game_state: nextState });
  };

  const currentPlayerObj = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="game-container">
      {/* Top and side player statuses */}
      <div className="game-players-bar">
        {gameState.players.map((p, idx) => (
            <div key={p.id} className={`player-status-card ${idx === gameState.currentPlayerIndex ? 'active-player-card' : ''}`} onClick={() => setPlayerDetailsModal(p.id)} style={{cursor: 'pointer', borderLeft: `6px solid ${p.color}`}}>
              <img src={p.image} className="avatar-small" style={{ border: `3px solid ${p.color}` }} />
              <div className="player-details">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="player-name" style={{fontSize: '0.9rem'}}>{p.name}</span>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.color, border: '1px solid white' }} title="Cor do Peão"></div>
                 </div>
                 <span className="player-money" style={{fontSize: '1rem', color: p.color}}>R$ {p.money}</span>
              </div>
             <button className="magical-btn text-xs py-1 px-2" style={{fontSize: '0.7rem', padding: '5px 10px', marginLeft: '5px', borderRadius: '20px'}} onClick={(e) => { e.stopPropagation(); setTransferModal({sourceId: p.id}); }}>
                Pix
             </button>
           </div>
        ))}
      </div>

      <div className="game-board-area">
          <div className="glass-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', border: 'none', borderTop: `4px solid ${currentPlayerObj.color}`}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{ position: 'relative' }}>
                    <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '60px', height: '60px', borderRadius: '50%', border: `4px solid ${currentPlayerObj.color}`, objectFit: 'cover'}} />
                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: currentPlayerObj.color, border: '2px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}></div>
                </div>
                <h2 style={{fontSize: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>Turno de <span style={{color: currentPlayerObj.color}}>{currentPlayerObj.name}</span></h2>
             </div>
             <p style={{fontSize: '1.2rem', fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.8)', cursor: 'pointer', margin: 0}} onClick={() => setPlayerDetailsModal(currentPlayerObj.id)}>
                📍 Posição Atual: <strong style={{color: 'var(--accent)'}}>{currentSpace?.title}</strong>
             </p>
          </div>

         {!diceValues && !activeAction && !transferModal && !playerDetailsModal && (
             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               className="magical-btn huge-btn mt-6 primary-btn" 
               onClick={rollDice}
             >
               Sortear Dados
             </motion.button>
         )}

         {isRolling && <DiceRolling onFinish={handleDiceFinish} diceValues={diceValues} isWaiting={isWaitingDice} />}
      </div>

      <AnimatePresence>
      {activeAction && !isRolling && (
         <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="action-modal-overlay">
            <div className="action-modal">
                {activeAction.type === 'buy_property' && (
                   <>
                       <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                           <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--text-light)', objectFit: 'cover'}} />
                       </div>
                       <h3>Comprar Propriedade?</h3>
                       <div style={{fontSize: '4rem', margin: '0.5rem 0'}}>{activeAction.space.emoji}</div>
                       <p>Você caiu em <strong>{activeAction.space.title}</strong></p>
                       <p className="price-tag">Preço: R$ {activeAction.space.prices.buy}</p>
                       <div className="modal-actions">
                           <button className="primary-btn magical-btn" onClick={() => executeAction('yes')}>Comprar</button>
                           <button className="cancel-btn magical-btn" onClick={() => executeAction('no')}>Ignorar</button>
                       </div>
                   </>
                )}
                {activeAction.type === 'build_property' && (
                   <>
                       <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                           <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--text-light)', objectFit: 'cover'}} />
                       </div>
                       <h3>Evoluir Propriedade?</h3>
                       <div style={{fontSize: '4rem', margin: '0.5rem 0'}}>{activeAction.space.emoji}</div>
                       <p>Você caiu no seu próprio <strong>{activeAction.space.title}</strong></p>
                       <p>Pode construir: {activeAction.currentLevel === 0 ? "1 Casa" : activeAction.currentLevel === 1 ? "1 Hotel" : "1 Shopping"}</p>
                       <p className="price-tag">Custo: R$ {activeAction.space.prices.build_cost}</p>
                       <div className="modal-actions">
                           <button className="primary-btn magical-btn" onClick={() => executeAction('yes')}>Construir</button>
                           <button className="cancel-btn magical-btn" onClick={() => executeAction('no')}>Ignorar</button>
                       </div>
                   </>
                )}
                {activeAction.type === 'pay_rent' && (
                   <>
                       <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                           <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--text-light)', objectFit: 'cover'}} />
                       </div>
                       <h3>Pagar Aluguel!</h3>
                       <div style={{fontSize: '4rem', margin: '0.5rem 0'}}>{activeAction.space.emoji}</div>
                       <p>Você caiu na propriedade de {activeAction.owner.name}.</p>
                       <p className="price-tag">Pagar: R$ {activeAction.amount}</p>
                       <button className="primary-btn magical-btn" onClick={() => executeAction()}>Pagar</button>
                   </>
                )}
                {activeAction.type === 'chance' && (
                   <>
                       <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                           <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--text-light)', objectFit: 'cover'}} />
                       </div>
                       <h3>Sorte ou Revés</h3>
                       <div style={{fontSize: '4rem', margin: '0.5rem 0'}}>❓</div>
                       <p>{activeAction.card.text}</p>
                       <p className="price-tag">{activeAction.card.amount ? (activeAction.card.amount > 0 ? `+ R$ ${activeAction.card.amount}` : `- R$ ${Math.abs(activeAction.card.amount)}`) : ''}</p>
                       <button className="primary-btn magical-btn" onClick={() => executeAction()}>OK</button>
                   </>
                )}
                {activeAction.type === 'go_to_jail' && (
                   <>
                       <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                           <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--text-light)', objectFit: 'cover'}} />
                       </div>
                       <h3>Vá para a Prisão!</h3>
                       <div style={{fontSize: '4rem', margin: '0.5rem 0'}}>🚓</div>
                       <p>Vá direto para o Camburão.</p>
                       <button className="primary-btn magical-btn" onClick={() => executeAction()}>OK</button>
                   </>
                )}
                 {activeAction.type === 'free_buy' && (
                    <>
                        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                            <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--text-light)', objectFit: 'cover'}} />
                        </div>
                        <h3>Compra Livre! 🎁</h3>
                        <p>Escolha uma propriedade para comprar:</p>
                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'10px', maxHeight:'300px', overflowY:'auto', margin:'1rem 0', padding:'10px', background:'rgba(255,255,255,0.1)', borderRadius:'10px'}}>
                            {BOARD_SPACES.filter(s => (s.type === 'property' || s.type === 'company') && !gameState.players.some(p => p.properties.includes(s.index))).map(s => (
                                <button 
                                    key={s.index} 
                                    className="magical-btn" 
                                    style={{fontSize:'0.8rem', padding:'8px'}}
                                    onClick={() => {
                                        if (currentPlayerObj.money >= s.prices.buy) {
                                            const newPlayers = [...gameState.players];
                                            const cp = newPlayers[gameState.currentPlayerIndex];
                                            cp.money -= s.prices.buy;
                                            cp.properties.push(s.index);
                                            playSound('money');
                                            executeAction(); 
                                        } else {
                                            alert("Saldo insuficiente para esta propriedade!");
                                        }
                                    }}
                                >
                                    {s.emoji} {s.title} (R${s.prices.buy})
                                </button>
                            ))}
                        </div>
                        <button className="cancel-btn magical-btn" onClick={() => executeAction()}>Pular</button>
                    </>
                 )}
                  {activeAction.type === 'jail_options' && (
                     <>
                        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                            <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '60px', height: '60px', borderRadius: '50%', border: `4px solid ${currentPlayerObj.color}`, objectFit: 'cover'}} />
                        </div>
                        <h3>Detenção! 🚓</h3>
                        <p>Você está preso. O que deseja fazer?</p>
                        <div className="modal-actions" style={{flexDirection: 'column', gap: '1rem'}}>
                            <button className="primary-btn magical-btn" style={{width: '100%'}} onClick={() => executeAction('roll')}>Tentar Dados Iguais (Grátis)</button>
                            <button className="magical-btn" style={{width: '100%', background: '#e67e22'}} onClick={() => executeAction('pay')}>Pagar R$ 50 e Sair Agora</button>
                        </div>
                        <p style={{marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8}}>Tentativas: {currentPlayerObj.jailTurns}/3</p>
                     </>
                  )}
                  {activeAction.type === 'info' && (
                   <>
                       <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                           <img src={currentPlayerObj.image} alt={currentPlayerObj.name} style={{width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--text-light)', objectFit: 'cover'}} />
                       </div>
                       <h3>{activeAction.title}</h3>
                       <div style={{fontSize: '4rem', margin: '0.5rem 0'}}>{activeAction.space?.emoji || 'ℹ️'}</div>
                       <p>{activeAction.message}</p>
                       <button className="primary-btn magical-btn" onClick={() => executeAction()}>OK</button>
                   </>
                )}
            </div>
         </motion.div>
      )}

      {transferModal && (
         <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="action-modal-overlay">
            <div className="action-modal">
               <h3>Transferência</h3>
               <p>De: {gameState.players.find(p=>p.id === transferModal.sourceId)?.name}</p>
               <input 
                  type="number" 
                  value={transferAmount} 
                  onChange={e => setTransferAmount(e.target.value)} 
                  placeholder="Valor..." 
                  className="rounded-input" 
                  style={{padding: '10px', fontSize: '1.2rem', width: '80%', margin: '1rem 0', borderRadius: '8px', border: 'none', textAlign: 'center'}}
               />
               <h4 style={{marginTop: '1rem', color: '#a8dadc'}}>Para quem?</h4>
               <div className="modal-actions" style={{flexWrap: 'wrap'}}>
                  <button className="primary-btn magical-btn" onClick={() => handleTransfer('banco')}>O Banco</button>
                  {gameState.players.map(p => {
                     if(p.id !== transferModal.sourceId) {
                        return <button key={p.id} className="magical-btn cancel-btn" onClick={() => handleTransfer(p.id)}>{p.name}</button>
                     }
                     return null;
                  })}
               </div>
               <button className="magical-btn" style={{marginTop: '1.5rem', background: 'transparent', border: '1px solid #fff'}} onClick={() => {setTransferModal(null); setTransferAmount('');}}>Cancelar</button>
            </div>
         </motion.div>
      )}

      {playerDetailsModal !== null && (() => {
         const p = gameState.players.find(player => player.id === playerDetailsModal);
         return (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="action-modal-overlay" onClick={() => setPlayerDetailsModal(null)}>
               <div className="action-modal" onClick={e => e.stopPropagation()} style={{maxHeight:'80vh', overflowY:'auto', width:'90%', maxWidth:'600px'}}>
                  <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                     <img src={p.image} alt={p.name} style={{width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--accent)', objectFit: 'cover'}} />
                  </div>
                  <h3>Painel de <span style={{color:'var(--highlight)'}}>{p.name}</span></h3>
                  <div style={{display:'flex', justifyContent:'space-around', margin:'1.5rem 0', padding:'1rem', background:'rgba(255,255,255,0.1)', borderRadius:'15px'}}>
                      <div>
                         <p style={{fontSize:'0.9rem', opacity:0.8}}>Saldo Atual</p>
                         <p className="price-tag" style={{margin:0}}>R$ {p.money}</p>
                      </div>
                      <div>
                         <p style={{fontSize:'0.9rem', opacity:0.8}}>Status</p>
                         <p style={{fontSize:'1.5rem', fontWeight:'bold', color: p.inJail ? '#e63946' : 'var(--accent)'}}>{p.inJail ? 'Na Prisão 🚓' : 'Livre 🕊️'}</p>
                      </div>
                  </div>
                  
                  <h4 style={{marginTop: '1rem', color: 'var(--text-light)', borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:'0.5rem', marginBottom:'1rem'}}>Propriedades ({p.properties.length})</h4>
                  {p.properties.length === 0 ? (
                      <p style={{opacity:0.7, fontStyle:'italic'}}>Nenhuma propriedade comprada ainda.</p>
                  ) : (
                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'10px', textAlign:'left'}}>
                          {p.properties.map(propIdx => {
                              const prop = BOARD_SPACES[propIdx];
                              const level = p.propertyLevels[propIdx] || 0;
                              let levelText = "";
                              if (prop.type === 'company') levelText = "🏢 Empresa";
                              else {
                                  if (level === 0) levelText = "🌱 Terreno Vazio";
                                  else if (level === 1) levelText = "🏠 1 Casa";
                                  else if (level === 2) levelText = "🏨 1 Hotel";
                                  else levelText = "🏬 1 Shopping";
                              }
                              return (
                                  <div key={propIdx} style={{background:'rgba(255,255,255,0.05)', padding:'10px', borderRadius:'10px', border:'1px solid var(--glass-border)'}}>
                                      <div style={{fontSize:'1.8rem', float:'right'}}>{prop.emoji}</div>
                                      <div style={{fontWeight:'bold', fontSize:'1.1rem', color:'var(--text-light)', display:'flex', alignItems:'center', gap:'5px'}}>
                                         {prop.title}
                                      </div>
                                      <div style={{color:'var(--accent)', fontSize:'0.9rem', marginTop:'5px'}}>{levelText}</div>
                                  </div>
                              );
                          })}
                      </div>
                  )}

                  <button className="primary-btn magical-btn" style={{marginTop: '2rem'}} onClick={() => setPlayerDetailsModal(null)}>Fechar</button>
               </div>
            </motion.div>
         );
      })()}
      </AnimatePresence>
    </div>
  );
}
