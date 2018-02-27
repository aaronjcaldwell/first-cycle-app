import xs from 'xstream';
import { run } from '@cycle/run';
import { div, button, h1, h4, a, makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';

// Analogous to 'computer' function, readable side effects
function main(sources) { // 'sources' are like user event streams

  // Read side effects and set up call to back-end
  const click$ = sources.DOM.select('.get-random').events('click');

  const getRandomUser$ = click$.map(() => {
    const randomNum = Math.round(Math.random() * 9) + 1;
    return {
      url: `https://jsonplaceholder.typicode.com/users/${String(randomNum)}`,
      category: 'users',
      method: 'GET'
    };
  });

  const user$ = sources.HTTP.select('users')
    .flatten()
    .map(res => res.body)
    .startWith(null);

  const vdom$ = user$.map( user => 
    div('.users', [
      button('.get-random', 'Get random user'),
      user === null ? null : div('.user-details', [
        h1('.user-name', user.name),
        h4('.user-email', user.email),
        a('.user-website', {href: user.website}, user.website)
      ])
    ])
  );
  // Instructions to drivers to perform side effects
  return {
    DOM: vdom$,
    HTTP: getRandomUser$
  }
}

// Adapters for the external world
const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

run(main, drivers);
