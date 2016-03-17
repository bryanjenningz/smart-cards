var view = React.createClass.bind(React);
var rootEl = document.querySelector('#app');
var initialState = {
  index: 0,
  backShown: false,
  cardsTotal: 3,
  cardsUnseen: 3,
  cardsDone: 0,
  cardsFailed: 0,
  cardsLeft: 3,
  cards: initializeCards(),
  finishedCards: []
};

function initializeCards() {
  var cards = [];
  for (var i = 1; i <= 3; i++) {
    cards.push({
      front: 'Test front ' + i,
      back: 'Test back ' + i,
      passes: 0,
      fails: 0,
      encounters: 0,
      nextTime: new Date().getTime()
    });
  }
  return cards;
}

function minutesFromNow(minutes) {
  return minutes * 60000 + new Date().getTime();
}
function hoursFromNow(hours) {
  return hours * 60000 * 60 + new Date().getTime();
}

var showIf = (condition, element) => condition ? element : '';
var hideIf = (condition, element) => !condition ? element : '';

var scoreCard = function({ cards, index, score }) {
  var currentCard = cards[index];
  return cards.slice(0, index).concat(
    Object.assign({}, currentCard, {
      score: score === 'FAIL' ? minutesFromNow(0.5) :
        score === 'PASS' ? minutesFromNow(5) :
        score === 'PERFECT' ? minutesFromNow(10) : minutesFromNow(1)
    })
  ).concat(cards.slice(index + 1));
};

var card = function(state, action) {
  if (state === undefined) return initialState;
  switch (action.type) {
    case 'SHOW_BACK':
      return Object.assign({}, state, {backShown: true});

    case 'NEXT_CARD':
      var currentCard = state.cards[state.index];
      var currentIndex = state.index;

      switch (action.score) {
        case 'FAIL':
          return Object.assign({}, state, {
            index: state.index === state.cardsLeft - 1 ? 0 : state.index + 1,
            backShown: false
          });

        case 'PASS':
        case 'PERFECT':
          var nextState = Object.assign({}, state);
          return Object.assign({}, nextState, {
            cards: state.cards.slice(0, currentIndex).concat(state.cards.slice(currentIndex + 1)),
            cardsLeft: state.cardsLeft - 1,
            index: state.index === state.cardsLeft - 1 ? 0 : state.index + 1, 
            backShown: false
          });
      }

    default:
      return state;
  }
};

var App = view({
  render: function() {
    return (
      <div>
        <Card />
      </div>
    );
  }
});

var GoalTracker = view({
  render() {
    var state = store.getState();
    return (
      <div className="goal-tracker">
        <span className="goal-total">Total: {state.cardsTotal}, </span>
        <span className="goal-done">Done: {state.cardsDone}, </span>
        <span className="goal-failed">Failed: {state.cardsFailed}, </span>
        <span className="goal-unseen">Unseen: {state.cardsUnseen} </span>
      </div>
    );
  }
});

var CardButtons = view({
  render() {
    var state = store.getState();
    return (
      <div className="card-buttons col-xs-11 col-sm-9">
        {hideIf(state.backShown, <button className="btn btn-lg btn-default col-xs-12" onClick={() => store.dispatch({type: 'SHOW_BACK'})}>Show Back</button>)}
        {showIf(state.backShown, <button className="btn btn-lg btn-default col-xs-4" onClick={() => store.dispatch({type: 'NEXT_CARD', score: 'FAIL'})}>Fail</button>)}
        {showIf(state.backShown, <button className="btn btn-lg btn-default col-xs-4" onClick={() => store.dispatch({type: 'NEXT_CARD', score: 'PASS'})}>Pass</button>)} 
        {showIf(state.backShown, <button className="btn btn-lg btn-default col-xs-4" onClick={() => store.dispatch({type: 'NEXT_CARD', score: 'PERFECT'})}>Perfect</button>)}
      </div> 
    );
  }
});

var Card = view({
  render: function() {
    var state = store.getState();
    var current = state.cards[state.index];

    return current ? (
      <div className="container card">
        <div className="jumbotron card-inner">
          <GoalTracker />
          <div>{current.front}</div>
          {showIf(state.backShown, <hr />)}
          {showIf(state.backShown, <div>{current.back}</div>)}
          <CardButtons />
        </div>
      </div>
    ) : (
      <div>Finished!</div>
    );
  }
});

var render = function() {
  ReactDOM.render(<App />, rootEl);
};
var store = Redux.createStore(card);
store.subscribe(render);
render();