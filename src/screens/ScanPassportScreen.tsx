import React, {useState, useEffect} from 'react'
import {SafeAreaView, View, Image, Alert, StatusBar} from 'react-native'
import {FormattedMessage} from 'react-intl'
import Modal from 'react-native-modal'
import {RNCamera, BarCodeType} from 'react-native-camera'
import {StackNavigationProp} from '@react-navigation/stack'

import {containerStyles, qrImage, qrMaskImage, colors} from '../styles'
import {BodyHeader, BodyText, LoadingOverlay} from '../components'
import SCREENS from '../constants/screens'
import {RootStackParamList} from '../Navigation'
import {useThunkDispatch} from '../redux/store'
import {activate} from '../redux/auth/auth.actions'

type ScanScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  SCREENS.LAUNCH
>

type Props = {
  navigation: ScanScreenNavigationProp
}

type BarCodeRead = {
  data: string
  rawData?: string
  type: keyof BarCodeType
}

enum UIState {
  Normal,
  CallingAPI,
}

function ScanPassportScreen({navigation}: Props) {
  const [uiState, setUIState] = useState(UIState.Normal)
  const [hasReadCode, setHasReadCode] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [modalIsVisible, setModalIsVisible] = useState(false)

  const dispatch = useThunkDispatch()

  const onBarCodeRead = (event: BarCodeRead) => {
    if (!hasReadCode && event.type === RNCamera.Constants.BarCodeType.qr) {
      setHasReadCode(true)
      setUIState(UIState.CallingAPI)
      setModalIsVisible(true)
      // tslint:disable-next-line: variable-name
      const passport_id = event.data
      return dispatch(activate(passport_id))
        .then(() => {
          navigation.navigate(SCREENS.VERIFY_YOUR_NUMBER, {passport_id})
        })
        .catch((err: Error) => {
          setError(err)
        })
        .finally(() => {
          setUIState(UIState.Normal)
          setModalIsVisible(false)
        })
    }
  }

  useEffect(() => {
    if (error && !modalIsVisible && uiState === UIState.Normal) {
      setTimeout(() => {
        Alert.alert(
          'Error',
          `${error}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setError(undefined)
                setHasReadCode(false)
              },
            },
          ],
          {cancelable: false},
        )
      }, 500)
    }
  }, [error, uiState, modalIsVisible])

  // test a working/not working code in the simulator
  /*
  useEffect(() => {
    const good = '0f8ce338-c3b4-4640-a68a-8d64f8ffbb1a'
    const bad = 'fdsfds'
    onBarCodeRead({
      data: good,
      type: RNCamera.Constants.BarCodeType.qr,
    })
  }, [])
  */

  return (
    <>
      <SafeAreaView style={[containerStyles.fill]}>
        <StatusBar backgroundColor={colors.blue1} barStyle="light-content" />
        <View style={[containerStyles.fill]}>
          <View
            style={[
              containerStyles.pageContainer,
              {
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 20,
              },
            ]}>
            <Image
              style={{
                marginRight: 12,
                flexShrink: 0,
              }}
              source={qrImage}
            />
            <BodyText
              style={{
                fontSize: 18,
                flex: 1,
              }}>
              <FormattedMessage id="scan-bp-passport.hold-camera" />
            </BodyText>
          </View>
          <View
            style={{
              flex: 1,
              overflow: 'hidden',
            }}>
            <RNCamera
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.off}
              captureAudio={false}
              androidCameraPermissionOptions={{
                title: 'Allow camera access?',
                message: 'BP Passport would like to access your camera',
                buttonPositive: 'Yes',
                buttonNegative: 'Cancel',
              }}
              barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
              onBarCodeRead={onBarCodeRead}
              notAuthorizedView={
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <BodyHeader
                    style={{
                      width: '80%',
                      textAlign: 'center',
                    }}>
                    <FormattedMessage id="login.allow-camera-access" />
                  </BodyHeader>
                </View>
              }>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <View
                  style={{
                    width: 200,
                    height: 200,
                  }}>
                  <Image
                    style={{width: '100%', height: '100%'}}
                    source={qrMaskImage}
                  />
                </View>
              </View>
            </RNCamera>
          </View>
        </View>
      </SafeAreaView>
      <Modal
        isVisible={modalIsVisible}
        style={{
          alignItems: 'center',
        }}
        onModalHide={() => {
          setModalIsVisible(false)
        }}>
        <LoadingOverlay />
      </Modal>
    </>
  )
}

export default ScanPassportScreen
