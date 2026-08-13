'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sampleAnimals, sampleAnimalData, conservationStatusData, animalCategoryData, dataCategoryData, sampleMonitoringData } from '@/data/sample/animals';
import { sampleAlerts } from '@/data/sample/alerts';
import { animalLaws } from '@/data/sample/animal-laws';
import { speciesSources } from '@/data/sample/sources';
import { RobotIcon, XIcon, SendIcon, PawIcon, SearchIcon, ChartIcon, ShieldIcon, GlobeIcon, BookIcon } from '@/components/icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  data?: any;
}

const STATUS_NAMES: Record<string, string> = {
  CR: 'Critically Endangered', EN: 'Endangered', VU: 'Vulnerable',
  NT: 'Near Threatened', LC: 'Least Concern', DD: 'Data Deficient', NE: 'Not Evaluated',
};

const CATEGORY_NAMES: Record<string, string> = {
  mammals: 'Mammals', birds: 'Birds', reptiles: 'Reptiles', amphibians: 'Amphibians',
  fish: 'Fish', invertebrates: 'Invertebrates', insects: 'Insects', marine: 'Marine',
};

// Smart response generator that understands the full dataset
function generateResponse(query: string): { text: string; data?: any } {
  const q = query.toLowerCase().trim();

  // Greetings
  if (/^(hello|hi|hey|greetings|howdy|sup|what'?s up)/i.test(q)) {
    return { text: `Hello! I'm OpenAnimalNet's AI assistant, powered by data on ${sampleAnimals.length} species verified across 4 live sources (IUCN, Wikipedia, GBIF, iNaturalist).\n\nI can help you with:\n• Species information and comparisons\n• Conservation status analysis\n• Population trends and data\n• Migration corridor details\n• Animal law lookup\n• Climate impact predictions\n• Wildlife alert monitoring\n\nWhat would you like to know?` };
  }

  // What can you do / help
  if (/what can you do|help|capabilities|features/i.test(q)) {
    return { text: `I have access to the complete OpenAnimalNet dataset:\n\n**Species Database** (${sampleAnimals.length} species)\n• Full profiles: taxonomy, habitat, population, migration routes\n• 5 data categories: biological, behavioral, ecological, population, health\n• Population history with source citations\n\n**Live Data**\n• GBIF occurrence sync (live)\n• Monitoring alerts (${sampleAlerts.length} active)\n• Conservation status tracking\n\n**Reference**\n• ${animalLaws.length} animal laws from 10+ countries\n• Climate corridor predictions (5 SSP scenarios)\n• Multi-source verification results\n\nTry asking me anything about animals, conservation, or our data!` };
  }

  // List all species
  if (/(list|show|all|every).*(species|animals|creatures)/i.test(q) && !/endangered|threatened|critical|status|category|migrat/i.test(q)) {
    const byCategory = sampleAnimals.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || []);
      acc[a.category].push(a);
      return acc;
    }, {} as Record<string, typeof sampleAnimals>);

    let text = `**All ${sampleAnimals.length} Species in the Database**\n\n`;
    for (const [cat, animals] of Object.entries(byCategory)) {
      text += `**${CATEGORY_NAMES[cat] || cat}** (${animals.length})\n`;
      animals.forEach(a => {
        text += `• ${a.commonName} (*${a.scientificName}*) — ${a.conservationStatus}`;
        if (a.populationEstimate) text += ` — ~${a.populationEstimate.toLocaleString()}`;
        text += '\n';
      });
      text += '\n';
    }
    text += `All species verified across IUCN, Wikipedia, GBIF, and iNaturalist.`;
    return { text };
  }

  // Endangered / threatened species
  if (/endangered|threatened|critical|at.risk|most.vulnerable/i.test(q)) {
    const endangered = sampleAnimals.filter(a => ['CR', 'EN', 'VU'].includes(a.conservationStatus));
    const cr = endangered.filter(a => a.conservationStatus === 'CR');
    const en = endangered.filter(a => a.conservationStatus === 'EN');
    const vu = endangered.filter(a => a.conservationStatus === 'VU');

    let text = `**${endangered.length} Species with Conservation Concerns**\n\n`;

    if (cr.length) {
      text += `🔴 **Critically Endangered (${cr.length})**\n`;
      cr.forEach(a => text += `• ${a.commonName} — ${a.populationEstimate?.toLocaleString() || 'Unknown'} remaining\n`);
      text += '\n';
    }
    if (en.length) {
      text += `🟠 **Endangered (${en.length})**\n`;
      en.forEach(a => text += `• ${a.commonName} — ${a.populationEstimate?.toLocaleString() || 'Unknown'} remaining\n`);
      text += '\n';
    }
    if (vu.length) {
      text += `🟡 **Vulnerable (${vu.length})**\n`;
      vu.forEach(a => text += `• ${a.commonName} — ${a.populationEstimate?.toLocaleString() || 'Unknown'} remaining\n`);
    }

    text += `\nThese species are verified across IUCN, Wikipedia, GBIF, and iNaturalist.`;
    return { text, data: { endangered } };
  }

  // Specific species lookup
  const speciesMatch = sampleAnimals.find(a =>
    q.includes(a.commonName.toLowerCase()) ||
    q.includes(a.scientificName.toLowerCase()) ||
    q.includes(a.id.replace(/-\d+$/, ''))
  );

  if (speciesMatch) {
    const source = speciesSources.find(s => s.animalId === speciesMatch.id);
    const data = sampleAnimalData.find(d => d.animal.id === speciesMatch.id);
    const alerts = sampleAlerts.filter(a => a.animal.id === speciesMatch.id);

    let text = `**${speciesMatch.commonName}** (*${speciesMatch.scientificName}*)\n\n`;
    text += `**Conservation Status:** ${STATUS_NAMES[speciesMatch.conservationStatus]} (${speciesMatch.conservationStatus})\n`;
    if (speciesMatch.populationEstimate) text += `**Population:** ~${speciesMatch.populationEstimate.toLocaleString()}\n`;
    text += `**Category:** ${CATEGORY_NAMES[speciesMatch.category]}\n`;
    text += `**Habitat:** ${speciesMatch.habitat?.join(', ') || 'Not specified'}\n`;
    text += `**Location:** ${speciesMatch.location.latitude.toFixed(2)}, ${speciesMatch.location.longitude.toFixed(2)}\n`;
    text += `**Monitored:** ${speciesMatch.isMonitored ? 'Yes' : 'No'}\n\n`;

    if (speciesMatch.populationHistory?.length) {
      text += `**Population History:**\n`;
      speciesMatch.populationHistory.forEach(p => {
        text += `• ${p.year}: ~${p.estimate.toLocaleString()}\n`;
      });
      if (speciesMatch.populationHistoryNote) text += `*Source: ${speciesMatch.populationHistoryNote}*\n`;
      text += '\n';
    }

    if (speciesMatch.migrationRoutes?.length) {
      text += `**Migration Routes:**\n`;
      speciesMatch.migrationRoutes.forEach(r => {
        text += `• ${r.name} (${r.season}, ${r.points?.length || 0} points)\n`;
      });
      text += '\n';
    }

    if (alerts.length) {
      text += `**Active Alerts (${alerts.length}):**\n`;
      alerts.forEach(a => text += `• [${a.type.toUpperCase()}] ${a.animal.commonName}: ${a.message}\n`);
      text += '\n';
    }

    if (source) {
      text += `**Data Sources:**\n`;
      text += `• Wikipedia: [${source.wikipediaTitle}](https://en.wikipedia.org/wiki/${source.wikipediaTitle.replace(/ /g, '_')})\n`;
      if (source.iucnId) text += `• IUCN: [Assessment ${source.iucnId}](https://www.iucnredlist.org/species/${source.iucnId}/0)\n`;
      if (source.gbifKey) text += `• GBIF: [Taxonomy ${source.gbifKey}](https://www.gbif.org/species/${source.gbifKey})\n`;
      if (source.inaturalistId) text += `• iNaturalist: [Taxon ${source.inaturalistId}](https://www.inaturalist.org/taxa/${source.inaturalistId})\n`;
    }

    return { text, data: { species: speciesMatch } };
  }

  // Population trends / data
  if (/population|trend|numbers|count|decline|increase/gi.test(q)) {
    const withPop = sampleAnimals.filter(a => a.populationEstimate);
    const totalPop = withPop.reduce((sum, a) => sum + (a.populationEstimate || 0), 0);

    let text = `**Population Overview**\n\n`;
    text += `Total tracked population: ~${totalPop.toLocaleString()} across ${withPop.length} species with data\n\n`;

    // Sort by population
    const sorted = [...withPop].sort((a, b) => (b.populationEstimate || 0) - (a.populationEstimate || 0));
    text += `**Largest Populations:**\n`;
    sorted.slice(0, 5).forEach(a => {
      text += `• ${a.commonName}: ~${a.populationEstimate!.toLocaleString()}\n`;
    });
    text += `\n**Smallest Populations:**\n`;
    sorted.slice(-5).forEach(a => {
      text += `• ${a.commonName}: ~${a.populationEstimate!.toLocaleString()} (${STATUS_NAMES[a.conservationStatus]})\n`;
    });

    text += `\nAll figures from published censuses and surveys. See each species profile for source citations.`;
    return { text };
  }

  // Migration / corridor
  if (/migrat|corridor|route|movement|travel|fly|swim/gi.test(q)) {
    const migrators = sampleAnimals.filter(a => a.migrationRoutes?.length);
    let text = `**Migration Corridors**\n\n`;
    text += `${migrators.length} species have documented migration routes:\n\n`;

    migrators.forEach(a => {
      a.migrationRoutes!.forEach(r => {
        text += `• **${a.commonName}**: ${r.name} (${r.season})\n`;
        text += `  ${r.waypoints?.length || 0} waypoints, months ${r.startMonth}-${r.endMonth}\n`;
      });
    });

    text += `\nUse the Climate Corridor Simulator on the /migration page to see how these routes may shift under warming scenarios.`;
    return { text };
  }

  // Conservation status breakdown
  if (/conservation|status|iucn|red.list|category breakdown/i.test(q)) {
    let text = `**Conservation Status Breakdown**\n\n`;
    conservationStatusData.forEach(s => {
      const bar = '█'.repeat(Math.round(s.count / 2));
      text += `• ${s.name} (${s.status}): ${s.count} species ${bar}\n`;
    });
    text += `\n${sampleAnimals.filter(a => ['CR', 'EN'].includes(a.conservationStatus)).length} species are Critically Endangered or Endangered.`;
    return { text };
  }

  // Laws / legal
  if (/law|legal|legislation|act|regulation|statute|rights|protection law/i.test(q)) {
    const matching = animalLaws.filter(l =>
      q.includes(l.category) || q.includes(l.country.toLowerCase()) ||
      q.includes(l.name.toLowerCase().slice(0, 20)) ||
      l.keyProvisions.some(p => p.toLowerCase().includes(q.slice(0, 30)))
    );

    if (matching.length) {
      let text = `**Animal Laws Found (${matching.length})**\n\n`;
      matching.slice(0, 5).forEach(l => {
        text += `**${l.name}** (${l.country}, ${l.year})\n`;
        text += `${l.summary.slice(0, 150)}...\n`;
        text += `Key: ${l.keyProvisions[0]}\n\n`;
      });
      text += `Visit /laws for the complete database of ${animalLaws.length} laws.`;
      return { text };
    }

    let text = `**Animal Law Database** (${animalLaws.length} laws)\n\n`;
    text += `I can help you find laws about:\n`;
    text += `• Wildlife protection (ESA, CITES, Habitats Directive)\n`;
    text += `• Companion animal welfare (AWA, PACT Act)\n`;
    text += `• Service animal rights (ADA, Equality Act)\n`;
    text += `• Farm animal welfare (EU directives, Humane Slaughter Act)\n`;
    text += `• Wildlife trafficking (Lacey Act, CITES)\n\n`;
    text += `Try: "What laws protect elephants?" or "ADA service animal rules"`;
    return { text };
  }

  // Climate / temperature / warming
  if (/climate|warming|temperature|ssp|scenario|2°C|1\.5°C/i.test(q)) {
    let text = `**Climate Impact on Migration Corridors**\n\n`;
    text += `Based on IPCC AR6 scenarios, our simulator predicts corridor shifts for 6 species:\n\n`;
    text += `• **Monarch Butterfly**: 85 km/°C poleward (milkweed habitat shift)\n`;
    text += `• **Arctic Tern**: 120 km/°C poleward (sea ice loss impacts)\n`;
    text += `• **Polar Bear**: Critical at 2°C (ice platform retreat)\n`;
    text += `• **African Lion**: 35 km/°C poleward (prey decline)\n`;
    text += `• **African Elephant**: 30 km/°C poleward (water scarcity)\n`;
    text += `• **Bengal Tiger**: 150 m/°C upslope (Himalayan range shift)\n\n`;
    text += `Use the Climate Corridor Simulator on /migration to explore scenarios interactively.`;
    return { text };
  }

  // Alerts / monitoring
  if (/alert|monitor|warning|critical|notification/i.test(q)) {
    const critical = sampleAlerts.filter(a => a.type === 'critical');
    const warning = sampleAlerts.filter(a => a.type === 'warning');
    const info = sampleAlerts.filter(a => a.type === 'info');

    let text = `**Active Monitoring Alerts** (${sampleAlerts.length})\n\n`;
    if (critical.length) {
      text += `🔴 **Critical (${critical.length})**\n`;
      critical.forEach(a => text += `• ${a.animal.commonName} — ${a.message}\n`);
      text += '\n';
    }
    if (warning.length) {
      text += `🟡 **Warning (${warning.length})**\n`;
      warning.forEach(a => text += `• ${a.animal.commonName} — ${a.message}\n`);
      text += '\n';
    }
    if (info.length) {
      text += `🔵 **Info (${info.length})**\n`;
      info.forEach(a => text += `• ${a.animal.commonName} — ${a.message}\n`);
    }
    return { text };
  }

  // Compare species
  if (/compar|versus|vs\.?|difference between|compare/i.test(q)) {
    const words = q.split(/\s+/);
    const found = words.filter(w => sampleAnimals.some(a => a.commonName.toLowerCase().includes(w)));
    if (found.length >= 2) {
      const sp1 = sampleAnimals.find(a => a.commonName.toLowerCase().includes(found[0]));
      const sp2 = sampleAnimals.find(a => a.commonName.toLowerCase().includes(found[1]));
      if (sp1 && sp2) {
        let text = `**Comparison: ${sp1.commonName} vs ${sp2.commonName}**\n\n`;
        text += `| Feature | ${sp1.commonName} | ${sp2.commonName} |\n`;
        text += `|---------|---------|----------|\n`;
        text += `| Status | ${sp1.conservationStatus} | ${sp2.conservationStatus} |\n`;
        text += `| Population | ~${sp1.populationEstimate?.toLocaleString() || 'N/A'} | ~${sp2.populationEstimate?.toLocaleString() || 'N/A'} |\n`;
        text += `| Category | ${sp1.category} | ${sp2.category} |\n`;
        text += `| Habitat | ${(sp1.habitat || []).join(', ')} | ${(sp2.habitat || []).join(', ')} |\n`;
        text += `| Monitored | ${sp1.isMonitored ? 'Yes' : 'No'} | ${sp2.isMonitored ? 'Yes' : 'No'} |\n`;
        return { text, data: { comparison: [sp1, sp2] } };
      }
    }
    return { text: `Try: "Compare lions and tigers" or "elephant vs rhino". I need two specific species names.` };
  }

  // Category filter
  if (/mammal|bird|reptile|amphibian|fish|insect|marine/i.test(q) && !/compar/i.test(q)) {
    const cat = sampleAnimals.filter(a =>
      q.includes(a.category) || a.category.includes(q.split(/\s+/)[0])
    );
    if (cat.length) {
      let text = `**${CATEGORY_NAMES[cat[0].category]} Species** (${cat.length})\n\n`;
      cat.forEach(a => {
        text += `• ${a.commonName} (*${a.scientificName}*) — ${a.conservationStatus}`;
        if (a.populationEstimate) text += ` — ~${a.populationEstimate.toLocaleString()}`;
        text += '\n';
      });
      return { text };
    }
  }

  // Data categories
  if (/data.categor|biological|behavioral|ecological|health|agricultural|shelter|human.interaction/i.test(q)) {
    let text = `**Data Categories Tracked** (${dataCategoryData.length})\n\n`;
    dataCategoryData.forEach(c => {
      text += `• **${c.name}**: ${c.description}\n`;
    });
    text += `\nEvery species has data across multiple categories. Check individual species profiles for details.`;
    return { text };
  }

  // API help
  if (/api|endpoint|json|programmatic|curl|fetch/i.test(q)) {
    let text = `**OpenAnimalNet API**\n\n`;
    text += `All endpoints are rate-limited to 60 req/min. No API key required.\n\n`;
    text += `• \`GET /api/v1/animals\` — List species (filters: category, status, search)\n`;
    text += `• \`GET /api/v1/animals/:id\` — Full species profile\n`;
    text += `• \`GET /api/v1/populations\` — Population estimates\n`;
    text += `• \`GET /api/v1/monitoring/alerts\` — Active alerts\n`;
    text += `• \`GET /api/v1/monitoring/stats\` — Dashboard stats\n`;
    text += `• \`GET /api/v1/locations\` — Telemetry locations\n`;
    text += `• \`GET /api/v1/live/sync?id=<id>\` — Live GBIF sync\n\n`;
    text += `OpenAPI spec: \`docs/openapi.yaml\`\n`;
    text += `Docs: \`docs/api-reference.md\``;
    return { text };
  }

  // Safar / discover
  if (/safari|discover|collection|pokedex|find.*animal/i.test(q)) {
    let text = `**Wildlife Safari**\n\n`;
    text += `The safari feature lets you:\n• Find animals near your GPS location\n• Encounter them with a discovery flow\n• Document with photos and notes\n• Build a collection (Pokedex-style)\n\n`;
    text += `Animals spawn based on conservation status:\n• Common (LC/DD/NE): 50% spawn rate\n• Uncommon (VU/NT): 30% spawn rate\n• Rare (EN): 15% spawn rate\n• Legendary (CR): 5% spawn rate\n\n`;
    text += `Visit /safari to start exploring!`;
    return { text };
  }

  // Pet tracker
  if (/pet|dog|cat|track|care|vaccination|vet/i.test(q)) {
    let text = `**Pet Tracker**\n\n`;
    text += `The pet tracker lets you:\n• Add pets with profiles (name, breed, age, weight, microchip)\n• Track vaccinations with due dates\n• Log vet visits and medications\n• Set feeding schedules and exercise goals\n• See a care dashboard with urgent/upcoming needs\n\n`;
    text += `All data stored locally in your browser.\nVisit /tracker to manage your pets!`;
    return { text };
  }

  // Statistics / numbers
  if (/stat|number|count|how many|total/i.test(q)) {
    let text = `**OpenAnimalNet Statistics**\n\n`;
    text += `• Species tracked: ${sampleAnimals.length}\n`;
    text += `• Total estimated population: ~${sampleAnimals.reduce((s, a) => s + (a.populationEstimate || 0), 0).toLocaleString()}\n`;
    text += `• Monitoring alerts: ${sampleAlerts.length}\n`;
    text += `• Animal laws indexed: ${animalLaws.length}\n`;
    text += `• Data categories: ${dataCategoryData.length}\n`;
    text += `• Species with migration routes: ${sampleAnimals.filter(a => a.migrationRoutes?.length).length}\n`;
    text += `• Species with population history: ${sampleAnimals.filter(a => a.populationHistory?.length).length}\n`;
    text += `• All species verified: 28/28 across 4 sources`;
    return { text };
  }

  // Sources / verification
  if (/source|verif|accurate|reliable|citation/i.test(q)) {
    let text = `**Data Verification**\n\n`;
    text += `Every species is verified across 4 independent live sources:\n\n`;
    text += `1. **IUCN Red List** (via Wikidata P627): conservation status + assessment ID\n`;
    text += `2. **Wikipedia**: species description + article existence\n`;
    text += `3. **GBIF**: backbone taxonomy + scientific name validation\n`;
    text += `4. **iNaturalist**: independently observed conservation status\n\n`;
    text += `Run \`npm run verify:data\` to re-verify all 28 species.\n`;
    text += `Weekly CI job checks for drift automatically.`;
    return { text };
  }

  // Default / fallback
  return { text: `I'm not sure how to answer that specific question. Here are some things I can help with:\n\n• **Species info**: "Tell me about lions" or "What is a vaquita?"\n• **Conservation**: "Which species are endangered?" or "Show CR species"\n• **Population**: "What are the population trends?"\n• **Migration**: "Show me migration corridors"\n• **Laws**: "What laws protect elephants?"\n• **Climate**: "How does warming affect migration?"\n• **Comparison**: "Compare tigers and lions"\n• **API**: "How do I use the API?"\n• **Data**: "What data categories do you track?"\n• **Stats**: "Give me the numbers"\n\nOr just ask me anything about animals!` };
}

export default function AIAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to **OpenAnimalNet AI** — your intelligent assistant for animal data.\n\nI have access to the complete dataset: ${sampleAnimals.length} species, ${sampleAlerts.length} alerts, ${animalLaws.length} laws, and live data from 4 verification sources.\n\nAsk me anything about species, conservation, migration, laws, or our data.`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Generate response with streaming effect
    const { text, data } = generateResponse(inputValue.trim());

    const words = text.split(' ');
    let current = '';

    for (let i = 0; i < words.length; i++) {
      current += (i > 0 ? ' ' : '') + words[i];

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.isStreaming) {
          return [...prev.slice(0, -1), { ...last, content: current, isStreaming: i < words.length - 1 }];
        }
        return [...prev, { id: `ai-${Date.now()}`, role: 'assistant', content: current, timestamp: new Date(), isStreaming: true, data }];
      });

      await new Promise(r => setTimeout(r, 15));
    }

    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false }];
      }
      return prev;
    });

    setIsLoading(false);
  };

  const quickQuestions = [
    'Which species are most endangered?',
    'Tell me about lions',
    'Show migration corridors',
    'What are the population trends?',
    'What laws protect wildlife?',
    'How does climate affect migration?',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <RobotIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">OpenAnimalNet AI</h3>
            <p className="text-xs opacity-80">{sampleAnimals.length} species · 4 sources · {animalLaws.length} laws</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white'
            }`}>
              <div className="text-sm whitespace-pre-wrap">
                {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </div>
              {msg.isStreaming && <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse ml-0.5" />}
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-secondary-100 dark:bg-secondary-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions (shown only at start) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => { setInputValue(q); }}
              className="px-3 py-1.5 rounded-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-secondary-200 dark:border-secondary-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask about any species, conservation, migration, laws..."
            className="flex-1 px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
