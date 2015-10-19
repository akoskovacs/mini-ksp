var angle = {
    toDeg: function(rad) {
        return 180/(Math.PI/rad);
    },
    toRad: function(deg) { 
        return (Math.PI/180)*deg;
    }
}

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
    var canvas     = document.getElementById("canvas"),
        context    = canvas.getContext("2d"),
        width      = canvas.width  = window.innerWidth,
        height     = canvas.height = window.innerHeight,
        canvasData = context.getImageData(0, 0, width, height),
        centerY    = height/2,
        centerX    = width/2;
  
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
        STAR_COUNT     = 200,
        PROJECTILE_TTL = 100,
        PROJECTILE_MAX = 5;
   
    var earth   = planets[0],
        mars    = planets[1],
        gravity = vector.create(),
        stars   = [],
        keymap  = [],
        projectiles = [],
        assets = {
          earth: document.getElementById("planet-earth"),
          rocket: document.getElementById("rocket-noflame"),
          rocket_flame: document.getElementById("rocket-wflame")
        },
        startxy  = vector.create(centerX, centerY-300),
        startvel = vector.createPolar(angle.toRad(0), 1.7),
        ship    = { 
            pos: startxy.copy(), 
            velocity: startvel.copy(),
            gravity: vector.create(),
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
    myship = ship;

    function gravitateTo(planet, obj) {
      var r   = planet.pos.distanceTo(obj.pos),
          f   = (planet.mass*obj.mass)/(r*r),
          phi = obj.pos.angleTo(planet.pos);
      
      obj.gravity.setPolar(phi, f);
      return gravity;
    }
    
    function doGravity(planet, obj) {
      /* Comment out the next line, to disable gravity */
      gravitateTo(planet, obj);
      obj.velocity.addTo(obj.gravity);
      obj.pos.addTo(obj.velocity);
    }
    
    /* Dumb collision detection */
    function isInCircle(cpos, pos, r) {
      var dx = pos.x-cpos.x,
          dy = pos.y-cpos.y;
      
      return dx*dx+dy*dy < r*r;
    }
  
    function doPhysics() {
      var r_earth = assets.earth.width/2;
      doGravity(earth, ship);
      /* Reset ship on collision */
      if (isInCircle(earth.pos, ship.pos, r_earth+10)) {
        ship.pos.set(startxy);
        ship.velocity.set(startvel);
      }
      
      for (var i = 0; i < projectiles.length; i++) {
        var p = projectiles[i];
        doGravity(earth, p);
        if (isInCircle(earth.pos, p.pos, r_earth+5)) {
          /* If the projectile collided with the planet, delete it from the array.
             It's a pity, that we have done all these physics on it... :( */
          projectiles.splice(i, i); 
        }
      }
    }

    function repositionIfGone(obj, x, y) {
      if (x <= 0) {
        obj.pos.x = width;
      } else if (x > width) {
        obj.pos.x = 0;
      }
      if (y <= 0) {
        obj.pos.y = height-10;
      } else if (y >= height) {
        obj.pos.y = 0;
      }
    }
  
    function drawProjectiles() {
      for (var i = 0; i < projectiles.length; i++) {
        var p = projectiles[i];
        repositionIfGone(p, p.pos.x, p.pos.y);
        context.beginPath();
        context.shadowBlur  = 20;
        context.fillStyle   = '#ff0';
        context.shadowColor = 'yellow'; //'#aa0';
        context.strokeStyle = '#440';
        context.arc(p.pos.x, p.pos.y, 3, 0, Math.PI*2);
        context.fill();
        context.stroke();
        context.closePath();
      }
      context.shadowBlur = 0;
    }
  
    function drawStars() {
      context.beginPath();
      context.fillStyle = "white";
      for (var i = 0; i < STAR_COUNT; i++) {
        context.fillRect(stars[i].x, stars[i].y, 2, 2);
      }
    }
  
    function drawPlanets() {
      var halfH = assets.earth.height/2,
          halfW = assets.earth.width/2;
          
      // These lines could rotate the Earth
      /*
      context.beginPath();
      context.save();
      context.translate(earth.pos.x, earth.pos.y);
      context.rotate(earth.rotation);
      context.drawImage(assets.earth, -halfW, -halfH);
      */
      context.shadowBlur = 30;
      context.shadowColor = 'blue';
      context.drawImage(assets.earth, earth.pos.x-halfW, earth.pos.y-halfH);
      /*
      context.restore();
      context.closePath();
      earth.rotation += 0.001;
      */
    }
  
    function drawCraft() {
     var halfW = ship.img.width/2+14,
          halfH = ship.img.height/2;
      //repositionIfGone(ship, ship.pos.x, ship.pos.y); // TODO
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
      /* Some useful debug shapes for the spacecraft image coordinates */
      //context.fillRect(ship.pos.x, ship.pos.y, 10, 10);                     // image (0,0) marker
      //context.arc(ship.pos.x+halfW, ship.pos.y+halfH, halfH, 0, Math.PI*2); // center marker
      //context.fillRect(ship.pos.x+halfW*2, ship.pos.y+halfH*2, 10, 10);     // marker for (w, h)
      context.save();
      /* These magic lines, are only here to do rotation on a single image (muh canvas) */
      context.translate(ship.pos.x+halfW, ship.pos.y+halfH);
      context.rotate(ship.heading);
      context.drawImage(ship.img, -halfW, -halfH);
      context.restore();
      context.fill();
      context.closePath();
    }
  
    function createProjectile() {
      var proj = {
        velocity: vector.create(),
        pos: ship.pos.copy(),
        gravity: vector.create(),
        mass: 10,
        ttl: 100
      };
      var phi = ship.heading-(Math.PI/2),
            v = vector.createPolar(phi, ship.img.height/2); // Position on the nose cone
      
      /* Translate the starting position to the ship's current position */
      proj.pos.addTo(v);
      /* Correct location to the ship's center point */
      proj.pos.x += ship.img.width/2+14; // Some magic
      proj.pos.y += ship.img.height/2;
      /* Make the projectile move a bit faster than the ship (with the correct heading) */
      proj.velocity.setPolar(phi, ship.velocity.getLength()+1);
      if (projectiles.length >= PROJECTILE_MAX) { 
        projectiles.shift(); // Eliminate space debris
      }
      projectiles.push(proj);
    }
   
    function doKeys() {
        if (keymap[37] == 'keydown') { // left
          ship.heading -= 0.08;
          keymap[37] == undefined;
        }
        if (keymap[38] == 'keydown') { // up
          var v = vector.createPolar(ship.heading-Math.PI/2, 0.1);
          ship.velocity.addTo(v);
          ship.img = assets.rocket_flame;
          keymap[38] == undefined;
        } else if (keymap[38] == 'keyup') {
          ship.img = assets.rocket;
          keymap[38] == undefined;
        }
        if (keymap[39] == 'keydown') { // right
          ship.heading += 0.08;
          keymap[39] == undefined;
        }
        if (keymap[32] == 'keyup') { // space
          createProjectile();
          keymap[32] = undefined;
        }
      //keymap = [];
    }
  
    function render() {
        context.clearRect(0, 0, width, height);
        doKeys();
        doPhysics();
        drawStars();
        drawProjectiles();
        drawCraft();
        drawPlanets();
        window.requestAnimationFrame(render);
    };
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push(vector.create(Math.random()*width, Math.random()*height));
    }
    render();
}
