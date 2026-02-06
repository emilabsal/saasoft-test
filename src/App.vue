<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center gap-3">
      <h1 class="text-xl font-semibold">Учетные записи</h1>
      <Button size="icon" variant="outline" @click="store.addEmpty">
        <Plus class="h-4 w-4" />
      </Button>
    </div>
    {{ formState }}

    <!-- Подсказака -->
    <div class="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground">
      Для указания нескольких меток используйте разделитель <b>;</b>
    </div>

    <!-- Table -->
    <div class="grid grid-cols-[1fr_160px_1fr_1fr_40px] gap-3 items-center">
      <!-- Header -->
      <p class="text-sm font-medium text-muted-foreground">Метки</p>
      <p class="text-sm font-medium text-muted-foreground">Тип записи</p>
      <p class="text-sm font-medium text-muted-foreground">Логин *</p>
      <p class="text-sm font-medium text-muted-foreground">Пароль *</p>
      <div />

      <template v-for="row in formState" :key="row.id">
        <!-- Метки -->
        <Input v-model="row.labelText" maxlength="50" @blur="validateAndSave(row)" />

        <!-- Type -->
        <Select v-model="row.type" @update:model-value="onTypeChange(row)">
          <SelectTrigger class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Локальная</SelectItem>
            <SelectItem value="ldap">LDAP</SelectItem>
          </SelectContent>
        </Select>

        <!-- Логин -->
        <Input
          v-model="row.login"
          maxlength="100"
          :class="[
            { 'border-red-500': row.errors.login },
            row.type === 'local' ? 'col-span-1' : 'col-span-2',
          ]"
          @blur="validateAndSave(row)"
        />

        <!-- Пароль -->
        <div v-if="row.type === 'local'" class="flex gap-2 items-center">
          <Input
            :model-value="row.password ?? ''"
            @update:model-value="row.password = ($event as string) || null"
            :type="showPassword ? 'text' : 'password'"
            :class="{ 'border-red-500': row.errors.password }"
            maxlength="100"
            @blur="validateAndSave(row)"
          />
          <Button size="icon" variant="ghost" @click="showPassword = !showPassword">
            <Eye v-if="showPassword" class="h-4 w-4 text-muted-foreground" />
            <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <!-- Удалить -->
        <Button size="icon" variant="ghost" @click="store.remove(row.id)">
          <Trash2 class="h-4 w-4 text-muted-foreground" />
        </Button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import type { Account, LabelItem, Row } from '@/types'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

import { Eye, EyeOff, Plus, Trash2 } from 'lucide-vue-next'

const store = useAccountsStore()

const showPassword = ref<boolean>(false)

const formState = computed<Row[]>(() =>
  store.accounts.map((account: Account) => ({
    ...account,
    labelText: account.labels.map((label: LabelItem) => label.text).join('; '),
    errors: reactive({
      login: false,
      password: false,
    }),
  })),
)

function parseLabels(value: string) {
  if (!value.trim()) return []
  return value
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((text) => ({ text }))
}

function validateAndSave(row: Row) {
  row.errors.login = !row.login || row.login.length > 100
  row.errors.password = row.type === 'local' ? !row.password || row.password.length > 100 : false

  if (row.errors.login || row.errors.password) return

  const updated: Account = {
    id: row.id,
    type: row.type,
    login: row.login,
    password: row.type === 'ldap' ? null : row.password,
    labels: parseLabels(row.labelText),
  }

  store.update(updated)
}

function onTypeChange(row: Row) {
  if (row.type === 'ldap') {
    row.password = ''
  } else {
    row.password = ''
  }
  validateAndSave(row)
}
</script>
