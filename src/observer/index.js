// Observer类是干什么用的？
class Observer {
    constructor(value) {// 需要对value属性重新定义
        this.walk(value);// 把对象里的数据，一步一步地都变成响应式的
    }
    walk(data) {
        // 将对象中的所有key，重新用defineProperty定义成响应式的
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key]);
        })
    }
}

export function defineReactive(data, key, value) {
    Object.defineProperty(data, key, {
        get() {
            console.log("get");
            return value;
        },
        set(newValue) {
            console.log("set");
            if (newValue === value) return;
            value = newValue; 
        }
    })
}

export function observer(data) {
    // 只能对对象类型进行侦测 非对象类型无法侦测
    if (typeof data !== 'object' || data === null) {
        return;
    }
    // 通过类来实现对数据的侦测 类可以方便扩展，会产生实例
    return new Observer(data);// Observer是在原对象上监听数据的
}