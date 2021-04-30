type Task = {
  title: string
  status: 'Done'|'Claimed'|'Pending'|'Paused'
  description: string
  id: string
  list_id: string
  creator_id: string
  creation_date: number
  claimed_by_id?: string
  completer_id?: string
  completion_date?: number
  position: number
}

export default Task