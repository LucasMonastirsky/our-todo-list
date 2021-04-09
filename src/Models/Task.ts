class Task {
  title: string
  status: TASK_STATUS
  description: string
  id: string
  creator_id: string
  creation_date: number
  completer_id?: string
  position: number

  constructor(properties: {
    title?: string,
    status?: TASK_STATUS,
    description?: string,
    id: string,
    creator_id: string,
    creation_date?: number,
    completer_id?: string,
    position: number,
  }){
    this.title = properties.title ?? 'Untitled Task'
    this.status = properties.status ?? TASK_STATUS.PENDING
    this.description = properties.description ?? ''
    this.id = properties.id
    this.creator_id = properties.creator_id
    this.creation_date = properties.creation_date ?? Date.now(),
    this.completer_id = properties.completer_id
    this.position = properties.position
  }
  
}

enum TASK_STATUS {
  DONE = 'Done',
  IN_PROGRESS = 'In Progress',
  PENDING = 'Pending',
  PAUSED = 'Paused',
}

export default Task
export { TASK_STATUS }