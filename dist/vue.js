(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('..')) :
  typeof define === 'function' && define.amd ? define(['..'], factory) :
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

  var oldArrayProtooMethods = Array.prototype; // 不能直接改写数组原有方法，不可靠，因为只有被vue控制的数组才需要改写

  var arrayMethods = Object.create(Array.prototype); // 创建一个元素，让链指向这个原型。arrayMethods继承Array.prototype。
  // arrayMethods.__proto__ === Array.prototype 
  // arrayMethods拷贝了数组的原型，这样就可以添加自己的方法了

  /**
      arrayMethods.__proto__.push // 拷贝了数组的原型

      arrayMethods.push // 以添加自己的方法了

      当数组调用push的时候，先找的是arrayMethods.push自己的方法，当arrayMethods上没有自己的push方法时，才会去arrayMethods.__proto__上找push方法
   */
  // vue2中修改原有数组中的length，是监控不到的

  var methods = [// 只有这些数组方法才会改变原数组，其它的数组方法不会改变原数组，所以监听这些数组方法的调用就可以了
  'push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    // AOP切片编程
    arrayMethods[method] = function () {
      var _oldArrayProtooMethod;

      // 重写数组方法
      // todo... 更新视图
      console.log("改写后的" + method);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = (_oldArrayProtooMethod = oldArrayProtooMethods[method]).call.apply(_oldArrayProtooMethod, [this].concat(args)); // this指向arrayMethods
      // 这一坨代码是侦测数组里新增的数据的，向pop、shift和splice的删除数组元素的操作，没有写，但是vue2源码里也都写了
      // 有可能用户新增的数据是对象格式，也需要进行拦截  'push','unshift','splice'都有增加功能


      var inserted;
      var ob = this.__ob__; // （备注4）this是在./index.js文件里定义的  这里的this就是method在哪里被谁调用的，是在./index.js的Observer对象里的value调用的

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          // xx.splice(0,1,xxx)
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        ob.observerArray(inserted);
      }

      return result;
    };
  });
  /** 
  new Vue({
      data() {
          return {
              obj: {
                  a: [1,2,3]
              }
          };
      }
  });

  vm.obj.a[0] = 4;// 是监控不到的，因为修改的是数组的索引上的值，但是vue中对数组的监控只监控了'push','pop','shift','unshift','splice','reverse','sort'这七个方法

  vue2中Map类型也不能监控，监控不到

  */

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 需要对value属性重新定义
      // value.__ob__ = this; // 自定义属性，能让./array.js中的（备注4）那里可以拿到this，进而使用observerArray()方法  但是这样写会有问题，如果value是对象，会一直走walk方法，循环死了，因为value.__ob__为this，this是对象，对象里面还是对象，就会一直走哦walk方法
      // 那就想办法，让walk方法的forEach不能循环__ob__就可以了，因此使用Object.defineProperty来定义__ob__属性
      Object.defineProperty(value, '__ob__', {
        value: this,
        enumerable: false,
        // 不能被枚举（表示不能被循环）
        configurable: false // 不能删除此属性

      }); // value可能是对象 可能是数组 分类来处理

      if (Array.isArray(value)) {
        // 数组不用defineProperty来进行代理，性能不好
        // 那该怎么监听数组呢？
        // 数组常用的方法有：push、shift、reverse、sort等，那么我们重写数组的这些方法，在里面加上更新的逻辑，这样就可以监听了
        // value.__proto__ = arrayMethods; // 当是数组时，改写方法为自己重写后的方法 __proto__有兼容性问题，可以使用Object.setPrototypeOf()方法
        Object.setPrototypeOf(value, arrayMethods); // 数组里的元素放的有可能是引用类型obejct 如果对象变化了 也需要更新视图

        this.observerArray(value); // 处理的是原有数组中的对象
      } else {
        this.walk(value); // 把对象里的数据，一步一步地都变成响应式的
      }
    } // 侦测数组变化


    _createClass(Observer, [{
      key: "observerArray",
      value: function observerArray(value) {
        for (var i = 0; i < value.length; i++) {
          observer(value[i]);
        }
      } // 侦测对象变化的

    }, {
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
    // value可能也是一个对象
    observer(value); // （注释2）对结果递归拦截（如果data对象里的数据嵌套太深，那么会进行深层次的递归拦截，对性能有影响，所以vue2中数据嵌套不要过深，会浪费性能）

    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observer(newValue); // （注释3）如果用户设置的是一个对象，就继续将用户设置的对象变成响应式的

        value = newValue;
      }
    });
  }
  function observer(data) {
    // 只能对对象类型进行侦测 非对象类型无法侦测
    if (_typeof(data) !== 'object' || data === null) {
      return;
    }

    if (data.__ob__) {
      // 防止循环引用
      return; // 要侦测的data如果有__ob__属性，说明这个data已经被侦测过了
      // 因此在vue2里，如果看到某个object或者array数据里看到了__ob__，就说明这个对象已经被侦测过了
    } // 通过类来实现对数据的侦测 类可以方便扩展，会产生实例


    return new Observer(data); // Observer是在原对象上监听数据的
  }
  /**
      删除了元素，需要去掉侦测么？
      无所谓，不太关心这个。因为如果数组里被删除的内容，如果是对象的话，也会触发重新侦测的，因为重写了数组的pop、shift和splice方法，vue2里面会重新侦测的
      如果是对象的话，那就更会被重新侦测的
   */

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
        return vm[source][key];
      },
      set: function set(newValue) {
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
