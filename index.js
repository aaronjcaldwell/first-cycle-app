import xs from 'xstream';
import { run } from '@cycle/run';
import { div, input, h2, makeDOMDriver } from '@cycle/dom';
import LabeledSlider from './labeledSlider';

function renderSlider(label, value, unit, className, min, max) {
  return div([
    `${label} ${value}${unit}`,
    input(`.${className}`, {
      attrs: {type: 'range', min, max, value}
    })
  ]);
}

function renderWeightSlider(weight) {
  return renderSlider('Weight', weight, 'kg', 'weight', 40, 140);
}

function renderHeightSlider(height) {
  return renderSlider('Height', height, 'cm', 'height', 140, 210);
}

function getSliderEvent(domSource, className) {
  return domSource.select(`.${className}`)
    .events('input')
    .map(ev => ev.target.value)
}

function bmi(weight, height) {
  const heightMeters = height * 0.01;
  return Math.round(weight / (heightMeters * heightMeters));
}

// Interpret dom events (user's intents) into actions
function intent(domSource) {
  return {
    changeWeight$: getSliderEvent(domSource, 'weight'),
    changeHeight$: getSliderEvent(domSource, 'height')
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
function view(state$, childVDom$) {
  // return state$
  return xs.combine(state$, childVDom$)
    .map(([{weight, height, bmi}, childVDom]) =>
      div([
        renderWeightSlider(weight),
        renderHeightSlider(height),
        h2('BMI is ' + bmi),
        childVDom
      ])
    );
}

// Analogous to 'computer' function, readable side effects
function main(sources) { // 'sources' are like user event streams
  const childProps$ = xs.of({
    label: 'Weight',
    unit: 'kg',
    min: 40,
    max: 140,
    value: 70
  });
  const childSources = {
    DOM: sources.DOM,
    props: childProps$
  }
  const labeledSlider = LabeledSlider(childSources);

  const actions = intent(sources.DOM);
  const state$ = model(actions);

  const childVDom$ = labeledSlider.DOM;
  const childValue$ = labeledSlider.value;
  const vdom$ = view(state$, childVDom$);

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
