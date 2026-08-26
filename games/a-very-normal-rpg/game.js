const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');

function printText(text) {
    const newParagraph = document.createElement('div');
    newParagraph.textContent = text;
    outputDiv.appendChild(newParagraph);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

class Potion {
    constructor(name, healAmount) {
        this.name = name;
        this.healAmount = healAmount;
    }
}

class Enemy {
    constructor(name, health, attackPower, defensePower) {
        this.name = name;
        this.health = health;
        this.attackPower = attackPower;
        this.defensePower = defensePower;
    }

    calculateDamageToPlayer(player) {
        let baseDamage = Math.floor(Math.random() * 10) + 1;
        return Math.max(0, baseDamage + this.attackPower - player.defensePower);
    }

    attackPlayer(player) {
        let damage = this.calculateDamageToPlayer(player);
        player.health -= damage;
        printText(`${this.name} attacks ${player.name} for ${damage} damage! ${player.name} has ${player.health} health remaining.`);
    }
}

class Player {
    constructor(name, money) {
        this.name = name;
        this.health = 100;
        this.maxHealth = 100;
        this.defensePower = 5;
        this.attackPower = 25; 
        this.level = 1;
        this.experience = 0;
        this.money = money;
        this.potions = [];
        this.hasUpgradedStats = false;
    }

    isAlive() {
        return this.health > 0;
    }

    calculateDamage(enemy) {
        let baseDamage = Math.floor(Math.random() * 10) + 1;
        return Math.max(0, baseDamage + this.attackPower - enemy.defensePower);
    }

    normalAttack(enemy) {
        let damage = this.calculateDamage(enemy);
        enemy.health -= damage;
        printText(`${this.name} attacks ${enemy.name} with a normal attack for ${damage} damage! ${enemy.name} has ${enemy.health} health remaining.`);
    }

    status() {
        printText(` | Player: ${this.name}\n | Level ${this.level}\n | XP: ${this.experience}\n | Health: ${this.health}/${this.maxHealth}\n | Attack : ${this.attackPower}\n | Defense: ${this.defensePower}\n | Money : ${this.money}`);
    }

    rng() {
        return Math.floor(Math.random() * 10) + 1;
    }

    upgradeStats() {
        if (!this.hasUpgradedStats) {
            let randomStat = Math.floor(Math.random() * 3) + 1;
            switch (randomStat) {
                case 1:
                    this.maxHealth += this.rng();
                    this.health = this.maxHealth;
                    printText("Your health has been increased!");
                    break;
                case 2:
                    this.attackPower += this.rng();
                    printText("Your attack has been increased!");
                    break;
                case 3:
                    this.defensePower += this.rng();
                    printText("Your defense has been increased!");
                    break;
                default:
                    printText("Invalid choice. No stat was increased.");
                    break;
            }
            this.hasUpgradedStats = true;
            this.levelUp();
            this.status();
        } else {
            printText("Stats have already been upgraded for this level.");
        }
    }

    levelUp() {
        if (this.experience >= 100 * this.level) {
            this.level++;
            this.experience = 0;
            this.hasUpgradedStats = false;
        }
    }

    usePotion() {
        if (this.potions.length > 0) {
            let potion = this.potions[0];
            this.health += potion.healAmount;
            printText(`${this.name} drinks ${potion.name} and restores ${potion.healAmount} health. Your health is now: ${this.health}/${this.maxHealth}`);
            this.potions.shift();
        } else {
            printText("There are no potions in your bag.");
        }
    }

    gainExperience(exp) {
        this.experience += exp;
        printText(`You gained ${exp} experience!`);
        while (this.experience >= 100 * this.level) {
            this.levelUp();
            printText(`Congratulations! You leveled up to level ${this.level}.`);
            this.status();
        }
    }
}

let player;
let currentState = "AWAITING_NAME";
const allEnemies = [

    // Humans
    new Enemy("Thief", 10, 3, 1),
    new Enemy("Guard", 15, 5, 2),
    new Enemy("Furry", 1, 1, 1),
    new Enemy("Weeb (Rare)", 10, 10, 1),
    new Enemy("Sorcerer", 35, 10, 5),
    new Enemy("Knight", 40, 10, 8),
    new Enemy("Clown (Rare)", 99, 1, 1),
    new Enemy("Ninja", 15, 30, 1),
    new Enemy("Sumo", 9, 9, 9),
    new Enemy("Samurai", 30, 7, 3),
    new Enemy("Idol Fan (Rare)", 5, 5, 5),
    new Enemy("Gamer (Rare)", 7, 7, 7),
    new Enemy("Ordinary Office Worker (Rare)", 4, 1, 2),
    new Enemy("Soldier", 30, 20, 10),
    new Enemy("Influencer (Rare)", 8, 8, 8),
    new Enemy("Mage", 15, 33, 6),
    new Enemy("Witch", 18, 31, 7),
    new Enemy("Warlock", 20, 31, 17),
    new Enemy("Brawler", 20, 15, 7),
    new Enemy("Cowboy", 10, 30, 5),
    new Enemy("Outlaw", 10, 28, 7),
    new Enemy("Robot", 20, 5, 20),
    new Enemy("Cyborg", 20, 10, 10),
    new Enemy("Hero (Rare)", 20, 20, 20),
    new Enemy("Villain (Rare)", 20, 20, 20),
    new Enemy("Hunter", 7, 13, 6),
    new Enemy("Police", 10, 10, 10),
    new Enemy("King (Rare)", 15, 15, 15),
    new Enemy("Murderer (Rare)", 15, 10, 10),
    new Enemy("Assasin", 7, 12, 7),

    // Animals
    new Enemy("Tiger", 22, 13, 3),
    new Enemy("Bear", 20, 10, 3),
    new Enemy("Piranha", 5, 12, 3),
    new Enemy("Gorilla", 30, 8, 8),
    new Enemy("Rabbit", 5, 3, 1),
    new Enemy("Ant (Rare)", 1, 1, 1),
    new Enemy("Spider", 2, 8, 1),
    new Enemy("Bat", 2, 8, 2),
    new Enemy("Snail (Rare)", 1, 1, 9),
    new Enemy("Shark", 5, 18, 3),
    new Enemy("Octopus (Rare)", 7, 8, 9),
    new Enemy("Crab", 6, 6, 9),
    new Enemy("Eagle (Rare)", 10, 20, 1),
    new Enemy("Turtle (Rare)", 20, 1, 20),
    new Enemy("Mosquito (Rare)", 1, 1, 1),
    new Enemy("Fly (Rare)", 1, 1, 1),
    new Enemy("Porcupine", 5, 7, 6),

    // Strange
    new Enemy("Car (???)", 30, 10, 10),
    new Enemy("Meteor (???)", 1, 45, 1),
    new Enemy("Alien", 1, 1, 30),
    new Enemy("Paper (???)", 1, 1, 1),
    new Enemy("Robot", 9, 1, 9),
    new Enemy("Cheese (???)", 2, 2, 2),
    new Enemy("Truck (???)", 1, 35, 1),
    new Enemy("Toilet (???)", 1, 3, 1),
    new Enemy("13 (???)", 13, 13, 13),
    new Enemy("Fixer (???)", 13, 13, 13),
    new Enemy("Round Tofu (???)", 1, 1, 1),
    new Enemy("BOB (???)", 1, 1, 1),

    // Monsters
    new Enemy("Goblin", 20, 8, 3),
    new Enemy("Orc", 33, 13, 3),
    new Enemy("Skeleton", 25, 6, 2),
    new Enemy("Vampire", 30, 15, 2),
    new Enemy("Slime", 10, 5, 2),
    new Enemy("Zombie", 28, 7, 3),
    new Enemy("Demon (Rare)", 66, 6, 6),
    new Enemy("Golem (Rare)", 50, 10, 10),
    new Enemy("Elf", 20, 14, 7),
    new Enemy("Griffin (Rare)", 23, 33, 8),
    new Enemy("Giant (Rare)", 33, 33, 8),
    new Enemy("Bloodfiend (Rare)", 23, 12, 8),
    new Enemy("Dragon (Rare)", 33, 35, 15),

    // Mythology Bosses
    new Enemy("Cerberus, The Hell Gatekeeper (BOSS)", 33, 23, 13),
    new Enemy("Kraken, The Sea Nightmare (BOSS)", 60, 28, 10),
    new Enemy("Leviathan, The Absolute Abyss (BOSS)", 45, 13, 13),
    new Enemy("Hydra, The Regenerating Terror (BOSS)", 99, 9, 9),
    new Enemy("Medusa, The Snake Queen (BOSS)", 36, 16, 26),
    new Enemy("Minotaurus, The Labyrinth King (BOSS)", 50, 10, 10),
    new Enemy("Chimera, The Three Headed Monster (BOSS)", 33, 23, 13),
    new Enemy("Cyclop, The One Eyed (BOSS)", 55, 12, 12),
    new Enemy("Lucifer, The Fallen Angel (BOSS)", 66, 66, 6),

    // Animal Bosses
    new Enemy("Megalodon, The Ancient Shark (BOSS)", 45, 20, 13),
    new Enemy("Tyrannosaurusrex, The Apex Predator (BOSS)", 45, 20, 13),
    new Enemy("Mammoth, The Artic Giant (BOSS)", 35, 18, 9),

    // Other World Bosses
    new Enemy("######, The Dragon of Freedom (BOSS)", 70, 28, 12),
    new Enemy("######, The Slime Demon (BOSS)", 100, 38, 8),
    new Enemy("######, The Shadow (BOSS)", 100, 42, 5),
    new Enemy("####, The Undying DOOM (BOSS)", 120, 25, 10),
    new Enemy("##, The Robot From Hell (BOSS)", 50, 50, 10),
    new Enemy("######, The Black Silence (BOSS)", 100, 30, 10),
    new Enemy("######, The Yellow Cantatiotura (BOSS)", 100, 10, 10),
    new Enemy("########, The Yellow Robot (BOSS)", 100, 20, 10),
    new Enemy("######, The Man Who Speaks in Hands (BOSS)", 66, 66, 66),
    new Enemy("#######, The Emanator of Nihility (BOSS)", 99, 59, 29),
    new Enemy("##### ####, The Planter of Apocalypse (BOSS)", 30, 20, 10),
    new Enemy("###### #####, The Withered Calamity (BOSS)", 60, 40, 20),
    new Enemy("#####, The Builderman (BOSS)", 50, 30, 20),
    new Enemy("###, The Wall Of Flesh (BOSS)", 130, 30, 20),
    new Enemy("##########, The Growganoth (BOSS)", 100, 40, 40),

    // Friends
    new Enemy("ReDoom, The Programmer of This Game (???)", 42, 6, 9),
    new Enemy("Keriescen, The Programmer of This Game (???)", 42, 6, 9),
    new Enemy("Unknown999GG, The Unknown Void (???)", 42, 6, 9),
    new Enemy("Xmeet, The Nuclear Harbringer (???)", 42, 6, 9),
    new Enemy("Feqed, The Mouse (777)", 42, 6, 9),
    new Enemy("Phynax, The First King (???)", 42, 6, 9),
    new Enemy("Dainzel, The Winter Veteran (???)", 42, 6, 9),
    new Enemy("Pinsen, The Guitar Prince (???)", 42, 6, 9)
];

function showMenu() {
    printText("\n=== Just Your Average RPG Main Menu ===");
    printText("1. Explore and Fight Enemies");
    printText("2. Enter the Shop");
    printText("3. Upgrade Stats");
    printText("4. View Player Stats");
    printText("5. Drink Potion");
    printText("6. Stop Playing");
}

function processCommand(input) {
    const cleanInput = input.trim();
    printText(`> ${cleanInput}`);

    if (currentState === "AWAITING_NAME") {
        let startingMoney = Math.floor(Math.random() * 11) + 5;
        player = new Player(cleanInput || "Hero", startingMoney);
        printText(`${player.name}... That's your name, right? How could you have forgotten it? You suddenly lose consciousness again, and the interface of this strange RPG game opens up.`);
        currentState = "MAIN_MENU";
        showMenu();
        return;
    }

    if (currentState === "MAIN_MENU") {
        switch (cleanInput) {
            case "1":
                let enemyTemplate = allEnemies[Math.floor(Math.random() * allEnemies.length)];
                let encounteredEnemy = new Enemy(enemyTemplate.name, enemyTemplate.health, enemyTemplate.attackPower, enemyTemplate.defensePower);
                
                printText(`\nYou encounter ${encounteredEnemy.name}! Get ready to fight.`);
                
                while (player.isAlive() && encounteredEnemy.health > 0) {
                    player.normalAttack(encounteredEnemy);
                    if (encounteredEnemy.health <= 0) {
                        printText(`${encounteredEnemy.name} has been defeated!`);
                        let moneyReward = 10 + enemyTemplate.health + enemyTemplate.attackPower + enemyTemplate.defensePower;
                        player.money += moneyReward;
                        printText(`You earned ${moneyReward} money. Your total money is now : ${player.money}`);
                        
                        let expGained = 45 + enemyTemplate.health + enemyTemplate.attackPower + enemyTemplate.defensePower;
                        player.gainExperience(expGained);
                        break;
                    }
                    encounteredEnemy.attackPlayer(player);
                }
                
                if (!player.isAlive()) {
                    printText(`NOOOOOOOOOO! ${player.name} You have been defeated by ${encounteredEnemy.name}.`);
                    printText("\nGame Over!\nThanks for playing! You died and were defeated. Good Game Well Played. You will now return to your original world.\n[SIMULATION TERMINATED]");
                    commandInput.disabled = true;
                } else {
                    player.levelUp();
                    showMenu();
                }
                break;
            case "2":
                currentState = "SHOP_MENU";
                printText("\nWelcome to the Shop!");
                printText("1. Buy Health Potion (Price: 20 money)"); 
                printText("2. Sell Health Potion (Sell Price 5 money)");
                printText("3. Exit Shop");
                break;
            case "3":
                player.upgradeStats();
                showMenu();
                break;
            case "4":
                player.status();
                showMenu();
                break;
            case "5":
                player.usePotion();
                showMenu();
                break;
            case "6":
                printText("You forcibly exit this strange RPG game.\n[SIMULATION TERMINATED]");
                commandInput.disabled = true;
                break;
            default:
                printText("Invalid choice. Please enter a valid input.");
                showMenu();
                break;
        }
        return;
    }

    if (currentState === "SHOP_MENU") {
        switch (cleanInput) {
            case "1":
                if (player.money >= 15) {
                    player.money -= 15;
                    player.potions.push(new Potion("Health Potion", 20));
                    printText(`You bought 1 health potion. Your money is now ${player.money}`);
                } else {
                    printText("You don't have enough money to buy a potion :( .");
                }
                printText("\n1. Buy | 2. Sell | 3. Exit Shop");
                break;
            case "2":
                if (player.potions.length > 0) {
                    player.money += 5;
                    player.potions.pop();
                    printText(`You sold 1 health potion. Your money is now : ${player.money}`);
                } else {
                    printText("There are no potions to sell.");
                }
                printText("\n1. Buy | 2. Sell | 3. Exit Shop");
                break;
            case "3":
                currentState = "MAIN_MENU";
                showMenu();
                break;
            default:
                printText("Invalid choice. Please enter a valid input.");
                printText("\n1. Buy | 2. Sell | 3. Exit Shop");
                break;
        }
    }
}

commandInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const command = commandInput.value;
        if (commandInput.disabled) return;
        processCommand(command);
        commandInput.value = '';
    }
});

printText("==============================");
printText("=== A Very Normal RPG Game ===");
printText("==============================");
printText("You suddenly wake up in this game world. You are playing a very strange RPG game. You come to your senses.");
printText("What is your name? : ");