import Vue from "..";

let oldArrayProtooMethods = Array.prototype;

// 不能直接改写数组原有方法，不可靠，因为只有被vue控制的数组才需要改写

export let arrayMethods = Object.create(Array.prototype); // 创建一个元素，让链指向这个原型。arrayMethods继承Array.prototype。
// arrayMethods.__proto__ === Array.prototype 
// arrayMethods拷贝了数组的原型，这样就可以添加自己的方法了

/**
    arrayMethods.__proto__.push // 拷贝了数组的原型

    arrayMethods.push // 以添加自己的方法了

    当数组调用push的时候，先找的是arrayMethods.push自己的方法，当arrayMethods上没有自己的push方法时，才会去arrayMethods.__proto__上找push方法
 */

// vue2中修改原有数组中的length，是监控不到的

let methods = [// 只有这些数组方法才会改变原数组，其它的数组方法不会改变原数组，所以监听这些数组方法的调用就可以了
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'reverse',
    'sort'
];

methods.forEach(method => {// AOP切片编程
    arrayMethods[method] = function (...args) { // 重写数组方法
        // todo... 更新视图
        console.log("改写后的"+method);
        let result = oldArrayProtooMethods[method].call(this, ...args);// this指向arrayMethods

        // 这一坨代码是侦测数组里新增的数据的，向pop、shift和splice的删除数组元素的操作，没有写，但是vue2源码里也都写了
        // 有可能用户新增的数据是对象格式，也需要进行拦截  'push','unshift','splice'都有增加功能
        
        let inserted;
        let ob = this.__ob__;// （备注4）this是在./index.js文件里定义的  这里的this就是method在哪里被谁调用的，是在./index.js的Observer对象里的value调用的
        switch (method) {
            case 'push': 
            case 'unshift': 
                inserted = args;
                break;
            case 'splice': // xx.splice(0,1,xxx)
                inserted = args.slice(2);
                break;
            default: break;
        }

        if (inserted) {
            ob.observerArray(inserted); 
        }
        
        return result;
    }
})

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
