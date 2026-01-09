import React from 'react';

const InfoPanel: React.FC<{ l: number; n: number }> = ({ l, n }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 text-slate-300">
      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Physics & Quantum Analogy</h3>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <section>
          <h4 className="font-semibold text-rose-300 mb-1">1D: Vibrating String</h4>
          <p>
             The fundamental example of standing waves. A string of length L fixed at both ends.
          </p>
           <ul className="list-disc list-inside mt-2 text-slate-400">
            <li><span className="text-rose-400 font-mono">n</span>: Harmonic number (integer).</li>
            <li>Wave: <span className="font-mono text-xs">sin(nπx/L)cos(ωt)</span></li>
            <li>Nodes are points that never move.</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-sky-300 mb-1">2D: The Drum Skin</h4>
          <p>
            Circular membrane fixed at the rim. Governed by the 2D Wave Equation.
          </p>
          <ul className="list-disc list-inside mt-2 text-slate-400">
            <li><span className="text-sky-400 font-mono">l = {l}</span>: Angular Quantum Number (nodal diameters).</li>
            <li><span className="text-rose-400 font-mono">n = {n}</span>: Radial Quantum Number (nodal circles).</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-purple-300 mb-1">3D: Hydrogen Orbital</h4>
          <p>
            The <span className="text-white font-semibold">Schrödinger Equation</span> solution for the Hydrogen atom.
          </p>
          
          <div className="mt-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 font-mono text-xs">
             <div className="grid grid-cols-2 gap-2">
                 <span>Principal (N):</span> <span className="text-rose-400">{n + l}</span>
                 <span>Angular (l):</span> <span className="text-sky-400">{l}</span>
             </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 italic">
             Note: In simulation, 'n' controls radial nodes. Actual Principal Number N = n + l.
          </p>
        </section>
      </div>
    </div>
  );
};

export default InfoPanel;