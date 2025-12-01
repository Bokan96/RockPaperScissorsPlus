/*
 * JavaScript powering the Rock Paper Scissors game.
 * Handles player input, random computer selections, scoring, upgrade logic
 * and responsive feedback for the user.
 */

// Grab references to DOM elements we need to update
const choices = document.querySelectorAll('.choice');
const resultMessage = document.getElementById('resultMessage');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const roundNumberEl = document.getElementById('roundNumber');
const upgradeOverlay = document.getElementById('upgradeOverlay');
const upgradeCards = document.querySelectorAll('.upgrade-card');

// Game state variables
let playerScore = 0;
let computerScore = 0;
let round = 1;

// Effects that may be active after picking an upgrade
const effects = {
    double: false,
    shield: false,
    reveal: false
};

// When reveal is active, we preselect the computer's next choice
let nextComputerChoice = null;

/**
 * Returns a random choice of 'rock', 'paper' or 'scissors'.
 */
function getRandomChoice() {
    const options = ['rock', 'paper', 'scissors'];
    return options[Math.floor(Math.random() * options.length)];
}

/**
 * Capitalises the first letter of a string.
 * @param {string} str
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Updates the scoreboard DOM elements based on the current scores.
 */
function updateScoreboard() {
    playerScoreEl.textContent = `You: ${playerScore}`;
    computerScoreEl.textContent = `Computer: ${computerScore}`;
}

/**
 * Displays a message to the player indicating the outcome of the round.
 * @param {string} msg
 */
function showResult(msg) {
    resultMessage.textContent = msg;
}

/**
 * Applies the selected upgrade. Only one upgrade is active per pick.
 * @param {string} upgrade - 'double', 'shield' or 'reveal'
 */
function applyUpgrade(upgrade) {
    // Reset all effects first to ensure only selected effect is active
    effects.double = false;
    effects.shield = false;
    effects.reveal = false;
    
    if (upgrade === 'double') {
        effects.double = true;
    } else if (upgrade === 'shield') {
        effects.shield = true;
    } else if (upgrade === 'reveal') {
        effects.reveal = true;
        // Preselect the computer's next choice and display it
        nextComputerChoice = getRandomChoice();
        displayReveal(nextComputerChoice);
    }
}

/**
 * Shows or hides the upgrade overlay. When showing, the overlay will pause game input.
 * @param {boolean} show
 */
function toggleUpgradeOverlay(show) {
    if (show) {
        upgradeOverlay.classList.add('active');
    } else {
        upgradeOverlay.classList.remove('active');
    }
}

/**
 * Handles the core logic of playing one round of Rock Paper Scissors.
 * Determines winner, updates scores and handles effects.
 * @param {string} playerChoice - the player's selection
 * @param {string} computerChoice - the computer's selection
 */
function playRound(playerChoice, computerChoice) {
    // Determine outcome
    let outcome;
    if (playerChoice === computerChoice) {
        outcome = 'tie';
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        outcome = 'win';
    } else {
        outcome = 'lose';
    }

    // Compose result message and adjust scores based on active effects
    if (outcome === 'tie') {
        showResult(`It's a tie! You both chose ${playerChoice}.`);
    } else if (outcome === 'win') {
        const pointsEarned = effects.double ? 2 : 1;
        playerScore += pointsEarned;
        showResult(`You win! ${capitalize(playerChoice)} beats ${computerChoice}.` + (effects.double ? ' (Double points!)' : ''));
    } else {
        if (effects.shield) {
            // Loss is nullified due to shield
            showResult(`Invincibility! Loss nullified. ${capitalize(computerChoice)} would have beaten ${playerChoice}.`);
        } else {
            computerScore += 1;
            showResult(`You lose! ${capitalize(computerChoice)} beats ${playerChoice}.`);
        }
    }

    // After playing a round, update scoreboard
    updateScoreboard();

    // Reset one-time effects (double and shield) after they have been used
    if (effects.double) effects.double = false;
    if (effects.shield) effects.shield = false;

    // If reveal was used, hide the reveal display and reset
    if (effects.reveal) {
        removeReveal();
        effects.reveal = false;
        nextComputerChoice = null;
    }

    // Increment round and update UI
    round++;
    roundNumberEl.textContent = round;

    // Show upgrade overlay every third round (i.e. after rounds 3,6,9...)
    if ((round - 1) % 3 === 0) {
        toggleUpgradeOverlay(true);
    }
}

/**
 * Displays a small notice showing the computer's next move when the reveal upgrade is active.
 * @param {string} choice - preselected computer choice
 */
function displayReveal(choice) {
    // Remove any existing reveal boxes
    removeReveal();
    const revealDiv = document.createElement('div');
    revealDiv.id = 'revealBox';
    revealDiv.className = 'reveal-box';
    revealDiv.textContent = `Computer will choose ${choice} next round.`;
    document.querySelector('.container').appendChild(revealDiv);
}

/**
 * Removes the reveal box from the DOM if it exists.
 */
function removeReveal() {
    const box = document.getElementById('revealBox');
    if (box) {
        box.remove();
    }
}

/* Event listeners */

// Listen for player choices
choices.forEach(button => {
    button.addEventListener('click', () => {
        // If upgrade overlay is open, ignore clicks
        if (upgradeOverlay.classList.contains('active')) return;
        const playerChoice = button.dataset.choice;
        const computerChoice = effects.reveal && nextComputerChoice ? nextComputerChoice : getRandomChoice();
        playRound(playerChoice, computerChoice);
    });
});

// Listen for upgrade selections
upgradeCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedUpgrade = card.dataset.upgrade;
        applyUpgrade(selectedUpgrade);
        // Hide overlay after an upgrade is chosen
        toggleUpgradeOverlay(false);
    });
});

// Initialize scoreboard on page load
updateScoreboard();