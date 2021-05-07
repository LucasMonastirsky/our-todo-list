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
  onRegister: function (token) {
    DEBUG.log(`Registered for push notifications with token ${token.token}`);
  },

  onNotification: function (notification) {
    DEBUG.log("NOTIFICATION:", notification);
    PushNotification.localNotification({
      title: 'SNS Notification',
      channelId: 'abc',
      message: 'Notification Message'
    })

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

export const push = (title: string, description: string) => {
  PushNotification.localNotification({
    channelId: channel_id,
    title,
    message: description,
  })
}
