<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const streakModalState = ref(true)

const lastLoginLoaded = ref(false)

onMounted(async () => {
  await userStore.getCurrentUser()
  if (userStore.name) {
    await getCurrentStreak()
    await checkLastLogin()
    await getWordsLearned()
    await checkLeaderboardRanking()
  }
})

function getDateDiffInDays(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)

  const diffTime = d2 - d1
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const lastLogin = ref(null)
const ifLastLogin = ref(false)

const daysDifference = ref(0)

async function checkLastLogin() {
  const { data, error } = await supabase
    .from('users_data')
    .select('last_login')
    .eq('name', userStore.name)
    .single()

  if (error) {
    console.error('Error checking last login:', error.message)
    return
  }

  lastLogin.value = data.last_login
  lastLoginLoaded.value = true

  const today = new Date()
  const last = new Date(lastLogin.value)

  // Convert to local date strings (ignore time)
  const todayStr = today.toISOString().split('T')[0]
  const lastStr = last.toISOString().split('T')[0]

  ifLastLogin.value = todayStr === lastStr
  daysDifference.value = getDateDiffInDays(last, today)

  console.log('Last login:', lastLogin.value)
  console.log('ifLastLogin:', ifLastLogin.value)

  // Only update if it's a new day
  if (!ifLastLogin.value) {
    await updateDayStreak()
    await updateTimestamp()
    streakModalState.value = true
  }
}

const currentStreak = ref(0)

async function getCurrentStreak() {
  const { data, error } = await supabase.from('users_data').select('day_streak').eq('name', userStore.name).single()

  if (error) {
    console.error('Error fetching streak:', error.message)
    return
  }

  console.log('Current Streak:', data.day_streak);
  currentStreak.value = data.day_streak;
}

const closeStreakModal = (() => {
  streakModalState.value = false
})

async function updateDayStreak() {
  let newStreak = 1

  if (daysDifference.value === 1) {
    newStreak = currentStreak.value + 1
  } else if (daysDifference.value === 0) {
    newStreak = currentStreak.value // same day login, no change
  } else {
    newStreak = 1 // missed day(s), reset streak
  }

  const { data, error } = await supabase
    .from('users_data')
    .update({ day_streak: newStreak })
    .eq('name', userStore.name)
    .select()

  if (error) {
    window.alert('Error updating day streak: ' + error.message)
  } else {
    currentStreak.value = newStreak
    console.log('Updated streak to:', newStreak)
  }
}

async function updateTimestamp() {
  const todayDateOnly = new Date()
  todayDateOnly.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase.from('users_data').update({ last_login: todayDateOnly }).eq('name', userStore.name)

  if (error) {
    window.alert('Error updating timestamp: ' + error.message)
  }
}

const wordsLearned = ref(0)

async function getWordsLearned() {
  const { data, error } = await supabase.from('users_data').select().eq('name', userStore.name)

  if (error) {
    console.error('Error fetching total words learned:', error.message)
    return
  }

  wordsLearned.value = data[0].words_learned
  console.log('Total Words Learned:', data[0].words_learned)
}

const userData = ref([])

async function fetchUserData() {
  const { data, error } = await supabase.from('user').select()
  if (data) {
    userData.value = data
  } else {
    console.log(error)
  }
  console.log('User Data:', userData.value)
}
fetchUserData()

const usersData = ref([])
const leaderboardRanking = ref(null)

async function checkLeaderboardRanking() {
  const { data, error } = await supabase.from('users_data').select('name, words_learned, points').order('points', { ascending: false })

  if (error) {
    console.error('Error fetching users data:', error.message)
    return
  }

  usersData.value = data

  const index = usersData.value.findIndex(user => user.name === userStore.name)

  if (index !== -1) {
    leaderboardRanking.value = index + 1
  } else {
    leaderboardRanking.value = null
  }
}

</script>

<template>
  <main>
    <div class="modal" v-if="streakModalState">
      <div class="modal-content">
        <Icon icon="fluent-emoji:fire" width="100" height="100" />
        <h1>{{ currentStreak }} day streak</h1>
        <p>Let's continue the journey</p>
        <button @click="closeStreakModal()">Okay</button>
      </div>
    </div>
    <div class="container">
      <div class="profile-container">
        <div class="profile">
          <div class="box-number">
            <span>{{ currentStreak }}</span>
            <p>Days streak</p>
          </div>
          <div class="box-number">
            <span>{{ wordsLearned }}</span>
            <p>Words learned</p>
          </div>
          <div class="box-number">
            <span>{{ leaderboardRanking }}</span>
            <p>On leaderboard</p>
          </div>
        </div>
      </div>

      <div class="card-container">
        <div class="card">
          <p>Learn Japanese words one by one.</p>
          <Icon icon="hugeicons:online-learning-01" width="100" height="100" />
          <RouterLink :to="'/learn'"><button>Learn ></button></RouterLink>
        </div>

        <div class="card">
          <p>Relearn all the words you have learned so far.</p>
          <Icon icon="material-symbols:memory" width="100" height="100" />
          <RouterLink :to="'/learntwo'"><button>Learn ></button></RouterLink>
        </div>

        <div class="card">
          <p>Advanced language acquisition learning.</p>
          <Icon icon="fluent-emoji-high-contrast:thinking-face" width="90" height="90" />
          <RouterLink :to="'/learnthree'"><button>Learn ></button></RouterLink>
        </div>
      </div>
    </div>

  </main>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

main {
  margin-top: 80px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
  display: flex;
  justify-content: center;
  transition: background-color 0.5s ease;

  .modal-content {
    animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
    color: white;
    padding: 20px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    width: 70%;
    height: 50%;
    position: fixed;
    bottom: 0;
    text-align: center;
    -webkit-box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
    box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);

    button {
      font-family: "Poppins", sans-serif;
      margin-top: 13px;
      border: none;
      padding: 5px;
      border-radius: 15px;
      width: 30%;
      background-color: white;
      transition: ease-in-out 0.5s;
      cursor: pointer;

      &:hover {
        transform: scale(1.030);
      }
    }
  }
}

.container {
  margin: 80px;
  display: flex;
  flex-direction: column;
  transition: ease-in-out 0.5s;

  .profile-container {
    display: flex;
    align-items: center;
    font-family: "Poppins", sans-serif;
    color: white;
    border-radius: 15px;
    padding: 13px;
    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
    height: 300px;
    box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);

    .profile {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      width: 100%;

      .box-number {
        text-align: center;

        span {
          font-size: 100px;
        }
      }
    }
  }

  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-family: "Poppins", sans-serif;
      background-color: #ecf0f1;
      height: 200px;
      padding: 13px;
      border-radius: 15px;
      box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
      margin-top: 30px;
      margin-bottom: 15px;
      transition: ease-in-out 0.5s;
      backdrop-filter: blur(10px);
      opacity: 0.8;
      background-size: 20px 20px;

      button {
        font-family: "Poppins", sans-serif;
        border: none;
        padding: 5px;
        border-radius: 15px;
        width: 100%;
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
        color: white;
        transition: ease-in-out 0.5s;
        cursor: pointer;

        &:hover {
          transform: scale(1.030);
        }
      }
    }
  }
}

@keyframes moveUp {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  50% {
    border-radius: 15px;
  }

  90% {
    border-radius: 15px;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .container .profile-container .profile .box-number span {
    font-size: 50px;
  }
}
</style>
