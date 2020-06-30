import React, {useState, useRef, useEffect} from 'react'
import {SafeAreaView, View, StyleSheet, TextInput} from 'react-native'
import {RouteProp} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {useIntl, FormattedMessage} from 'react-intl'
import {Item} from 'react-native-picker-select'

import {containerStyles, colors} from '../styles'
import {Picker, BodyText, Button, ButtonType} from '../components'
import SCREENS from '../constants/screens'
import {RootStackParamList} from '../Navigation'

import {
  BLOOD_SUGAR_TYPES,
  BloodSugar,
} from '../redux/blood-sugar/blood-sugar.models'
import {useThunkDispatch} from '../redux/store'
import {addBloodSugar} from '../redux/blood-sugar/blood-sugar.actions'
import {ScrollView} from 'react-native-gesture-handler'

import {
  isHighBloodSugar,
  isLowBloodSugar,
  showWarning,
  BloodSugarCode,
  convertBloodSugarValue,
  getDisplayBloodSugarUnit,
} from '../utils/blood-sugars'

import {bloodSugarUnitSelector} from '../redux/patient/patient.selectors'

type AddBsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  SCREENS.ADD_BS
>

type AddBsScreen = RouteProp<RootStackParamList, SCREENS.ADD_BS>

type Props = {
  navigation: AddBsScreenNavigationProp
  route: AddBsScreen
}

interface PickerItemExtended extends Item {
  min: number
  max: number
  type: string
}

enum INPUT_TYPES {
  DECIMAL = 'DECIMAL',
  PERCENTAGE = 'PERCENTAGE',
}

function AddBsScreen({navigation, route}: Props) {
  const intl = useIntl()

  const dispatch = useThunkDispatch()

  const SUGAR_TYPES: PickerItemExtended[] = [
    {
      label: intl.formatMessage({id: 'bs.random-blood-sugar'}),
      value: BLOOD_SUGAR_TYPES.RANDOM_BLOOD_SUGAR,
      min: 30,
      max: 1000,
      type: INPUT_TYPES.DECIMAL,
    },
    {
      label: intl.formatMessage({id: 'bs.fasting-blood-sugar'}),
      value: BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR,
      min: 30,
      max: 1000,
      type: INPUT_TYPES.DECIMAL,
    },
    {
      label: intl.formatMessage({id: 'bs.post-prandial'}),
      value: BLOOD_SUGAR_TYPES.POST_PRANDIAL,
      min: 30,
      max: 1000,
      type: INPUT_TYPES.DECIMAL,
    },
    {
      label: intl.formatMessage({id: 'bs.hemoglobic'}),
      value: BLOOD_SUGAR_TYPES.HEMOGLOBIC,
      min: 3,
      max: 25,
      type: INPUT_TYPES.PERCENTAGE,
    },
  ]

  const [type, setType] = useState<string>(SUGAR_TYPES[0].value)
  const [reading, setReading] = useState<string>('')
  const [errors, setErrors] = useState<null | string>(null)
  const inputRef = useRef<null | any>(null)

  const [showErrors, setShowErrors] = useState(false)

  const selectedBloodSugarUnit =
    bloodSugarUnitSelector() ?? BloodSugarCode.MG_DL

  const getErrors = (input: string): string | null => {
    if (input === '') {
      return null
    }

    const foundType = SUGAR_TYPES.find((sugarType) => {
      return sugarType.value === type
    })

    if (foundType) {
      const isPercentage = foundType.type === INPUT_TYPES.PERCENTAGE

      const minValue: number = isPercentage
        ? foundType.min
        : Number(
            convertBloodSugarValue(
              foundType.value,
              foundType.min.toString(),
              BloodSugarCode.MG_DL,
              selectedBloodSugarUnit,
            ),
          )

      if (Number(input) < minValue) {
        return intl.formatMessage(
          {id: 'add-bs.bs-less-than-error'},
          {value: `${minValue}${isPercentage ? '%' : ''}`},
        )
      }

      const maxValue: number = isPercentage
        ? foundType.max
        : Number(
            convertBloodSugarValue(
              foundType.value,
              foundType.max.toString(),
              BloodSugarCode.MG_DL,
              selectedBloodSugarUnit,
            ),
          )

      if (Number(input) > maxValue) {
        return intl.formatMessage(
          {id: 'add-bs.bs-more-than-error'},
          {value: `${maxValue}${isPercentage ? '%' : ''}`},
        )
      }
    }

    return null
  }

  useEffect(() => {
    const newErrors = getErrors(reading)
    if (newErrors !== errors) {
      setErrors(newErrors)
      setShowErrors(newErrors != null)
    }
  }, [type])

  useEffect(() => {
    if (reading === '') {
      if (errors != null) {
        setErrors(null)
        setShowErrors(false)
      }
      return
    }

    const newErrors = getErrors(reading)

    if (newErrors === null) {
      if (showErrors) {
        setShowErrors(false)
      }

      if (errors != null) {
        setErrors(null)
      }

      return
    }

    if (newErrors !== errors) {
      setErrors(newErrors)
    }

    const errorShowTimeout = setTimeout(() => {
      setShowErrors(true)
    }, 1500)

    return () => {
      clearTimeout(errorShowTimeout)
    }
  }, [reading])

  const isSaveDisabled = (): boolean => {
    return !!(reading === '' || errors || isNaN(Number(reading)))
  }

  const cleanText = (input: string) => {
    if (type === BLOOD_SUGAR_TYPES.HEMOGLOBIC) {
      return input.replace(/[^0-9.]/g, '')
    }
    return input.replace(/[^0-9]/g, '')
  }

  // need to do this way, beause if you change type then react complains that number of called hooks has changed
  let displayUnit = getDisplayBloodSugarUnit()
  if (type === BLOOD_SUGAR_TYPES.HEMOGLOBIC) {
    displayUnit = '%'
  }

  return (
    <View style={{flex: 1}}>
      <SafeAreaView
        style={[containerStyles.fill, {backgroundColor: colors.white100}]}>
        <ScrollView
          style={{
            flex: 1,
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled">
          <View
            style={{
              position: 'relative',
              marginBottom: 24,
            }}>
            <TextInput
              style={[styles.input]}
              ref={inputRef}
              onFocus={() => {
                inputRef.current.setNativeProps({
                  borderColor: colors.blue2,
                })
              }}
              onBlur={() => {
                inputRef.current.setNativeProps({
                  borderColor: colors.grey2,
                })
              }}
              autoFocus={true}
              placeholder={intl.formatMessage({id: 'bs.blood-sugar'})}
              placeholderTextColor={colors.grey1}
              value={reading}
              onChangeText={(textIn) => {
                const text = setReading(cleanText(textIn))
              }}
              keyboardType={
                type === BLOOD_SUGAR_TYPES.HEMOGLOBIC ? 'numeric' : 'number-pad'
              }
              maxLength={6}
            />
            <BodyText
              style={{
                position: 'absolute',
                right: 12,
                top: 14,
                color: colors.grey1,
              }}>
              {displayUnit}
            </BodyText>
          </View>
          <Picker
            value={type}
            items={SUGAR_TYPES}
            onValueChange={(value: string) => {
              setType(value)
            }}
          />
          <Button
            title={intl.formatMessage({id: 'general.save'})}
            disabled={isSaveDisabled()}
            buttonType={ButtonType.Normal}
            style={{
              marginTop: 24,
            }}
            onPress={() => {
              const newBloodSugar: BloodSugar = {
                blood_sugar_type: type,
                blood_sugar_value: reading,
                offline: true,
                recorded_at: new Date().toISOString(),
                blood_sugar_unit: selectedBloodSugarUnit,
              }

              dispatch(addBloodSugar(newBloodSugar))

              navigation.goBack()

              if (showWarning(newBloodSugar)) {
                if (isHighBloodSugar(newBloodSugar)) {
                  setTimeout(() => {
                    navigation.navigate(SCREENS.ADD_DATA_WARNING_MODAL_SCREEN, {
                      displayText: intl.formatMessage(
                        {id: 'alert.description-high'},
                        {
                          label: intl.formatMessage({
                            id: 'bs.blood-sugar',
                          }),
                        },
                      ),
                    })
                  }, 250)
                } else if (isLowBloodSugar(newBloodSugar)) {
                  setTimeout(() => {
                    navigation.navigate(SCREENS.ADD_DATA_WARNING_MODAL_SCREEN, {
                      displayText: intl.formatMessage({
                        id: 'alert.description-low',
                      }),
                    })
                  }, 250)
                }
              }
            }}
          />
          {!errors && !showErrors && reading === '' && (
            <BodyText
              style={{
                textAlign: 'center',
                marginTop: 24,
                color: colors.grey1,
              }}>
              <FormattedMessage id="bs.select-rbs-if-unsure" />
            </BodyText>
          )}
          {errors && showErrors && (
            <BodyText
              style={{
                textAlign: 'center',
                marginTop: 24,
                color: colors.red1,
              }}>
              {errors}
            </BodyText>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

export default AddBsScreen

const styles = StyleSheet.create({
  input: {
    position: 'relative',
    height: 56,
    borderRadius: 4,
    backgroundColor: colors.white100,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.grey3,
    padding: 16,
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0.5,
    color: colors.grey0,
  },
})
