export interface LecomUser {
  address: string
  administratorAccess: boolean
  administratorECMAccess: boolean
  aliasId: boolean
  authenticationType: string
  blocked: boolean
  cellphone: string
  chartAccess: boolean
  city: string
  complement: string
  createFolders: boolean
  delayActivityGraphAccess: boolean
  delayProcessGraphAccess: boolean
  delayedProcessPanelAccess: boolean
  digitalSignature: boolean
  email: string
  endDateVacation: string
  expiredPassword: boolean
  externalAccess: boolean
  id: number
  idDepartment: number
  idLeader: number
  idSubstitute: number
  inactivatedUser: boolean
  information1: string
  information2: string
  information3: string
  language: string
  masterUser: boolean
  mfaEnabled: boolean
  myChartsAccess: boolean
  name: string
  number: string
  openedProcessesGraphAccess: boolean
  openedProcessesGraphAccessInTest: boolean
  openedProcessesRelationGraphAccess: boolean
  processChangePermission: boolean
  processCreatePermission: boolean
  searchAccess: string
  specialFieldAccess: boolean
  startDateVacation: string
  state: string
  statisticsAccess: boolean
  telephone: string
  turnFoldersPublic: boolean
  updateDate: string
  userProfileChangePermission: boolean
  userStatusGraphAccess: boolean
  username: string
  zipcode: string
  permissions: string
}

export interface LecomFunction {
  id: number
  name: string
}

export interface LecomGroup {
  id: number
  name: string
  leaderName?: string
}

// Interface para o payload de atualização
export interface UpdateUserPayload {
  name: string
  email: string
  idDepartment: number
  language: string
  searchAccess: string
  idLeader: number
}
