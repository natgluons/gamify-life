import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
  // Core Game State, loaded from localStorage or initialized
  const [state, setState] = useState(() => {
    try {
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
    return {
      xp: 0,
      coins: 0,
      completedTasks: 0,
      level: 1,
      avatar: {
        shirt: 'red',
        hair: 'black'
      },
      inventory: {
        shirts: ['red'],
        hair: ['black']
      },
      saveSlots: {}
    };
  });

  // useEffect to save state whenever it changes
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  // Game Data
  const QUESTS = {
    home: {
      rewards: { xp: 6, coins: 3 },
      quests: [
        "Clean your desk.",
        "Do laundry.",
        "Cook a healthy meal.",
        "Write down 3 things you're grateful for.",
        "Organize your room."
      ]
    },
    gym: {
      rewards: { xp: 10, coins: 5 },
      quests: [
        "Do 3x12 squats.",
        "10 push-ups × 3.",
        "Walk 5,000 steps.",
        "Stretch for 10 minutes.",
        "Do 20 minutes of cardio."
      ]
    },
    library: {
      rewards: { xp: 8, coins: 4 },
      quests: [
        "Study for 25 minutes.",
        "Read 1 article.",
        "Summarize what you learned in 2 sentences.",
        "Review past lecture notes.",
        "Finish one algorithm exercise."
      ]
    }
  };

  const SHOP_THRESHOLD = 5;

  // React Router-like navigation using a state variable
  const [currentPage, setCurrentPage] = useState('home');
  const [currentQuest, setCurrentQuest] = useState(null);

  // Handlers for quests
  const handleGetQuest = (location) => {
    const randomQuest = QUESTS[location].quests[Math.floor(Math.random() * QUESTS[location].quests.length)];
    setCurrentQuest({
      text: randomQuest,
      rewards: QUESTS[location].rewards
    });
  };

  const handleCompleteQuest = () => {
    setState(prevState => ({
      ...prevState,
      xp: prevState.xp + currentQuest.rewards.xp,
      coins: prevState.coins + currentQuest.rewards.coins,
      completedTasks: prevState.completedTasks + 1
    }));
    setCurrentQuest(null);
    setCurrentPage('home'); // Go back to home after completing
  };

  // Handlers for customization and shop
  const handleBuyItem = (itemType, itemValue, cost) => {
    if (state.coins >= cost && !state.inventory[itemType].includes(itemValue)) {
      setState(prevState => ({
        ...prevState,
        coins: prevState.coins - cost,
        inventory: {
          ...prevState.inventory,
          [itemType]: [...prevState.inventory[itemType], itemValue]
        }
      }));
    }
  };

  const handleEquipItem = (itemType, itemValue) => {
    setState(prevState => ({
      ...prevState,
      avatar: {
        ...prevState.avatar,
        [itemType]: itemValue
      }
    }));
  };

  // Handlers for save/load
  const handleSaveGame = (slotId) => {
    const saveObject = {
      ...state,
      lastSave: new Date().toLocaleString()
    };
    setState(prevState => ({
      ...prevState,
      saveSlots: {
        ...prevState.saveSlots,
        [slotId]: saveObject
      }
    }));
  };

  const handleLoadGame = (slotId) => {
    const savedData = state.saveSlots[slotId];
    if (savedData) {
      setState(savedData);
      setCurrentPage('home');
    }
  };

  // Function to render content based on the current page
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
            <div
              id="avatar-preview"
              className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4"
              style={{ backgroundColor: state.avatar.shirt }}
            ></div>
            <h2 className="text-xl mb-4">Welcome Home!</h2>
            <p className="mb-4">Take a moment to relax and reflect. You can also work on some light goals here.</p>
            <button
              onClick={() => handleGetQuest('home')}
              className="pixel-button"
            >
              Get Home Quest
            </button>
          </div>
        );
      case 'townMap':
        return (
          <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
            <h2 className="text-xl mb-4">Town Map</h2>
            <p className="mb-4">Choose your destination!</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCurrentPage('gym')} className="pixel-button"><span className="text-xl">🏋️</span><br />Gym</button>
              <button onClick={() => setCurrentPage('library')} className="pixel-button"><span className="text-xl">📚</span><br />Library</button>
              <button onClick={() => setCurrentPage('shop')} className="pixel-button"><span className="text-xl">🛒</span><br />Shop</button>
            </div>
          </div>
        );
      case 'gym':
        return (
          <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
            <h2 className="text-xl mb-4">The Gym</h2>
            <p className="mb-4">Work on your physical health goals.</p>
            <button
              onClick={() => handleGetQuest('gym')}
              className="pixel-button"
            >
              Get Gym Quest
            </button>
          </div>
        );
      case 'library':
        return (
          <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
            <h2 className="text-xl mb-4">The Library</h2>
            <p className="mb-4">Focus on personal growth and learning.</p>
            <button
              onClick={() => handleGetQuest('library')}
              className="pixel-button"
            >
              Get Library Quest
            </button>
          </div>
        );
      case 'shop':
        return (
          <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
            <h2 className="text-xl mb-4">The Shop</h2>
            {state.completedTasks >= SHOP_THRESHOLD ? (
              <div>
                <p className="mb-4">Check out the new arrivals!</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleBuyItem('shirts', 'blue', 10)}
                    disabled={state.coins < 10 || state.inventory.shirts.includes('blue')}
                    className="pixel-button"
                  >
                    Buy Blue Shirt (10 Coins)
                  </button>
                  <button
                    onClick={() => handleBuyItem('shirts', 'green', 10)}
                    disabled={state.coins < 10 || state.inventory.shirts.includes('green')}
                    className="pixel-button"
                  >
                    Buy Green Shirt (10 Coins)
                  </button>
                </div>
              </div>
            ) : (
              <p className="mb-4">
                The shop is locked. Complete more tasks to unlock it!
                <br />({state.completedTasks}/{SHOP_THRESHOLD} tasks completed)
              </p>
            )}
          </div>
        );
      case 'customize':
        return (
          <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
            <h2 className="text-xl mb-4">Customize Your Avatar</h2>
            <div
              className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4"
              style={{ backgroundColor: state.avatar.shirt }}
            ></div>
            <p className="mb-2">Change your shirt:</p>
            <div className="flex flex-wrap justify-center space-x-2 mb-4">
              {state.inventory.shirts.map(color => (
                <button
                  key={color}
                  onClick={() => handleEquipItem('shirt', color)}
                  className={`w-12 h-12 rounded-full pixel-border ${state.avatar.shirt === color ? 'border-yellow-400' : ''}`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
          </div>
        );
      case 'saveGame':
        return (
          <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
            <h2 className="text-xl mb-4">Save Game</h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3].map(slotId => {
                const saveKey = `saveSlot${slotId}`;
                const savedData = state.saveSlots[saveKey];
                return (
                  <div key={slotId} className="pixel-border p-2">
                    {savedData ? (
                      <>
                        <p className="text-xs">Level {savedData.level}</p>
                        <p className="text-xs">XP: {savedData.xp}</p>
                        <p className="text-xs">Last save: {savedData.lastSave}</p>
                        <button
                          onClick={() => handleLoadGame(saveKey)}
                          className="pixel-button mt-2"
                        >
                          Load
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs mb-2">Empty Slot</p>
                        <button
                          onClick={() => handleSaveGame(saveKey)}
                          className="pixel-button"
                        >
                          Save
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return <div>Error: Page not found.</div>;
    }
  };

  const backgroundClasses = {
    home: 'bg-home',
    townMap: 'bg-town-map',
    gym: 'bg-gym',
    library: 'bg-library',
    shop: 'bg-shop',
    customize: 'bg-home',
    saveGame: 'bg-home',
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4">
      <div
        id="game-container"
        className={`relative w-full max-w-4xl h-full max-h-[600px] pixel-border bg-cover bg-center ${backgroundClasses[currentPage]} overflow-hidden`}
      >
        {/* Top UI Panel */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between p-2 rounded pixel-border bg-gray-900/75">
          <div className="flex items-center space-x-2">
            <img
              src="https://placehold.co/32x32/d8dee9/2e3440?text=A"
              alt="Avatar"
              className="pixel-border-sm w-8 h-8 rounded"
            />
            <div id="level-display" className="text-sm">
              Lvl {state.level}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div id="xp-display" className="text-sm">
              XP: {state.xp}
            </div>
            <div id="coins-display" className="text-sm">
              Coins: {state.coins}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {currentQuest ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="bg-gray-900/75 p-6 rounded pixel-border text-center w-3/4 max-w-sm">
              <h2 className="text-xl mb-4">Current Quest</h2>
              <p className="mb-4">{currentQuest.text}</p>
              <button onClick={handleCompleteQuest} className="pixel-button">
                Complete Quest
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            {renderContent()}
          </div>
        )}

        {/* UI Buttons Panel */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-4">
          <button onClick={() => setCurrentPage('home')} className="pixel-button"><span className="text-xl">🏠</span></button>
          <button onClick={() => setCurrentPage('townMap')} className="pixel-button"><span className="text-xl">🗺️</span></button>
          <button onClick={() => setCurrentPage('customize')} className="pixel-button"><span className="text-xl">👕</span></button>
          <button onClick={() => setCurrentPage('saveGame')} className="pixel-button"><span className="text-xl">💾</span></button>
        </div>
      </div>
    </div>
  );
};

export default App;
