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

    async function updatePoints() {
    // Get the most recent points value from DB
    const { data, error: selectError } = await supabase
        .from('users_data')
        .select('points')
        .eq('name', name.value)
        .single()

    if (selectError) {
        console.error('Fetch error in updatePoints:', selectError.message)
        return
    }

    const newPoints = data.points + 5

    const { error: updateError } = await supabase
        .from('users_data')
        .update({ points: newPoints })
        .eq('name', name.value)

    if (updateError) {
        console.error('Update error in updatePoints:', updateError.message)
        window.alert('Update point error')
    }
}

    return { user, name, username, getCurrentUser, updatePoints }
})