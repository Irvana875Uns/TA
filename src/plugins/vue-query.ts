import { VueQueryPlugin } from "@tanstack/vue-query"


export default definePlugin((app) => {
  app.use(VueQueryPlugin)
})
