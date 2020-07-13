import AddressBook from './address-book.vue'

export default {
  ...AddressBook,
  install: Vue => Vue.component('addressBook', AddressBook),
}
