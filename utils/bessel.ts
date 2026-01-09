// Zeros of Bessel functions J_n(x)
// n is the index (order), roots are the values of x where J_n(x) = 0
// We store the first 6 roots for n=0 to n=5
export const BESSEL_ROOTS: number[][] = [
  [2.4048, 5.5201, 8.6537, 11.7915, 14.9309, 18.0711], // n=0
  [3.8317, 7.0156, 10.1735, 13.3237, 16.4706, 19.6159], // n=1
  [5.1356, 8.4172, 11.6198, 14.7960, 17.9598, 21.1170], // n=2
  [6.3802, 9.7610, 13.0152, 16.2235, 19.4094, 22.5827], // n=3
  [7.5883, 11.0647, 14.3725, 17.6160, 20.8269, 24.0190], // n=4
  [8.7715, 12.3386, 15.7002, 18.9801, 22.2178, 25.4303], // n=5
];

/**
 * Computes the Bessel function of the first kind J_n(x)
 * Uses a series expansion for small x, which is sufficient for this visualization
 * or a standard approximation.
 * 
 * For this visualization, since we aren't doing high-precision engineering,
 * a standard numerical recipe or series is fine.
 * However, JS Math doesn't have it built-in.
 */
export function besselJ(n: number, x: number): number {
  if (x === 0) return n === 0 ? 1 : 0;
  
  // Optimization: For very large x, asymptotic forms could be used, 
  // but our x is bounded by the roots table (max ~25).
  // A simple sum is often enough for small arguments.
  // J_n(x) = sum_{k=0 to infinity} [ (-1)^k / (k! * (n+k)!) ] * (x/2)^(2k+n)
  
  let sum = 0;
  let term = 1;
  const halfX = x / 2;
  const limit = 20; // convergence usually fast for x < 20

  // Calculate the first term: (x/2)^n / n!
  let factorialN = 1;
  for (let i = 1; i <= n; i++) factorialN *= i;
  
  term = Math.pow(halfX, n) / factorialN;
  sum = term;

  for (let k = 1; k < limit; k++) {
    // Update term for next k:
    // term_{k} = term_{k-1} * (-1) * (halfX^2) / (k * (n+k))
    term *= -1 * (halfX * halfX) / (k * (n + k));
    sum += term;
    if (Math.abs(term) < 1e-10) break;
  }
  
  return sum;
}

/**
 * Get the m-th zero of J_n
 * m is 1-based index
 */
export function getBesselRoot(n: number, m: number): number {
  if (n < 0 || n >= BESSEL_ROOTS.length) return 0;
  if (m < 1 || m > BESSEL_ROOTS[0].length) return 0;
  return BESSEL_ROOTS[n][m - 1];
}
