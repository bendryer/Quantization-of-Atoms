import React from 'react';

const InfoPanel = ({ l, n }) => {
  return React.createElement('div', { className: "bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 text-slate-300" },
    React.createElement('h3', { className: "text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2" }, "Physics & Quantum Analogy"),
    React.createElement('div', { className: "space-y-4 text-sm leading-relaxed" },
      React.createElement('section', null,
        React.createElement('h4', { className: "font-semibold text-rose-300 mb-1" }, "1D: Vibrating String"),
        React.createElement('p', null, "The fundamental example of standing waves. A string of length L fixed at both ends."),
        React.createElement('ul', { className: "list-disc list-inside mt-2 text-slate-400" },
          React.createElement('li', null, React.createElement('span', { className: "text-rose-400 font-mono" }, "n"), ": Harmonic number (integer)."),
          React.createElement('li', null, "Wave: ", React.createElement('span', { className: "font-mono text-xs" }, "sin(nπx/L)cos(ωt)")),
          React.createElement('li', null, "Nodes are points that never move.")
        )
      ),
      React.createElement('section', null,
        React.createElement('h4', { className: "font-semibold text-sky-300 mb-1" }, "2D: The Drum Skin"),
        React.createElement('p', null, "Circular membrane fixed at the rim. Governed by the 2D Wave Equation."),
        React.createElement('ul', { className: "list-disc list-inside mt-2 text-slate-400" },
          React.createElement('li', null, React.createElement('span', { className: "text-sky-400 font-mono" }, `l = ${l}`), ": Angular Quantum Number (nodal diameters)."),
          React.createElement('li', null, React.createElement('span', { className: "text-rose-400 font-mono" }, `n = ${n}`), ": Radial Quantum Number (nodal circles).")
        )
      ),
      React.createElement('section', null,
        React.createElement('h4', { className: "font-semibold text-purple-300 mb-1" }, "3D: Hydrogen Orbital"),
        React.createElement('p', null, "The ", React.createElement('span', { className: "text-white font-semibold" }, "Schrödinger Equation"), " solution for the Hydrogen atom."),
        React.createElement('div', { className: "mt-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 font-mono text-xs" },
          React.createElement('div', { className: "grid grid-cols-2 gap-2" },
            React.createElement('span', null, "Principal (N):"), React.createElement('span', { className: "text-rose-400" }, n + l),
            React.createElement('span', null, "Angular (l):"), React.createElement('span', { className: "text-sky-400" }, l)
          )
        ),
        React.createElement('p', { className: "text-xs text-slate-500 mt-1 italic" }, "Note: In simulation, 'n' controls radial nodes. Actual Principal Number N = n + l.")
      )
    )
  );
};

export default InfoPanel;