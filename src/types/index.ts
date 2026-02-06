export type AccountType = 'local' | 'ldap'

export interface LabelItem {
  text: string
}

export interface Row {
  id: string
  type: AccountType
  login: string
  password: string | null
  labels: LabelItem[]
  labelText: string
  errors: {
    login: boolean
    password: boolean
  }
}

export type Account = Omit<Row, 'labelText' | 'errors'>
