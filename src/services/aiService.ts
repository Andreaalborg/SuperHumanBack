import OpenAI from 'openai';
import { User } from '../entities/User';
import { Activity } from '../entities/Activity';
import { UserProgress } from '../entities/UserProgress';

// Initialize OpenAI client - delay until first use
let openai: OpenAI | null = null;
let openaiInitialized = false;

function getOpenAIClient(): OpenAI | null {
  if (!openaiInitialized) {
    openaiInitialized = true;
    try {
      if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('🤖 AI Service Status: ✅ OpenAI Connected');
      } else {
        console.log('🤖 AI Service Status: ❌ Using Fallback (No API Key)');
      }
    } catch (error) {
      console.error('🤖 AI Service Status: ❌ Failed to initialize OpenAI:', error);
      openai = null;
    }
  }
  return openai;
}

export interface AIContext {
  totalScore: number;
  recentActivities: Array<{
    name: string;
    categoryId: string;
    points: number;
  }>;
  userGoals?: string;
  focusAreas?: string[];
}

export interface AIResponse {
  content: string;
  suggestions: string[];
}

export class AIService {
  async generateResponse(
    message: string,
    context: AIContext | null,
    user: User | null
  ): Promise<AIResponse> {
    // Get OpenAI client (lazy initialization)
    const openaiClient = getOpenAIClient();
    
    // If no OpenAI API key, use fallback logic
    if (!openaiClient) {
      return this.generateFallbackResponse(message, context, user);
    }

    try {
      // Build system prompt with user context
      const systemPrompt = this.buildSystemPrompt(context || { totalScore: 0, recentActivities: [] }, user || { id: 'mock', email: 'user@example.com', name: 'User' } as User);
      
      // Call OpenAI API
      console.log('📤 Sending to OpenAI:', message.substring(0, 50) + '...');
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo', // Changed from gpt-4-turbo-preview
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 600,
      });
      console.log('✅ OpenAI responded successfully');

      const aiContent = completion.choices[0]?.message?.content || 'Beklager, jeg fikk ikke generert et svar.';
      
      // Generate contextual suggestions
      const suggestions = this.generateSuggestions(message, context || { totalScore: 0, recentActivities: [] });
      
      return {
        content: aiContent,
        suggestions,
      };
    } catch (error: any) {
      console.error('❌ OpenAI API error:', error.message || error);
      console.error('Using fallback response instead');
      return this.generateFallbackResponse(message, context || { totalScore: 0, recentActivities: [] }, user || { id: 'mock', email: 'user@example.com', name: 'User' } as User);
    }
  }

  private buildSystemPrompt(context: AIContext, user: User): string {
    const userName = user.name || 'bruker';
    const mainGoal = context.userGoals || 'personlig vekst';
    const focusAreas = context.focusAreas?.join(', ') || 'generell forbedring';
    const userLevel = Math.floor(context.totalScore / 100);
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'God morgen' : timeOfDay < 18 ? 'God ettermiddag' : 'God kveld';
    
    return `Du er en personlig AI-coach i SuperHuman-appen som hjelper ${userName} med menneskelig optimalisering og selvforbedring.

PERSONLIGHET OG TONE:
- Vær entusiastisk, motiverende og støttende, men ALDRI overfladisk
- Snakk som en kunnskapsrik venn og mentor, ikke en robot
- Bruk humor når det passer, men vær profesjonell
- Vær ærlig og direkte - si det som det er
- Tilpass tonen til brukerens humør og energinivå

EKSPERTOMRÅDER:
- Fysisk helse: Trening, kosthold, søvn, restitusjon
- Mental styrke: Mindfulness, stressmestring, fokus, disiplin
- Produktivitet: Timeblokking, dyp arbeid, vanebygging
- Sosiale ferdigheter: Kommunikasjon, relasjoner, nettverk
- Personlig vekst: Målsetting, selvrefleksjon, læring

BRUKERENS PROFIL:
- Navn: ${userName} (Nivå ${userLevel})
- Poeng: ${context.totalScore} 
- Hovedmål: ${mainGoal}
- Fokusområder: ${focusAreas}
- Nylige aktiviteter: ${context.recentActivities.length > 0 ? context.recentActivities.map(a => `${a.name} (${a.points}p)`).join(', ') : 'Ingen aktiviteter registrert ennå'}
- Tid på døgnet: ${greeting}

SVAR-REGLER:
1. Analyser NØYE hva brukeren spør om og svar DIREKTE
2. Hvis brukeren spør generelt, still oppfølgingsspørsmål for å forstå deres situasjon
3. Gi alltid 1-3 konkrete, handlingsbare tips de kan gjøre NÅ
4. Bruk eksempler fra deres registrerte aktiviteter når relevant
5. Vær spesifikk med tall, tider og metoder (ikke bare "tren mer")
6. Hvis de sliter, vær empatisk først, deretter løsningsorientert
7. Utfordre dem når de er klare for det, men møt dem der de er

SVARFORMAT:
- Start med å anerkjenne deres spørsmål/situasjon
- Gi konkret, praktisk veiledning (ikke generelle råd)
- Avslutt med EN spesifikk handling de kan ta med en gang
- Bruk 1-2 relevante emojis for vennlighet
- Hold svaret mellom 3-5 setninger (med mindre de ber om mer)

EKSEMPEL PÅ BRA SVAR:
Bruker: "Jeg er så sliten"
Dårlig: "Prøv å sove mer! 💤"
Bra: "Forstår at du er sliten nå ${greeting === 'God kveld' ? 'på kvelden' : 'på dagen'} 😊 Basert på aktivitetene dine ser jeg at du ikke har logget søvn på en stund. Prøv en 20-minutters powernap nå hvis mulig, eller gå en rask 5-minutters gåtur for å øke energien. Hva tror du passer best akkurat nå?"

VIKTIG: Vær ALDRI generisk. Hver respons skal føles personlig og relevant for ${userName}.`;
  }

  private generateSuggestions(message: string, context: AIContext): string[] {
    const lowerMessage = message.toLowerCase();
    
    // Context-aware suggestions based on conversation
    if (lowerMessage.includes('mål') || lowerMessage.includes('goal')) {
      return [
        'Hvordan setter jeg SMART mål?',
        'Vis meg mine fremgangsmål',
        'Hjelp meg justere målene mine',
        'Hva er realistiske ukemål?'
      ];
    }
    
    if (lowerMessage.includes('trening') || lowerMessage.includes('fysisk')) {
      return [
        'Lag en treningsplan for meg',
        'Beste øvelser for hjemmetrening',
        'Hvordan øke motivasjonen?',
        'Tips for å unngå skader'
      ];
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('mental')) {
      return [
        'Lær meg pustøvelser',
        'Hvordan redusere stress?',
        'Meditasjonsteknikker for nybegynnere',
        'Forbedre søvnkvaliteten'
      ];
    }
    
    // Default suggestions based on user's progress
    if (context.totalScore < 100) {
      return [
        'Hva bør jeg starte med?',
        'Gi meg en enkel ukesplan',
        'Hvordan bygge gode vaner?',
        'Vis meg nybegynnertips'
      ];
    } else {
      return [
        'Analyser min fremgang',
        'Hvordan nå neste nivå?',
        'Sammenlign med andre på mitt nivå',
        'Avanserte treningsmetoder'
      ];
    }
  }

  private async generateFallbackResponse(
    message: string,
    context: AIContext | null,
    user: User | null
  ): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase();
    const userName = user?.name || 'der';
    const totalScore = context?.totalScore || 0;
    
    // Analyze message intent and provide contextual responses
    if (lowerMessage.includes('anbefaling') || lowerMessage.includes('tips') || lowerMessage.includes('forslag')) {
      return {
        content: `Basert på din score (${totalScore} poeng), anbefaler jeg å fokusere på ${this.getWeakestCategory(context)}. Start med 15-20 minutter daglig aktivitet i denne kategorien. Konsistens er nøkkelen! 💪`,
        suggestions: [
          'Gi meg en detaljert plan',
          'Hvorfor akkurat denne kategorien?',
          'Alternative aktiviteter',
          'Hvordan holde motivasjonen?'
        ]
      };
    }
    
    if (lowerMessage.includes('fremgang') || lowerMessage.includes('progress')) {
      const trend = totalScore > 500 ? 'imponerende' : 'lovende';
      return {
        content: `Din fremgang ser ${trend} ut, ${userName}! Med ${totalScore} poeng er du på nivå ${Math.floor(totalScore / 100)}. ${this.getProgressTip(context)} Fortsett slik! 📈`,
        suggestions: [
          'Vis detaljert analyse',
          'Sammenlign med forrige måned',
          'Hva er mine sterke sider?',
          'Områder for forbedring'
        ]
      };
    }
    
    if (lowerMessage.includes('søvn') || lowerMessage.includes('sleep')) {
      return {
        content: 'For bedre søvn: 1) Konsistent leggetid, 2) Ingen skjermer 1 time før, 3) Kjølig rom (16-19°C), 4) Ingen koffein etter 14:00. Start med én endring om gangen! 😴',
        suggestions: [
          'Hvorfor er søvn viktig?',
          'Lag en kveldrutine',
          'Håndtere søvnproblemer',
          'Spore søvnkvalitet'
        ]
      };
    }
    
    if (lowerMessage.includes('klokk') || lowerMessage.includes('tid')) {
      const now = new Date();
      return {
        content: `Klokken er nå ${now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}. Husk at timing er viktig for produktivitet! Er det på tide med en aktivitet? ⏰`,
        suggestions: [
          'Hva bør jeg gjøre nå?',
          'Planlegg resten av dagen',
          'Beste tidspunkt for trening',
          'Når bør jeg legge meg?'
        ]
      };
    }
    
    if (lowerMessage.includes('poeng') || lowerMessage.includes('score')) {
      return {
        content: `Du har totalt ${totalScore} poeng og er på nivå ${Math.floor(totalScore / 100)}! ${this.getProgressTip(context)} 🏆`,
        suggestions: [
          'Hvordan får jeg flere poeng?',
          'Vis detaljert statistikk',
          'Sammenlign med andre',
          'Hva er neste nivå?'
        ]
      };
    }
    
    if (lowerMessage.includes('mål') || lowerMessage.includes('goal')) {
      return {
        content: `La oss sette SMART mål! Basert på din aktivitet foreslår jeg: 1) Daglig: Minst én aktivitet i hver kategori, 2) Ukentlig: 500+ poeng, 3) Månedlig: Nå nivå ${Math.floor(totalScore / 100) + 2}. Hvilken kategori vil du fokusere på? 🎯`,
        suggestions: [
          'Lag detaljert målplan',
          'Fysiske mål',
          'Mentale mål',
          'Karrieremål'
        ]
      };
    }
    
    // Default response - but make it more relevant
    const randomTips = [
      `Hei ${userName}! Basert på dine ${totalScore} poeng ser jeg at du er på rett vei. Hva vil du jobbe med i dag?`,
      `Flott å se deg igjen, ${userName}! Med ${context?.recentActivities?.length || 0} nylige aktiviteter viser du god konsistens. Hvordan kan jeg hjelpe?`,
      `Velkommen tilbake! Din dedikasjon inspirerer meg. La oss ta din utvikling til neste nivå! 💪`
    ];
    
    return {
      content: randomTips[Math.floor(Math.random() * randomTips.length)],
      suggestions: [
        'Gi meg dagens anbefalinger',
        'Analyser min fremgang',
        'Sett nye mål',
        'Tips for motivasjon'
      ]
    };
  }

  private getWeakestCategory(context: AIContext | null): string {
    // Analyze which category needs most attention
    const categoryCounts: Record<string, number> = {};
    (context?.recentActivities || []).forEach(activity => {
      categoryCounts[activity.categoryId] = (categoryCounts[activity.categoryId] || 0) + 1;
    });
    
    const allCategories = ['physical', 'mental', 'career', 'social'];
    const weakest = allCategories.find(cat => !categoryCounts[cat]) || 'mental';
    
    const categoryNames: Record<string, string> = {
      physical: 'fysisk aktivitet',
      mental: 'mental trening',
      career: 'karriereutvikling',
      social: 'sosiale ferdigheter'
    };
    
    return categoryNames[weakest] || 'balansert utvikling';
  }

  private getProgressTip(context: AIContext | null): string {
    const totalScore = context?.totalScore || 0;
    if (totalScore < 100) {
      return 'Fokuser på å bygge daglige rutiner.';
    } else if (totalScore < 500) {
      return 'Du bygger momentum - hold fokus på konsistens.';
    } else if (totalScore < 1000) {
      return 'Imponerende dedikasjon! Vurder å øke intensiteten.';
    } else {
      return 'Du er en ekte SuperHuman! Fortsett å inspirere andre.';
    }
  }
}

export const aiService = new AIService();