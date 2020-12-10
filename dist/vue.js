(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // Observer类是干什么用的？
  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 需要对value属性重新定义
      this.walk(value); // 把对象里的数据，一步一步地都变成响应式的
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 将对象中的所有key，重新用defineProperty定义成响应式的
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    Object.defineProperty(data, key, {
      get: function get() {
        console.log("get");
        return value;
      },
      set: function set(newValue) {
        console.log("set");
        if (newValue === value) return;
        value = newValue;
      }
    });
  }
  function observer(data) {
    // 只能对对象类型进行侦测 非对象类型无法侦测
    if (_typeof(data) !== 'object' || data === null) {
      return;
    } // 通过类来实现对数据的侦测 类可以方便扩展，会产生实例


    return new Observer(data); // Observer是在原对象上监听数据的
  }

  function initState(vm) {
    // 将所有数据都定义在vm属性上，并且后续更改 需要触发视图更新
    var opts = vm.$options; // 获取用户属性

    if (opts.data) {
      // 数据的初始化
      initData(vm);
    }
  }

  function proxy(vm, source, key) {
    // 代理属性    为了用户能直接通过vm拿到data里的属性
    Object.defineProperty(vm, key, {
      get: function get() {
        console.log('get proxy');
        return vm[source][key];
      },
      set: function set(newValue) {
        console.log('set proxy');
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    // 数据劫持 Object.defineProperty
    var data = vm.$options.data; // 对data类型进行判断 如果是函数 获取函数返回值作为对象

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // (注释1)
    // 通过vm._data获取劫持后的数据，用户就可以拿到_data了
    // 将_data中的数据全部放到vm上

    for (var key in data) {
      proxy(vm, '_data', key); // vm.name => vm._data.name
    } // 侦测这个数据


    observer(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 实例上有个属性$options 表示的是用户传入的所有属性
      // 初始化状态

      initState(vm);
    };
  }

  // vue在2.0版本中就是一个构造函数

  function Vue(options) {
    this._init(options); // 当用户new Vue时，就调用init方法进行vue的初始化

  } // 可以拆分逻辑到不同的文件中，利于代码维护


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
