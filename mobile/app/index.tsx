import { View, Text, TouchableOpacity } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import NlwLogo from '../src/assets/nlw-logo.svg'
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import { useEffect } from 'react'
import { api } from '../src/lib/api'
import { useRouter } from 'expo-router'

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint:
    'https://github.com/settings/connections/applications/95953509ef83ca31046a',
}

export default function App() {
  const router = useRouter()
  const [, response, signInWithGithub] = useAuthRequest(
    {
      clientId: '95953509ef83ca31046a',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        scheme: 'nlw-spacetime',
      }),
    },
    discovery,
  )

  useEffect(() => {
    // get redirect uri to update in github redirect url oauth app
    // console.log(
    //   makeRedirectUri({
    //     scheme: 'nlw-spacetime',
    //   }),
    // )
    if (response?.type === 'success') {
      const { code } = response.params
      handleGithubOauthCode(code)
    }
  }, [response])

  async function handleGithubOauthCode(code: string) {
    try {
      const response = await api.post('/register', { code })
      await SecureStore.setItemAsync('token', response.data.token)
      router.push('/memories')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View className="flex-1 items-center px-8 py-10">
      <View className="flex-1 items-center justify-center gap-6">
        <NlwLogo />
        <View className="space-y-2">
          <Text className="text-center font-title text-2xl leading-tight text-gray-50">
            Sua cápsula do tempo
          </Text>
          <Text className="text-center font-body text-base leading-relaxed text-gray-100">
            Colecione momentos marcantes da sua jornada e compartilhe (se
            quiser) com o mundo
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-full bg-green-500 px-5 py-2"
          onPress={() => signInWithGithub()}
        >
          <Text className="font-alt text-sm uppercase text-black">
            Cadastrar lembrança
          </Text>
        </TouchableOpacity>
      </View>
      <Text className="text-center font-body text-sm leading-relaxed text-gray-200">
        Feito com 💜 no NLW da Rocketseat
      </Text>
    </View>
  )
}
