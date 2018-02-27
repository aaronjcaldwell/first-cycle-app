import xs from 'xstream';
import { run } from '@cycle/run';
import { makeDOMDriver, div, input, p} from '@cycle/dom';

// Analogous to 'computer' function
function main(sources) { // 'sources' are like user event streams
console.log(sources)
  const sinks = {
    DOM: sources.DOM.select('input').events('change')
      .map(ev => ev.target.checked) 
      .startWith(false)
      .map( toggled => 
        div([
          input({attrs: {type: 'checkbox'}}), 
          'Toggle me',
          p(toggled ? 'ON' : 'not ON at all (OFF)')
        ])
      )
  };
  return sinks; // 'sinks' are like computer 'actuators'
}

// Adapters for the external world
const drivers = {
  // Takes a screen stream from computer and returns stream of
  // mouse & keyboard events
  DOM: makeDOMDriver('#app')
}

run(main, drivers);
