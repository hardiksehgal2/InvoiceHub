import { createRouter, createWebHistory } from 'vue-router'
import InvoicesView from '../views/InvoicesView.vue'
import InvoiceDetailView from '../views/InvoiceDetailView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InvoicesView },
    { path: '/invoices/:id', component: InvoiceDetailView },
  ],
})
