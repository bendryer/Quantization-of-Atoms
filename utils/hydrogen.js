// Utilities for Hydrogen Atom Wavefunctions

// Factorial helper
function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// Generalized Laguerre Polynomial L_{n}^{alpha}(x)
function laguerre(n, alpha, x) {
  let L0 = 1;
  if (n === 0) return L0;
  let L1 = 1 + alpha - x;
  if (n === 1) return L1;

  for (let i = 2; i <= n; i++) {
    const nextL = ((2 * i - 1 + alpha - x) * L1 - (i - 1 + alpha) * L0) / i;
    L0 = L1;
    L1 = nextL;
  }
  return L1;
}

// Associated Legendre Polynomial P_l(x) (assuming m=0)
function legendre(l, x) {
  if (l === 0) return 1;
  if (l === 1) return x;
  
  let P0 = 1;
  let P1 = x;
  
  for (let i = 2; i <= l; i++) {
    const nextP = ((2 * i - 1) * x * P1 - (i - 1) * P0) / i;
    P0 = P1;
    P1 = nextP;
  }
  return P1;
}

/**
 * Calculates the value of the Hydrogen wavefunction psi(r, theta, phi)
 */
export function getHydrogenPsi(N, L, r, cosTheta) {
  if (N <= L) return 0;
  // Normalized radius rho = 2r / N 
  const rho = (2 * r) / N;

  // Radial Part R_nl
  const radial = Math.exp(-rho / 2) * Math.pow(rho, L) * laguerre(N - L - 1, 2 * L + 1, rho);

  // Angular Part Y_lm (m=0)
  const angular = legendre(L, cosTheta);

  return radial * angular;
}

/**
 * Find Radial Nodes (where Laguerre polynomial is zero)
 */
export function getRadialNodeRadii(N, L) {
  const n_poly = N - L - 1; // Degree of polynomial
  if (n_poly < 1) return [];

  const alpha = 2 * L + 1;
  const roots = [];
  
  const step = 0.05;
  const maxRho = 4 * N + 10; 
  
  let prevVal = laguerre(n_poly, alpha, 0);
  
  for (let rho = step; rho < maxRho; rho += step) {
    const val = laguerre(n_poly, alpha, rho);
    if (prevVal * val <= 0) {
      // Linear interpolation
      const frac = Math.abs(prevVal) / (Math.abs(prevVal) + Math.abs(val));
      const rootRho = rho - step + frac * step;
      
      // Convert rho back to r
      roots.push(rootRho * N / 2);
    }
    prevVal = val;
  }
  
  return roots;
}

/**
 * Find Angular Nodes (where Legendre polynomial is zero)
 */
export function getAngularNodeAngles(L) {
  if (L < 1) return [];

  const roots = [];
  
  const step = 0.01;
  let prevVal = legendre(L, -1);
  
  for (let x = -1 + step; x <= 1; x += step) {
    const val = legendre(L, x);
    if (prevVal * val <= 0) {
      const frac = Math.abs(prevVal) / (Math.abs(prevVal) + Math.abs(val));
      const rootX = (x - step) + frac * step;
      roots.push(Math.acos(rootX));
    }
    prevVal = val;
  }

  return roots;
}