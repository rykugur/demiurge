export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-amber-500">Demiurge</h1>
          <p className="text-slate-400 italic max-w-2xl mx-auto">
            &ldquo;The demiurge, derived from the Greek demiourgos (&ldquo;craftsman&rdquo;), 
            is a figure responsible for fashioning and maintaining the physical universe...&rdquo;
          </p>
        </header>

        {/* Quote of the day */}
        <div className="mb-12 p-6 bg-slate-900 rounded-lg border border-amber-500/30">
          <blockquote className="text-xl text-amber-400 italic text-center">
            &ldquo;I am not the man I was... but I am the man I must be.&rdquo;
          </blockquote>
          <p className="text-center text-slate-500 mt-2">— Hadrian Marlowe</p>
        </div>

        {/* Agent Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AgentCard 
            name="Hadrian" 
            role="Orchestrator" 
            quote="I am not the man I was..." 
            status="Active"
            color="amber"
          />
          <AgentCard 
            name="Valka" 
            role="Scholar" 
            quote="The universe is larger than we know..." 
            status="Standby"
            color="blue"
          />
          <AgentCard 
            name="Palino" 
            role="Executor" 
            quote="Give me a task..." 
            status="Standby"
            color="green"
          />
          <AgentCard 
            name="Lorian" 
            role="Infrastructure" 
            quote="Order is the foundation..." 
            status="Standby"
            color="red"
          />
          <AgentCard 
            name="Otavia" 
            role="Coordinator" 
            quote="Words are weapons..." 
            status="Standby"
            color="purple"
          />
        </div>

        {/* Status */}
        <div className="text-center text-slate-500">
          <p>System Status: <span className="text-green-400">Operational</span></p>
          <p className="text-sm mt-2">Awaiting directives from The Emperor</p>
        </div>
      </div>
    </main>
  );
}

interface AgentCardProps {
  name: string;
  role: string;
  quote: string;
  status: 'Active' | 'Standby' | 'Busy';
  color: 'amber' | 'blue' | 'green' | 'red' | 'purple';
}

function AgentCard({ name, role, quote, status, color }: AgentCardProps) {
  const colorClasses = {
    amber: 'border-amber-500/50 bg-amber-950/30',
    blue: 'border-blue-500/50 bg-blue-950/30',
    green: 'border-green-500/50 bg-green-950/30',
    red: 'border-red-500/50 bg-red-950/30',
    purple: 'border-purple-500/50 bg-purple-950/30',
  };

  const statusColors = {
    Active: 'text-green-400',
    Standby: 'text-slate-400',
    Busy: 'text-yellow-400',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} backdrop-blur`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{name}</h2>
        <span className={`text-sm ${statusColors[status]}`}>{status}</span>
      </div>
      <p className="text-sm text-slate-400 mb-3">{role}</p>
      <p className="text-sm italic text-slate-300">&ldquo;{quote}&rdquo;</p>
    </div>
  );
}
