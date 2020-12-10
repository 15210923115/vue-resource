import { observer } from "./observer/index.js";

// vue的数据有哪些？按照vue初始化的顺序有：props methods data computed watch
export function initState(vm) {
    // 将所有数据都定义在vm属性上，并且后续更改 需要触发视图更新
    const opts = vm.$options; // 获取用户属性
    if (opts.data) { // 数据的初始化
        initData(vm);
    }

}

function proxy(vm, source, key) {
    // 代理属性    为了用户能直接通过vm拿到data里的属性
    Object.defineProperty(vm, key, {
        get() {
            console.log('get proxy');
            return vm[source][key];
        },
        set(newValue) {
            console.log('set proxy');
            vm[source][key] = newValue;
        }
    });
}

function initData(vm) {
    // 数据劫持 Object.defineProperty
    let data = vm.$options.data;
    // 对data类型进行判断 如果是函数 获取函数返回值作为对象
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;// (注释1)
    // 通过vm._data获取劫持后的数据，用户就可以拿到_data了
    // 将_data中的数据全部放到vm上
    for (let key in data) {
        proxy(vm, '_data', key);// vm.name => vm._data.name
    }
    // 侦测这个数据
    observer(data);
}
