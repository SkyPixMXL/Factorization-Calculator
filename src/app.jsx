import React from "react";

//default export
export default function App() {
  return (
    <>
      <h1>Factorization Calculator</h1>
      <Configuration />
    </>
  );
}

let web_worker;
const newWorkerInstance = () => {
  web_worker?.terminate();
  web_worker = new Worker(new URL("facto.js", import.meta.url));
  return web_worker;
};

const chooseAlgorithm = (number, config) => {
  const length = number.toString().length;
  if (config.algorithm === "automatic") {
    if (length > 6) {
      config.algorithm = "trial-div v2";
    } else {
      config.algorithm = "trial-division";
    }
  }
};

//utility functions
const setToStorage = (new_obj, key) =>
  localStorage.setItem(
    key,
    JSON.stringify({
      ...retrieveFromStorage(key),
      ...new_obj,
    })
  );

const retrieveFromStorage = (key) => JSON.parse(localStorage.getItem(key)); //returns null if key is inexistent

const downloadJSON = () =>
  Object.assign(document.createElement("a"), {
    href:
      "data:application/JSON," +
      encodeURIComponent(
        JSON.stringify(
          Object.keys(localStorage).reduce(
            (p, c) => ({ ...p, [c]: retrieveFromStorage(c) }),
            {}
          ),
          null,
          2
        )
      ),
    download: "your_history",
  }).click();

const findResultsInStorage = (number) => {
  for (const value of Object.values(
    retrieveFromStorage("facto_history") ?? {}
  )) {
    const index = value.detailed_factorization.findIndex((element) =>
      element.startsWith(`${number} ÷`)
    );
    if (index > -1) {
      return {
        default_factorization: value.default_factorization.slice(index),
        detailed_factorization: value.detailed_factorization.slice(index),
        isPrime: value.detailed_factorization.slice(index).length === 1,
      };
    }
  }
};

//Components (defined hierarchically)
function Configuration() {
  const [config, setConfig] = React.useState(
    retrieveFromStorage("configuration") ?? {
      /*nullish coalescing (??) operator returns right-hand value when left-hand value is null or undefined
      better than OR operator (//) because ?? doesn't consider "falsy" values, only null and undefined*/
      view: "default",
      algorithm: "automatic",
      useScientificNotation: false,
      alwaysUseBigInts: false,
      useLocalStorage: true,
      dark_theme: true,
    }
  );
  const [showBT, setShowBT] = React.useState(false);

  React.useEffect(() => setToStorage(config, "configuration"), [config]);
  //the useEffect callback runs whenever the states are updated, when re-rendering, or when component mounts

  const handleConfig = ({ target: { type, name, value, checked } }) => {
    setConfig((prev) => ({
      ...prev,
      [name]: type === "select-one" ? value : checked,
    }));
  };

  return (
    <>
      <details open={true} id="options">
        <summary title="set your config">Options:</summary>
        <section>
          <span title="Change factorization display style">
            <b>View:</b>
            <select name="view" value={config.view} onChange={handleConfig}>
              <option>default</option>
              <option>detailed</option>
            </select>
          </span>
          <span title="Choose the algorithm to be used (default is auto)">
            <b>Algorithm:</b>
            <select
              name="algorithm"
              value={config.algorithm}
              onChange={handleConfig}
            >
              <option>automatic</option>
              <option>trial-division</option>
              <option>trial-div v2</option>
              <option>quadratic-seive</option>
            </select>
          </span>
          <span title="Display numbers in scientific notation">
            <b>Use scientific notation</b>
            <input
              type="checkbox"
              checked={config.useScientificNotation}
              name="useScientificNotation"
              onChange={handleConfig}
            />
          </span>
          <span title="Always use bigint (this numeric primitive is used to 'safely' represent integers beyond MAX_SAFE_INTEGER)">
            <b>
              Always use{" "}
              <a
                href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt"
                target="_blank"
                rel="noopener"
              >
                BigInts
              </a>
            </b>
            <input
              type="checkbox"
              name="alwaysUseBigInts"
              checked={config.alwaysUseBigInts}
              onChange={handleConfig}
            />
          </span>
          <span title="This retrieves previous results from LocalStorage">
            <b>Use previous results</b>
            <input
              type="checkbox"
              checked={config.useLocalStorage}
              name="useLocalStorage"
              onChange={handleConfig}
            />
          </span>
          <span title="Perform a benchmarking test on your device">
            <b onClick={() => setShowBT(!showBT)}>Benchmarking test</b>
          </span>
          <span title="Clear localStorage">
            <b onClick={() => (localStorage.clear(), alert("History cleared"))}>
              Clear history
            </b>
          </span>
          <span title="Download your factorization history & config (json file)">
            <b onClick={downloadJSON}>Download history & config</b>
          </span>
          <span>
            <a
              target="_blank"
              rel="noopener"
              href="https://github.com/"
              title="For further info and explanations, check the github repo"
            >
              <b>Head to repository</b>
            </a>
          </span>
        </section>
      </details>

      <UserInput config={config} />
      {showBT && <BenchmarkingTest exit={() => setShowBT(false)} />}
      <Theme darkTheme={config.dark_theme} handleInput={handleConfig} />
    </>
  );
}

function UserInput({ config }) {
  const [input, setInput] = React.useState("");
  const [valid, setValidity] = React.useState(false);
  const [number, setNumber] = React.useState("");

  const handleInput = ({ target }) => (
    setInput(target.value), target.setCustomValidity("")
  );

  const handleOnInvalid = ({ target }) => (
    target.setCustomValidity("Enter a +integer > 1"), setValidity(false)
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    chooseAlgorithm(input, config);
    setNumber(
      input >= Number.MAX_SAFE_INTEGER || config.alwaysUseBigInts
        ? BigInt(input)
        : parseInt(input)
    );
    setValidity(true);
    if (window.matchMedia("(max-width: 700px)").matches)
      //for screens < 700px
      setTimeout(
        () =>
          window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: "smooth",
          }),
        100
        //adding some latency before scrolling down otherwise might not catch new scollHeight
      );
  };

  return (
    <>
      <form onSubmit={handleSubmit} onInvalid={handleOnInvalid}>
        <input
          type="text"
          value={input}
          onChange={handleInput}
          placeholder="+integer"
          pattern="^([2-9]|[1-9]+\d+)$"
          autoFocus
          required
        />
        <input type="submit" value="submit" />
      </form>

      {valid && <Factorization number={number} config={config} />}
    </>
  );
}

function Factorization({
  number,
  config: { view, algorithm, useScientificNotation, useLocalStorage },
}) {
  const [results, setResults] = React.useState({});
  const [aboutExecution, setAboutExecution] = React.useState("");

  React.useEffect(() => {
    //setting states to default values
    setResults({});
    setAboutExecution("");
    //check if number has already been factorized
    const resultsFromStorage = findResultsInStorage(number);
    if (resultsFromStorage && useLocalStorage) {
      setResults(resultsFromStorage);
      setAboutExecution("Retrieved from localStorage");
    } else {
      //if number is not in localStorage then launch a web worker instance
      const worker = newWorkerInstance();
      worker.postMessage({ number, algorithm });
      worker.onmessage = ({ data: { facto, about } }) => {
        setResults(facto);
        //checks if calculation has terminated
        if (typeof about === "number") {
          setAboutExecution(
            about === 0
              ? "Too fast to measure!"
              : parseFloat(about.toFixed(10)) + " ms"
          );
          //set results to localStorage
          setToStorage(
            {
              [number]: { algorithm: algorithm, ...facto },
              //no need to serialize bigints because they are later retrieved as strings
            },
            "facto_history"
          );
        }
      };
    }
  }, [number]);

  return (
    <>
      <AbortFacto
        terminated={results.hasOwnProperty("isPrime")} //checks if facto terminated
        setAboutExecution={setAboutExecution}
      />

      <details id="results" open={true}>
        <summary>Results:</summary>
        <section>
          <DisplayNumber
            number={number.toString()}
            useScientificNotation={useScientificNotation}
          />
          <DisplayFactorization
            mode={view}
            default_factorization={results?.default_factorization ?? []}
            //using optional chaining and nullish coalescing operators to avoid errors by setting a default value when property is inexistant
            detailed_factorization={results?.detailed_factorization ?? []}
          />
          <Prime isPrime={results?.isPrime} />
          <AboutExecution about={aboutExecution} />
        </section>
      </details>
    </>
  );
}

function DisplayNumber({ number, useScientificNotation }) {
  //https://stackoverflow.com/a/70471156
  const toScientificNotation = () => {
    const exponent = number.length - 1;
    if (exponent === 0)
      return (
        <>
          {number + " ×10"}
          <sup>0</sup>
        </>
      );
    let a = number.replace(/(0+)$/, "").charAt(0);
    if (number.replace(/(0+)$/, "").length > 1) {
      a += "." + number.replace(/(0+)$/, "").substring(1);
    }
    return (
      <>
        {a + " ×10"}
        <sup>{exponent}</sup>
      </>
    );
  };

  return (
    <span>
      <b>Number</b>: {useScientificNotation ? toScientificNotation() : number}
    </span>
  );
}

function DisplayFactorization({
  mode,
  default_factorization,
  detailed_factorization,
}) {
  const defaultView = default_factorization
    .reduce(
      (previous, current) =>
        current === previous[previous.length - 1][0]
          ? (previous[previous.length - 1][1]++, previous)
          : (previous.push([current, 1]), previous),
      [[]]
    )
    .slice(1)
    .map((element, index) => (
      <li key={index}>
        {element[1] > 1 ? (
          <>
            {element[0]}
            <sup>{element[1]}</sup>
          </>
        ) : (
          element[0]
        )}
      </li>
    ));

  const advancedView = detailed_factorization.map((element, index) => (
    <li key={index}>{element}</li>
  ));

  return (
    //casting this to boolean is necessary
    !!default_factorization.length && (
      <span>
        <b>Factorization</b>: {mode === "detailed" ? advancedView : defaultView}
      </span>
    )
  );
}

function Prime({ isPrime }) {
  return (
    typeof isPrime === "boolean" && (
      <span>
        <b>Prime:</b> {isPrime.toString()}
      </span>
    )
  );
}

function AboutExecution({ about }) {
  return (
    <span>
      <b>About</b>: {about || "operating..."}
    </span>
  );
}

function AbortFacto({ terminated, setAboutExecution }) {
  const [proposeAbort, setProposeAbort] = React.useState(false);

  React.useEffect(() => terminated && setProposeAbort(false), [proposeAbort]);

  React.useEffect(() => {
    setProposeAbort(false);
    const timer = setTimeout(() => setProposeAbort(true), 3000);
    return () => clearTimeout(timer); //cleanup function
  }, [terminated]);

  const handleAbort = () => {
    web_worker.terminate();
    setAboutExecution("operation aborted");
  };

  return (
    proposeAbort && (
      <div id="abort" onClick={handleAbort}>
        Abort Operation
      </div>
    )
  );
}

function BenchmarkingTest({ exit }) {
  const [clicked, setClicked] = React.useState(false);
  const [results, setResults] = React.useState({
    time: null,
    speed: "",
  });

  const performTest = () => {
    setClicked(true);
    const worker = newWorkerInstance();
    worker.postMessage({ number: 572070539, algorithm: "trial-div v1" });
    worker.onmessage = ({ data: { about } }) =>
      setResults({
        time: about,
        speed:
          about < 1000
            ? "incredibly fast!"
            : about < 1500
            ? "very fast!"
            : about < 2500
            ? "fast"
            : about < 3500
            ? "moderate"
            : about < 5000
            ? "slow"
            : "very slow",
      });
  };

  if (results.time) {
    return (
      <aside>
        <h2>Results</h2>
        <p>
          Your device computed calculation in{" "}
          <b>{Math.round(results.time)}ms</b>
          <br />
          Your device is <b>{results.speed}</b>
        </p>
        <button onClick={exit}>Go Back</button>
      </aside>
    );
  } else {
    return (
      <aside>
        <h2>Benchmarking Test</h2>
        <p>
          <b>Info:</b> This test will compute a calculation on your device and
          will measure time performance. <br />
          Note that results may change depending on your browser. For better
          results and comparison accuracy use Chrome (recent version).
          <br />
          The test generally lasts three seconds however might be slower or
          faster depending on your hardware capabilities. <br />
          Click on start to launch test.
        </p>
        <button onClick={performTest} disabled={clicked}>
          {clicked ? "operating..." : "start"}
        </button>
      </aside>
    );
  }
}

function Theme({ darkTheme, handleInput }) {
  React.useEffect(
    () =>
      darkTheme
        ? document.body.removeAttribute("data-theme")
        : document.body.setAttribute("data-theme", "light"),
    [darkTheme]
  );

  return (
    <div className="theme">
      ☀️
      <label htmlFor="theme-checkbox">
        <input
          type="checkbox"
          id="theme-checkbox"
          name="dark_theme"
          defaultChecked={darkTheme}
          onChange={handleInput}
        />
        <span className="slidebar"></span>
      </label>
      🌒
    </div>
  );
}
