document.addEventListener('DOMContentLoaded', init, false);

// units
class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = 'images/dummy_ship.png';

        this.speed = 0;
        this.targetSpeed = 0;
        this.acceleration = 0.01;

        // this.bodyRotation = -Math.PI / 2;
        this.bodyRotation = 0;

        this.bodyRotationSpeedChange = 1 / (800 + this.speed);           //the faster the ship the slower it turns
        this.bodyMaxRotationSpeed = 1 * this.bodyRotationSpeedChange
        this.bodyMinRotationSpeed = -1 * this.bodyRotationSpeedChange

        this.bodyRotationSpeed = 0;

        this.hullPoint = 100;
        this.crew = 150;
        this.mass = 100;

        this.hitbox = [
            { x: -47, y: -7 },
            { x: -40, y: -8 },
            { x: -30, y: -9},
            { x: -10, y: - 10},
            { x: 7, y: - 10},
            { x: 21, y: - 6},
            { x: 28, y: -1 },
            { x: 28, y: 1 },
            { x: 21, y: 6},
            { x: 7, y: 10},
            { x: -10, y: 10},
            { x: -30, y: 9},
            { x: -40, y: 8 },
            { x: -47, y: 7 },
        ];

        //calculate global hitbox
        this.shipGlobalHitbox = this.hitbox.map(point => ({
            x: this.x + Math.cos(this.bodyRotation) * point.x - Math.sin(this.bodyRotation) * point.y,
            y: this.y + Math.sin(this.bodyRotation) * point.x + Math.cos(this.bodyRotation) * point.y
        }));

        this.isDestroied = false;
        this.hostility = 'friendly'
    }

    update() {
        //
        // console.log('hostility:', this.hostility);

        // put ship into global arrays
        if (this.hostility === 'friendly' && !friendlies.includes(this)) {
            friendlies.push(this);
        } else if (this.hostility == 'enemy' && !enemies.includes(this)) {
            enemies.push(this);
        } 

        // console.log('friendlies length:', friendlies.length);
        // console.log('enemies length:', enemies.length);

        if (this.hullPoint <= 0) {
            this.isDestroied = true;
        }

        if (!this.isDestroied) {
            this.bodyRotation += this.bodyRotationSpeed;
            this.x += Math.cos(this.bodyRotation) * this.speed;
            this.y += Math.sin(this.bodyRotation) * this.speed;

            if (this.speed < this.targetSpeed) {
                this.speed = Math.min(this.speed + this.acceleration, this.targetSpeed);
            } else if (this.speed > this.targetSpeed) {
                this.speed = Math.max(this.speed - this.acceleration, this.targetSpeed);
            }
            this.isHit()
        } else {
            //to be fixed
            //this.destroy();
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y); 
        context.rotate(this.bodyRotation); 

        if (!this.isDestroied) {
            context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        } else {
            console.log('destroy animation')
            // Destroy animation
        }
       
        context.restore();
    }
    
    isHit() {
        if (this.hostility == 'enemy') {
            for (let i = projectileList.length - 1; i >= 0; i--) {
                let ammo = projectileList[i];
                if (ammo.hostility != 'player') continue;
    
                if (isInsideHitbox(ammo, this.shipGlobalHitbox)) {
                    this.hullPoint -= ammo.damage;
                    console.log(this.hullPoint);
                    console.log('DummyShip hit!');
                    projectileList.splice(i, 1); 
                }
            }
        } else if (this.hostility === 'friendlies') {
            for (let i = projectileList.length - 1; i >= 0; i--) {
                let ammo = projectileList[i];
                if (ammo.hostility != 'enemy') continue;
        
                if (isInsideHitbox(ammo, this.shipGlobalHitbox)) {
                    this.hullPoint -= ammo.damage;
                    console.log(this.hullPoint);
                    console.log('Friendly ship hit!');
                    projectileList.splice(i, 1); 
                }
            }
        }
    }

    //to be fixed
    // destroy() {
    //     if (this.hostility === 'firendly') {
    //         let index = friendlies.indexOf(this);
    //         if (index !== -1) {
    //             friendlies.splice(index, 1);
    //             console.log('player destroied'); // test
    //             if (!destroies.includes(this)) {
    //                 destroies.push(this);
    //             }
    //         }
    //     }  else if (this.hostility === 'enemy') {
    //         let index = enemies.indexOf(this);
    //         if (index !== -1) {
    //             enemies.splice(index, 1);
    //             console.log('dummy destroied'); // test
    //             if (!destroies.includes(this)) {
    //                 destroies.push(this);
    //             }
    //         }
    //     }
    // }
}   

class PlayerShip extends Ship {
    constructor(x, y) {
        super(x, y)
        this.image.src = 'images/default_ship.png';

        this.clutchSpeed = 0.1;
        this.maxSpeed = 3 * this.clutchSpeed;
        this.minSpeed = -1 * this.clutchSpeed;

        this.port = {                               // fancy word for left side
            health: 100,
            cannons: [
                new PlayerCannon(this, -41, -3.5, -Math.PI / 1.8, enemies, projectileList),
                new PlayerCannon(this, -35, -4.5, -Math.PI / 1.8, enemies, projectileList),
                new PlayerCannon(this, -12, -6, -Math.PI / 2, enemies, projectileList),
                new PlayerCannon(this, -6, -6, -Math.PI / 2, enemies, projectileList),
                new PlayerCannon(this, 0, -6, -Math.PI / 2, enemies, projectileList),
                new PlayerCannon(this, 6, -5, -Math.PI / 2.2, enemies, projectileList),
                new PlayerCannon(this, 19, -2.5, -Math.PI / 2.5, enemies, projectileList),
            ]
        };
        
        this.starboard ={                          // right of course
            health: 100,
            cannons: [
                new PlayerCannon(this, -41, 3.5, Math.PI / 1.8, enemies, projectileList),
                new PlayerCannon(this, -35, 4.5, Math.PI / 1.8, enemies, projectileList),
                new PlayerCannon(this, -12, 6, Math.PI / 2, enemies, projectileList),
                new PlayerCannon(this, -6, 6, Math.PI / 2, enemies, projectileList),
                new PlayerCannon(this, 0, 6, Math.PI / 2, enemies, projectileList),
                new PlayerCannon(this, 6, 5, Math.PI / 2.2, enemies, projectileList),
                new PlayerCannon(this, 19, 2.5, Math.PI / 2.5, enemies, projectileList),
            ]
        };

        // this.sails = {
        //     health: 100,
        //     sails: [
        //         new Sail(this, -19, 0, 'images/main_sail.png'),
        //         new Sail(this, 8, 0, 'images/front_sail.png')
        //     ]
        // }

        this.hostility = 'friendly'
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    handleKeyDown(event) {
        switch(event.key) {
            // case '1':
            //     this.port.cannons.forEach(cannon => {
            //         if (cannon.currentAmmo === 'PlayerAmmo') {
            //         }
            //     });
            //     this.starboard.cannons.forEach(cannon => {
            //         if (cannon.currentAmmo === 'PlayerAmmo') {
            //         }
            //     });
            //     break

            case 'w':
                this.targetSpeed = Math.min(this.targetSpeed += this.clutchSpeed, this.maxSpeed)
                break;

            case 's':
                this.targetSpeed = Math.max(this.targetSpeed -= this.clutchSpeed, this.minSpeed)
                this.bodyRotationSpeed = 0;
                break
            
            case 'a':
                this.bodyRotationSpeed = Math.max(this.bodyMinRotationSpeed, this.bodyRotationSpeed - this.bodyRotationSpeedChange);
                break

            case 'd':
                this.bodyRotationSpeed = Math.min(this.bodyMaxRotationSpeed, this.bodyRotationSpeed + this.bodyRotationSpeedChange);
                break

            case ' ': //break
                this.targetSpeed = 0;
                this.bodyRotationSpeed = 0;
                break
            
            case 'j':
                this.port.cannons.forEach(cannon => {
                    cannon.fireMode = cannon.fireMode === 'fire_at_will' ? 'normal' : 'fire_at_will';
                });
                break;
            
            case 'l':
                this.starboard.cannons.forEach(cannon => {
                    cannon.fireMode = cannon.fireMode === 'fire_at_will' ? 'normal' : 'fire_at_will';
                });
                break;
        }
    }
    update() {
        super.update();
        this.port.cannons.forEach(cannon => {
            if (cannon.fireMode === 'fire_at_will') {
                cannon.update();
            }
        });
        this.starboard.cannons.forEach(cannon => {
            if (cannon.fireMode === 'fire_at_will') {
                cannon.update();
            }
        });

    }
    draw(context) {
        super.draw(context);
        this.port.cannons.forEach(cannon => {
            cannon.draw(context);
        });
        
        this.starboard.cannons.forEach(cannon => {
            cannon.draw(context);
        });


        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.bodyRotation);

        //drawHitbox
        context.beginPath();
        context.moveTo(this.hitbox[0].x, this.hitbox[0].y);
        for (let i = 1; i < this.hitbox.length; i++) {
            context.lineTo(this.hitbox[i].x, this.hitbox[i].y);
        }
        context.closePath();
        context.strokeStyle = 'yellow'; 
        context.lineWidth = 1;
        context.stroke();
        ////

        // this.sails.sails.forEach(sail => {
        //     sail.draw(context);
        // });
        context.restore();
    }
}

class EnemyShip1 extends Ship {
    constructor(x, y) {
        super(x, y)
        this.image.src = 'images/default_ship.png';

        this.clutchSpeed = 0.1;
        this.maxSpeed = 3 * this.clutchSpeed;
        this.minSpeed = -1 * this.clutchSpeed;

        this.port = {                               // fancy word for left side
            health: 100,
            cannons: [
                new EnemyCannon(this, -41, -3.5, -Math.PI / 1.8, friendlies, projectileList),
                new EnemyCannon(this, -35, -4.5, -Math.PI / 1.8, friendlies, projectileList),
                new EnemyCannon(this, -12, -6, -Math.PI / 2, friendlies, projectileList),
                new EnemyCannon(this, -6, -6, -Math.PI / 2, friendlies, projectileList),
                new EnemyCannon(this, 0, -6, -Math.PI / 2, friendlies, projectileList),
                new EnemyCannon(this, 6, -5, -Math.PI / 2.2, friendlies, projectileList),
                new EnemyCannon(this, 19, -2.5, -Math.PI / 2.5, friendlies, projectileList),
            ]
        };
        
        this.starboard ={                          // right of course
            health: 100,
            cannons: [
                new EnemyCannon(this, -41, 3.5, Math.PI / 1.8, friendlies, projectileList),
                new EnemyCannon(this, -35, 4.5, Math.PI / 1.8, friendlies, projectileList),
                new EnemyCannon(this, -12, 6, Math.PI / 2, friendlies, projectileList),
                new EnemyCannon(this, -6, 6, Math.PI / 2, friendlies, projectileList),
                new EnemyCannon(this, 0, 6, Math.PI / 2, friendlies, projectileList),
                new EnemyCannon(this, 6, 5, Math.PI / 2.2, friendlies, projectileList),
                new EnemyCannon(this, 19, 2.5, Math.PI / 2.5, friendlies, projectileList),
            ]
        };

        // this.sails = {
        //     health: 100,
        //     sails: [
        //         new Sail(this, -19, 0, 'images/main_sail.png'),
        //         new Sail(this, 8, 0, 'images/front_sail.png')
        //     ]
        // }

        this.hostility = 'enemy'
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    handleKeyDown(event) {
        switch(event.key) {
            // case '1':
            //     this.port.cannons.forEach(cannon => {
            //         if (cannon.currentAmmo === 'PlayerAmmo') {
            //         }
            //     });
            //     this.starboard.cannons.forEach(cannon => {
            //         if (cannon.currentAmmo === 'PlayerAmmo') {
            //         }
            //     });
            //     break

            case 'w':
                this.targetSpeed = Math.min(this.targetSpeed += this.clutchSpeed, this.maxSpeed)
                break;

            case 's':
                this.targetSpeed = Math.max(this.targetSpeed -= this.clutchSpeed, this.minSpeed)
                this.bodyRotationSpeed = 0;
                break
            
            case 'a':
                this.bodyRotationSpeed = Math.max(this.bodyMinRotationSpeed, this.bodyRotationSpeed - this.bodyRotationSpeedChange);
                break

            case 'd':
                this.bodyRotationSpeed = Math.min(this.bodyMaxRotationSpeed, this.bodyRotationSpeed + this.bodyRotationSpeedChange);
                break

            case ' ': //break
                this.targetSpeed = 0;
                this.bodyRotationSpeed = 0;
                break
            
            case 'j':
                this.port.cannons.forEach(cannon => {
                    cannon.fireMode = cannon.fireMode === 'fire_at_will' ? 'normal' : 'fire_at_will';
                });
                break;
            
            case 'l':
                this.starboard.cannons.forEach(cannon => {
                    cannon.fireMode = cannon.fireMode === 'fire_at_will' ? 'normal' : 'fire_at_will';
                });
                break;
        }
    }

    update() {
        super.update();
        this.port.cannons.forEach(cannon => {
            if (cannon.fireMode === 'fire_at_will') {
                cannon.update();
            }
        });
        this.starboard.cannons.forEach(cannon => {
            if (cannon.fireMode === 'fire_at_will') {
                cannon.update();
            }
        });
    }

    draw(context) {
        super.draw(context);
        this.port.cannons.forEach(cannon => {
            cannon.draw(context);
        });
        
        this.starboard.cannons.forEach(cannon => {
            cannon.draw(context);
        });


        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.bodyRotation);

        //drawHitbox
        context.beginPath();
        context.moveTo(this.hitbox[0].x, this.hitbox[0].y);
        for (let i = 1; i < this.hitbox.length; i++) {
            context.lineTo(this.hitbox[i].x, this.hitbox[i].y);
        }
        context.closePath();
        context.strokeStyle = 'yellow'; 
        context.lineWidth = 1;
        context.stroke();
        ////

        // this.sails.sails.forEach(sail => {
        //     sail.draw(context);
        // });
        context.restore();
    }

    
    
}

class Dummy extends Ship {
    constructor(x, y) {
        super(x, y)
        this.bodyRotation = 0;
        this.image.src = 'images/dummy_ship.png';

        this.hostility = 'friendly'
    }

    draw(context) {
        super.draw(context);

        context.save();  
        context.translate(this.x, this.y);  
        context.rotate(this.bodyRotation);  

        //drawHitbox
        context.beginPath();
        context.moveTo(this.hitbox[0].x, this.hitbox[0].y);
        for (let i = 1; i < this.hitbox.length; i++) {
            context.lineTo(this.hitbox[i].x, this.hitbox[i].y);
        }
        context.closePath();
        ///

        context.globalAlpha = 0.5;  //transparency
        context.fillStyle = 'red';  
        context.fill();
        ////
        
        context.restore();
    }
}

// weapon and gadgets

class Cannon {
    constructor(ship, offsetX, offsetY, rotationAngle, targetGroup, projectileList) {
        this.ship = ship;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.initialAngle = rotationAngle;
        this.rotationAngle = rotationAngle;
        this.rotationSpeed = 0.01;

        this.image = new Image();
        this.image.src = 'images/cannon.png';
        this.loaded = false;

        this.currentAmmo = null;
        this.projectileList = projectileList;
        this.lastFired = 0;             
        this.reloadTime = 0;              //initialized

        this.searchSectorAngle = Math.PI / 3;
        this.range = 450;
        this.isDetecting = null;
        this.detectedEnemy = null;

        this.enemyDistance = 0;
        // this.enemyEndX = 0;
        // this.enemyEndY = 0;

        this.fireMode = 'normal'
        this.targetGroup = targetGroup;
        
    }

    updateGlobalPosition() {
        let cosTheta = Math.cos(this.ship.bodyRotation);
        let sinTheta = Math.sin(this.ship.bodyRotation);

        this.globalX = this.ship.x + cosTheta * this.offsetX - sinTheta * this.offsetY;
        this.globalY = this.ship.y + sinTheta * this.offsetX + cosTheta * this.offsetY;
        this.globalRotation = this.ship.bodyRotation + this.rotationAngle;
    }

    draw(context) {
        this.updateGlobalPosition();  

        context.save();
        context.translate(this.globalX, this.globalY);
        context.rotate(this.globalRotation);
        context.drawImage(this.image, 0, -this.image.height / 2);

        if (this.fireMode === 'fire_at_will') {
            this.aimAndReload(context);
        }

        //helper line
        if(this.isDetecting && this.detectedEnemy) {
            context.beginPath();
            context.moveTo(0, 0); // Start from the cannon's position (which is now the origin of the canvas)
            context.lineTo(this.enemyEndX, this.enemyEndY); // Draw line to the transformed local position
            context.stroke();
        }
        
        context.restore();

        this.projectileList.forEach(ammo => {
            ammo.draw(context);
        });
    }

    update() {
        this.nervous = Math.random() * 0.6 - 0.3;    //crew nervous from -.3, .3
        //  console.log("Updating cannon..."); 
        // this.projectileList.forEach(ammo => {
        //     ammo.update();
        // });
        this.detection();
        if (this.isDetecting && this.detectedEnemy) {
            this.fire();
        }
    }

    detection() {
        let minDistance = Infinity;
        let closestEnemy = null;
        this.isDetecting = false; 
        this.targetAngle = 0; // Reset the target angle at the start of each detection
    
        for (let unit of this.targetGroup) {
            let result = distanceFromCannonToPolygon(this.globalX, this.globalY, unit.shipGlobalHitbox);

            //console.log('here:', unit);
            // Only update the target angle if a unit is in range
            if (result.distance <= this.range) {
                this.targetAngle = result.angle - this.globalRotation;
               
                // Normalize the angle to [-Math.PI, Math.PI]
                this.targetAngle = (this.targetAngle + Math.PI) % (2 * Math.PI) - Math.PI;
                if (this.targetAngle < -Math.PI) {
                    this.targetAngle += 2 * Math.PI;
                }
    
                if (Math.abs(this.targetAngle) <= this.searchSectorAngle / 2 && result.distance < minDistance) {  
                    minDistance = result.distance;
                    closestEnemy = unit;
                    //console.log('closestEnemy:', unit);
                    this.isDetecting = true;
                    
                    this.enemyDistance = minDistance;
                    this.enemyEndX = this.enemyDistance * Math.cos(this.targetAngle);
                    this.enemyEndY = this.enemyDistance * Math.sin(this.targetAngle);
                    // console.log('closestEnemy:', this.enemyEndX, this.enemyEndY);
                } else {
                    // console.log('Did not update closestEnemy, targetAngle:', this.targetAngle, 'searchSectorAngle:', this.searchSectorAngle, 'distance:', result.distance, 'minDistance:', minDistance);
                }
            }
        }
        this.detectedEnemy = closestEnemy;
        // console.log('Detected enemy:', this.detectedEnemy);
    }

    fire() {
        if (this.currentAmmo != null) {
            const now = Date.now();
            const error = (1 - this.nervous) * Math.PI / 36; //weapon accuracy
            if (now - this.lastFired >= this.reloadTime && this.detectedEnemy) {
                if (Math.abs(this.targetAngle) <= this.searchSectorAngle / 2) {
                    if (this.hostility = 'enemy') {
                        this.currentAmmo = new HostileAmmo(this.globalX, this.globalY, ((this.targetAngle + error) + this.globalRotation));
                    } else if (this.hostility = 'player') {
                        this.currentAmmo = new PlayerAmmo(this.globalX, this.globalY, ((this.targetAngle + error) + this.globalRotation));
                    }
                    this.projectileList.push(this.currentAmmo); 
                    this.reloadTime = this.currentAmmo.reloadTime;
                    this.lastFired = now;
                }
            }
        }
    }
}

class PlayerCannon extends Cannon {

    constructor(ship, offsetX, offsetY, rotationAngle, targetGroup, projectileList) {
        super(ship, offsetX, offsetY, rotationAngle, targetGroup, projectileList);
        this.hostility = 'player';
        this.targetGroup = enemies;
    }

    update() {
        super.update(); 
    }

    aimAndReload(context) {
        // only while radar is drawn a currentAmmo is set
        this.currentAmmo = new PlayerAmmo(this.globalX, this.globalY, this.globalRotation + this.targetAngle);
        this.searchSectorAngle = this.currentAmmo.searchSectorAngle;
        this.range = this.currentAmmo.range;

        context.beginPath();
        context.arc(0, 0, this.range, -this.searchSectorAngle / 2, this.searchSectorAngle / 2);
        context.lineTo(0, 0);
        context.fillStyle = 'rgba(255, 0, 0, 0.1)';  
        context.fill();
    }
}
    
class EnemyCannon extends Cannon {
    constructor(ship, offsetX, offsetY, rotationAngle, targetGroup, projectileList) {
        super(ship, offsetX, offsetY, rotationAngle, targetGroup, projectileList);
        this.hostility = 'enemy';
        this.targetGroup = friendlies;
        this.fireMode = 'fire_at_will'
    }

    aimAndReload(context) {
        // only while radar is drawn a currentAmmo is set
        this.currentAmmo = new HostileAmmo(this.globalX, this.globalY, this.globalRotation + this.targetAngle);
        this.searchSectorAngle = this.currentAmmo.searchSectorAngle;
        this.range = this.currentAmmo.range;

        context.beginPath();
        context.arc(0, 0, this.range, -this.searchSectorAngle / 2, this.searchSectorAngle / 2);
        context.lineTo(0, 0);
        context.fillStyle = 'rgba(255, 0, 0, 0.1)';  
        context.fill();
    }

}

class Ammo {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 1;  
        this.color = '#000000';
        
        this.reloadTime = 5000;
        this.damage = 3;

        //default
        this.searchSectorAngle = Math.PI / 3;
        this.range = 450;   
        
        this.hitbox = {
            x: this.x,
            y: this.y,
            radius: .5 
        }
        this.hostility = 'friendly'
    }

    update() {
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        this.hitbox.x = this.x;
        this.hitbox.y = this.y;
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(0, 0, this.hitbox.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}

class PlayerAmmo extends Ammo {
    constructor(x, y, direction) {
        super(x, y, direction);
        this.hostility = 'player'
        this.searchSectorAngle = Math.PI / 3;
        this.reloadTime = 5000;
        this.range = 450;
    }
}

class HostileAmmo extends Ammo {
    constructor(x, y, direction) {
        super(x, y, direction);
        this.hostility = 'enemy'
        this.searchSectorAngle = Math.PI / 3;
        this.reloadTime = 5000;
        this.range = 400;
    }
}

class Sail {
    constructor(ship, offsetX, rotationAngle, imageSrc) {
        this.ship = ship;
        this.offsetX = offsetX;
        this.offsetY = 0;
        this.rotationAngle = rotationAngle;

        this.reloadTime = 5000;
        this.damage = 10;

        this.image = new Image();
        this.image.src = imageSrc
    }
    
    draw(context) {
        context.save();

        context.translate(this.ship.x, this.ship.y);
        context.rotate(this.ship.bodyRotation);

        context.translate(this.offsetX, this.offsetY);
        context.rotate(this.rotationAngle);

        context.drawImage(this.image, 0, -this.image.height/2);
        context.restore();
    }
}

// mechanism helper functions

let projectileList = []; //arrays are kept in global to massively simplify the data structure to fasten collision detection

let friendlies = [];
console.log('friendlies: ', friendlies)
let enemies = [];
console.log('enemies: ', enemies)
let destroies = [];
console.log('destroies: ', destroies)

//calculate Ammo collision

// simple pt to AB distance
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    let a_to_b = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    let projectRatio = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (a_to_b ** 2);
    
    let pointProjectionX = x1 + projectRatio * (x2 - x1);
    let pointProjectionY = y1 + projectRatio * (y2 - y1);

    let distanceX = pointProjectionX - px;
    let distanceY = pointProjectionY - py;

    if (projectRatio < 0) { 
        return Math.sqrt((x1 - px) ** 2 + (y1 - py) ** 2); 
    } else if (projectRatio > 1) {
         return Math.sqrt((x2 - px) ** 2 + (y2 - py) ** 2); 
        }  

    return Math.sqrt(distanceX ** 2 + distanceY ** 2);
}

// for radar detection
function distanceFromCannonToPolygon(px, py, hitbox) {
    let minDist = Infinity;
    let angleWithMinDist = 0; // 存储与最近点的角度
    let closestPoint = null; // 存储最近点的坐标

    for (let i = 0; i < hitbox.length; i++) {
        let j = (i + 1) % hitbox.length;
        let x1 = hitbox[i].x, y1 = hitbox[i].y;
        let x2 = hitbox[j].x, y2 = hitbox[j].y;
        
        // 线段上最近点到点 (px, py) 的距离及其坐标
        let result = closestPointOnLine(px, py, x1, y1, x2, y2);
        
        if (result.distance < minDist) {
            minDist = result.distance;
            closestPoint = result.point;
            angleWithMinDist = Math.atan2(result.point.y - py, result.point.x - px);
        }
    }

    return { distance: minDist, angle: angleWithMinDist, point: closestPoint };
}


function closestPointOnLine(px, py, x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let mag = dx * dx + dy * dy;
    let u = ((px - x1) * dx + (py - y1) * dy) / mag;

    u = Math.max(0, Math.min(1, u)); // Clamp u to the range [0, 1]
    let x = x1 + u * dx;
    let y = y1 + u * dy;
    let distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

    return { distance: distance, point: { x: x, y: y } };
}



//Ray Casting Algorithm to check if pt is inside Polygon
//Material cannot be directly copy: https://www.youtube.com/watch?v=RSXM9bgqxJM
//                                  https://www.bilibili.com/video/BV1ce4y1j7a6/?spm_id_from=333.337.search-card.all.click&vd_source=527af51298f5c974212d8c41d444ed04

function isInsideHitbox(ammo, hitbox) {
    let count = 0;
    for (let i = 0, j = hitbox.length - 1; i < hitbox.length; j = i++) {
        if (((hitbox[i].y > ammo.y) != (hitbox[j].y > ammo.y)) &&
            (ammo.x < (hitbox[j].x - hitbox[i].x) * (ammo.y - hitbox[i].y) / (hitbox[j].y - hitbox[i].y) + hitbox[i].x)) {
            count++;
        }
    }
    return count % 2 == 1;
}

// Collision Detection: https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/Collision_detection
// SAT: https://www.metanetsoftware.com/technique/tutorialA.html
// Math & Coding Instruction: https://www.youtube.com/watch?v=-EsWKT7Doww

// Ship collision detection (Not yet implemented)
function getEdges(hitbox) {
    let edges = [];
    for (let i = 0; i < hitbox.length; i ++) {
        let j = (i + 1) % hitbox.length;
        edges.push({
            point1: hitbox[i], 
            point2: hitbox[j]
        });
    }
    return edges;
}

function projectPolygon(axis, polygon) {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < polygon.length; i++) {
        let vertex = (polygon[i].x * axis.x) + (polygon[i].y * axis.y);
        if (vertex < min) min = vertex;
        if (vertex > max) max = vertex;
    }
    return { min: min, max: max };
}

function overlap(projection1, projection2) {
    if (projection1.max >= projection2.min && projection2.max >= projection1.min) {
        return true;
    }
    return false;
}

function isShipCollide(hitbox1, hitbox2) {
    let edges = getEdges(hitbox1).concat(getEdges(hitbox2));
    for (let i =0; i < edges.length; i ++) {
        let axis = { 
            x: -edges[i].y, 
            y: edges[i].x
        };
        let projection1 = projectPolygon(axis, hitbox1);
        let projection2 = projectPolygon(axis, hitbox2);
        if (!overlap(projection1, projection2)) {
            return false;
        }
    }
    return true;
}

// hud


class Hud {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = 'images/hud.png'
    }
    
    update(){

    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        context.restore();
    }
}

// game loop
function init(){
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");

    const hud = new Hud(canvas.width/2, canvas.height - 75);
    const enemyShip = new EnemyShip1(canvas.width/2 - 400, canvas.height/2);
    const dummy1 = new Dummy(canvas.width/2 + 200 , canvas.height/2 - 200);
    // const dummy2 = new Dummy(canvas.width/2 + 100, canvas.height/2 - 150);
    // const ammo = new Ammo(800, 300, Math.PI / 2);
    

    function gameLoop() {

        let dx = canvas.width / 2 - enemyShip.x;
        let dy = canvas.height / 2 - enemyShip.y;


        context.clearRect(0, 0, canvas.width, canvas.height);
    
        context.translate(dx, dy);
    
        enemyShip.update();
        dummy1.update();
        // dummy2.update();
    
        enemyShip.draw(context);
        dummy1.draw(context);
        // dummy2.draw(context);
    
        // shooting ammo 
        projectileList.forEach(ammo => {
            ammo.update();
            ammo.draw(context);
        }); 
    
        context.translate(-dx, -dy);
        
        //hud here
        hud.update();
        hud.draw(context);
    
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}
