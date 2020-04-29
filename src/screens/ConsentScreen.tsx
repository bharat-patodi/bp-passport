import React from 'react'
import {SafeAreaView, View, ScrollView, StatusBar, Linking} from 'react-native'
import {FormattedMessage, useIntl} from 'react-intl'
import {StackNavigationProp} from '@react-navigation/stack'

import {containerStyles, colors} from '../styles'
import {Button, Link, BodyText} from '../components'
import SCREENS from '../constants/screens'
import {RootStackParamList} from '../Navigation'

type ConsentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  SCREENS.CONSENT
>

type Props = {
  navigation: ConsentScreenNavigationProp
}

function Consent({navigation}: Props) {
  const intl = useIntl()

  return (
    <SafeAreaView
      style={[containerStyles.fill, {backgroundColor: colors.white}]}>
      <StatusBar backgroundColor="blue" barStyle="light-content" />
      <View
        style={[
          containerStyles.fill,
          containerStyles.centeredContent,
          {margin: 24},
        ]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <BodyText style={{marginBottom: 24}}>
            <FormattedMessage id="consent.by-using-app" />
          </BodyText>
          <BodyText style={{marginBottom: 24}}>
            <FormattedMessage id="consent.this-means-that" />
          </BodyText>
          <BodyText style={{marginBottom: 24}}>
            <FormattedMessage id="consent.patient-data" />{' '}
            <BodyText
              style={{color: colors.blue2}}
              onPress={() => {
                Linking.openURL('https://simple.org/patient-privacy')
              }}>
              <FormattedMessage id="consent.here-link" />{' '}
            </BodyText>
            <BodyText>
              <FormattedMessage id="consent.and-in-our" />{' '}
            </BodyText>
            <BodyText
              style={{color: colors.blue2}}
              onPress={() => {
                Linking.openURL('https://simple.org/digitalprinciples/')
              }}>
              <FormattedMessage id="consent.digital-principles-link" />
            </BodyText>
            <BodyText>.</BodyText>
          </BodyText>
        </ScrollView>
      </View>
      <View
        style={[
          {
            margin: 12,
          },
        ]}>
        <Button
          title={intl.formatMessage({id: 'general.i-agree'})}
          onPress={() => {
            console.log('Nick Kuh todo - offline login')
          }}
        />
      </View>
      <View />
    </SafeAreaView>
  )
}

export default Consent
