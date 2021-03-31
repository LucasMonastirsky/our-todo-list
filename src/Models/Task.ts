class Task {
  title: string
  status: TASK_STATUS
  description: string
  id: string
  creator_id: string
  completer_id?: string

  constructor(properties: {
    title?: string,
    status?: TASK_STATUS,
    description?: string,
    id: string,
    creator_id: string,
    completer_id?: string,
  }){
    this.title = properties.title ?? 'Untitled Task'
    this.status = properties.status ?? TASK_STATUS.PENDING
    this.description = properties.description ?? ''
    this.id = properties.id
    this.creator_id = properties.creator_id
    this.completer_id = properties.completer_id
  }
  
}

enum TASK_STATUS {
  DONE = 'Done',
  PENDING = 'Pending',
  PAUSED = 'Paused',
}

export default Task
export { TASK_STATUS }