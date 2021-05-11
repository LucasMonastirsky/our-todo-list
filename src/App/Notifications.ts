import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotification from 'react-native-push-notification'
import { create } from 'react-test-renderer';
import DEBUG from '../Utils/DEBUG';

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

  onNotification: function (notification) {
    const data = JSON.parse(notification.data.default)
    DEBUG.log(`Received ${data.type} notification`);

    if (data.type === 'task_created') {
      PushNotification.localNotification({
        title: `New task in ${data.list_title}`,
        channelId: channel_id,
        message: `${data.task.title}`
      })
    }

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

type NotificationType =
  'task_created' |
  'added_to_list'

export default class Notifications {
  private static _token: string
  static get token() { return Notifications._token }

  static push = (title: string, description: string) => {
    PushNotification.localNotification({
      channelId: channel_id,
      title,
      message: description,
    })
  }
}
