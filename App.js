import React, { useState } from 'react';
import DrumCanvas from './components/DrumCanvas.js';
import Controls from './components/Controls.js';
import InfoPanel from './components/InfoPanel.js';

const App = () => {
  const [state, setState] = useState({
    l: 1, // Start with a dipolar mode
    n: 1, // First radial mode
    isPlaying: true,
    speed: 0.8,
    amplitude: 1,
    showNodalLines: true,
    resolution: 100,
    viewMode: 'DRUM', // Default view
    zoom: 1.0,
    slicePosition: 0, // 0 = Full view (Slice plane at front)
    radialClip: 1.0, // 1.0 = Full view (Max radius)
    particleBrightness: 1.5, // Default brightness
    probPower: 1.5 // Default probability power (contrast)
  });

  const handleStateChange = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return React.createElement('div', { className: "min-h-screen bg-slate-900 text-slate-200 selection:bg-sky-500/30" },
    /* Header */
    React.createElement('header', { className: "bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50" },
      React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" },
        React.createElement('div', { className: "flex items-center gap-3" },
          React.createElement('div', { className: "w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20" },
            React.createElement('span', { className: "font-bold text-white text-lg" }, "Q")
          ),
          React.createElement('h1', { className: "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-400" }, "Quantum Drum")
        ),
        React.createElement('a', { href: "#", className: "text-sm font-medium text-slate-400 hover:text-white transition-colors" }, "Resonant Modes Visualization")
      )
    ),

    /* Main */
    React.createElement('main', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" },
      React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start" },
        /* Left Column */
        React.createElement('div', { className: "lg:col-span-7 flex flex-col items-center" },
          React.createElement('div', { className: "relative w-full aspect-square max-w-[600px] mx-auto" },
            React.createElement(DrumCanvas, {
                l: state.l,
                n: state.n,
                isPlaying: state.isPlaying,
                speed: state.speed,
                amplitude: state.amplitude,
                resolution: state.resolution,
                viewMode: state.viewMode,
                zoom: state.zoom,
                slicePosition: state.slicePosition,
                radialClip: state.radialClip,
                particleBrightness: state.particleBrightness,
                probPower: state.probPower
            }),
            /* Legend */
            React.createElement('div', { className: "absolute -bottom-12 left-0 right-0 flex justify-center gap-8 text-xs font-mono text-slate-400" },
              React.createElement('div', { className: "flex items-center gap-2" },
                React.createElement('div', { className: "w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" }),
                React.createElement('span', null, "Positive Phase (+)")
              ),
              state.viewMode === 'DRUM' && React.createElement('div', { className: "flex items-center gap-2" },
                React.createElement('div', { className: "w-3 h-3 rounded-full bg-slate-700 border border-slate-600" }),
                React.createElement('span', null, "Node (0)")
              ),
              React.createElement('div', { className: "flex items-center gap-2" },
                React.createElement('div', { className: "w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]" }),
                React.createElement('span', null, "Negative Phase (-)")
              )
            )
          )
        ),
        /* Right Column */
        React.createElement('div', { className: "lg:col-span-5 space-y-6" },
           React.createElement(Controls, { state: state, onChange: handleStateChange }),
           React.createElement(InfoPanel, { l: state.l, n: state.n })
        )
      )
    ),

    /* Footer */
    React.createElement('footer', { className: "mt-12 py-8 border-t border-slate-800 text-center text-slate-500 text-sm" },
       React.createElement('p', null, "Switch between Classical Membrane mechanics and Quantum Orbital mechanics.")
    )
  );
};

export default App;