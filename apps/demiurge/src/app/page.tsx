export default function Home() {
  return (
    <main className="min-h-screen relative z-10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-16 text-center animate-fade-in-up">
          <div className="inline-block mb-6">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-imperial-gold to-transparent mx-auto mb-6"></div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold shimmer-text tracking-wider">
              DEMIURGE
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-imperial-gold to-transparent mx-auto mt-6"></div>
          </div>
          <p className="text-xl md:text-2xl text-slate-400 font-body italic max-w-3xl mx-auto leading-relaxed">
            &ldquo;The demiourgos, craftsman of the cosmos, 
            <br className="hidden md:block" />
            fashions reality from the void...&rdquo;
          </p>
        </header>

        {/* Quote of the day */}
        <div className="mb-16 animate-fade-in-up-delay-1">
          <div className="max-w-4xl mx-auto">
            <div className="corner-accent gradient-border p-8 md:p-12 glow-gold">
              <div className="text-center">
                <div className="mb-6">
                  <span className="text-6xl text-imperial-gold/30 font-display">"</span>
                </div>
                <blockquote className="text-2xl md:text-3xl lg:text-4xl text-imperial-gold font-body italic leading-relaxed mb-6">
                  I am not the man I was... 
                  <br />
                  <span className="text-imperial-gold-light">but I am the man I must be.</span>
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-imperial-gold/50"></div>
                  <p className="text-lg text-slate-500 font-display tracking-widest uppercase">
                    Hadrian Marlowe
                  </p>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-imperial-gold/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-10 text-center animate-fade-in-up-delay-2">
          <h2 className="text-2xl md:text-3xl font-display text-slate-300 tracking-widest uppercase">
            Imperial Agents
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-imperial-gold"></div>
            <div className="w-2 h-2 rotate-45 bg-imperial-gold"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-imperial-gold"></div>
          </div>
        </div>

        {/* Agent Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 animate-fade-in-up-delay-3">
          <AgentCard 
            name="Hadrian" 
            role="Orchestrator" 
            quote="I am not the man I was..." 
            status="Active"
            color="hadrian"
            description="Strategic coordination and high-level decision making"
          />
          <AgentCard 
            name="Valka" 
            role="Scholar" 
            quote="The universe is larger than we know..." 
            status="Standby"
            color="valka"
            description="Research, analysis, and knowledge synthesis"
          />
          <AgentCard 
            name="Palino" 
            role="Executor" 
            quote="Give me a task..." 
            status="Standby"
            color="palino"
            description="Implementation, coding, and task execution"
          />
          <AgentCard 
            name="Lorian" 
            role="Infrastructure" 
            quote="Order is the foundation..." 
            status="Standby"
            color="lorian"
            description="DevOps, security, and system architecture"
          />
          <AgentCard 
            name="Otavia" 
            role="Coordinator" 
            quote="Words are weapons..." 
            status="Standby"
            color="otavia"
            description="Communication, documentation, and cross-agent coordination"
          />
        </div>

        {/* System Status Bar */}
        <div className="animate-fade-in-up-delay-3">
          <div className="gradient-border p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-green-400 status-active"></div>
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-ping opacity-30"></div>
                </div>
                <div>
                  <p className="text-slate-400 font-body text-sm uppercase tracking-widest">System Status</p>
                  <p className="text-green-400 font-display text-xl">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-imperial-gold font-display text-2xl">5</p>
                  <p className="text-slate-500 font-body text-xs uppercase tracking-wider">Active Agents</p>
                </div>
                <div className="w-px h-12 bg-slate-700"></div>
                <div className="text-center">
                  <p className="text-imperial-gold font-display text-2xl">1</p>
                  <p className="text-slate-500 font-body text-xs uppercase tracking-wider">In Operation</p>
                </div>
                <div className="w-px h-12 bg-slate-700"></div>
                <div className="text-center">
                  <p className="text-slate-300 font-display text-2xl">—</p>
                  <p className="text-slate-500 font-body text-xs uppercase tracking-wider">Pending Tasks</p>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-slate-500 font-body italic text-sm">Awaiting directives from</p>
                <p className="text-imperial-gold font-display text-lg tracking-wider">THE EMPEROR</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center animate-fade-in-up-delay-3">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-slate-700"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-slate-600"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-slate-700"></div>
          </div>
          <p className="text-slate-600 font-body text-sm">
            Autonomous Orchestrator Agent System
          </p>
          <p className="text-slate-700 font-body text-xs mt-1">
            Phase 1 Complete • Phase 2 Planning
          </p>
        </footer>
      </div>
    </main>
  );
}

interface AgentCardProps {
  name: string;
  role: string;
  quote: string;
  status: 'Active' | 'Standby' | 'Busy';
  color: 'hadrian' | 'valka' | 'palino' | 'lorian' | 'otavia';
  description: string;
}

function AgentCard({ name, role, quote, status, color, description }: AgentCardProps) {
  const colorConfig = {
    hadrian: {
      gradient: 'bg-gradient-hadrian',
      border: 'border-imperial-gold/50',
      glow: 'hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]',
      accent: 'text-imperial-gold',
      icon: '👑',
    },
    valka: {
      gradient: 'bg-gradient-valka',
      border: 'border-blue-400/50',
      glow: 'hover:shadow-[0_0_30px_rgba(96,165,250,0.3)]',
      accent: 'text-blue-400',
      icon: '🔮',
    },
    palino: {
      gradient: 'bg-gradient-palino',
      border: 'border-emerald-400/50',
      glow: 'hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]',
      accent: 'text-emerald-400',
      icon: '⚔️',
    },
    lorian: {
      gradient: 'bg-gradient-lorian',
      border: 'border-red-400/50',
      glow: 'hover:shadow-[0_0_30px_rgba(248,113,113,0.3)]',
      accent: 'text-red-400',
      icon: '🛡️',
    },
    otavia: {
      gradient: 'bg-gradient-otavia',
      border: 'border-purple-400/50',
      glow: 'hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]',
      accent: 'text-purple-400',
      icon: '✉️',
    },
  };

  const config = colorConfig[color];

  return (
    <div 
      className={`
        relative group overflow-hidden rounded-xl border ${config.border}
        ${config.gradient} backdrop-blur-sm
        transition-all duration-500 hover-lift ${config.glow}
      `}
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={`
          text-xs font-display uppercase tracking-wider
          ${status === 'Active' ? 'text-green-400' : status === 'Busy' ? 'text-yellow-400' : 'text-slate-400'}
        `}>
          {status}
        </span>
        <div className={`
          w-2.5 h-2.5 rounded-full
          ${status === 'Active' ? 'bg-green-400 status-active' : status === 'Busy' ? 'bg-yellow-400' : 'bg-slate-500'}
        `}></div>
      </div>

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">
            {config.icon}
          </span>
          <div>
            <h3 className={`text-2xl font-display font-bold ${config.accent} tracking-wide`}>
              {name}
            </h3>
            <p className="text-slate-300 font-body text-sm uppercase tracking-widest">
              {role}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-200 font-body text-sm mb-4 leading-relaxed">
          {description}
        </p>

        {/* Quote */}
        <div className="relative">
          <div className={`absolute -left-2 top-0 text-4xl ${config.accent} opacity-30 font-display`}>
            "
          </div>
          <p className="text-slate-300 font-body italic text-sm pl-4 border-l-2 border-slate-600">
            {quote}
          </p>
        </div>

        {/* Hover Accent Line */}
        <div className={`
          absolute bottom-0 left-0 h-1 
          bg-gradient-to-r from-transparent via-current to-transparent
          ${config.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500
          w-full
        `}></div>
      </div>
    </div>
  );
}
