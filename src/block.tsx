import React, { useState, useEffect } from 'react';
import './styles.css';

interface Card {
  id: number;
  content: string;
  type: 'image' | 'text';
  pair: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface BlockProps {
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const Block: React.FC<BlockProps> = ({ 
  title = "World War 1 Memory Game",
  difficulty = 'medium'
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  // WWI card data with images and facts
  const cardPairs = [
    {
      image: "🎖️", 
      fact: "1914-1918\nThe Great War"
    },
    {
      image: "⚔️", 
      fact: "Trench Warfare\nDefensive Strategy"
    },
    {
      image: "🛩️", 
      fact: "First Air Combat\nFighter Planes"
    },
    {
      image: "🎯", 
      fact: "Assassination of\nArchduke Franz Ferdinand"
    },
    {
      image: "🏴‍☠️", 
      fact: "U-Boat Warfare\nSubmarine Attacks"
    },
    {
      image: "🇺🇸", 
      fact: "USA Entered\nWar in 1917"
    },
    {
      image: "☢️", 
      fact: "Poison Gas\nChemical Weapons"
    },
    {
      image: "🏰", 
      fact: "Battle of Verdun\nLongest Battle"
    }
  ];

  const initializeGame = () => {
    const gameCards: Card[] = [];
    let cardId = 0;

    cardPairs.forEach((pair, index) => {
      // Add image card
      gameCards.push({
        id: cardId++,
        content: pair.image,
        type: 'image',
        pair: index,
        isFlipped: false,
        isMatched: false
      });

      // Add fact card
      gameCards.push({
        id: cardId++,
        content: pair.fact,
        type: 'text',
        pair: index,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameStarted(true);
    setGameCompleted(false);
    setTimer(0);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted || gameCompleted) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      setTimeout(() => {
        if (firstCard && secondCard && firstCard.pair === secondCard.pair) {
          // Match found
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstCardId || c.id === secondCardId 
                ? { ...c, isMatched: true } 
                : c
            )
          );
          setMatches(matches + 1);
          
          // Check if game is completed
          if (matches + 1 === cardPairs.length) {
            setGameCompleted(true);
            // Send completion event
            window.postMessage({ 
              type: 'BLOCK_COMPLETION', 
              blockId: '6853c0b47405ab9cb3e4ccbe', 
              completed: true,
              score: Math.max(1000 - moves * 10 - timer, 100),
              maxScore: 1000,
              timeSpent: timer
            }, '*');
            window.parent.postMessage({ 
              type: 'BLOCK_COMPLETION', 
              blockId: '6853c0b47405ab9cb3e4ccbe', 
              completed: true,
              score: Math.max(1000 - moves * 10 - timer, 100),
              maxScore: 1000,
              timeSpent: timer
            }, '*');
          }
        } else {
          // No match - flip cards back
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstCardId || c.id === secondCardId 
                ? { ...c, isFlipped: false } 
                : c
            )
          );
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetGame = () => {
    setCards([]);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameStarted(false);
    setGameCompleted(false);
    setTimer(0);
  };

  return (
    <div className="ww1-memory-game">
      <header className="game-header">
        <h1>{title}</h1>
        <p>Match WWI images with their historical facts!</p>
      </header>

      {!gameStarted ? (
        <div className="game-start">
          <div className="game-info">
            <h2>🎖️ World War 1 Memory Challenge</h2>
            <p>Test your knowledge of the Great War by matching images with historical facts.</p>
            <ul>
              <li>Click cards to flip them over</li>
              <li>Match each symbol with its corresponding fact</li>
              <li>Complete all {cardPairs.length} pairs to win</li>
              <li>Try to finish with the fewest moves!</li>
            </ul>
          </div>
          <button className="start-button" onClick={initializeGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Matches:</span>
              <span className="stat-value">{matches}/{cardPairs.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Moves:</span>
              <span className="stat-value">{moves}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(timer)}</span>
            </div>
          </div>

          <div className="cards-grid">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <div className="card-back-pattern">WWI</div>
                  </div>
                  <div className="card-back">
                    {card.type === 'image' ? (
                      <div className="card-image">{card.content}</div>
                    ) : (
                      <div className="card-text">{card.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {gameCompleted && (
            <div className="game-completed">
              <div className="completion-modal">
                <h2>🎉 Victory!</h2>
                <p>You've successfully matched all WWI pairs!</p>
                <div className="final-stats">
                  <p><strong>Moves:</strong> {moves}</p>
                  <p><strong>Time:</strong> {formatTime(timer)}</p>
                  <p><strong>Score:</strong> {Math.max(1000 - moves * 10 - timer, 100)}/1000</p>
                </div>
                <button className="play-again-button" onClick={resetGame}>
                  Play Again
                </button>
              </div>
            </div>
          )}

          <div className="game-controls">
            <button className="reset-button" onClick={resetGame}>
              New Game
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Block;