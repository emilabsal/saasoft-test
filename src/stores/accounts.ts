import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Account } from '@/types'
import { STORAGE_KEY } from '@/constants'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>(load())

  function load(): Account[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value))
  }

  function addEmpty() {
    accounts.value.push({
      id: crypto.randomUUID(),
      labels: [],
      type: 'local',
      login: '',
      password: '',
    })
  }

  function update(account: Account) {
    const idx = accounts.value.findIndex((a) => a.id === account.id)
    if (idx !== -1) accounts.value[idx] = account
  }

  function remove(id: string) {
    accounts.value = accounts.value.filter((account) => account.id !== id)
  }

  watch(accounts, save, { deep: true })

  return { accounts, addEmpty, update, remove }
})
