document.addEventListener('DOMContentLoaded', init, false);

// units
class Ship {
    constructor(x, y, bodyRotation) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = 'images/dummy_ship.png';

        this.speed = 0;
        this.setSpeed = 0;
        this.acceleration = 0.01;

        // this.bodyRotation = -Math.PI / 2;
        this.bodyRotation = bodyRotation;

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

        this.isDestroied = false;
        this.hostility = 'friendly'
    }
    
    update() {
        
        // updating the hitbox!!!!
        this.shipGlobalHitbox = this.hitbox.map(point => ({
            x: this.x + Math.cos(this.bodyRotation) * point.x - Math.sin(this.bodyRotation) * point.y,
            y: this.y + Math.sin(this.bodyRotation) * point.x + Math.cos(this.bodyRotation) * point.y
        }));

        // put ship into global arrays
        if (this.hostility === 'friendly' && !friendlies.includes(this)) {
            friendlies.push(this);
        } else if (this.hostility == 'enemy' && !enemies.includes(this)) {
            enemies.push(this);
        } 

        // check failure condition
        if (this.hullPoint <= 0) {
            this.isDestroied = true;
        }

        if (!this.isDestroied) {
            this.bodyRotation += this.bodyRotationSpeed;
            this.x += Math.cos(this.bodyRotation) * this.speed;
            this.y += Math.sin(this.bodyRotation) * this.speed;

            if (this.speed < this.setSpeed) {
                this.speed = Math.min(this.speed + this.acceleration, this.setSpeed);
            } else if (this.speed > this.setSpeed) {
                this.speed = Math.max(this.speed - this.acceleration, this.setSpeed);
            }
            this.isHit()
        } else {
            this.destroy();
        }

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
                if (ammo.hostility != 'friendly') continue;
    
                if (isInsideHitbox(ammo, this.shipGlobalHitbox)) {
                    this.hullPoint -= ammo.damage;
                    console.log(this.hullPoint);
                    console.log('DummyShip hit!');
                    projectileList.splice(i, 1); 
                }
            }
        } else if (this.hostility === 'friendly') {
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
    destroy() {
        if (this.hostility === 'friendly') {
            let index = friendlies.indexOf(this);
            if (index !== -1) {
                friendlies.splice(index, 1);
                console.log('player destroied'); // test
                if (!destroies.includes(this)) {
                    destroies.push(this);
                }
            }
        }  else if (this.hostility === 'enemy') {
            let index = enemies.indexOf(this);
            if (index !== -1) {
                enemies.splice(index, 1);
                console.log('dummy destroied'); // test
                if (!destroies.includes(this)) {
                    destroies.push(this);
                }
            }
        }
    }
}   

class PlayerShip extends Ship {
    constructor(x, y, bodyRotation) {
        super(x, y, bodyRotation)
        this.image.src = 'images/default_ship.png';

        this.clutchSpeed = 0.05;
        this.maxSpeed = 3 * this.clutchSpeed;
        this.minSpeed = -1 * this.clutchSpeed;

        if(!this.isDestroied) {
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
    
            this.sails = {
                health: 100,
                sails: [
                    new Sail(this, -19, 0, 'images/main_sail_player.png'),
                    new Sail(this, 8, 0, 'images/front_sail_player.png')
                ]
            }
        }

        this.hostility = 'friendly'
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    handleKeyDown(event) {
        switch(event.key) {

            case 'w':
            case' W':
                this.setSpeed = Math.min(this.setSpeed += this.clutchSpeed, this.maxSpeed)
                break;

            case 's':
            case 'S':
                this.setSpeed = Math.max(this.setSpeed -= this.clutchSpeed, this.minSpeed)
                this.bodyRotationSpeed = 0;
                break
            
            case 'a':
            case 'A':
                this.bodyRotationSpeed = Math.max(this.bodyMinRotationSpeed, this.bodyRotationSpeed - this.bodyRotationSpeedChange);
                break

            case 'd':
            case 'D':
                this.bodyRotationSpeed = Math.min(this.bodyMaxRotationSpeed, this.bodyRotationSpeed + this.bodyRotationSpeedChange);
                break

            case ' ': //break
                this.setSpeed = 0;
                this.bodyRotationSpeed = 0;
                break
            
            case 'j':
            case 'J':
                this.port.cannons.forEach(cannon => {
                    cannon.fireMode = cannon.fireMode === 'fire_at_will' ? 'normal' : 'fire_at_will';
                });
                break;
            
            case 'l':
            case 'L':
                this.starboard.cannons.forEach(cannon => {
                    cannon.fireMode = cannon.fireMode === 'fire_at_will' ? 'normal' : 'fire_at_will';
                });
                break;
        }
    }

    draw(context) {
        super.draw(context);
        this.port.cannons.forEach(cannon => {
            cannon.draw(context);
        });
        
        this.starboard.cannons.forEach(cannon => {
            cannon.draw(context);
        });

        this.sails.sails.forEach(sail => {
            sail.draw(context);
        });

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.bodyRotation);

        // //drawHitbox for debugging
        // context.beginPath();
        // context.moveTo(this.hitbox[0].x, this.hitbox[0].y);
        // for (let i = 1; i < this.hitbox.length; i++) {
        //     context.lineTo(this.hitbox[i].x, this.hitbox[i].y);
        // }
        // context.closePath();
        // context.strokeStyle = 'yellow'; 
        // context.lineWidth = 1;
        // context.stroke();

        context.restore();
    }    
}

class EnemyShip1 extends Ship {
    constructor(x, y, bodyRotation) {
        super(x, y, bodyRotation)
        this.image.src = 'images/default_ship.png'; 

        this.clutchSpeed = 0.05;
        this.maxSpeed = 3 * this.clutchSpeed;
        this.minSpeed = -1 * this.clutchSpeed;

        if(!this.isDestroied) {
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
    
            this.sails = {
                health: 100,
                sails: [
                    new Sail(this, -19, 0, 'images/main_sail.png'),
                    new Sail(this, 8, 0, 'images/front_sail.png')
                ]
            }
        }
        

        this.status = 'following';  //also engaging
        this.disengageRange = 500;
        this.attackRange = 400;
        this.targetShip = null;
        this.lastEngageTime  = null;

        this.hostility = 'enemy'

    }
    
    update() {
        super.update();

        //locate closest enemy ship
        
        let closestFriendly = null;
        let closestDistance = Infinity;
        for (let i = 0; i < friendlies.length; i++) {
            let friendly = friendlies[i];
            let distance = Math.sqrt((this.x - friendly.x) ** 2 + (this.y - friendly.y) ** 2);
            // console.log(distance)
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFriendly = friendly;
            }
        }
        
        //setting engaging status
        this.targetShip = closestFriendly;

        if (closestFriendly) {
            this.calculate();
            if (this.status === 'engaging') {
                if (closestDistance > this.disengageRange) {
                    this.status = 'following';
                    console.log('following')
                } else {
                    this.engage();
                }
            } else if (this.status === 'following') {
                if (closestDistance < this.attackRange) {
                    this.status = 'engaging';
                    this.engage();
                } else {
                    this.follow();
                    console.log('following')
                }
            }
        }
        //fire at will
        this.fire();
    }

    draw(context) {
        super.draw(context);
        this.port.cannons.forEach(cannon => {
            cannon.draw(context);
        });
        
        this.starboard.cannons.forEach(cannon => {
            cannon.draw(context);
        });

        this.sails.sails.forEach(sail => {
            sail.draw(context);
        });

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.bodyRotation);

        // //engaging range drawn for debugging
        // context.beginPath();
        // context.arc(0, 0, this.attackRange, 0, 2 * Math.PI);
        // context.strokeStyle = 'red'; // Change this to the color you want
        // context.stroke();

       
        context.restore();
    } 

    calculate() {
        if(this.targetShip) {
            // bearing is the fancy word for angle to target

            this.bearing = Math.atan2(this.targetShip.y - this.y, this.targetShip.x - this.x) - this.bodyRotation;
            
            this.bearing = this.bearing;
            while (this.bearing < -Math.PI) this.bearing += 2 * Math.PI;
            while (this.bearing > Math.PI) this.bearing -= 2 * Math.PI;

            //bearing not in use for now
            // if (this.bearing < 0 && this.bearing >= -Math.PI/2) {
            //     this.bearingQuadrant = 1;
            // } else if (this.bearing < -Math.PI/2 && this. bearing >= -Math.PI) {
            //     this.bearingQuadrant = 2;
            // } else if (this.bearing  > 0 && this.bearing <= Math.PI/2) {
            //     this.bearingQuadrant = 4;
            // } else {
            //     this.bearingQuadrant = 3
            // }
            // console.log('bearing quadrant: ', this.bearingQuadrant)

            //course angle
            this.courseDifference = this.targetShip.bodyRotation - this.bodyRotation

            if (this.courseDifference < 0 && this.courseDifference >= -Math.PI/2) {
                this.courseDifferenceQuadrant= 1;
            } else if (this.courseDifference < -Math.PI/2 && this.courseDifference >= -Math.PI) {
                this.courseDifferenceQuadrant = 2;
            } else if (this.courseDifference > 0 && this.courseDifference <= Math.PI/2) {
                this.courseDifferenceQuadrant = 4;
            } else {
                this.courseDifferenceQuadrant = 3;
            }
            // console.log('course diff quadrant: ', this.courseDifferenceQuadrant)
        }
    }

    follow() {
        if (this.bearing > 0) {
            this.bodyRotation += Math.min(this.bearing, this.bodyRotationSpeedChange);
            
        } else if (this.bearing < 0) {
            this.bodyRotation -= Math.min(-this.bearing, this.bodyRotationSpeedChange);
        }

        // approaching in max speed
        this.setSpeed = this.maxSpeed
    }   

    engage() {
        const now = Date.now();
        if (this.lastEngageTime !== null && now - this.lastEngageTime < 3000) {
            return;
        }
        this.lastEngageTime = now;
        this.setting_track();
    }

    setting_track() {
        // console.log(this.courseDifferenceQuadrant)
        this.setSpeed = .2;
        if (this.courseDifferenceQuadrant === 3 || this.courseDifferenceQuadrant === 4) {
            // Clockwise rotation
            this.bodyRotation += this.bodyRotationSpeedChange;
        } else if (this.courseDifferenceQuadrant === 1 || this.courseDifferenceQuadrant === 2) {
            // Counter-clockwise rotation
            this.bodyRotation -= this.bodyRotationSpeedChange;
        }

        if (this.bearing === Math.PI/2) {
            // console.log('starboard on target')
        } else if (this.bearing === -Math.PI/2) {
            // console.log('port on target')
        }
    }

    fire() {
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
}

class Dummy extends Ship {
    constructor(x, y, bodyRotation) {
        super(x, y, bodyRotation)
        this.image.src = 'images/dummy_ship.png';
        this.setSpeed = 0;
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
        this.hostility = 'enemy'
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
        
        // this.enemyDistance = 0;

        this.fireMode = 'normal'
        this.targetGroup = targetGroup;
        
    }

    draw(context) {

        //converting to global coordinates for future target aiming
        let cos = Math.cos(this.ship.bodyRotation);
        let sin = Math.sin(this.ship.bodyRotation);

        this.globalX = this.ship.x + cos * this.offsetX - sin * this.offsetY;
        this.globalY = this.ship.y + sin * this.offsetX + cos * this.offsetY;
        this.globalRotation = this.ship.bodyRotation + this.rotationAngle;
        /////
        
        context.save();
        context.translate(this.globalX, this.globalY);
        context.rotate(this.globalRotation);
        context.drawImage(this.image, 0, -this.image.height / 2);

        if (this.fireMode === 'fire_at_will') {
            this.aimAndReload(context);
        }

        //helper line of sight of each cannon
        // if(this.isDetecting) {
        //     context.beginPath();
        //     context.moveTo(0, 0); // Start from the cannon's position (which is now the origin of the canvas)
            
        //     context.lineTo(this.enemyEndX, this.enemyEndY); // Draw line to the transformed local position
        //     context.stroke();
        // }
        
        context.restore();

        this.projectileList.forEach(ammo => {
            ammo.draw(context);
        });
    }

    update() {
        this.nervous = Math.random() * 0.6 - 0.3;    //crew nervous from -.3, .3
         console.log("Updating cannon..."); 

        this.detection();
        if (this.isDetecting) {
            this.fire();
        }
    }

    detection() {
        // console.log("Starting detection");
       
        let minDistance = Infinity;
        this.targetAngle = 0; 
        this.isDetecting = null; // current target enemy
    
        for (let unit of this.targetGroup) {
            let unit_measure = distanceFromCannonToPolygon(this.globalX, this.globalY, unit.shipGlobalHitbox);
            // console.log("Unit measure: ", unit_measure);
            
            // Calculate differences between target and cannon'facing

            let relativeAngle = unit_measure.angle - this.globalRotation;

            // Normalize angle to be within the range of -Math.PI to Math.PI for easier understanding
            while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
            while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    
            if (Math.abs(relativeAngle) < this.searchSectorAngle / 2 && unit_measure.distance < this.range) {
                if (unit_measure.distance < minDistance) {
                    minDistance = unit_measure.distance;
                    this.isDetecting = unit; 
                    this.targetAngle = relativeAngle;  // update as target angle
                    console.log('Target ANGLE:', this.targetAngle) 
                    
                    this.enemyEndX = this.globalX + Math.cos(unit_measure.angle) * minDistance;  // Correcting trajectory
                    this.enemyEndY = this.globalY + Math.sin(unit_measure.angle) * minDistance;
                    // console.log("New target detected: ", this.isDetecting);
                }
            }
        }
    }
    
    
    fire() {
      
        if (this.currentAmmo != null) {
            const now = Date.now();
            // const error = (1 - this.nervous) * Math.PI / 36; //weapon accuracy
            const error = 0;
            if (now - this.lastFired >= this.reloadTime && this.isDetecting) {
                // console.log('AMMO ANGLE:', this.targetAngle) 
            
                if (this.hostility === 'enemy') {
                    this.currentAmmo = new HostileAmmo(this.globalX, this.globalY, ((this.targetAngle + error) + this.globalRotation));
                    
                } else if (this.hostility === 'friendly') {
                    this.currentAmmo = new PlayerAmmo(this.globalX, this.globalY, ((this.targetAngle + error) + this.globalRotation));
                    console.log('friendly ammo loaded')
                }
                this.projectileList.push(this.currentAmmo); 
                this.reloadTime = this.currentAmmo.reloadTime;
                this.lastFired = now;
                
            }
        }
    }
}

class PlayerCannon extends Cannon {

    constructor(ship, offsetX, offsetY, rotationAngle, targetGroup, projectileList) {
        super(ship, offsetX, offsetY, rotationAngle, targetGroup, projectileList);
        this.hostility = 'friendly';
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

    aimAndReload() {
        // only while radar is drawn a currentAmmo is set
        this.currentAmmo = new HostileAmmo(this.globalX, this.globalY, this.globalRotation + this.targetAngle);
        this.searchSectorAngle = this.currentAmmo.searchSectorAngle;
        this.range = this.currentAmmo.range;

        this.searchSectorAngle = Math.PI / 3;
        this.range = 450;

        // not shown
        // context.beginPath();
        // context.arc(0, 0, this.range, -this.searchSectorAngle / 2, this.searchSectorAngle / 2);
        // context.lineTo(0, 0);
        // context.fillStyle = 'rgba(255, 0, 0, 0.1)';  
        // context.fill();
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
        this.hostility = 'friendly'
        this.speed = 1.5;  
        this.searchSectorAngle = Math.PI / 3;
        
        this.reloadTime = 10000;
        this.range = 450;
        this.hostility = 'friendly'
    }
}

class HostileAmmo extends Ammo {
    constructor(x, y, direction) {
        super(x, y, direction);
        this.hostility = 'enemy'
        this.speed = 1.5;  
        this.searchSectorAngle = Math.PI / 3;
        this.reloadTime = 10000;
        this.range = 450;
        this.hostility = 'enemy'
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

// mechanism && helper functions etc
// simple pt to AB distance
function closestPointOnLine(px, py, xA, yA, xB, yB) {

    let lineLength = (xB - xA) ** 2 + (yB - yA) ** 2;
    let u = ((px - xA) * (xB - xA) + (py - yA) * (yB - yA)) / lineLength; //if u <0 or u > 1, u not on the line

    u = Math.max(0, Math.min(1, u)); // u valid only in range(0, 1)
    let x = xA + u * (xB - xA);
    let y = yA + u * (yB - yA);

    //coordination of P(px, py)'s projection on the line
    let distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

    return { distance: distance, point: { x: x, y: y } };
}


// for radar detection
function distanceFromCannonToPolygon(px, py, hitbox) {
    let minDist = Infinity;
    let angleWithMinDist = 0; 
    let closestPoint = null; 

    for (let i = 0; i < hitbox.length; i++) {
        //two adjacent vertexs as xAyA, xByB
        let j = (i + 1) % hitbox.length;
        let xA = hitbox[i].x, yA = hitbox[i].y;
        let xB = hitbox[j].x, yB = hitbox[j].y;
        
        
        let result = closestPointOnLine(px, py, xA, yA, xB, yB);
        
        if (result.distance < minDist) {
            minDist = result.distance;
            closestPoint = result.point;
            angleWithMinDist = Math.atan2(result.point.y - py, result.point.x - px);
        }
    }
    return { distance: minDist, angle: angleWithMinDist, closestPoint: closestPoint };
}

// for hitbox and future collision (not yet implemented)
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

//Ray Casting Algorithm to check if pt is inside Polygon
//Material cannot be directly copy: https://www.youtube.com/watch?v=RSXM9bgqxJM
//                                  https://www.bilibili.com/video/BV1ce4y1j7a6/?spm_id_from=333.337.search-card.all.click&vd_source=527af51298f5c974212d8c41d444ed04

// Collision Detection: https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/Collision_detection
// SAT: https://www.metanetsoftware.com/technique/tutorialA.html
// Math & Coding Instruction: https://www.youtube.com/watch?v=-EsWKT7Doww

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



// Ship collision detection (Not yet implemented)


//// not yet implemented
// function projectPolygon(axis, polygon) {
//     let min = Infinity, max = -Infinity;
//     for (let i = 0; i < polygon.length; i++) {
//         let vertex = (polygon[i].x * axis.x) + (polygon[i].y * axis.y);
//         if (vertex < min) min = vertex;
//         if (vertex > max) max = vertex;
//     }
//     return { min: min, max: max };
// }

// function overlap(projection1, projection2) {
//     if (projection1.max >= projection2.min && projection2.max >= projection1.min) {
//         return true;
//     }
//     return false;
// }

// function isShipCollide(hitbox1, hitbox2) {
//     let edges = getEdges(hitbox1).concat(getEdges(hitbox2));
//     for (let i =0; i < edges.length; i ++) {
//         let axis = { 
//             x: -edges[i].y, 
//             y: edges[i].x
//         };
//         let projection1 = projectPolygon(axis, hitbox1);
//         let projection2 = projectPolygon(axis, hitbox2);
//         if (!overlap(projection1, projection2)) {
//             return false;
//         }
//     }
//     return true;
// }

// hud

class Hud {
    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.player = player;
        this.image = new Image();
        this.image.src = 'images/hud.png'
    }
    
    update(){

    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);

        context.fillStyle = 'black';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Hullpoint: ' + this.player.hullPoint, 0, -this.image.height / 2 + 50);
        context.fillText('Speed: ' + (this.player.setSpeed * 10).toFixed(0), 0, -this.image.height / 2 + 75);

        context.restore();
    }
}


//global variables
let projectileList = []; //arrays are kept in global to massively simplify the data structure to fasten collision detection

let friendlies = [];

let enemies = [];

let destroies = [];

// game loop
function init(){
    const canvas = document.querySelector("canvas");
    canvas.width = 1600
    canvas.height = 900;

    
    
    
    const context = canvas.getContext("2d");

    const randomY = Math.random() < 0.5 ? -500 : -400;
    
    const playerShip = new PlayerShip(canvas.width/2 - 400, canvas.height/2, 0);
    const dummy1 = new EnemyShip1(canvas.width/2 + 300, canvas.height/2 + randomY, -Math.PI);
    // const dummy2 = new Dummy(canvas.width/2 - 400, canvas.height/2 + 100, 0);

    const hud = new Hud(canvas.width/2, canvas.height - 75, playerShip);
    function gameLoop() {
        // Calculate difference between player and center of canvas
        let dx = canvas.width / 2 - playerShip.x;
        let dy = canvas.height / 2 - playerShip.y;
    
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Mark enemy outside of visible range
        for (let ship of enemies) {
            let screenX = ship.x + dx;  
            let screenY = ship.y + dy;  
    
            if (screenX < 0 || screenX > canvas.width || screenY < 0 || screenY > canvas.height - 150) {
                let markingX = Math.max(0, Math.min(canvas.width, screenX));
                let markingY = Math.max(0, Math.min(canvas.height - 150, screenY));
    
                context.fillStyle = 'red';
                context.fillRect(markingX - 5, markingY - 5, 10, 10);  // Center the marker
            }
        }
        
        context.save();

        // Start camera following
        // Set canvas to the center of player
        context.translate(dx, dy);
        
        // Units
        playerShip.update();
        playerShip.draw(context);
    
        dummy1.update();     
        dummy1.draw(context);
    
        // Shooting ammo 
        projectileList.forEach(ammo => {
            ammo.update();
            ammo.draw(context);
        });
    
        
        context.save();  // Save context to adjust for off-screen markings
        context.translate(-dx, -dy);  // move camera to this coord
        
        context.restore();  // Restore context to continue with translated state
    
        // Restore the original context state for HUD drawing
        context.restore();
        hud.update();
        hud.draw(context);
        
        if (playerShip.isDestroied) {
            cancelAnimationFrame(gameLoop);
            context.fillStyle = 'red';
            context.font = '50px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
            return;
        } else if (dummy1.isDestroied) {
            context.fillStyle = 'green';
            context.font = '50px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('You Win', canvas.width / 2, canvas.height / 2);

            return;
        }
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}