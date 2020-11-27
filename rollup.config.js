import serve from 'rollup-plugin-serve';
import babel from 'rollup-plugin-babel';

export default { // 用于打包的配置
    input: './src/index.js', // 入口文件
    output: { // 输出的结果
        file: './dist/vue.js', // 输出的目录文件
        name: 'Vue', // 全局的名字就是Vue
        format: 'umd', // 模块格式用的是umd（统一模块规范，即可以支持commonjs规范，也可以支持es6模块规范），默认情况下会把Vue变量放到window下
        sourcemap: true // 源码映射文件，因为rollup配置打包会将es6->es5，而我们希望看到的源码文件是es6的，所以配置这么个选项就可以了
    },
    plugins: [ // 插件
        babel({
            exclude: "node_modules/**", // 这个目录不需要用babel转换
        }),
        serve({
            open: true, // 服务启动后，自动打开浏览器
            openPage: "./public/index.html", // 服务起来之后，默认打开某个页面
            port: 3000, // 启动的服务端口
            contentBase: "" // 以哪个目录下的哪个文件来启动，""就是默认以当前类库的根目录下的"/public/index.html"文件来启动
        })
    ]
}