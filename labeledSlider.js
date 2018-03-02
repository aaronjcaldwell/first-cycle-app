
import xs from 'xstream';
import { run } from '@cycle/run';
import { div, input, h2, makeDOMDriver, span } from '@cycle/dom';

function renderSlider(label, value, unit, min, max) {
  return div([
    `${label} ${value}${unit}`,
    input('.slider', {
      attrs: {type: 'range', min, max, value}
    })
  ]);
}

function getSliderEvent(domSource) {
  return domSource.select(`.slider`)
    .events('input')
    .map(ev => ev.target.value)
}

function bmi(weight, height) {
  const heightMeters = height * 0.01;
  return Math.round(weight / (heightMeters * heightMeters));
}

// Interpret dom events (user's intents) into actions
function intent(domSource) {
  return getSliderEvent(domSource)
}

// Given action streams, output state stream
function model(actions$, props$) {
  const state$ = props$
    .map(props => actions$
      .map(val => ({
        label: props.label,
        unit: props.unit,
        min: props.min,
        value: val,
        max: props.max
      }))
      .startWith(props)
    )
    .flatten()
    .remember();
  return state$;
}

// Given state stream, visually represent state
function view(state$) {
  const vdom$ = state$
    .map(state =>
      div('.labeled-slider', [
        span('.label',
          state.label + ' ' + state.value + state.unit
        ),
        input('.slider', {
          attrs: {type: 'range', min: state.min, max: state.max, value: state.value}
        })
      ])
    );
  return vdom$;
}

// Analogous to 'computer' function, readable side effects
export default function LabeledSlider(sources) { // 'sources' are like user event streams
  const actions = intent(sources.DOM);
  const props$ = sources.props;
  const state$ = model(actions, props$);
  const vdom$ = view(state$);

  // Instructions to drivers to perform side effects
  return {
    DOM: vdom$,
    value: state$.map(state => state.value)
  }
}

// Adapters for the external world
const drivers = {
  DOM: makeDOMDriver('#slider'),
}