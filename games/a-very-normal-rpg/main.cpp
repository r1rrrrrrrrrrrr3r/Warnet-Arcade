#include <iostream> 
#include <string>    
#include <cstdlib>
#include <ctime>
#include <vector>
using namespace std;

class Enemy;

class Potion {
    public:
        string name;
        int healAmount;

        Potion(string name, int healAmount) : name(name), healAmount(healAmount) {}
};

class Player {
    public:
        string name;
        int health;
        int maxHealth;
        int defensePower;
        int attackPower;
        int level;
        int experience;
        int upgradeCooldown;
        time_t lastUpgrade;
        int money;
        vector<Potion> potions;
        bool hasUpgradedStats;

    public:
        Player(
        string name,
        int health,
        int attackPower,
        int defensePower,
        int upgradeCooldown,
        int money)
        :
        name(name), 
        health(health),
        maxHealth(health),
        defensePower(defensePower),
        attackPower(attackPower + 5),
        level(1),
        experience(0),
        upgradeCooldown(upgradeCooldown),
        lastUpgrade(0),
        money(money),
        hasUpgradedStats(false)
    {}
        void normalAttack(Enemy& enemy);
        bool isAlive() const;
        void status() const;
        void upgradeStats();
        void levelUp();
        int rng() const;
        void usePotion();
        void gainExperience(int exp);

    private:
        int calculateDamage(const Enemy& enemy) const;
};

class Enemy {
    public:
        string name;
        int health;
        int attackPower;
        int defensePower;

        Enemy(
            string name, 
            int health,
            int attackPower,
            int defensePower)
            :
            name(name),
            health(health),
            attackPower(attackPower),
            defensePower(defensePower)
            {}
        
        void attackPlayer(Player& player);

    private:
        int calculateDamageToPlayer(const Player& player) const;
};

class RPG {
    private:
        Player& player;
        vector<Enemy> allEnemies;

    public:
        RPG(Player& player): player (player) { 

        //Humans
        allEnemies.push_back(Enemy("Thief", 10, 3, 1));
        allEnemies.push_back(Enemy("Guard", 15, 5, 2));
        allEnemies.push_back(Enemy("Furry", 1, 1, 1));
        allEnemies.push_back(Enemy("Weeb (Rare)", 10, 10, 1));
        allEnemies.push_back(Enemy ("Sorcerer", 35, 10, 5)); 
        allEnemies.push_back(Enemy("Knight",40, 10, 8) ); 
        allEnemies.push_back(Enemy("Clown (Rare)", 99, 1, 1));
        allEnemies.push_back(Enemy("Ninja", 15, 30, 1));
        allEnemies.push_back(Enemy ("Sumo", 9, 9, 9));
        allEnemies.push_back(Enemy("Samurai", 30, 7, 3));
        allEnemies.push_back(Enemy ("Idol Fan (Rare)", 5, 5, 5));
        allEnemies.push_back(Enemy ("Gamer (Rare)", 7, 7, 7));
        allEnemies.push_back(Enemy ("Ordinary Office Worker", 4, 1, 2));
        allEnemies.push_back(Enemy("Soldier", 30, 20, 10));
        allEnemies.push_back(Enemy ("Youtuber", 8, 8, 8));

        //Animals
        allEnemies.push_back(Enemy ("Tiger", 22, 13, 3));
        allEnemies.push_back(Enemy("Bear", 20, 10, 3));
        allEnemies.push_back(Enemy("Piranha", 5, 12, 3)); 
        allEnemies.push_back(Enemy ("Gorilla", 30, 8, 8));
        allEnemies.push_back(Enemy("Rabbit", 5, 3, 1));
        allEnemies.push_back(Enemy ("Ant (Rare)", 1, 1, 1));
        allEnemies.push_back(Enemy ("Spider", 2, 8, 1));
        allEnemies.push_back(Enemy("Bat", 2, 8, 2));
        allEnemies.push_back(Enemy ("Snail (Rare)", 1, 1, 9));
        allEnemies.push_back(Enemy("Shark", 5, 18, 3));
        allEnemies.push_back(Enemy("Octopus (Rare)", 7, 8, 9));
        allEnemies.push_back(Enemy ("Crab", 6, 6, 9));
        allEnemies.push_back(Enemy("Eagle (Rare)", 10, 20, 1));
        allEnemies.push_back(Enemy ("Turtle (Rare)", 20, 1, 20));

        //Strange
        allEnemies.push_back(Enemy("Car (???)", 30, 10, 10));
        allEnemies.push_back(Enemy ("Meteor (???)", 1, 45, 1)); 
        allEnemies.push_back(Enemy("Alien", 1, 1, 30));
        allEnemies.push_back(Enemy ("Paper (???)", 1, 1, 1));
        allEnemies.push_back(Enemy("Robot", 9, 1, 9)); 
        allEnemies.push_back(Enemy("Cheese (???)", 2, 2, 2));
        allEnemies.push_back(Enemy("Truck (???)", 1, 35, 1));
        allEnemies.push_back(Enemy("Toilet (???)", 1, 3, 1));
        allEnemies.push_back(Enemy("13 (???)", 13, 13, 13));

        //Monsters
        allEnemies.push_back(Enemy("Goblin", 20, 8, 3));
        allEnemies.push_back(Enemy("Orc", 33, 13, 3));
        allEnemies.push_back(Enemy("Skeleton", 25, 6, 2));
        allEnemies.push_back(Enemy("Vampire", 30, 15, 2));
        allEnemies.push_back(Enemy("Slime", 10, 5, 2));
        allEnemies.push_back(Enemy("Zombie", 28, 7, 3));
        allEnemies.push_back(Enemy("Demon (Rare)", 66, 6, 6));
        allEnemies.push_back(Enemy("Golem (Rare)", 50, 10, 10));
        allEnemies.push_back(Enemy("Elf", 20, 14, 7));
        allEnemies.push_back(Enemy("Griffin (Rare)", 23, 33, 8));

        //Bosses (High Stats)

        //Mythology Bosses
        allEnemies.push_back(Enemy("Cerberus, The Hell Gatekeeper (BOSS)", 33, 23, 13));
        allEnemies.push_back(Enemy("Kraken, The Sea Nightmare (BOSS)", 60, 28, 10));
        allEnemies.push_back(Enemy("Leviathan, The Absolute Abyss (BOSS)", 45, 13, 13));
        allEnemies.push_back(Enemy("Hydra, The Regenerating Terror (BOSS)", 99, 9, 9));
        allEnemies.push_back(Enemy ("Medusa, The Snake Queen (BOSS)", 36, 16, 26));
        allEnemies.push_back(Enemy ("Minotaurus, The Labyrinth King (BOSS)", 50, 10, 10)); 
        allEnemies.push_back(Enemy("Chimera, The Three Headed Monster (BOSS)", 33, 23, 13));
        allEnemies.push_back(Enemy("Cyclop, The One Eyed (BOSS)", 55, 12, 12));
        allEnemies.push_back(Enemy ("Lucifer, The Fallen Angel (BOSS)", 66, 66, 6));

        //Animal Bosses
        allEnemies.push_back(Enemy("Megalodon, The Ancient Shark (BOSS)", 45, 20, 13));
        allEnemies.push_back(Enemy("Tyrannosaurusrex, The Apex Predator (BOSS)", 45, 20, 13));
        allEnemies.push_back(Enemy ("Mammoth, The Artic Giant (BOSS)", 35, 18, 9));

        //Other World Bosses   
        allEnemies.push_back(Enemy("Dvalin, The Dragon of Freedom (BOSS)", 70, 28, 12));
        allEnemies.push_back(Enemy("Rimuru, The Slime Demon (BOSS)", 100, 38, 8));
        allEnemies.push_back(Enemy("Shadow, The Mysterious Leader (BOSS)", 100, 42, 5));
        allEnemies.push_back(Enemy("Nuclear Monster, The Undying Doom (BOSS)", 120, 25, 10));
        allEnemies.push_back(Enemy("V1, The Robot From Hell (BOSS)", 30, 20, 10));

        //Friends (Same stats for everyone so nobody complains)
        allEnemies.push_back(Enemy ("ReDoom, The Programmer of This Game (???)", 42, 6, 9));
        allEnemies.push_back(Enemy("Keriescen, The Programmer of This Game (???)", 42, 6, 9));
        allEnemies.push_back(Enemy("Unknown999GG, The Unknown Void (???)", 42, 6, 9));
        allEnemies.push_back(Enemy("Xmeet, The Nuclear Harbringer (???)", 42, 6, 9));
        allEnemies.push_back(Enemy("Feqed, The Mouse (777)", 42, 6, 9));
        allEnemies.push_back(Enemy("Phynax, The First King (???)", 42, 6, 9));
        allEnemies.push_back(Enemy("Dainzel, The Winter Veteran (???)", 42, 6, 9));
        allEnemies.push_back(Enemy ("Pinsen, The Guitar Prince (???)", 42, 6, 9));

    }

    void play();

    private:
        void showMenu() const;
        void explore();
        void enterShop();
        void upgradeStats();
        void status() const;
        void usePotion();
        void showGameOver() const;
};

int main() {
    srand(static_cast<unsigned>(time(0)));

    int startingMoney = rand() % 11 + 5;

    string name; 
    cout << "You suddenly wake up in this game world. You are playing a very strange RPG game. You come to your senses." << endl; 
    cout << "What is your name? : ";
    cin >> name;
    cout << name << "... That's your name, right? How could you have forgotten it? You suddenly lose consciousness again, and the interface of this strange RPG game opens up." << endl;

    Player player(name, 100, 20, 5, 20, startingMoney);
    RPG rpg(player);
    rpg.play();

    return 0;
}

void Enemy::attackPlayer(Player& player){
    int damage = calculateDamageToPlayer(player);
    player.health -= damage;
    
    cout << name << " attacks " << player.name << " for " << damage << " damage! " 
    << player.name << " has " << player.health << " health remaining." << endl;
}

int Enemy::calculateDamageToPlayer(const Player& player) const {
    int baseDamage = rand() % 10 + 1;
    int totalDamage = max(0, baseDamage + attackPower - player.defensePower);

    return totalDamage;
}
    
void Player::normalAttack(Enemy& enemy) { 
    int damage = calculateDamage(enemy); 
    enemy.health -= damage;

    cout << name << " attacks " << enemy.name << " with a normal attack for " << damage << " damage! " 
    << enemy.name << " has " << enemy.health << " health remaining." << endl; 
}

bool Player::isAlive() const {
    return health > 0;
}

void Player::status() const { 
    cout << " | Player: " << name << endl;
    cout << " | Level " << level << endl;
    cout << " | XP: " << experience << endl;
    cout << " | Health: " << health << "/" << maxHealth << endl;
    cout << " | Attack : " << attackPower << endl;
    cout << " | Defense: " << defensePower << endl;
    cout << " | Money : " << money << endl;
}

void Player::upgradeStats() {
    if (!hasUpgradedStats) {
        int randomStat = rand() % 3 + 1; 

        switch (randomStat) {
            case 1:
                maxHealth += rng();
                health = maxHealth;
                cout << "Your health has been increased!" << endl;
                break;
            case 2:
                attackPower += rng();
                cout << "Your attack has been increased!" << endl;
                break;
            case 3: 
                defensePower += rng();
                cout << "Your defense has been increased!" << endl;
                break;
            default:
                cout << "Invalid choice. No stat was increased." << endl;
                break;
        }
        hasUpgradedStats = true;
        levelUp();
        status();
    } else {
        cout << "Stats have already been upgraded for this level." << endl;
    }
}

void Player::levelUp() {
    if (experience >= 100 * level) {
        level++;
        experience = 0;
        hasUpgradedStats = false;
    }
}

int Player::rng() const {
    return rand() % 10 + 1; 
}

int Player::calculateDamage(const Enemy& enemy) const {
    int baseDamage = rand() % 10 + 1;
    int totalDamage = max(0, baseDamage + attackPower - enemy.defensePower);

    return totalDamage;
}

void Player::usePotion() {
    if (!potions.empty()) {
        health += potions[0].healAmount;
        cout << name
        << " drinks " << potions[0].name << " and restores " << potions[0].healAmount
        << " health. Your health is now: " << health << "/" << maxHealth << endl;
        potions.erase(potions.begin());
    } else {
        cout << "There are no potions in your bag." << endl;
    }
}

void Player::gainExperience(int exp) {
    experience += exp;
    cout << "You gained " << exp << " experience!" << endl;

    while (experience >= 100 * level) {
        levelUp();
        cout << "Congratulations! You leveled up to level " << level << "." << endl;
        status(); 
    }
}

void RPG::play() {
    cout << "==============================" << endl;
    cout << "=== A Very Normal RPG Game ===" << endl;
    cout << "==============================" << endl;

    do {
        showMenu();
        int choice;
        cout << "Enter your choice : ";
        cin >> choice;

        switch (choice) {
            case 1:
                explore();
                break;
            case 2:
                enterShop();
                break;
            case 3:
                upgradeStats();
                break;
            case 4:
                status();
                break;
            case 5:
                usePotion();
                break;
            case 6:
                cout << "You forcibly exit this strange RPG game." << endl;
                cout << "[SIMULATION TERMINATED]" << endl;
                exit(0);
            default:
                cout << "Invalid choice. Please enter a valid input." << endl;
                break;
        }

        player.levelUp();

    } while (player.isAlive());

    showGameOver();
}

void RPG::showMenu() const {
    cout << "\n=== Just Your Average RPG Main Menu ===" << endl;
    cout << "1. Explore and Fight Enemies" << endl;
    cout << "2. Enter the Shop" << endl;
    cout << "3. Upgrade Stats" << endl;
    cout << "4. View Player Stats" << endl;
    cout << "5. Drink Potion" << endl;
    cout << "6. Stop Playing" << endl;
}

void RPG::explore() {
    cout << "\nExploring..." << endl;

    int randomEnemyIndex = rand() % allEnemies.size();
    Enemy encounteredEnemy = allEnemies[randomEnemyIndex];

    cout << "You encounter " << encounteredEnemy.name << "! Get ready to fight." << endl;

    while (player.isAlive() && encounteredEnemy.health > 0) {
        player.normalAttack (encounteredEnemy);
        if (encounteredEnemy.health <= 0) {
            cout << encounteredEnemy.name << " has been defeated!" << endl;

            int moneyReward = 10+ encounteredEnemy.health + encounteredEnemy.attackPower + encounteredEnemy.defensePower;
            player.money += moneyReward;

            cout << "You earned " << moneyReward << " money. Your total money is now : " << player.money << endl;

            int expGained = 45+ encounteredEnemy.health + encounteredEnemy.attackPower + encounteredEnemy.defensePower;
            player.gainExperience(expGained);

            break;
        }

        encounteredEnemy.attackPlayer (player);

        if (!player.isAlive()) {
            cout << "NOOOOOOOOOO!" << player.name << " You have been defeated by " << encounteredEnemy.name << "." << endl;
            break;
        }
    }
}

void RPG::enterShop() {
    cout << "\nWelcome to the Shop!" << endl;

    cout << "1. Buy Health Potion (Price: 20 money)" << endl;
    cout << "2. Sell Health Potion (Sell Price 5 money)" << endl;
    cout << "3. Exit Shop" << endl;
    
    int choice;
    cout << "Enter your choice : ";
    cin >> choice;

    switch (choice) {
        case 1: {
            if (player.money >= 15) {
                player.money -= 15;
                player.potions.push_back(Potion ("Health Potion", 20));
                cout << "You bought 1 health potion. Your money is now " << player.money << endl;
        } else {
            cout << "You don't have enough money to buy a potion :( ." << endl;
        }
        break;
    }
        case 2: {
            if (!player.potions.empty()) {
                player.money += 5;
                player.potions.pop_back();
                cout << "You sold 1 health potion. Your money is now : " << player.money << endl;
        } else {
        cout << "There are no potions to sell." << endl;
        }
        break;
    }
        case 3:
            break;
        default:
            cout << "Invalid choice. Please enter a valid input." << endl;
            break;
    }
}

void RPG::upgradeStats() {
    player.upgradeStats();
}

void RPG::status() const {
    player.status();
} 

void RPG::usePotion() {
    player.usePotion();
}

void RPG::showGameOver() const {
    cout << "\nGame Over!" << endl;

    cout << "Thanks for playing! You died and were defeated. Good Game Well Played. You will now return to your original world." << endl;
    cout << "[SIMULATION TERMINATED]" << endl;
}