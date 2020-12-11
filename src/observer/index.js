import { arrayMethods } from "./array";

// Observer类是干什么用的？
class Observer {
    constructor(value) {// 需要对value属性重新定义

        // value.__ob__ = this; // 自定义属性，能让./array.js中的（备注4）那里可以拿到this，进而使用observerArray()方法  但是这样写会有问题，如果value是对象，会一直走walk方法，循环死了，因为value.__ob__为this，this是对象，对象里面还是对象，就会一直走哦walk方法
        // 那就想办法，让walk方法的forEach不能循环__ob__就可以了，因此使用Object.defineProperty来定义__ob__属性
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false,// 不能被枚举（表示不能被循环）
            configurable: false // 不能删除此属性
        });
        // value可能是对象 可能是数组 分类来处理
        if (Array.isArray(value)) {
            // 数组不用defineProperty来进行代理，性能不好
            // 那该怎么监听数组呢？
            // 数组常用的方法有：push、shift、reverse、sort等，那么我们重写数组的这些方法，在里面加上更新的逻辑，这样就可以监听了
            // value.__proto__ = arrayMethods; // 当是数组时，改写方法为自己重写后的方法 __proto__有兼容性问题，可以使用Object.setPrototypeOf()方法
            Object.setPrototypeOf(value, arrayMethods);
            
            // 数组里的元素放的有可能是引用类型obejct 如果对象变化了 也需要更新视图

            this.observerArray(value); // 处理的是原有数组中的对象

        } else {
            this.walk(value);// 把对象里的数据，一步一步地都变成响应式的
        }
    }
    // 侦测数组变化
    observerArray(value) {
        for (let i=0; i < value.length; i++) {
            observer(value[i]);
        }
    }
    // 侦测对象变化的
    walk(data) {
        // 将对象中的所有key，重新用defineProperty定义成响应式的
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key]);
        })
    }
}

export function defineReactive(data, key, value) {

    // value可能也是一个对象
    observer(value);// （注释2）对结果递归拦截（如果data对象里的数据嵌套太深，那么会进行深层次的递归拦截，对性能有影响，所以vue2中数据嵌套不要过深，会浪费性能）
    
    Object.defineProperty(data, key, {
        get() {
            return value;
        },
        set(newValue) {
            if (newValue === value) return;
            observer(newValue); // （注释3）如果用户设置的是一个对象，就继续将用户设置的对象变成响应式的
            value = newValue; 
        }
    })
}

export function observer(data) {
    // 只能对对象类型进行侦测 非对象类型无法侦测
    if (typeof data !== 'object' || data === null) {
        return;
    }
    if (data.__ob__) { // 防止循环引用
        return; // 要侦测的data如果有__ob__属性，说明这个data已经被侦测过了
        // 因此在vue2里，如果看到某个object或者array数据里看到了__ob__，就说明这个对象已经被侦测过了
    }
    // 通过类来实现对数据的侦测 类可以方便扩展，会产生实例
    return new Observer(data);// Observer是在原对象上监听数据的
}

/**
    删除了元素，需要去掉侦测么？
    无所谓，不太关心这个。因为如果数组里被删除的内容，如果是对象的话，也会触发重新侦测的，因为重写了数组的pop、shift和splice方法，vue2里面会重新侦测的
    如果是对象的话，那就更会被重新侦测的
 */