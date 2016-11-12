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
  
  Vector.prototype.fix = function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this; 
  }
  
  Vector.prototype.toFixed = function() {
    return copy().fix();
  }
  
  return Vector;
})();
