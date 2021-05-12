import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotification from 'react-native-push-notification'
import DEBUG from '../Utils/DEBUG';
import API from './API';

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
      await notification_handlers[data.type][ground](data)
    else DEBUG.log(`Ignored notification from self`)

    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  onAction: function (notification) {
    DEBUG.log("ACTION:", notification.action);
    DEBUG.log("NOTIFICATION:", notification);
  },

  onRegistrationError: function(err) {
    console.error(err.message, err);
  },
});

type NotificationHandler = { foreground: (data:any)=>any, background: (data:any)=>any}
const notification_handlers: { [index: string]: NotificationHandler } = {
  task_created: {
    foreground: async data => {

    },
    background: async data => {
      PushNotification.localNotification({
        title: `New task in ${data.list_title}`,
        channelId: channel_id,
        message: `${data.task.title} by ${data.user_nickname}`
      })
    }
  },
  task_claimed: {
    foreground: async data => {

    },
    background: async data => {
      PushNotification.localNotification({
        title: `${data.user_nickname} claimed ${data.task.title}`,
        channelId: channel_id,
        message: ``,
      })
    },
  },
  task_completed: {
    foreground: async data => {

    },
    background: async data => {
      PushNotification.localNotification({
        title: `${data.user_nickname} completed ${data.task.title}`,
        channelId: channel_id,
        message: ``,
      })
    },
  },
  added_to_list: {
    foreground: async data => {

    },
    background: async data => {
      PushNotification.localNotification({
        title: `${data.sender_nickname} added you to ${data.list.title}`,
        channelId: channel_id,
        message: ``,
      })
    },
  }
}

type NotificationType =
  'task_created' |
  'task_claimed' |
  'task_completed' |
  'added_to_list'

export default class Notifications {
  private static _token: string
  static get token() { return Notifications._token }
}
