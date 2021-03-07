// Pages
const gamePage = document.getElementById('gamePage');
const scorePage = document.getElementById('scorePage');
const splashPage = document.getElementById('splashPage');
const countdownPage = document.getElementById('countdownPage');
// Splash Page
const startForm = document.getElementById('sratForm');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0;

// Refresh game and show Best Scores
function bestScoresToDOM() {
  bestScores.forEach((score, index) => {
    const bestScoreEl = score;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  })
}

// Check Local Storage for best scores, set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

// Update est Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    // Slecet correct Best Score to update
    if (questionAmount == score.questions) {
      // Return best score as number with one decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update Splash page
  bestScoresToDOM();
  // Save to local storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

// Reset, store Best time & go back to splash page
function startOver() {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true; 
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
}

// Format & Display Time in DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  // Go back to Score page
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  gamePage.hidden = true;
  scorePage.hidden = false;
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 2000)
}

// Stop Timer, Process Results, go to Score page
function checkTime() {
  console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    console.log('player guess', playerGuessArray);
    clearInterval(timer);
    // Check for wrong guesses, add penalty time for wrong answers
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated == playerGuessArray[index]) {
        // Correct Guess, No Penalty
      } else {
        // Incorrect Guess, Add Penalty
        penaltyTime += 0.5;
      }
    })
    finalTime = timePlayed + penaltyTime;
    console.log('Base time', timePlayed, 'Penalty', penaltyTime, 'Final time', finalTime);
    scoresToDOM();
  }
}

// Add a tenth of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// Start timer when game page is clicked
function startTimer() {
  // Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
}

// Scroll, Store user selection in playerGuessArray
function select(guessedTrue) {
  // Scroll 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);
  return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
}
// Get Radom Number up to a max number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  console.log('correct', correctEquations);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log('wrong', wrongEquations);
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
  console.log('equations array', equationsArray);
  equationsToDOM();
}

// Add Equations to DOM
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement('div');
    item.classList.add('item');
    // Equation Text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  })
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);
  
  // Create Equations, Build Elements in DOM
  createEquations();
  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// Show Countdown
function showCountDown() {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  let countdownNum = 3;
  countdown.textContent = countdownNum;
  let count = setInterval(() => {
    countdownNum--;
    if (countdownNum >= 0) {
      if (countdownNum === 0) {
        countdown.textContent = 'Go!';
      } else {
        countdown.textContent = countdownNum;
      }
    } else {
      clearInterval(count);
      countdownPage.hidden = true;
      gamePage.hidden = false;
    }
  }, 1000)
  populateGamePage();
  playAgainBtn.hidden = true;
}

// Get the value from selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  })
  return radioValue;
}

// Form that decides how many questions for game
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (questionAmount) {
    showCountDown();
  }
}

// Event Listeners
startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remove Selected Label Styling
    radioEl.classList.remove('selected-label');
    // Add it back if radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  })
})

startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);
playAgainBtn.addEventListener('click', startOver);

// On load
getSavedBestScores();