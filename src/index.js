// vue在2.0版本中就是一个构造函数

import { initMixin } from "./init";

function Vue(options) {
    this._init(options); // 当用户new Vue时，就调用init方法进行vue的初始化
}
// 可以拆分逻辑到不同的文件中，利于代码维护
initMixin(Vue);


export default Vue;