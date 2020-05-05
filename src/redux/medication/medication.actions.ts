import {MedicationActionTypes} from './medication.types'
import {Medication, Day, dayToKeyString} from './medication.models'
import {Platform} from 'react-native'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotificationAndroid from 'react-native-push-notification'
import {IntlShape} from 'react-intl'
import {format} from 'date-fns'

export const mergeMedications = (medications: Medication[]) => ({
  type: MedicationActionTypes.MERGE_MEDICATIONS,
  payload: medications,
})

export const addMedication = (medication: Medication) => ({
  type: MedicationActionTypes.ADD_MEDICATION,
  payload: medication,
})

export const updateMedication = (medication: Medication) => ({
  type: MedicationActionTypes.UPDATE_MEDICATION,
  payload: medication,
})

export const deleteMedication = (bloodPressure: Medication) => ({
  type: MedicationActionTypes.DELETE_MEDICATION,
  payload: bloodPressure,
})

export const refreshAllLocalPushReminders = (
  medications: Medication[],
  intl: IntlShape,
) => {
  console.log('refreshAllLocalPushReminders!')
  if (Platform.OS === 'ios') {
    PushNotificationIOS.cancelAllLocalNotifications()
  } else if (Platform.OS === 'android') {
    PushNotificationAndroid.cancelAllLocalNotifications()
  }

  const now = new Date().getTime()

  const oneDayMilliseconds = 24 * 60 * 60 * 1000

  medications.map((medication) => {
    const reminder = medication.reminder
    if (reminder) {
      for (let i = 0; i < 50; i++) {
        const midnight = new Date(new Date().getTime() + i * oneDayMilliseconds)
        midnight.setHours(0, 0, 0, 0) // midnight in past

        const reminderTime = midnight.getTime() + reminder.dayOffset * 1000
        if (reminderTime < new Date().getTime()) {
          // in past
          continue
        }

        const fireDate = new Date(reminderTime)

        const day: Day = fireDate.getDay()
        const dayString = intl.formatMessage({id: dayToKeyString(day, true)})
        const when = `${dayString} ${format(fireDate, 'h:mm a')}`

        const body = intl.formatMessage(
          {id: 'medicine.reminder-notification'},
          {value: when},
        )
        if (Platform.OS === 'ios') {
          PushNotificationIOS.scheduleLocalNotification({
            alertTitle: medication.name,
            alertBody: body,
            fireDate: fireDate.toISOString(),
          })
        } else if (Platform.OS === 'android') {
          PushNotificationAndroid.localNotificationSchedule({
            date: fireDate,
            autoCancel: true, // (optional) default: true
            largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
            smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
            vibrate: true, // (optional) default: true
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            ongoing: false, // (optional) set whether this is an "ongoing" notification

            title: medication.name, // (optional)
            message: body, // (required)
            playSound: true, // (optional) default: true
            soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
          })
        }
      }
    }
  })
}
