type Task = {
  title: string
  status: TASK_STATUS
  description: string
  id: string
  list_id: string
  creator_id: string
  creation_date: number
  claimed_by_id?: string
  completer_id?: string
  position: number
}

enum TASK_STATUS {
  DONE = 'Done',
  IN_PROGRESS = 'In Progress',
  PENDING = 'Pending',
  PAUSED = 'Paused',
}

export default Task
export { TASK_STATUS }