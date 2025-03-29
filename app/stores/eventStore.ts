// Define the Event interface
interface RandomEvent {
  id: string;
  name: string;
  description: string;
  triggerChance: number; // Base chance per day (out of 100)
  priceEffect: number;
  prestigeEffect: number;
  cashEffect: number;
  duration: number; // Duration in days, -1 for permanent
  triggerConditions?: {
    minPrice?: number;
    maxPrice?: number;
    minDays?: number;
    maxDays?: number;
    priceChangeLastDay?: number; // Require a minimum price change in the last day
    minPlayerHoldings?: number; // Minimum percentage player holds
    minPrestige?: number; // Minimum player prestige
  };
  modifiers?: {
    // Special IDs of decisions or other events that modify the trigger chance
    [decisionId: string]: number; // Adds this number to the trigger chance
  };
}

export const useEventStore = defineStore('events', () => {
  const gameStore = useGameStore();
  
  // List of possible random events
  const events = ref<RandomEvent[]>([
    {
      id: 'elon-tweet',
      name: 'Elon Musk Tweet',
      description: 'Elon Musk tweets about your coin!',
      triggerChance: 0.1, // Very rare
      priceEffect: 100,
      prestigeEffect: 50,
      cashEffect: 0,
      duration: 5,
      triggerConditions: {
        minPrice: 10, // Coin must have some relevance
        minDays: 14, // Must exist for a while
      },
      modifiers: {
        'memes': 0.2, // Posting memes increases chance
        'whitepaper': 0.1, // Having a technical whitepaper increases chance
      }
    },
    {
      id: 'whale-sell',
      name: 'Whale Sells Large Amount',
      description: 'A major holder suddenly dumps their coins!',
      triggerChance: 3, // Uncommon
      priceEffect: -40,
      prestigeEffect: -5,
      cashEffect: 0,
      duration: 7,
      triggerConditions: {
        minPrice: 5,
        priceChangeLastDay: 10, // More likely after price increases
      },
      modifiers: {
        'insider': -1, // Having insiders reduces chance
        'exchange': 1, // Being on exchanges increases chance
      }
    },
    {
      id: 'coffeezilla',
      name: 'CoffeeZilla Exposes Scam',
      description: 'Your coin has been featured in a CoffeeZilla expose video!',
      triggerChance: 0.5, // Rare
      priceEffect: -80,
      prestigeEffect: -70,
      cashEffect: 0,
      duration: -1, // Permanent damage
      triggerConditions: {
        minDays: 30, // Needs to be around for a while
      },
      modifiers: {
        'fake-partnership': 5, // Significantly increases chance if you announced fake partnerships
        'exchange-bribe': 3, // Bribing exchanges increases chance
        'memes-bots': 2, // Using bots increases chance
      }
    },
    {
      id: 'reddit-hype',
      name: 'Reddit Hype Train',
      description: 'Your coin is trending on cryptocurrency subreddits!',
      triggerChance: 2,
      priceEffect: 30,
      prestigeEffect: 20,
      cashEffect: 0,
      duration: 4,
      triggerConditions: {
        minDays: 7,
      },
      modifiers: {
        'memes': 3, // Significantly increases chance if you've been posting memes
        'whitepaper': 1, // Technical content helps
      }
    },
    {
      id: 'hacker-attack',
      name: 'Hacker Attack',
      description: 'Your coin\'s website or community has been hacked!',
      triggerChance: 1,
      priceEffect: -35,
      prestigeEffect: -25,
      cashEffect: -50, // Costs money to fix
      duration: 10,
      modifiers: {
        'exchange': 0.5, // Being on exchanges increases visibility and attack surface
      }
    },
    {
      id: 'celeb-endorsement',
      name: 'Celebrity Endorsement',
      description: 'A celebrity has mentioned your coin on social media!',
      triggerChance: 0.5,
      priceEffect: 50,
      prestigeEffect: 30,
      cashEffect: 0,
      duration: 6,
      triggerConditions: {
        minPrestige: 50, // More prestigious coins attract celebrities
      }
    },
    {
      id: 'market-crash',
      name: 'Crypto Market Crash',
      description: 'The entire crypto market is crashing!',
      triggerChance: 1,
      priceEffect: -30,
      prestigeEffect: 0,
      cashEffect: 0,
      duration: 14,
      // No special conditions, can happen anytime
    },
    {
      id: 'market-boom',
      name: 'Crypto Market Boom',
      description: 'The entire crypto market is booming!',
      triggerChance: 1,
      priceEffect: 20,
      prestigeEffect: 10,
      cashEffect: 0,
      duration: 14,
      // No special conditions, can happen anytime
    },
    {
      id: 'sec-investigation',
      name: 'SEC Investigation',
      description: 'The SEC has announced they\'re investigating your coin!',
      triggerChance: 0.5,
      priceEffect: -60,
      prestigeEffect: -40,
      cashEffect: -200, // Legal costs
      duration: 20,
      triggerConditions: {
        minPrice: 50, // Only targets valuable coins
        minDays: 60, // Has to exist for a while
      },
      modifiers: {
        'fake-partnership': 2, // Increases chance if you faked partnerships
        'whitepaper': -0.3, // Reduces chance if you have legitimate documentation
      }
    },
    {
      id: 'technical-breakthrough',
      name: 'Technical Breakthrough',
      description: 'Your development team has made a significant technical breakthrough!',
      triggerChance: 0.5,
      priceEffect: 25,
      prestigeEffect: 30,
      cashEffect: 0,
      duration: -1, // Permanent improvement
      triggerConditions: {
        minDays: 45, // Takes time to develop
      },
      modifiers: {
        'whitepaper': 1, // More likely if you invested in technical documentation
      }
    },
    {
      id: 'copycat-coins',
      name: 'Copycat Coins Emerge',
      description: 'Several copycat coins have appeared, diluting your market!',
      triggerChance: 2,
      priceEffect: -15,
      prestigeEffect: -5,
      cashEffect: 0,
      duration: 10,
      triggerConditions: {
        minPrice: 20, // Only successful coins get copied
        minDays: 30,
      }
    },
  ]);
  
  // History of triggered events
  const triggeredEvents = ref<{
    eventId: string;
    time: number;
    active: boolean;
  }[]>([]);
  
  // Check if any events should trigger on the current day
  function checkEventTriggers(currentTime: number) {
    // Don't trigger events in the first few days (120 hours = 5 days)
    if (currentTime < 120) return null;
    
    const gameState = gameStore;
    const price = gameState.currentCoin.price;
    const days = gameState.currentCoin.lifetimeInDays;
    const playerHoldings = gameState.distribution.player;
    
    // Get active effects to check for modifiers
    const activeEffects = gameState.priceGrowthFactors.map(factor => factor.name);
    
    let triggeredEvent = null;
    
    for (const event of events.value) {
      let chance = event.triggerChance;
      
      // Since we're now checking hourly instead of daily, reduce the chance
      // by dividing by 24 to keep the same daily probability
      chance = chance / 24;
      
      // Check conditions
      if (event.triggerConditions) {
        const conditions = event.triggerConditions;
        
        if (conditions.minPrice !== undefined && price < conditions.minPrice) continue;
        if (conditions.maxPrice !== undefined && price > conditions.maxPrice) continue;
        if (conditions.minDays !== undefined && days < conditions.minDays) continue;
        if (conditions.maxDays !== undefined && days > conditions.maxDays) continue;
        if (conditions.minPlayerHoldings !== undefined && playerHoldings < conditions.minPlayerHoldings) continue;
        
        // For price change check, we would need hourly price history
        // This is a simplified version
        // if (conditions.priceChangeLastDay !== undefined) { ... }
      }
      
      // Apply modifiers from active effects
      if (event.modifiers) {
        for (const effect of activeEffects) {
          // Check if this effect has a modifier on this event
          for (const [decisionId, modifier] of Object.entries(event.modifiers)) {
            if (effect.includes(decisionId)) {
              // Scale the modifier to the hourly chance
              chance += modifier / 24;
            }
          }
        }
      }
      
      // Clamp chance to reasonable values
      chance = Math.max(0.004, Math.min(chance, 0.4)); // 0.4% to 10% per hour (~10% to 100% per day)
      
      // Roll for event trigger
      if (Math.random() * 100 <= chance) {
        triggeredEvent = event;
        break;
      }
    }
    
    if (triggeredEvent) {
      // Add to triggered events
      triggeredEvents.value.push({
        eventId: triggeredEvent.id,
        time: currentTime,
        active: true,
      });
      
      // Apply effects
      gameStore.addPriceGrowthFactor(
        triggeredEvent.name,
        triggeredEvent.priceEffect,
        triggeredEvent.duration
      );
      
      if (triggeredEvent.cashEffect !== 0) {
        if (triggeredEvent.cashEffect > 0) {
          gameStore.addCash(triggeredEvent.cashEffect);
        } else {
          gameStore.removeCash(Math.abs(triggeredEvent.cashEffect));
        }
      }
      
      if (triggeredEvent.prestigeEffect !== 0) {
        if (triggeredEvent.prestigeEffect > 0) {
          gameStore.addPrestige(triggeredEvent.prestigeEffect);
        } else {
          gameStore.removePrestige(Math.abs(triggeredEvent.prestigeEffect));
        }
      }
      
      return triggeredEvent;
    }
    
    return null;
  }
  
  // Get event by ID
  function getEvent(id: string) {
    return events.value.find(event => event.id === id);
  }
  
  // Check if an event is active
  function isEventActive(id: string) {
    return triggeredEvents.value.some(event => event.eventId === id && event.active);
  }
  
  return {
    events,
    triggeredEvents,
    checkEventTriggers,
    getEvent,
    isEventActive,
  };
});