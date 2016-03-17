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
  cards: [
    {front: 'Test first front', back: 'Test first back'},
    {front: 'Second front card', back: 'Second back card'},
    {front: 'Third card', back: 'This is the third back'}
  ],
  finishedCards: []
};

var showIf = (condition, element) => condition ? element : '';
var hideIf = (condition, element) => !condition ? element : '';

// Reducers
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
  render: function() {
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
  render: function() {
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
