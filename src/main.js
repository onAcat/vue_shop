import Vue from 'vue'
import App from './App.vue'
import ElementUI, { MessageBox } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from '@/router' //路由对象
//导入全局样式表
import './assets/css/global.css'

import axios  from "axios";
//配置请求根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
//请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use(config=>{
  //为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$confirm = MessageBox.confirm

Vue.config.productionTip = false
Vue.use(ElementUI);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
