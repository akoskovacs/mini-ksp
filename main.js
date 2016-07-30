var angle = {
    toDeg: function(rad) {
        return 180/(Math.PI/rad);
    },
    toRad: function(deg) { 
        return (Math.PI/180)*deg;
    }
}

var Vector = (function() {
  function Vector(x, y) {
  
    this.x = x || 0;
    this.y = y || 0;
    return this;
  }

  Vector.createPolar = function(phi, len) {
    var v = new Vector();
    v.setPolar(phi, len);
    return v;
  }

  Vector.prototype.createFrom = function(v) {
    return new Vector(v.x, v.y);
  }
  
  Vector.prototype.isEqual = function(v) {
    return (this.x === v.x) && (this.y === v.y);
  }

  Vector.prototype.copy = function() {
    return new Vector(this.x, this.y);
  }

  Vector.prototype.getAngle = function() {
    return Math.atan2(this.y, this.x);
  }

  Vector.prototype.getLengthSquared = function() {
    return (this.x*this.x) + (this.y*this.y);
  }

  Vector.prototype.getLength = function() {
    return Math.sqrt(this.getLengthSquared());    
  }

  Vector.prototype.setLength = function(len) {
    var phi = this.getAngle();
    return this.setPolar(phi, len);
  }
  
  Vector.prototype.setAngle = function(phi) {
    var len = this.getLength();
    return this.setPolar(phi, len);
  }

  Vector.prototype.set = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  Vector.prototype.add = function(v) {
    return new Vector(this.x+v.x, this.y+v.y);
  }
  
  Vector.prototype.sub = function(v) {
    return new Vector(this.x-v.x, this.y-v.y);
  }

  Vector.prototype.multiply = function(v) {
    return new Vector(this.x*v.x, this.y*v.y);
  }

  Vector.prototype.divide = function(v) { // et impera
    return new Vector(this.x/v.x, this.y/v.y);
  }

  Vector.prototype.angleTo = function(v) {
    return Math.atan2(v.y-this.y, v.x-this.x);
  }

  Vector.prototype.setAngleTo = function(v) {
    var phi = this.angleTo(v);
    this.setAngle(phi);
    return phi;
  }

  Vector.prototype.setLengthTo = function(v, len) {
    var phi = this.angleTo(v);
    this.setPolar(phi, len);
    return this;
  }

  Vector.prototype.setPolar = function(phi, len) {
    this.x = Math.cos(phi) * len;
    this.y = Math.sin(phi) * len;
    return this;
  }

  Vector.prototype.scale = function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  Vector.prototype.addScalar = function(scalar) {
    this.x += scalar;
    this.y += scalar;
    return this;
  }

  Vector.prototype.distanceTo = function(v) {
    var dx = v.x-this.x,
        dy = v.y-this.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  Vector.prototype.addTo = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  Vector.prototype.subFrom = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  Vector.prototype.mulBy = function(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  Vector.prototype.divBy = function(v) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  Vector.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
  }
  
  return Vector;
})();

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
            pos: new Vector(centerX, centerY),
            velocity: new Vector(),
            rotation: 0,
            color: '#44bbcc',
            size: 63,//6371e3, // meter
            mass: 1000//597e21 // Kg
        },
        {
            name: 'Mars',
            pos: new Vector(700, centerY),
            velocity: new Vector(),
            color: '#aaaa00',
            size: 10,//3390e3,  // meter
            mass: 15000//639e21 // Kg
        }],
        STAR_COUNT     = 200,
        PROJECTILE_TTL = 100,
        PROJECTILE_MAX = 5;
   
    var earth   = planets[0],
        mars    = planets[1],
        gravity = new Vector(),
        stars   = [],
        keymap  = [],
        projectiles = [],
        assets = {
          earth: document.getElementById("planet-earth"),
          rocket: document.getElementById("rocket-noflame"),
          rocket_flame: document.getElementById("rocket-wflame")
        },
        startxy  = new Vector(centerX, centerY-300),
        startvel = Vector.createPolar(angle.toRad(0), 4.5),
        ship    = { 
            pos: startxy.copy(), 
            velocity: startvel.copy(),
            gravity: new Vector(),
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
      /*
      context.fillRect(ship.pos.x, ship.pos.y, 10, 10);                     // image (0,0) marker
      context.arc(ship.pos.x+halfW, ship.pos.y+halfH, 10, 0, Math.PI*2); // center marker
      context.fillRect(ship.pos.x+halfW*2, ship.pos.y+halfH*2, 10, 10);     // marker for (w, h)
      */
       
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
        velocity: new Vector(),
        pos: ship.pos.copy(),
        gravity: new Vector(),
        mass: 10,
        ttl: 100
      };
      var phi = ship.heading-(Math.PI/2),
            v = Vector.createPolar(phi, ship.img.height/2); // Position on the nose cone
      
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
          var v = Vector.createPolar(ship.heading-Math.PI/2, 0.1);
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
      stars.push(new Vector(Math.random()*width, Math.random()*height));
    }
    render();
}
