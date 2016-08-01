(function(win, doc) {

  var Events = function() {
    this.map = {};
  };

  Events.prototype = {
    constructor: Events,
    trigger: function(name, args) {
      var self = this,
        cbs = this.map[name];
      if (cbs) {
        cbs.forEach(function(fn) {
          fn.apply(self, args);
        });
      }
    },
    on: function(name, cb) {
      if (this.map[name]) {
        this.map[name].push(cb);
      } else {
        this.map[name] = [cb];
      }
    }
  };

  var utils = {
    deviceW: (function() {
      return doc.body.clientWidth;
    })(),
    getStyle: function(obj, sName) {
      return obj.currentStyle || getComputedStyle(obj, false)[sName];
    },
    addEvent: function(obj, sEv, fn) {
      obj.addEventListener(sEv, fn, false);
    },
    removeEvent: function(obj, sEv, fn) {
      obj.removeEventListener(sEv, fn, false);
    }
  };

  var ATTRS = {
    BOXCLS: 'J_slide_box',
    ITEMCLS: 'J_slide_item'
  };

  function Slide($element) {
    this.$element = $element;
    this.left = 0;
    this.events = new Events();
    this.init($element);
  }

  Slide.prototype = {
    constructor: Slide,
    start: function(ev) {
      this.startX = ev.touches[0].clientX - this.boxLeft;
    },
    move: function(ev) {
      this.moveX = ev.touches[0].clientX - (this.startX - this.left);
      this.$box.style.transition = '';
      this.$box.style.transform = 'translate(' + this.moveX + 'px,0) translateZ(0px)';
      if (this.moveX > 0) {
        this.events.trigger('leftOver', [this.moveX]);
      } else if (this.boxWidth - Math.abs(this.moveX) < this.$element.clientWidth) {
        this.events.trigger('rightOver', [this.$element.clientWidth - (this.boxWidth - Math.abs(this.moveX))]);
      }
      ev.preventDefault();
    },
    end: function() {
      this.left = this.moveX;
      if (this.left > 0) {
        this.left = 0;
      } else if (this.boxWidth - Math.abs(this.left) < this.$element.clientWidth) {
        this.left = -(this.boxWidth - this.$element.clientWidth);
      }
      this.$box.style.transform = 'translate(' + this.left + 'px,0) translateZ(0px)';
      this.$box.style.transition = '300ms all ease';
      this.events.trigger('end');
    },
    bindEvent: function() {
      var $box = this.$box;
      utils.addEvent($box, 'touchstart', this.start.bind(this));
      utils.addEvent($box, 'touchmove', this.move.bind(this));
      utils.addEvent($box, 'touchend', this.end.bind(this));
    },
    setBoxStyle: function($element) {
      var $box = $element.getElementsByClassName(ATTRS.BOXCLS)[0];
      var $items = $element.getElementsByClassName(ATTRS.ITEMCLS);
      var boxwidth = 0;
      Array.from($items).forEach(function($item) {
        boxwidth += $item.offsetWidth + parseInt(utils.getStyle($item, 'margin-left'), 10) + parseInt(utils.getStyle($item, 'margin-right'), 10);
      });
      $box.style.width = boxwidth + 'px';
      $box.style.height = $items[0].offsetHeight + 'px';
      $element.style.width = $element.offsetWidth + 'px';
      $element.style.overflow = 'hidden';
      this.boxWidth = boxwidth;
      this.boxLeft = $box.offsetLeft;
      this.boxTop = $box.offsetTop;
      this.$box = $box;
    },
    init: function(element) {
      this.setBoxStyle(element);
      this.bindEvent();
    }
  };

  win.touchSlide = Slide;

})(window, document);
