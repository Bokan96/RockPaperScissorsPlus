/*
 * Enhanced Rock, Paper, Scissors (and more) game.
 * Adds durability to each weapon, allows the player to unlock additional
 * weapons (fire and air) every third round, and includes animations for
 * showing the computer's choice. Tooltips on each weapon describe what
 * other weapons it can defeat. Both player and computer share the same
 * durability counts for fairness.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM references
    const choicesContainer = document.getElementById('choicesContainer');
    const battleField = document.getElementById('battleField');
    const resultMessage = document.getElementById('resultMessage');
    const playerScoreEl = document.getElementById('playerScore');
    const computerScoreEl = document.getElementById('computerScore');
    const roundNumberEl = document.getElementById('roundNumber');
    const upgradeOverlay = document.getElementById('upgradeOverlay');
    const upgradeOptionsContainer = document.getElementById('upgradeOptions');

    // Game state
    let playerScore = 0;
    let computerScore = 0;
    let round = 1;

    // Define the weapons with their emoji and the list of other weapons they defeat.
    const weapons = {
        rock:     { emoji: '🪨', beats: ['scissors', 'fire'] },
        paper:    { emoji: '📄', beats: ['rock', 'air'] },
        scissors: { emoji: '✂️', beats: ['paper', 'air'] },
        fire:     { emoji: '🔥', beats: ['paper', 'scissors'] },
        air:      { emoji: '💨', beats: ['fire', 'paper'] }
    };

    // Weapons initially available to both player and computer
    let availableWeapons = ['rock', 'paper', 'scissors'];

    // Upgrades that can still be selected by the player
    let availableUpgrades = ['fire', 'air'];

    // Durability counters for each weapon for both players
    const playerDurability = { rock: 3, paper: 3, scissors: 3, fire: 0, air: 0 };
    const computerDurability = { rock: 3, paper: 3, scissors: 3, fire: 0, air: 0 };

    // Reference to the timeout used in showBattle to ensure messages don't overlap
    let battleTimeout = null;

    /**
     * Capitalises the first letter of a string.
     * @param {string} str
     */
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Updates the scoreboard display.
     */
    function updateScoreboard() {
        playerScoreEl.textContent = 'You: ' + playerScore;
        computerScoreEl.textContent = 'Computer: ' + computerScore;
        roundNumberEl.textContent = round;
    }

    /**
     * Update the durability counter shown on the button for a given weapon.
     * If the durability reaches zero, the button is disabled.
     * @param {string} w
     */
    function updateDurabilityUI(w) {
        const counter = document.getElementById('durability-' + w);
        if (counter) {
            counter.textContent = playerDurability[w];
        }
        if (playerDurability[w] <= 0) {
            disableWeaponButton(w);
        }
    }

    /**
     * Disables the button for a weapon that has no durability left.
     * @param {string} w
     */
    function disableWeaponButton(w) {
        const btn = choicesContainer.querySelector(`button[data-choice='${w}']`);
        if (btn) {
            btn.classList.add('disabled');
        }
    }

    /**
     * Determines the computer's choice from weapons that still have durability.
     * @returns {string} The computer's chosen weapon.
     */
    function getRandomComputerChoice() {
        const validChoices = availableWeapons.filter(w => computerDurability[w] > 0);
        if (validChoices.length === 0) {
            // Fallback: choose at random from all available (should not normally happen)
            return availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
        }
        return validChoices[Math.floor(Math.random() * validChoices.length)];
    }

    /**
     * Determines the outcome of a round.
     * @param {string} playerChoice
     * @param {string} computerChoice
     * @returns {'tie'|'player'|'computer'}
     */
    function determineOutcome(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) return 'tie';
        if (weapons[playerChoice].beats.includes(computerChoice)) return 'player';
        if (weapons[computerChoice].beats.includes(playerChoice)) return 'computer';
        return 'tie';
    }

    /**
     * Resets the battle field for the next round.
     */
    function resetBattleField() {
        battleField.innerHTML = '';
        battleField.style.display = 'none';
    }

    /**
     * Displays the player's and computer's choices with animations and highlights the winner.
     * @param {string} playerChoice
     * @param {string} computerChoice
     * @param {'tie'|'player'|'computer'} outcome
     */
    function showBattle(playerChoice, computerChoice, outcome) {
        battleField.innerHTML = '';
        // Create player icon
        const playerDiv = document.createElement('div');
        playerDiv.className = 'battle-icon shake';
        playerDiv.innerHTML = `<span class="emoji" aria-hidden="true">${weapons[playerChoice].emoji}</span><span class="label">${capitalize(playerChoice)}</span>`;
        // Create computer icon
        const computerDiv = document.createElement('div');
        computerDiv.className = 'battle-icon shake';
        computerDiv.innerHTML = `<span class="emoji" aria-hidden="true">${weapons[computerChoice].emoji}</span><span class="label">${capitalize(computerChoice)}</span>`;
        battleField.appendChild(playerDiv);
        battleField.appendChild(computerDiv);
        battleField.style.display = 'flex';
        // Clear any existing timeout so previous rounds don't update the message late
        if (battleTimeout) {
            clearTimeout(battleTimeout);
        }
        // Immediately clear message so old text doesn't linger
        resultMessage.textContent = '';
        // After animation, remove shake and apply winner/loser classes
        battleTimeout = setTimeout(() => {
            playerDiv.classList.remove('shake');
            computerDiv.classList.remove('shake');
            if (outcome === 'player') {
                playerDiv.classList.add('winner');
                computerDiv.classList.add('loser');
                resultMessage.textContent = `${capitalize(playerChoice)} beats ${computerChoice}. You win this round!`;
            } else if (outcome === 'computer') {
                playerDiv.classList.add('loser');
                computerDiv.classList.add('winner');
                resultMessage.textContent = `${capitalize(computerChoice)} beats ${playerChoice}. You lose this round!`;
            } else {
                resultMessage.textContent = `It's a tie! You both chose ${playerChoice}.`;
            }
        }, 500);
    }

    /**
     * Handles playing a single round of the game.
     * @param {string} playerChoice
     */
    function playRound(playerChoice) {
        // Determine computer's choice
        const computerChoice = getRandomComputerChoice();
        // Decrease durability counts
        playerDurability[playerChoice]--;
        computerDurability[computerChoice]--;
        updateDurabilityUI(playerChoice);
        // Determine outcome
        const outcome = determineOutcome(playerChoice, computerChoice);
        // Update scores
        if (outcome === 'player') {
            playerScore++;
        } else if (outcome === 'computer') {
            computerScore++;
        }
        // Display battle animations and message
        showBattle(playerChoice, computerChoice, outcome);
        // Increment round number
        round++;
        // Update scoreboard (includes round number)
        updateScoreboard();
        // Show upgrade overlay every third round if upgrades remain
        if ((round - 1) % 3 === 0 && availableUpgrades.length > 0) {
            showUpgradeOverlay();
        }
    }

    /**
     * Builds and displays the upgrade overlay allowing the player to choose a new weapon.
     */
    function showUpgradeOverlay() {
        // Populate upgrade options dynamically
        upgradeOptionsContainer.innerHTML = '';
        availableUpgrades.forEach(upg => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.dataset.upgrade = upg;
            // Add an emoji for the weapon
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'emoji';
            emojiSpan.style.fontSize = '2rem';
            emojiSpan.textContent = weapons[upg].emoji;
            const h3 = document.createElement('h3');
            h3.textContent = capitalize(upg);
            const p = document.createElement('p');
            // Describe what the new weapon can beat
            p.textContent = 'Beats: ' + weapons[upg].beats.join(', ');
            card.appendChild(emojiSpan);
            card.appendChild(h3);
            card.appendChild(p);
            upgradeOptionsContainer.appendChild(card);
        });
        // Display overlay
        upgradeOverlay.classList.add('active');
    }

    /**
     * Adds a new weapon to the player's and computer's arsenals.
     * @param {string} weapon
     */
    function addNewWeapon(weapon) {
        if (!availableUpgrades.includes(weapon)) return;
        // Remove from available upgrades
        availableUpgrades = availableUpgrades.filter(u => u !== weapon);
        // Add to available weapons list
        availableWeapons.push(weapon);
        // Set durability for both players
        playerDurability[weapon] = 3;
        computerDurability[weapon] = 3;
        // Create new button for the player
        const newBtn = document.createElement('button');
        newBtn.className = 'choice';
        newBtn.dataset.choice = weapon;
        newBtn.setAttribute('title', 'Beats: ' + weapons[weapon].beats.join(', '));
        newBtn.innerHTML = `<span class="emoji" aria-hidden="true">${weapons[weapon].emoji}</span><span class="label">${capitalize(weapon)}</span><span class="durability" id="durability-${weapon}">3</span>`;
        choicesContainer.appendChild(newBtn);
        // Hide the overlay
        upgradeOverlay.classList.remove('active');
    }

    /**
     * Event delegation for clicking on weapon buttons.
     */
    choicesContainer.addEventListener('click', event => {
        const btn = event.target.closest('button.choice');
        if (!btn) return;
        // If overlay is active, ignore weapon clicks
        if (upgradeOverlay.classList.contains('active')) return;
        const weapon = btn.dataset.choice;
        if (!weapon) return;
        // Ignore if durability is depleted
        if (playerDurability[weapon] <= 0) return;
        // Reset battle field for new round
        resetBattleField();
        // Play the round
        playRound(weapon);
    });

    /**
     * Handles clicks on upgrade cards within the overlay.
     */
    upgradeOptionsContainer.addEventListener('click', event => {
        const card = event.target.closest('.upgrade-card');
        if (!card) return;
        const weapon = card.dataset.upgrade;
        if (!weapon) return;
        addNewWeapon(weapon);
    });

    // Initialize scoreboard on load
    updateScoreboard();
});