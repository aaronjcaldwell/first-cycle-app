import xs from 'xstream';
import { run } from '@cycle/run';
import { div, input, h2, makeDOMDriver } from '@cycle/dom';

function renderWeightSlider(weight) {
  return div([
    'Weight ' + weight + 'kg',
    input('.weight', {
      attrs: {type: 'range', min: 40, max: 140, value: weight}
    })
  ]);
}

function renderHeightSlider(height) {
  return div([
    'Height ' + height + 'cm',
    input('.height', {
      attrs: {type: 'range', min: 140, max: 210, value: height}
    })
  ]);
}

function bmi(weight, height) {
  const heightMeters = height * 0.01;
  return Math.round(weight / (heightMeters * heightMeters));
}

// Analogous to 'computer' function, readable side effects
function main(sources) { // 'sources' are like user event streams

  const weight$ = sources.DOM.select('.weight')
    .events('input')
    .map(ev => ev.target.value)
    .startWith(70);

  const height$ = sources.DOM.select('.height')
    .events('input')
    .map(ev => ev.target.value)
    .startWith(170);

  // State is an object (in this case) stream
  const state$ = xs.combine(weight$, height$)
    .map(([weight, height]) => {
      return {weight, height, bmi: bmi(height, weight)};
    });
  
  // State gets mapped to display
  const vdom$ = state$.map(({weight, height, bmi}) =>
    div([
      renderWeightSlider(weight),
      renderHeightSlider(height),
      h2('BMI is ' + bmi)
    ])
  );

  // Instructions to drivers to perform side effects
  return {
    DOM: vdom$
  }
}

// Adapters for the external world
const drivers = {
  DOM: makeDOMDriver('#app')
}

run(main, drivers);
