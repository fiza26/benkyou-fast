<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'
import router from '@/router'
import supabase from '@/supabase'

const streakModalState = ref(true)

const user = ref(null)
const name = ref(null)

const lastLoginLoaded = ref(false)

async function init() {
  await getCurrentUser()
  if (name.value) {
    await checkLastLogin()
    await getCurrentStreak()
    await getWordsLearned()
  }
}
init()

async function getCurrentUser() {
  const { data: { user: currentUser }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user data', error.message)
    return
  }

  user.value = currentUser
  name.value = user.value.user_metadata.name
}
getCurrentUser()

const lastLogin = ref(null)
const ifLastLogin = ref(false)

async function checkLastLogin() {
  const { data, error } = await supabase.from('users_data').select('last_login').eq('name', name.value).single()

  if (error) {
    console.error('Error checking last login:', error.message)
    return
  }

  lastLogin.value = data.last_login
  lastLoginLoaded.value = true

  const today = new Date().toISOString().split('T')[0]
  const last = new Date(lastLogin.value).toISOString().split('T')[0]
  ifLastLogin.value = today === last

  console.log('Last login:', lastLogin.value)
  console.log('ifLastLogin:', ifLastLogin.value)
}

const currentStreak = ref(0)

async function getCurrentStreak() {
  const { data, error } = await supabase.from('users_data').select('day_streak').eq('name', name.value).single()

  if (error) {
    console.error('Error fetching streak:', error.message)
    return
  }

  console.log('Current Streak:', data.day_streak);
  currentStreak.value = data.day_streak;
}
getCurrentStreak()

const closeStreakModal = (() => {
  streakModalState.value = false
  updateDayStreak()
  updateTimestamp()
})

async function updateDayStreak() {
  const { data, error } = await supabase
    .from('users_data')
    .update({ day_streak: currentStreak.value + 1 })
    .eq('name', name.value)
    .select(); // This is necessary if you want data returned

  if (error) {
    window.alert('Error updating day streak: ' + error.message)
  } else {
    // window.alert('Day Streak Updated!')
    console.log('Updated data:', data) // Optional: to verify update
  }
}

async function updateTimestamp() {
  const todayDateOnly = new Date()
  todayDateOnly.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase.from('users_data').update({ last_login: todayDateOnly }).eq('name', name.value)

  if (error) {
    window.alert('Error updating timestamp: ' + error.message)
  } else {
    // window.alert('Timestamp Updated!')
    await checkLastLogin()
  }
}

const wordsLearned = ref(0)

async function getWordsLearned() {
  const { data, error } = await supabase.from('users_data').select().eq('name', name.value)

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

</script>

<template>
  <main>
    <div v-if="lastLoginLoaded && !ifLastLogin">
      <div class="modal" v-if="streakModalState">
        <div class="modal-content">
          <Icon icon="fluent-emoji:fire" width="100" height="100" />
          <h1>{{ currentStreak }} day streak</h1>
          <p>Let's continue the journey</p>
          <button @click="closeStreakModal()">Okay</button>
        </div>
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
            <span>#5</span>
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
