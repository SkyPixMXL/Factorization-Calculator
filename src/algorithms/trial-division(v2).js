export default function (int) {
  const cast = (n, ref = int) => (typeof ref === "number" ? n : BigInt(n));
  let divisor = cast(2);
  const default_factorization = [];
  const detailed_factorization = [];

  const measureTimeStart = performance.now();
  while (int % divisor == 0) {
    default_factorization.push(divisor.toString());
    detailed_factorization.push(`${int} ÷ ${divisor}`);
    postMessage({
      facto: {
        default_factorization,
        detailed_factorization,
      },
    });
    int /= divisor;
  }
  divisor = cast(3);
  while (divisor * divisor <= int) {
    if (int % divisor == 0) {
      default_factorization.push(divisor.toString());
      detailed_factorization.push(`${int} ÷ ${divisor}`);
      postMessage({
        facto: {
          default_factorization,
          detailed_factorization,
        },
      });
      int /= divisor;
    } else {
      divisor += cast(2);
    }
  }
  if (int != 1) {
    default_factorization.push(int.toString());
    detailed_factorization.push(`${int} ÷ ${int}`);
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
