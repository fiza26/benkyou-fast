import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import supabase from '@/supabase'

export const useUserStore = defineStore('user', () => {
    const user = ref(null)
    const name = ref(null)
    const username = ref(null)

    async function getCurrentUser() {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()

        if (error) {
            console.error('Error fetching user data', error.message)
            return
        }

        user.value = currentUser
        name.value = user.value.user_metadata.name
        username.value = user.value.user_metadata.username
    }

    return { user, name, username, getCurrentUser }
})