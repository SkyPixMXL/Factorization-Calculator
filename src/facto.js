import TrialDivision from "algorithms/trial-division";
import TrialDivisionV2 from "algorithms/trial-division(v2)";

self.addEventListener("message", ({ data: { number, algorithm } }) => {
  switch (algorithm) {
    case "trial-div v2":
      TrialDivisionV2(number);
      break;
    default:
      TrialDivision(number);
  }
});
