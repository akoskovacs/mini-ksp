var angle = {
    toDeg: function(rad) {
        return 180/(Math.PI/rad);
    },
    // Radians are bad and you should feel bad.
    toRad: function(deg) { 
        return (Math.PI/180)*deg;
    }
}
// Shitty vectors are shitty
var vector = {
    x: 0,
    y: 0,
    create: function(_x, _y) {
        var obj = Object.create(this);
        obj.x = _x || 0;
        obj.y = _y || 0;
        return obj;
    },
    createPolar: function(phi, len) {
        v = this.create();
        return v.setPolar(phi,len);
    },
    createFrom: function(v) {
        return vector.create(v.x, v.y);
    },
    isEqual: function(v) {
        return (this.x === v.x) && (this.y === v.y);
    },
    copy: function() {
        return vector.create(this.x, this.y);
    },
    getAngle: function() {
        return Math.atan2(this.y, this.x);
    },
    getLengthSquared: function() {
        return (this.x*this.x) + (this.y*this.y);
    },
    getLength: function() {
        return Math.sqrt(this.getLengthSquared());    
    },
    setLength: function(len) {
        var phi = this.getAngle();
        return this.setPolar(phi, len);
    },
    setAngle: function(phi) {
        var len = this.getLength();
        return this.setPolar(phi, len);
    },
    set: function(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    },
    add: function(v) {
        return vector.create(this.x+v.x, this.y+v.y);
    },
    sub: function(v) {
        return vector.create(this.x-v.x, this.y-v.y);
    },
    multiply: function(v) {
        return vector.create(this.x*v.x, this.y*v.y);
    },
    divide: function(v) { // et impera
        return vector.create(this.x/v.x, this.y/v.y);
    },
    angleTo: function(v) {
        return Math.atan2(v.y-this.y, v.x-this.x);
    },
    setAngleTo: function(v) {
        var phi = this.angleTo(v);
        this.setAngle(phi);
        return phi;
    },
    setLengthTo: function(v, len) {
        var phi = this.angleTo(v);
        this.setPolar(phi, len);
        return this;
    },
    setPolar: function(phi, len) {
        this.x = Math.cos(phi) * len;
        this.y = Math.sin(phi) * len;
        return this;
    },
    scale: function(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },
    addScalar: function(scalar) {
        this.x += scalar;
        this.y += scalar;
        return this;
    },
    distanceTo: function(v) {
        var dx = v.x-this.x,
            dy = v.y-this.y;
        return Math.sqrt(dx*dx + dy*dy);
    },
    addTo: function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    },
    subFrom: function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },
    mulBy: function(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    },
    divBy: function(v) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    },
    toString: function() {
        return '(' + this.x + ', ' + this.y + ')';
    }
};

window.onload = function() {
    var canvas  = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        width   = canvas.width = window.innerWidth,
        height  = canvas.height = window.innerHeight;
    
    var centerY = height * .5,
        centerX = width * .5;
    var planets = [
        {
            name: 'Föld',
            pos: vector.create(centerX, centerY),
            velocity: vector.create(),
            rotation: 0,
            color: '#44bbcc',
            size: 63,//6371e3, // meter
            mass: 100//597e21 // Kg
        },
        {
            name: 'Mars',
            pos: vector.create(700, centerY),
            velocity: vector.create(),
            color: '#aaaa00',
            size: 10,//3390e3,  // meter
            mass: 15000//639e21 // Kg
        }],
        STAR_COUNT = 200;
   
    var earth   = planets[0],
        mars    = planets[1],
        gravity = vector.create(),
        stars   = [],
        keymap  = [],
        assets = {
          earth: document.getElementById("planet-earth"),
          rocket: document.getElementById("rocket-noflame"),
          rocket_flame: document.getElementById("rocket-wflame")
        },
        startxy = vector.create(centerX, centerY-300),
        ship    = { 
            pos: startxy, 
            velocity: vector.createPolar(angle.toRad(0), 1.7),
            heading: angle.toRad(90),
            oldpos: startxy.copy(),
            img: assets.rocket,
            size: 10,
            mass: 10
        }

    /* Simultanious keypresses */
    onkeydown = onkeyup = function(e) {
      keymap[e.keyCode] = e.type;
    }

    function gravitateTo(planet) {
      var r   = planet.pos.distanceTo(ship.pos),
          f   = (planet.mass*ship.mass)/(r*r),
          phi = ship.pos.angleTo(planet.pos);
      return vector.createPolar(phi, f);
    }
    
    function doPhysics() {
      gv = gravitateTo(earth);
      ship.velocity.addTo(gv);
      ship.pos.addTo(ship.velocity);
    }

    function drawStars() {
      context.beginPath();
      context.strokeStyle = 'white';
      for (var i = 0; i < STAR_COUNT; i++) {
        context.rect(stars[i].x, stars[i].y, 1, 0);
        context.stroke();
      }
    }
  
    function drawPlanets() {
      var halfH = assets.earth.height/2,
          halfW = assets.earth.width/2;
          
      context.beginPath();
      /*
      context.save();
      context.translate(earth.pos.x, earth.pos.y);
      context.rotate(earth.rotation);
      context.drawImage(assets.earth, -halfW, -halfH);
      */
      context.drawImage(assets.earth, earth.pos.x-halfW, earth.pos.y-halfH);
      /*
      context.restore();
      context.closePath();
      earth.rotation += 0.001;
      */
    }
  
    function drawCraft() {
      var halfW = ship.img.width/2,
          halfH = ship.img.height/2;
      if (ship.pos.x+halfW <= 0) {
        ship.pos.x = width;
      } else if (ship.pos.x > width) {
        ship.pos.x = 0;
      }
      if (ship.pos.y+halfH <= 0) {
        ship.pos.y = height;
      } else if (ship.pos.y > height) {
        ship.pos.y = 0;
      }
      context.beginPath();
      context.save();
      context.translate(ship.pos.x+halfW, ship.pos.y+halfH);
      context.rotate(ship.heading);
      context.drawImage(ship.img, -halfW, -halfH);
      context.restore();
      context.closePath();
    }
   
    function doKeys() {
        if (keymap[37] == 'keydown') { // left
          ship.heading -= 0.1;
          console.log("left");
        }
        if (keymap[38] == 'keydown') { // up
          var v = vector.createPolar(ship.heading-Math.PI/2, 0.5);
          ship.velocity.addTo(v);
          ship.img = assets.rocket_flame;
        } else if (keymap[38] == 'keyup') {
          ship.img = assets.rocket;
        }
        if (keymap[39] == 'keydown') {
          ship.heading += 0.1;
          console.log("right");
        }
      keymap = [];
    }
  
    function render() {
        context.clearRect(0, 0, width, height);
        doKeys();
        doPhysics();
        drawStars();
        drawCraft();
        drawPlanets();
        window.requestAnimationFrame(render);
    };
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push(vector.create(Math.random()*width, Math.random()*height));
    }
    render();
}