import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native'
import NlwLogo from '../src/assets/nlw-logo.svg'
import Icon from '@expo/vector-icons/Feather'
import { Link, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { api } from '../src/lib/api'
dayjs.locale(ptBr)

interface Memory {
  coverUrl: string
  excerpt: string
  id: string
  createdAt: string
}

export default function Memories() {
  const router = useRouter()
  const { bottom, top } = useSafeAreaInsets()
  const [memories, setMemories] = useState<Memory[]>([])

  async function signOut() {
    await SecureStore.deleteItemAsync('token')
    return router.push('/')
  }

  async function getMemories() {
    const token = await SecureStore.getItemAsync('token')
    try {
      const response = await api.get('/memories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMemories(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getMemories()
  }, [])

  return (
    <View className="flex-1" style={{ paddingBottom: bottom, paddingTop: top }}>
      <View className="mt-4 flex-row items-center justify-between px-8">
        <NlwLogo />
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={signOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>
          <Link asChild href="/new">
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <ScrollView className="mt-3">
        <View className="mt-6 space-y-10">
          {memories.map((memory) => (
            <View className="space-y-4" key={memory.id}>
              <View className="flex-row items-center gap-2">
                <View className="h-px w-5 bg-gray-50"></View>
                <Text className="font-body text-xs text-gray-100">
                  {dayjs(memory.createdAt).format('D[ de ]MMMM[, ]YYYY')}
                </Text>
              </View>
              <View className="space-y-4 px-8">
                <Image
                  source={{
                    uri: memory.coverUrl,
                  }}
                  className="aspect-video w-full rounded-lg"
                  alt="image"
                />
                <Text className="font-body text-base leading-relaxed text-gray-100">
                  {memory.excerpt}
                </Text>
                <Link href="/memories/id" asChild>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Text className="font-body text-sm text-gray-200">
                      Ler mais
                    </Text>
                    <Icon name="arrow-right" size={16} color="#9e9ea0" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
