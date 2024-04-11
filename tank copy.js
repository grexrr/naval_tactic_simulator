document.addEventListener('DOMContentLoaded', init, false);

// game elements
// Units
function max_speed(a, b) {
    return a > b ? a: b;
}

class Tank {
    constructor(x, y, bodyColor, turretColor) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 50;
        this.color = bodyColor;
        this.speed = 0;
        this.bodyRotation = -Math.PI / 2;
        this.turret = {
            offsetX: 0 + 4, //turret position
            offsetY: 0, 
            length: 50,  //turret length
            width: 5,
            height: 20,
            color: turretColor,
            rotation: 0, 
        };
    }

    update() {
        this.x += Math.cos(this.bodyRotation) * this.speed;
        this.y += Math.sin(this.bodyRotation) * this.speed;
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.bodyRotation);

        context.fillStyle = this.color;
        context.fillRect(-this.height / 2, -this.width / 2, this.height, this.width);
        
        this.drawTurret(context);
        context.restore();
    }

    drawTurret(context) {
        context.save();
        context.translate(this.turret.offsetX, this.turret.offsetY);

        context.rotate(this.turret.rotation); 
        context.fillStyle = this.turret.color;
        
        context.fillRect(0, -this.turret.width / 2, this.turret.length, this.turret.width);
        context.restore();
    }
    
    
}

class PlayerTank extends Tank { 
    constructor(x, y) {
        super(x, y, '#008000', '#005000');
        // this.newSpeed = 0;
        this.clutchSpeed = .3;
        this.maxSpeed = 3 * this.clutchSpeed;
        this.minSpeed = -this.clutchSpeed;
        this.bodyRotationSpeed = 0.03;
        this.health = 100;
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }


    handleKeydown(event) {
        switch (event.key) {
            case 'w':
                this.speed = Math.min(this.speed + this.clutchSpeed, this.maxSpeed);
                break;

            case 's':
                this.speed = Math.max(this.speed - this.clutchSpeed, this.minSpeed);
                break
            
            case 'a':
                this.bodyRotation -= this.bodyRotationSpeed;
                break

            case 'd':
                this.bodyRotation += this.bodyRotationSpeed;
                break
        }
    }
}

class EnemyTank extends Tank { 
    constructor(x, y) {
        super(x, y, '#FF0000', '#005000');
    }

    updateAI() {
        // AI行为
    }
}


function init() {
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");
    const playerTank = new PlayerTank(canvas.width / 2, canvas.height / 2);
    // const enemyTank = new EnemyTank(100, 100); 

    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        playerTank.update();
        playerTank.draw(context);
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}
