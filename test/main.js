import Vue from 'vue'
import App from './App.vue'
import MindMap from '../src/index'

Vue.config.productionTip = false

Vue.use(MindMap)

new Vue({
  render: h => h(App)
}).$mount('#app')
