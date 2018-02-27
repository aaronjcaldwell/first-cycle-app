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

// Interpret dom events (user's intents) into actions
function intent(domSource) {
  return {
    changeWeight$: domSource.select('.weight')
      .events('input')
      .map(ev => ev.target.value),
    changeHeight$: domSource.select('.height')
      .events('input')
      .map(ev => ev.target.value)
  }
}

// Given action streams, output state stream
function model(actions) {
  const weight$ = actions.changeWeight$.startWith(70);
  const height$ = actions.changeHeight$.startWith(170);

  // State is an object (in this case) stream
  return xs.combine(weight$, height$)
    .map(([weight, height]) => {
      return {weight, height, bmi: bmi(weight, height)};
    });
}

// Given state stream, visually represent state
function view(state$) {
  return state$.map(({weight, height, bmi}) =>
    div([
      renderWeightSlider(weight),
      renderHeightSlider(height),
      h2('BMI is ' + bmi)
    ])
  );
}


// Analogous to 'computer' function, readable side effects
function main(sources) { // 'sources' are like user event streams
  const actions = intent(sources.DOM);
  const state$ = model(actions);
  const vdom$ = view(state$);

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
