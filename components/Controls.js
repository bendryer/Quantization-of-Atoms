import React from 'react';

const Controls = ({ state, onChange }) => {
  const isOrbital = state.viewMode === 'ORBITAL';
  const isString = state.viewMode === 'STRING';
  
  let radialLabel = 'Radial Quantum Number';
  let radialSymbol = 'n';
  let radialValue = state.n;
  let radialMin = 1;
  let radialMax = 5;

  if (isOrbital) {
    radialLabel = 'Principal Quantum Number';
    radialSymbol = 'N';
    radialValue = state.n + state.l;
    radialMin = state.l + 1;
    radialMax = state.l + 5;
  } else if (isString) {
    radialLabel = 'Harmonic Number';
    radialSymbol = 'n';
    radialValue = state.n;
    radialMin = 1;
    radialMax = 8;
  }
  
  const handleRadialChange = (val) => {
    if (isOrbital) {
      onChange({ n: val - state.l });
    } else {
      onChange({ n: val });
    }
  };

  return React.createElement('div', { className: "bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl w-full max-w-md" },
    React.createElement('h2', { className: "text-xl font-bold text-white mb-6 flex items-center gap-2" },
      React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-sky-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" })
      ),
      "Wave Controls"
    ),

    /* Mode Toggle */
    React.createElement('div', { className: "mb-8 bg-slate-900/50 p-1 rounded-lg flex border border-slate-700/50" },
      React.createElement('button', {
        onClick: () => onChange({ viewMode: 'STRING' }),
        className: `flex-1 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${state.viewMode === 'STRING' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`
      }, "1D String"),
      React.createElement('button', {
        onClick: () => onChange({ viewMode: 'DRUM' }),
        className: `flex-1 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${state.viewMode === 'DRUM' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`
      }, "2D Drum"),
      React.createElement('button', {
        onClick: () => onChange({ viewMode: 'ORBITAL' }),
        className: `flex-1 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${state.viewMode === 'ORBITAL' ? 'bg-gradient-to-r from-sky-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`
      }, "3D Orbital")
    ),

    React.createElement('div', { className: "space-y-6" },
      /* Angular Mode (l) */
      !isString && React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between mb-2" },
          React.createElement('label', { className: "text-sm font-medium text-slate-300" }, "Angular Quantum Number (", React.createElement('span', { className: "font-mono text-sky-400" }, "l"), ")"),
          React.createElement('span', { className: "text-sky-400 font-mono font-bold" }, state.l)
        ),
        React.createElement('input', {
          type: "range", min: "0", max: "5", step: "1", value: state.l,
          onChange: (e) => onChange({ l: parseInt(e.target.value) }),
          className: "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-all"
        }),
        React.createElement('p', { className: "text-xs text-slate-500 mt-1" }, "Determines the number of angular nodal planes.")
      ),

      /* Radial Mode (n) */
      React.createElement('div', null,
        React.createElement('div', { className: "flex justify-between mb-2" },
          React.createElement('label', { className: "text-sm font-medium text-slate-300" }, radialLabel, " (", React.createElement('span', { className: "font-mono text-rose-400" }, radialSymbol), ")"),
          React.createElement('span', { className: "text-rose-400 font-mono font-bold" }, radialValue)
        ),
        React.createElement('input', {
          type: "range", min: radialMin, max: radialMax, step: "1", value: radialValue,
          onChange: (e) => handleRadialChange(parseInt(e.target.value)),
          className: "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400 transition-all"
        }),
        React.createElement('p', { className: "text-xs text-slate-500 mt-1" },
          isOrbital ? "Energy Shell (N must be > l)." : isString ? "Number of antinodes (bumps) on the string." : "Number of radial nodal circles."
        )
      ),

      /* Orbital Specific Tools */
      state.viewMode === 'ORBITAL' && React.createElement('div', { className: "bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 space-y-4" },
         React.createElement('h3', { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Interrogation Tools"),
         React.createElement('div', null,
           React.createElement('div', { className: "flex justify-between mb-2" },
             React.createElement('label', { className: "text-sm font-medium text-slate-300" }, "Z-Slice Cut"),
             React.createElement('span', { className: "text-slate-400 font-mono" }, Math.round(state.slicePosition * 100) + "%")
           ),
           React.createElement('input', {
             type: "range", min: "0", max: "1", step: "0.01", value: state.slicePosition,
             onChange: (e) => onChange({ slicePosition: parseFloat(e.target.value) }),
             className: "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
           })
         ),
         React.createElement('div', null,
           React.createElement('div', { className: "flex justify-between mb-2" },
             React.createElement('label', { className: "text-sm font-medium text-slate-300" }, "Outer Shell Crop"),
             React.createElement('span', { className: "text-slate-400 font-mono" }, Math.round(state.radialClip * 100) + "%")
           ),
           React.createElement('input', {
             type: "range", min: "0", max: "1", step: "0.01", value: state.radialClip,
             onChange: (e) => onChange({ radialClip: parseFloat(e.target.value) }),
             className: "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
           })
         )
      ),

      /* Common Controls */
      React.createElement('div', { className: "grid grid-cols-2 gap-4" },
        state.viewMode === 'ORBITAL' ? React.createElement('div', null,
            React.createElement('label', { className: "text-xs font-medium text-slate-400 mb-1 block" }, "Node Clarity"),
            React.createElement('input', {
              type: "range", min: "1.0", max: "4.0", step: "0.1", value: state.probPower,
              onChange: (e) => onChange({ probPower: parseFloat(e.target.value) }),
              className: "w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            }),
            React.createElement('p', { className: "text-[10px] text-slate-500 mt-1" }, "Enhance empty regions")
        ) : React.createElement('div', null,
            React.createElement('label', { className: "text-xs font-medium text-slate-400 mb-1 block" }, "Speed"),
            React.createElement('input', {
              type: "range", min: "0.1", max: "3", step: "0.1", value: state.speed,
              onChange: (e) => onChange({ speed: parseFloat(e.target.value) }),
              className: "w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
            })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: "text-xs font-medium text-slate-400 mb-1 block" },
            state.viewMode === 'DRUM' ? 'Amp' : state.viewMode === 'STRING' ? 'Amp' : 'Density'
          ),
          React.createElement('input', {
            type: "range", min: "0.1", max: "2.5", step: "0.1", value: state.amplitude,
            onChange: (e) => onChange({ amplitude: parseFloat(e.target.value) }),
            className: "w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          })
        )
      ),

      /* Zoom & Brightness */
      React.createElement('div', { className: "grid grid-cols-2 gap-4" },
        React.createElement('div', null,
           React.createElement('label', { className: "text-xs font-medium text-slate-400 mb-1 block" }, "Zoom"),
           React.createElement('input', {
            type: "range", min: "0.2", max: "3", step: "0.1", value: state.zoom,
            onChange: (e) => onChange({ zoom: parseFloat(e.target.value) }),
            className: "w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
           })
        ),
        state.viewMode === 'ORBITAL' && React.createElement('div', null,
           React.createElement('label', { className: "text-xs font-medium text-slate-400 mb-1 block" }, "Brightness"),
           React.createElement('input', {
            type: "range", min: "0.5", max: "5.0", step: "0.1", value: state.particleBrightness,
            onChange: (e) => onChange({ particleBrightness: parseFloat(e.target.value) }),
            className: "w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
           })
        )
      ),

      /* Play/Pause */
      React.createElement('div', { className: "pt-2" },
        React.createElement('button', {
          onClick: () => onChange({ isPlaying: !state.isPlaying }),
          className: `w-full py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${state.isPlaying ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20'}`
        },
          state.isPlaying ? React.createElement('span', { className: "flex items-center gap-2" },
             React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" },
                 React.createElement('path', { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" })
             ),
             "Pause"
          ) : React.createElement('span', { className: "flex items-center gap-2" },
             React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" },
                 React.createElement('path', { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" })
             ),
             "Resume"
          )
        )
      )
    )
  );
};

export default Controls;