export default function (int) {
  const cast = (n, ref = int) => (typeof ref === "number" ? n : BigInt(n));
  let divisor = cast(2);
  const default_factorization = [];
  const detailed_factorization = [];

  const measureTimeStart = performance.now();
  while (int > 1) {
    if (int % divisor == 0) {
      default_factorization.push(divisor.toString()); //for bigints
      detailed_factorization.push(`${int} ÷ ${divisor}`);
      postMessage({
        facto: {
          default_factorization,
          detailed_factorization,
        },
      });
      int /= divisor;
    } else {
      divisor++;
    }
  }
  const measureTimeEnd = performance.now();

  postMessage({
    facto: {
      default_factorization,
      detailed_factorization,
      isPrime: default_factorization.length === 1,
    },
    about: measureTimeEnd - measureTimeStart,
  });
}
