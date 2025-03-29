import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useGameStore } from './gameStore';

// Define the Decision interface
interface Decision {
  id: string;
  name: string;
  description: string;
  baseSuccessChance: number;
  costCash: number;
  costPrestige: number;
  successEffects: {
    description: string;
    priceEffect: number;
    prestigeEffect: number;
    cashEffect: number;
    duration?: number;
  };
  failureEffects: {
    description: string;
    priceEffect: number;
    prestigeEffect: number;
    cashEffect: number;
    duration?: number;
  };
  improvements: {
    id: string;
    name: string;
    description: string;
    costCash: number;
    costPrestige: number;
    successChanceBoost: number;
    selected: boolean;
  }[];
  unlockRequirements?: {
    minCash?: number;
    minPrestige?: number;
    minPrice?: number;
    minDays?: number;
  };
  cooldown: number;
  lastUsed: number;
}

export const useDecisionStore = defineStore('decisions', () => {
  const gameStore = useGameStore();
  
  // Available decisions
  const decisions = ref<Decision[]>([
    {
      id: 'sister',
      name: "Instagram Shoutout from Sister",
      description: "Leverage your sister's 2000 followers to boost coin visibility",
      baseSuccessChance: 70,
      costCash: 0,
      costPrestige: 20,
      successEffects: {
        description: "Sister's shoutout is received well",
        priceEffect: 5,
        prestigeEffect: 5,
        cashEffect: 0,
        duration: 5, // 5 days
      },
      failureEffects: {
        description: "Sister's followers mock the coin",
        priceEffect: -3,
        prestigeEffect: -10,
        cashEffect: 0,
        duration: 3,
      },
      improvements: [
        {
          id: 'sister-gift',
          name: "Send Gift",
          description: "Send your sister a gift to increase her enthusiasm",
          costCash: 50,
          costPrestige: 0,
          successChanceBoost: 15,
          selected: false,
        },
        {
          id: 'sister-pitch',
          name: "Prepare Pitch",
          description: "Create a compelling pitch for your sister to use",
          costCash: 0,
          costPrestige: 10,
          successChanceBoost: 10,
          selected: false,
        }
      ],
      cooldown: 5, // 5 days cooldown
      lastUsed: -999, // Never used
    },
    {
      id: 'influencer',
      name: "Buy a Shoutout from Popular Influencer",
      description: "Pay a crypto influencer to promote your coin",
      baseSuccessChance: 60,
      costCash: 100,
      costPrestige: 0,
      successEffects: {
        description: "Influencer shoutout creates huge buzz",
        priceEffect: 20,
        prestigeEffect: 15,
        cashEffect: 0,
        duration: 7,
      },
      failureEffects: {
        description: "Influencer gives a half-hearted promotion",
        priceEffect: 5,
        prestigeEffect: -5,
        cashEffect: 0,
        duration: 3,
      },
      improvements: [
        {
          id: 'influencer-extra',
          name: "Premium Package",
          description: "Pay for extra promotion and multiple posts",
          costCash: 150,
          costPrestige: 0,
          successChanceBoost: 20,
          selected: false,
        },
        {
          id: 'influencer-script',
          name: "Provide Script",
          description: "Create a detailed script for the influencer to follow",
          costCash: 30,
          costPrestige: 5,
          successChanceBoost: 10,
          selected: false,
        }
      ],
      cooldown: 10,
      lastUsed: -999,
    },
    {
      id: 'memes',
      name: "Post Memes About Your Coin on Reddit",
      description: "Create and share memes to build community interest",
      baseSuccessChance: 50,
      costCash: 0,
      costPrestige: 5,
      successEffects: {
        description: "Memes go viral and create new interest",
        priceEffect: 10,
        prestigeEffect: 10,
        cashEffect: 0,
        duration: 4,
      },
      failureEffects: {
        description: "Memes flop and get heavily downvoted",
        priceEffect: -5,
        prestigeEffect: -5,
        cashEffect: 0,
        duration: 2,
      },
      improvements: [
        {
          id: 'memes-quality',
          name: "Hire Designer",
          description: "Pay a professional to make high-quality memes",
          costCash: 50,
          costPrestige: 0,
          successChanceBoost: 15,
          selected: false,
        },
        {
          id: 'memes-bots',
          name: "Use Upvote Bots",
          description: "Pay for bot upvotes to increase visibility",
          costCash: 75,
          costPrestige: -10, // Costs prestige if discovered
          successChanceBoost: 25,
          selected: false,
        }
      ],
      cooldown: 3,
      lastUsed: -999,
    },
    {
      id: 'insider',
      name: "Recruit Crypto Insider",
      description: "Get a known crypto whale to invest in your coin",
      baseSuccessChance: 40,
      costCash: 200,
      costPrestige: 30,
      successEffects: {
        description: "Insider publicly announces investment",
        priceEffect: 30,
        prestigeEffect: 25,
        cashEffect: 100, // They also invest cash
        duration: 10,
      },
      failureEffects: {
        description: "Insider declines and spreads doubt",
        priceEffect: -15,
        prestigeEffect: -20,
        cashEffect: 0,
        duration: 5,
      },
      improvements: [
        {
          id: 'insider-dinner',
          name: "Luxury Dinner",
          description: "Arrange an expensive dinner meeting",
          costCash: 100,
          costPrestige: 0,
          successChanceBoost: 20,
          selected: false,
        },
        {
          id: 'insider-deal',
          name: "Offer Special Deal",
          description: "Propose a special allocation of coins at discount",
          costCash: 0,
          costPrestige: 10,
          successChanceBoost: 15,
          selected: false,
        }
      ],
      unlockRequirements: {
        minCash: 300,
        minPrestige: 70,
        minPrice: 5, // Coin must be worth at least $5
      },
      cooldown: 15,
      lastUsed: -999,
    },
    {
      id: 'whitepaper',
      name: "Publish Technical Whitepaper",
      description: "Create a detailed technical document explaining your coin",
      baseSuccessChance: 60,
      costCash: 50,
      costPrestige: 10,
      successEffects: {
        description: "Whitepaper impresses technical audience",
        priceEffect: 15,
        prestigeEffect: 20,
        cashEffect: 0,
        duration: 20, // Long-lasting but modest effect
      },
      failureEffects: {
        description: "Technical errors found in whitepaper",
        priceEffect: -10,
        prestigeEffect: -15,
        cashEffect: 0,
        duration: 7,
      },
      improvements: [
        {
          id: 'whitepaper-expert',
          name: "Hire Technical Writer",
          description: "Get a professional to write the whitepaper",
          costCash: 150,
          costPrestige: 0,
          successChanceBoost: 30,
          selected: false,
        }
      ],
      cooldown: 30, // Can only do this rarely
      lastUsed: -999,
    },
    {
      id: 'exchange',
      name: "List on Major Exchange",
      description: "Apply to get your coin listed on a major exchange",
      baseSuccessChance: 30,
      costCash: 500,
      costPrestige: 50,
      successEffects: {
        description: "Coin listed on major exchange",
        priceEffect: 50,
        prestigeEffect: 40,
        cashEffect: 0,
        duration: -1, // Permanent
      },
      failureEffects: {
        description: "Exchange rejects application",
        priceEffect: -20,
        prestigeEffect: -30,
        cashEffect: 0,
        duration: 10,
      },
      improvements: [
        {
          id: 'exchange-lawyer',
          name: "Hire Legal Team",
          description: "Get legal assistance with the application",
          costCash: 300,
          costPrestige: 0,
          successChanceBoost: 30,
          selected: false,
        },
        {
          id: 'exchange-bribe',
          name: "Unofficial Payment",
          description: "Make an unofficial payment to exchange contacts",
          costCash: 1000,
          costPrestige: -30, // Very risky for reputation
          successChanceBoost: 40,
          selected: false,
        }
      ],
      unlockRequirements: {
        minCash: 1000,
        minPrestige: 100,
        minPrice: 20,
        minDays: 30, // Coin must exist for at least 30 days
      },
      cooldown: 60,
      lastUsed: -999,
    },
    {
      id: 'burn',
      name: "Burn Coins",
      description: "Permanently remove coins from circulation to reduce supply",
      baseSuccessChance: 90, // Almost guaranteed to work
      costCash: 0,
      costPrestige: 5,
      successEffects: {
        description: "Coin burn reduces supply and increases price",
        priceEffect: 25,
        prestigeEffect: 15,
        cashEffect: 0,
        duration: 15,
      },
      failureEffects: {
        description: "Market doesn't respond to coin burn",
        priceEffect: 5,
        prestigeEffect: -5,
        cashEffect: 0,
        duration: 3,
      },
      improvements: [
        {
          id: 'burn-announcement',
          name: "Media Campaign",
          description: "Promote the coin burn event widely",
          costCash: 100,
          costPrestige: 0,
          successChanceBoost: 10,
          selected: false,
        }
      ],
      unlockRequirements: {
        minPrestige: 30,
        minDays: 10,
      },
      cooldown: 20,
      lastUsed: -999,
    },
    {
      id: 'fake-partnership',
      name: "Announce Fake Partnership",
      description: "Falsely claim partnership with a major company",
      baseSuccessChance: 40,
      costCash: 50, // Cost to create fake materials
      costPrestige: 0,
      successEffects: {
        description: "Partnership announcement causes price spike",
        priceEffect: 40,
        prestigeEffect: 0,
        cashEffect: 0,
        duration: 3, // Short-lived pump
      },
      failureEffects: {
        description: "Partnership exposed as fake immediately",
        priceEffect: -30,
        prestigeEffect: -40, // Huge hit to reputation
        cashEffect: 0,
        duration: 15,
      },
      improvements: [
        {
          id: 'fake-partnership-details',
          name: "Create Detailed Materials",
          description: "Develop convincing partnership materials",
          costCash: 100,
          costPrestige: 0,
          successChanceBoost: 20,
          selected: false,
        },
        {
          id: 'fake-partnership-timing',
          name: "Strategic Timing",
          description: "Release news when target company is busy with other news",
          costCash: 0,
          costPrestige: 10,
          successChanceBoost: 15,
          selected: false,
        }
      ],
      cooldown: 30,
      lastUsed: -999,
    },
  ]);
  
  // List of available decisions (filtered by requirements)
  const availableDecisions = computed(() => {
    const currentGameTime = gameStore.gameTime;
    const currentCoinPrice = gameStore.currentCoin.price;
    const currentCash = gameStore.cash;
    const currentPrestige = gameStore.prestige;
    const coinLifetime = gameStore.currentCoin.lifetimeInDays;
    
    return decisions.value.filter(decision => {
      // Check cooldown - convert days to hours (1 day = 24 hours)
      const cooldownInHours = decision.cooldown * 24;
      if (currentGameTime - decision.lastUsed < cooldownInHours) {
        return false;
      }
      
      // Check requirements if they exist
      if (decision.unlockRequirements) {
        const req = decision.unlockRequirements;
        
        if (req.minCash && currentCash < req.minCash) return false;
        if (req.minPrestige && currentPrestige < req.minPrestige) return false;
        if (req.minPrice && currentCoinPrice < req.minPrice) return false;
        if (req.minDays && coinLifetime < req.minDays) return false;
      }
      
      return true;
    });
  });
  
  // Get a specific decision by ID
  function getDecision(id: string): Decision | undefined {
    return decisions.value.find(decision => decision.id === id);
  }
  
  // Calculate the success chance for a decision
  function calculateSuccessChance(decision: Decision): number {
    let chance = decision.baseSuccessChance;
    
    // Add bonuses from selected improvements
    decision.improvements.forEach(improvement => {
      if (improvement.selected) {
        chance += improvement.successChanceBoost;
      }
    });
    
    // Adjust based on player's resources
    const currentCash = gameStore.cash;
    const currentPrestige = gameStore.prestige;
    
    // More cash and prestige slightly increase chance
    if (currentCash > 500) chance += 5;
    if (currentCash > 1000) chance += 5;
    if (currentPrestige > 100) chance += 5;
    if (currentPrestige > 200) chance += 5;
    
    // Clamp between 5% and 95%
    return Math.min(Math.max(chance, 5), 95);
  }
  
  // Execute a decision
  function executeDecision(decisionId: string): { success: boolean; effect: string } {
    const decision = getDecision(decisionId);
    if (!decision) {
      return { success: false, effect: "Decision not found" };
    }
    
    // Calculate total cost including improvements
    let totalCostCash = decision.costCash;
    let totalCostPrestige = decision.costPrestige;
    
    decision.improvements.forEach(improvement => {
      if (improvement.selected) {
        totalCostCash += improvement.costCash;
        totalCostPrestige += improvement.costPrestige;
      }
    });
    
    // Check if player has enough resources
    if (gameStore.cash < totalCostCash || gameStore.prestige < totalCostPrestige) {
      return { success: false, effect: "Not enough resources" };
    }
    
    // Spend resources
    gameStore.removeCash(totalCostCash);
    gameStore.removePrestige(totalCostPrestige);
    
    // Calculate success chance
    const successChance = calculateSuccessChance(decision);
    const roll = Math.random() * 100;
    const success = roll <= successChance;
    
    // Apply effects
    if (success) {
      const effect = decision.successEffects;
      // Add price growth factor
      gameStore.addPriceGrowthFactor(
        effect.description,
        effect.priceEffect,
        effect.duration
      );
      
      // Add resources if applicable
      if (effect.cashEffect > 0) {
        gameStore.addCash(effect.cashEffect);
      }
      
      if (effect.prestigeEffect > 0) {
        gameStore.addPrestige(effect.prestigeEffect);
      }
      
      // Update last used time
      decision.lastUsed = gameStore.gameTime;
      
      // Reset improvements selection
      decision.improvements.forEach(improvement => {
        improvement.selected = false;
      });
      
      return { success: true, effect: effect.description };
    } else {
      const effect = decision.failureEffects;
      // Add price growth factor (negative)
      gameStore.addPriceGrowthFactor(
        effect.description,
        effect.priceEffect,
        effect.duration
      );
      
      // Deduct resources if applicable (beyond the cost)
      if (effect.cashEffect < 0) {
        gameStore.removeCash(Math.abs(effect.cashEffect));
      }
      
      if (effect.prestigeEffect < 0) {
        gameStore.removePrestige(Math.abs(effect.prestigeEffect));
      }
      
      // Update last used time
      decision.lastUsed = gameStore.gameTime;
      
      // Reset improvements selection
      decision.improvements.forEach(improvement => {
        improvement.selected = false;
      });
      
      return { success: false, effect: effect.description };
    }
  }
  
  // Toggle an improvement selection
  function toggleImprovement(decisionId: string, improvementId: string) {
    const decision = getDecision(decisionId);
    if (!decision) return;
    
    const improvement = decision.improvements.find(imp => imp.id === improvementId);
    if (improvement) {
      improvement.selected = !improvement.selected;
    }
  }
  
  return {
    decisions,
    availableDecisions,
    getDecision,
    calculateSuccessChance,
    executeDecision,
    toggleImprovement,
  };
});