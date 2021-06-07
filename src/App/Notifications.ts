import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotification from 'react-native-push-notification'
import { Task, TodoList } from '../Models';
import DEBUG from '../Utils/DEBUG';
import API from './API';
import uuid from 'react-native-uuid'
import { Dictionary } from '../Utils';

const channel_id = 'our_todo_main_channel'

PushNotification.createChannel({
    channelId: 'our_todo_main_channel', // (required)
    channelName: "Our ToDo", // (required)
  },
  created => {
    DEBUG.log(created
    ? `Created notification channel with id ${channel_id}`
    : `Couldn't create notification channel`
    )
  }
);

PushNotification.configure({
  onRegister: function ({token}) {
    // @ts-ignore
    Notifications._token = token
    DEBUG.log(`Registered for push notifications with token ${token}`);
  },

  onNotification: async function (notification) {
    const data = JSON.parse(notification.data.default)
    const ground = notification.foreground ? 'foreground' : 'background'
    DEBUG.log(`Received ${data.type} notification in ${ground}`);

    if (data.user_id !== API.user) // ignore notifications created by self
      await notification_handlers[data.type](data, ground === 'background')
    else DEBUG.log(`Ignored notification from self`)

    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  onAction: function (notification) {
    DEBUG.log("ACTION:", notification.action);
    DEBUG.log("NOTIFICATION:", notification);
  },

  onRegistrationError: function(err) {
    DEBUG.error(err.message, err);
  },
});

const notification_handlers: { [index: string]: (data: any, background: boolean) => any } = {
  task_created: (data, background) => {
    if (!Notifications.triggerTaskCreatedListeners(data.task))
      PushNotification.localNotification({
        title: `New task in ${data.list_title}`,
        channelId: channel_id,
        message: `${data.task.title} by ${data.user_nickname}`
      })
  },
  task_claimed: (data, background) => {
    Notifications.triggerTaskUpdatedListeners(data.task)
    if (background) PushNotification.localNotification({
      title: `${data.user_nickname} claimed ${data.task.title}`,
      channelId: channel_id,
      message: ``,
    })
  },
  task_completed: (data, background) => {
    Notifications.triggerTaskUpdatedListeners(data.task)
    if (background) PushNotification.localNotification({
      title: `${data.user_nickname} completed ${data.task.title}`,
      channelId: channel_id,
      message: ``,
    })
  },
  added_to_list: (data, background) => {
    Notifications.triggerAddedToListListeners(data.list)
    if (background) PushNotification.localNotification({
      title: `${data.sender_nickname} added you to ${data.list.title}`,
      channelId: channel_id,
      message: ``,
    })
  },
}

type NotificationType =
  'task_created' |
  'task_claimed' |
  'task_completed' |
  'added_to_list'

type TaskCreatedCallback = (task: Task)=>any
type TaskUpdatedCallback = (task: Task)=>any
type AddedToListCallback = (list: TodoList)=>any

export default class Notifications {
  private static _token: string
  static get token() { return Notifications._token }

  private static task_created_listeners = new Dictionary<TaskCreatedCallback>()
  static addTaskCreatedListener = (callback: TaskCreatedCallback) =>
    addListener(callback, Notifications.task_created_listeners)
  static triggerTaskCreatedListeners = (task: Task) =>
    triggerListeners(Notifications.task_created_listeners, task)

  private static task_updated_listeners = new Dictionary<TaskUpdatedCallback>()
  static addTaskUpdatedListener = (callback: TaskUpdatedCallback) =>
    addListener(callback, Notifications.task_updated_listeners)
  static triggerTaskUpdatedListeners = (task: Task) =>
    triggerListeners(Notifications.task_updated_listeners, task)

  private static added_to_list_listeners = new Dictionary<AddedToListCallback>()
  static addAddedToListListener = (callback: AddedToListCallback) =>
    addListener(callback, Notifications.added_to_list_listeners)
  static triggerAddedToListListeners: AddedToListCallback = list =>
    triggerListeners(Notifications.added_to_list_listeners, list)
}

function addListener<T> (callback: T, listeners: Dictionary<T>) {
  const id = `${uuid.v4()}`
  listeners.set(id, callback)
  return {
    remove: () => {listeners.delete(id)}
  }
}

// if a handler returns true, the notification must be blocked (other handlers will still trigger)
function triggerListeners (listeners: Dictionary<Function>, data: any) {
  let blocked = false
  listeners.values.forEach(callback => {
    if (callback(data))
      blocked = true
  })
  return blocked
}
