'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sampleAnimals, sampleAnimalData } from '@/data/sample/animals';
import { AnimalData, AnimalFilter, DataCategory } from '@/types/animal/types';
import { RobotIcon } from '@/components/icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const systemPrompts = [
  'You are an expert animal data analyst. Help users explore and understand animal data from OpenAnimalNet.',
  'Provide insights based on biological, behavioral, ecological, and conservation data.',
  'You can help with species identification, data analysis, conservation status, and monitoring information.',
  'Always base your answers on the available data and provide sources when possible.',
];

const suggestedQuestions = [
  'What are the most endangered mammals?',
  'Show me animals with population data',
  'Which species are being monitored in Africa?',
  'What is the conservation status of lions?',
  'Find animals with recent health alerts',
  'Show me marine species with telemetry data',
];

export default function AIAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI Animal Data Assistant. I can help you explore and analyze data from over 1.2 million species. Ask me about animal biology, behavior, conservation status, or monitoring data.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    await simulateAIResponse(inputValue.trim());
    setIsLoading(false);
  };

  // Simulate AI response based on user query
  const simulateAIResponse = async (query: string) => {
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate appropriate response based on query
    const response = generateResponse(query);

    // Stream the response word by word
    const words = response.split(' ');
    let currentResponse = '';

    for (let i = 0; i < words.length; i++) {
      currentResponse += (i > 0 ? ' ' : '') + words[i];
      
      // Update messages with streaming effect
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: currentResponse, isStreaming: i < words.length - 1 }
          ];
        }
        return [...prev, {
          id: `ai-${Date.now()}-${i}`,
          role: 'assistant',
          content: currentResponse,
          timestamp: new Date(),
          isStreaming: i < words.length - 1,
        }];
      });

      await new Promise(resolve => setTimeout(resolve, 20));
    }

    // Finalize the message
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, isStreaming: false }
        ];
      }
      return prev;
    });
  };

  // Generate AI response based on query
  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Check for greetings
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return `Hello! I'm here to help you explore animal data. You can ask me about specific species, conservation status, biological data, or any other animal-related information.`;
    }

    // Check for help
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return `I can help you with:
- Finding information about specific animals
- Analyzing biological, behavioral, and ecological data
- Checking conservation status and population trends
- Exploring monitoring data and alerts
- Comparing data across different species
- Answering questions about animal categories and habitats

Try asking me: "What are the most endangered mammals?" or "Show me data for lions."`;
    }

    // Check for endangered species
    if (lowerQuery.includes('endangered') || lowerQuery.includes('threatened')) {
      const endangeredAnimals = sampleAnimals.filter(
        a => a.conservationStatus === 'EN' || a.conservationStatus === 'CR' || a.conservationStatus === 'VU'
      );
      return `Based on our data, we have ${endangeredAnimals.length} species with conservation concerns:

${endangeredAnimals.slice(0, 5).map(a => `- **${a.commonName}** (${a.scientificName}): ${a.conservationStatus} - Population: ${a.populationEstimate?.toLocaleString() || 'Unknown'}`).join('\n')}

${endangeredAnimals.length > 5 ? `...and ${endangeredAnimals.length - 5} more species.` : ''}

Would you like to see more details about any of these species?`;
    }

    // Check for specific animals
    const animalMatches = sampleAnimals.filter(a => 
      lowerQuery.includes(a.commonName.toLowerCase()) ||
      lowerQuery.includes(a.scientificName.toLowerCase())
    );

    if (animalMatches.length > 0) {
      const animal = animalMatches[0];
      return `Here's what I found for **${animal.commonName}** (*${animal.scientificName}*):

📊 **Category**: ${animal.category}
🌍 **Habitat**: ${animal.habitat?.join(', ') || 'Unknown'}
👥 **Population**: ${animal.populationEstimate?.toLocaleString() || 'Unknown'}
🛡️ **Conservation Status**: ${animal.conservationStatus}
📡 **Monitored**: ${animal.isMonitored ? 'Yes' : 'No'}
📅 **Last Updated**: ${new Date(animal.lastUpdated).toLocaleDateString()}

**Data Categories Available**: ${animal.dataCategories.join(', ')}

Would you like to see detailed data for this species?`;
    }

    // Check for monitoring data
    if (lowerQuery.includes('monitor') || lowerQuery.includes('tracking')) {
      const monitoredAnimals = sampleAnimals.filter(a => a.isMonitored);
      return `We currently monitor **${monitoredAnimals.length}** species in real-time:

${monitoredAnimals.slice(0, 5).map(a => `- **${a.commonName}** (${a.scientificName})`).join('\n')}

${monitoredAnimals.length > 5 ? `...and ${monitoredAnimals.length - 5} more species.` : ''}

These animals have GPS tracking, telemetry data, and real-time monitoring. You can view their movements on our interactive globe.`;
    }

    // Check for data categories
    if (lowerQuery.includes('biological') || lowerQuery.includes('genetic') || lowerQuery.includes('dna')) {
      const biologicalAnimals = sampleAnimals.filter(a => a.dataCategories.includes('biological'));
      return `We have biological data for **${biologicalAnimals.length}** species, including:

- Body mass and biometrics
- Genomic and molecular data
- Physiological metrics
- Endocrine and blood chemistry

Some examples: ${biologicalAnimals.slice(0, 3).map(a => a.commonName).join(', ')}`;
    }

    // Check for conservation status
    if (lowerQuery.includes('conservation') || lowerQuery.includes('iucn') || lowerQuery.includes('status')) {
      const statusCounts: Record<string, number> = {};
      sampleAnimals.forEach(a => {
        statusCounts[a.conservationStatus] = (statusCounts[a.conservationStatus] || 0) + 1;
      });
      
      return `Here's the conservation status breakdown for our tracked species:

${Object.entries(statusCounts).map(([status, count]) => `- **${status}**: ${count} species`).join('\n')}

The IUCN Red List categories help us understand the extinction risk for each species. Species marked as CR (Critically Endangered), EN (Endangered), and VU (Vulnerable) need urgent conservation attention.`;
    }

    // Check for population data
    if (lowerQuery.includes('population') || lowerQuery.includes('count') || lowerQuery.includes('abundance')) {
      const animalsWithPopulation = sampleAnimals.filter(a => a.populationEstimate);
      const totalPopulation = animalsWithPopulation.reduce((sum, a) => sum + (a.populationEstimate || 0), 0);
      
      return `We have population data for **${animalsWithPopulation.length}** species:

- Total tracked population: **${totalPopulation.toLocaleString()}** individuals
- Average population: **${(totalPopulation / animalsWithPopulation.length).toLocaleString()}** per species
- Largest population: **${Math.max(...animalsWithPopulation.map(a => a.populationEstimate || 0)).toLocaleString()}** (African Bush Elephant)
- Smallest population: **${Math.min(...animalsWithPopulation.map(a => a.populationEstimate || Infinity)).toLocaleString()}** (Bengal Tiger)

Population data helps us track species health and conservation progress.`;
    }

    // Default response
    return `I found ${sampleAnimals.length} species in our database that match your query. 

Here are some suggestions to get more specific information:
- Ask about a specific animal by name
- Request data for a particular category (mammals, birds, etc.)
- Inquire about conservation status or population trends
- Ask about monitoring and tracking data

You can also try: "Show me all mammals" or "What animals are in Africa?"`;
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    // Auto-submit after a small delay
    setTimeout(() => {
      const form = document.getElementById('ai-form');
      form?.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <RobotIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-secondary-900 dark:text-white">AI Assistant</div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              {isLoading ? 'Thinking...' : 'Online'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-300 text-secondary-500 dark:text-secondary-400"
          >
            <span>{isMinimized ? '↑' : '↓'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-900/20 transition-colors duration-300 text-danger-500 dark:text-danger-400"
          >
            <span>×</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence mode="popLayout">
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 rounded-bl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        |
                      </motion.span>
                    )}
                  </div>
                  <div className="text-xs text-right text-white/50 dark:text-secondary-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="bg-secondary-100 dark:bg-secondary-700 rounded-2xl px-4 py-3 rounded-bl-sm">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-secondary-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                      className="w-2 h-2 rounded-full bg-secondary-400"
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-secondary-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Questions */}
      <AnimatePresence>
        {!isMinimized && messages.length === 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 border-t border-secondary-200 dark:border-secondary-700"
          >
            <div className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
              Suggested questions:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 text-sm transition-colors duration-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.form
            id="ai-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="p-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/50"
          >
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isLoading ? "Wait for response..." : "Ask about animals, data, or conservation..."}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed"
              >
                <span className="text-xl">✈️</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
