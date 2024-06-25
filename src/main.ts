import './assets/main.css'

import vue3GoogleLogin from 'vue3-google-login'


import { createApp } from 'vue'

import App from './App.vue'

const app = createApp(App)

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

const plugins = import.meta.glob('./plugins/*.ts', {
  eager: true
})

Object.values(plugins).forEach((module: any) => {
  app.use(module.default)
})
app.use(vue3GoogleLogin, {
  clientId: '127421363147-vl8e79jbc7e7oh847rboht5742pft7m7.apps.googleusercontent.com'
})

app.mount('#app')


